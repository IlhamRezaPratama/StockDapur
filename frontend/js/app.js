// app.js
// File utama frontend aplikasi StockDapur.
// Di sini semua state aplikasi disimpan, semua event listener didaftarkan,
// dan semua alur kerja fitur dikendalikan dengan memanggil fungsi dari api.js dan ui.js.

import { loginApi, logoutApi, cekSesiApi, getBahanApi, tambahBahanApi, ubahBahanApi, hapusBahanApi, catatApi } from './api.js';
import { renderRak, renderBon, renderCatat, renderJurnal, formatJumlah } from './ui.js';

// State global yang dipakai di seluruh aplikasi.
// penggunaAktif menyimpan info pengguna yang sedang login.
// daftarBahan menyimpan semua data bahan yang diambil dari database.
// riwayat menyimpan semua transaksi yang dicatat selama sesi berlangsung.
// tabAktif menyimpan nama tab yang sedang ditampilkan.
// tipeCapatan menyimpan apakah sedang mode masuk atau keluar.
// idSedangEdit menyimpan ID bahan yang sedang dalam mode edit.
// idAkanHapus menyimpan ID bahan yang akan dihapus setelah dikonfirmasi.
let penggunaAktif = null;
let daftarBahan   = [];
let riwayat       = [];
let tabAktif      = 'rak';
let tipeCapatan   = 'masuk';
let idSedangEdit  = null;
let idAkanHapus   = null;

// Fungsi pembantu agar penulisan document.getElementById lebih singkat di seluruh file ini.
const el = id => document.getElementById(id);

// FITUR: Toast notifikasi
// Menampilkan pesan singkat di bagian bawah layar setiap kali ada aksi yang berhasil atau gagal.
// Pesan akan muncul dengan animasi lalu menghilang sendiri setelah 2.5 detik.
// Kalau tipenya merah maka dipakai untuk notifikasi error seperti saat bahan berhasil dihapus.
function toast(pesan, tipe) {
  const t = el('toast');
  t.textContent = pesan;
  t.className = 'toast' + (tipe === 'red' ? ' t-red' : '') + ' show';
  setTimeout(() => t.className = 'toast', 2500);
}

// FITUR: Tema terang dan gelap
// Mengubah tema seluruh halaman dengan mengganti atribut data-theme di elemen html.
// Pilihan tema disimpan ke localStorage di browser sehingga ketika halaman dibuka lagi
// tema yang dipilih sebelumnya akan langsung diterapkan tanpa perlu memilih ulang.
// Teks tombol tema juga diperbarui sesuai tema yang aktif saat ini.
function setTheme(tema) {
  const gelap = tema === 'dark';
  document.documentElement.dataset.theme = gelap ? 'dark' : 'light';
  localStorage.setItem('stockdapur-tema', gelap ? 'dark' : 'light');
  document.querySelectorAll('.theme-toggle').forEach(b => {
    b.textContent = gelap ? ' Mode terang' : ' Mode gelap';
    b.setAttribute('aria-pressed', String(gelap));
  });
}

// FITUR: Render ulang tampilan
// Fungsi ini dipanggil setiap kali data berubah agar tampilan selalu sinkron dengan data terbaru.
// Bon belanja selalu diperbarui karena berpengaruh di semua tab.
// Lalu tampilan yang diperbarui hanya untuk tab yang sedang aktif saja untuk efisiensi.
function render() {
  renderBon(daftarBahan);
  if (tabAktif === 'rak')    renderRak(daftarBahan);
  if (tabAktif === 'catat')  renderCatat(daftarBahan, riwayat, tipeCapatan);
  if (tabAktif === 'jurnal') renderJurnal(riwayat);
}

// FITUR: Pindah tab
// Mengubah tab yang aktif dan memperbarui tampilan tombol navigasi serta konten yang ditampilkan.
// Tombol tab yang aktif mendapat kelas active untuk memberikan tampilan berbeda.
// Panel konten yang sesuai dengan tab dipilih juga mendapat kelas active untuk ditampilkan,
// sedangkan panel lainnya disembunyikan.
function pindahTab(nama) {
  tabAktif = nama;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === nama));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + nama));
  render();
}

// FITUR: Login pengguna
// Dipanggil saat pengguna menekan tombol Masuk di form login.
// Username dan password yang diketik dikirim ke backend lewat fungsi loginApi.
// Kalau backend mengembalikan gagal maka pesan error ditampilkan di bawah form.
// Kalau berhasil maka halaman login disembunyikan dan halaman app ditampilkan.
async function prosesLogin(e) {
  e.preventDefault();
  const hasil = await loginApi(el('login-user').value.trim(), el('login-pass').value);
  if (!hasil.ok) {
    el('login-error').textContent = hasil.pesan;
    el('login-error').style.display = 'block';
    return;
  }
  el('login-error').style.display = 'none';
  tampilkanApp(hasil.pengguna);
}

// Menampilkan halaman utama aplikasi setelah login berhasil.
// Nama pengguna ditampilkan di pojok kanan atas beserta link untuk keluar.
// Data bahan kemudian langsung dimuat dari backend dan halaman Rak ditampilkan.
async function tampilkanApp(pengguna) {
  penggunaAktif = pengguna;
  el('login-page').style.display = 'none';
  el('app').style.display = '';
  el('user-tag').innerHTML = `${pengguna.nama} · <a href="#" id="btn-logout">Keluar</a>`;
  el('btn-logout').addEventListener('click', e => { e.preventDefault(); prosesLogout(); });
  const data = await getBahanApi();
  if (data.ok) daftarBahan = data.bahan;
  render();
}

// FITUR: Logout pengguna
// Mengirim permintaan keluar ke backend agar sesi dihapus dari server.
// Setelah itu semua state di frontend dikosongkan dan halaman login ditampilkan kembali.
// Form login juga direset agar username dan password sebelumnya tidak terlihat.
async function prosesLogout() {
  await logoutApi();
  penggunaAktif = null;
  daftarBahan   = [];
  riwayat       = [];
  el('app').style.display = 'none';
  el('login-page').style.display = 'flex';
  el('form-login').reset();
}

// FITUR: Simpan bahan baru atau perubahan data bahan
// Dipanggil saat form tambah atau edit bahan dikirim.
// Kalau idSedangEdit tidak kosong berarti sedang mode edit, maka data yang ada diperbarui.
// Kalau idSedangEdit kosong berarti mode tambah baru, maka bahan baru ditambahkan ke daftar.
// Setelah selesai, form dikembalikan ke kondisi awal dan tampilan diperbarui.
async function simpanBahan(e) {
  e.preventDefault();
  const payload = {
    namaBahan:   el('add-nama').value.trim(),
    satuan:      el('add-satuan').value.trim(),
    stok:        Number(el('add-stok').value) || 0,
    minStok:     Number(el('add-min').value) || 0,
    hargaSatuan: parseInt(el('add-harga').value) || 0
  };

  if (idSedangEdit !== null) {
    const hasil = await ubahBahanApi(idSedangEdit, payload);
    if (hasil.ok) {
      const idx = daftarBahan.findIndex(b => b._id === idSedangEdit);
      if (idx !== -1) daftarBahan[idx] = hasil.bahan;
      toast('Bahan berhasil diubah');
    }
  } else {
    const hasil = await tambahBahanApi(payload);
    if (hasil.ok) { daftarBahan.push(hasil.bahan); toast('Bahan berhasil ditambahkan'); }
  }
  resetFormBahan();
  el('details-add').open = false;
  render();
}

// FITUR: Mode edit bahan
// Dipanggil saat tombol edit di kartu bahan ditekan.
// Data bahan yang bersangkutan diisi ke form tambah bahan agar bisa diubah.
// Field stok awal dinonaktifkan karena stok hanya boleh diubah lewat fitur catat transaksi.
// Form kemudian dibuka secara otomatis dan halaman digulir ke posisi form tersebut.
// Fungsi ini dibuat global agar bisa dipanggil dari dalam kode HTML yang dibuat oleh renderRak.
window.startEdit = function(id) {
  const b = daftarBahan.find(x => x._id === id);
  if (!b) return;
  idSedangEdit = id;
  el('add-id').value      = b._id;
  el('add-nama').value    = b.nama_bahan;
  el('add-satuan').value  = b.satuan;
  el('add-stok').value    = b.stok;
  el('add-stok').disabled = true;
  el('add-min').value     = b.min_stok;
  el('add-harga').value   = b.harga_satuan;
  el('btn-simpan-bahan').textContent = 'Simpan perubahan';
  const det = el('details-add');
  det.open = true;
  det.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Mengembalikan form tambah bahan ke kondisi kosong dan mode tambah baru.
// Dipanggil setelah berhasil menyimpan atau saat form ditutup dalam kondisi sedang edit.
function resetFormBahan() {
  el('form-tambah').reset();
  el('add-id').value      = '';
  el('add-stok').disabled = false;
  el('btn-simpan-bahan').textContent = 'Simpan bahan';
  idSedangEdit = null;
}

// FITUR: Konfirmasi sebelum menghapus bahan
// Dipanggil saat tombol hapus di kartu bahan ditekan.
// Modal konfirmasi ditampilkan terlebih dahulu dengan nama bahan yang akan dihapus
// agar pengguna tidak tidak sengaja menghapus bahan yang salah.
// ID bahan disimpan sementara di idAkanHapus dan baru benar-benar dihapus setelah dikonfirmasi.
// Fungsi ini dibuat global agar bisa dipanggil dari dalam kode HTML yang dibuat oleh renderRak.
window.confirmDel = function(id) {
  const b = daftarBahan.find(x => x._id === id);
  if (!b) return;
  idAkanHapus = id;
  el('confirm-text').textContent = `Yakin ingin menghapus ${b.nama_bahan}?`;
  el('confirm-overlay').style.display = 'flex';
};

// FITUR: Hapus bahan
// Dipanggil saat pengguna menekan tombol Hapus di modal konfirmasi.
// Permintaan penghapusan dikirim ke backend, lalu bahan dihapus dari daftar lokal
// sehingga tampilan langsung diperbarui tanpa perlu memuat ulang data dari server.
async function hapusBahan() {
  if (idAkanHapus !== null) {
    await hapusBahanApi(idAkanHapus);
    daftarBahan = daftarBahan.filter(b => b._id !== idAkanHapus);
    toast('Bahan berhasil dihapus', 'red');
    idAkanHapus = null;
  }
  el('confirm-overlay').style.display = 'none';
  render();
}

// FITUR: Tombol Catat stok di kartu bahan
// Dipanggil saat tombol Catat stok di kartu bahan ditekan.
// Aplikasi otomatis pindah ke tab Catat, lalu dropdown bahan langsung dipilihkan
// ke bahan yang tombolnya ditekan sehingga pengguna tinggal mengisi jumlahnya saja.
// Kursor juga otomatis diarahkan ke kolom jumlah agar lebih cepat diisi.
// Fungsi ini dibuat global agar bisa dipanggil dari dalam kode HTML yang dibuat oleh renderRak.
window.catatStok = function(id) {
  pindahTab('catat');
  el('catat-bahan').value = id;
  updateLabelJumlah();
  el('catat-jumlah').focus();
};

// FITUR: Catat transaksi stok masuk atau keluar
// Dipanggil saat form catat dikirim oleh pengguna.
// Pertama dilakukan validasi sederhana: bahan harus dipilih dan jumlah harus lebih dari nol.
// Kalau validasi lolos, data transaksi dikirim ke backend.
// Backend akan memvalidasi lebih lanjut seperti memastikan stok tidak sampai minus saat keluar.
// Kalau backend mengembalikan gagal maka pesan error ditampilkan di bawah form.
// Kalau berhasil maka stok bahan di daftar lokal diperbarui dan transaksi disimpan ke riwayat.
async function prosesCatat(e) {
  e.preventDefault();
  const id      = el('catat-bahan').value;
  const jumlah  = Number(el('catat-jumlah').value);
  const catatan = el('catat-catatan').value.trim();
  const errEl   = el('catat-error');

  if (!id || jumlah <= 0) {
    errEl.textContent = 'Masukkan jumlah yang lebih besar dari 0.';
    errEl.style.display = 'block';
    return;
  }

  const hasil = await catatApi(id, { tipe: tipeCapatan, jumlah, catatan });
  if (!hasil.ok) {
    errEl.textContent = hasil.pesan;
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  const idx = daftarBahan.findIndex(b => b._id === id);
  if (idx !== -1) daftarBahan[idx] = hasil.bahan;
  riwayat.push(hasil.transaksi);

  const verb = tipeCapatan === 'masuk' ? 'ditambahkan' : 'dikeluarkan';
  toast(`${formatJumlah(jumlah)} ${hasil.bahan.satuan} ${hasil.bahan.nama_bahan} berhasil ${verb}`);
  el('form-catat').reset();
  render();
}

// FITUR: Toggle antara mode masuk dan mode keluar di form catat
// Mengubah tipeCapatan dan memperbarui tampilan tombol toggle serta teks tombol submit.
// Pesan error juga disembunyikan saat mode berganti agar tidak membingungkan pengguna.
function setTipeCapatan(tipe) {
  tipeCapatan = tipe;
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.type === tipe));
  el('btn-catat-submit').textContent = 'Catat ' + tipe;
  el('catat-error').style.display = 'none';
  updateLabelJumlah();
}

// Memperbarui label di atas kolom jumlah agar menampilkan satuan bahan yang dipilih.
// Contoh hasilnya: Jumlah masuk atau Jumlah keluar lalu diikuti satuannya seperti kg atau liter.
// Ini membantu pengguna tahu dalam satuan apa jumlah yang harus diisi.
function updateLabelJumlah() {
  const b = daftarBahan.find(x => x._id === el('catat-bahan').value);
  el('catat-jumlah-label').textContent = `Jumlah ${tipeCapatan}${b ? ` (${b.satuan})` : ''}`;
}

// FITUR: Muat ulang data dari database
// Mengosongkan riwayat dan memuat ulang seluruh data bahan dari backend.
// Berguna kalau ada perubahan data di backend yang belum tercermin di tampilan.
async function resetData() {
  riwayat      = [];
  idSedangEdit = null;
  resetFormBahan();
  const data = await getBahanApi();
  if (data.ok) daftarBahan = data.bahan;
  toast('Data berhasil dimuat ulang');
  render();
}

// INISIALISASI APLIKASI
// Kode di dalam sini dijalankan satu kali saat halaman selesai dimuat oleh browser.
// Pertama tema yang tersimpan di localStorage diterapkan agar tampilan langsung konsisten.
// Lalu dicek apakah ada sesi login yang masih aktif.
// Kalau ada maka langsung tampilkan halaman app tanpa perlu melalui form login.
// Kalau tidak ada maka semua event listener didaftarkan agar form login dan fitur lainnya bisa dipakai.
document.addEventListener('DOMContentLoaded', async () => {
  setTheme(localStorage.getItem('stockdapur-tema') === 'dark' ? 'dark' : 'light');

  document.querySelectorAll('.theme-toggle').forEach(b =>
    b.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'))
  );

  const sesi = await cekSesiApi().catch(() => ({ ok: false }));
  if (sesi.ok) { tampilkanApp(sesi.pengguna); return; }

  el('form-login').addEventListener('submit', prosesLogin);
  el('nav-tabs').addEventListener('click', e => { const b = e.target.closest('.tab-btn'); if (b) pindahTab(b.dataset.tab); });
  el('catat-toggle').addEventListener('click', e => { const b = e.target.closest('.toggle-btn'); if (b) setTipeCapatan(b.dataset.type); });
  el('form-catat').addEventListener('submit', prosesCatat);
  el('catat-bahan').addEventListener('change', updateLabelJumlah);
  el('form-tambah').addEventListener('submit', simpanBahan);
  el('details-add').addEventListener('toggle', function() { if (!this.open && idSedangEdit !== null) resetFormBahan(); });
  el('confirm-yes').addEventListener('click', hapusBahan);
  el('confirm-no').addEventListener('click', () => { el('confirm-overlay').style.display = 'none'; idAkanHapus = null; });
  el('confirm-overlay').addEventListener('click', e => { if (e.target === el('confirm-overlay')) { el('confirm-overlay').style.display = 'none'; idAkanHapus = null; } });
  el('reset-rak').addEventListener('click', e => { e.preventDefault(); resetData(); });
  el('reset-jurnal').addEventListener('click', e => { e.preventDefault(); resetData(); });
});
