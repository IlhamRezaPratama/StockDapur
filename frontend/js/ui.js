// ui.js
// File ini berisi semua fungsi yang bertugas menggambar dan memperbarui tampilan di halaman.
// Semua manipulasi HTML dan DOM dilakukan di sini, dipisah dari logika utama di app.js
// agar setiap bagian punya tanggung jawab yang jelas dan mudah dicari kalau ada masalah.

// Fungsi pembantu untuk mengubah angka menjadi format mata uang Rupiah.
// Contoh: angka 38000 akan menjadi Rp38.000 sesuai format Indonesia.
export const formatRp = n => 'Rp' + Number(n).toLocaleString('id-ID');

// Fungsi pembantu untuk menampilkan angka dengan pemisah ribuan gaya Indonesia.
// Mendukung angka desimal sampai 10 angka di belakang koma untuk satuan seperti liter atau kg.
export const formatJumlah = n => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 10 });

// Fungsi pembantu untuk mengubah waktu dari format ISO menjadi tampilan yang mudah dibaca.
// Contoh hasil: 2 Nov, 21.30 artinya tanggal 2 bulan November jam 21.30.
export function formatWaktu(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}, ${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}`;
}

// Fungsi pembantu untuk menampilkan hari dan tanggal lengkap hari ini.
// Hasilnya seperti: Minggu, 2 Nov 2026. Dipakai di bagian header bon belanja.
export const hariIni = () => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

// FITUR: Tentukan status stok setiap bahan
// Status ditentukan berdasarkan perbandingan stok saat ini dengan batas minimum yang diset.
// Kalau stok sudah di bawah minimum maka statusnya Menipis dan ditandai warna merah.
// Kalau stok masih di atas minimum tapi belum mencapai 1.5 kali minimum, statusnya Hampir menipis warna kuning.
// Kalau stok masih lebih dari 1.5 kali minimum maka statusnya Aman dan ditandai warna hijau.
export function getStatus(b) {
  if (b.stok < b.min_stok)       return { label: 'Menipis',        cls: 'red'    };
  if (b.stok < b.min_stok * 1.5) return { label: 'Hampir menipis', cls: 'yellow' };
  return                                 { label: 'Aman',           cls: 'green'  };
}

// Fungsi pembantu untuk menghitung persentase level stok yang ditampilkan sebagai progress bar.
// Level dihitung relatif terhadap dua kali batas minimum. Kalau batas minimumnya nol maka level penuh.
// Hasilnya dibatasi maksimal 100 persen agar progress bar tidak keluar dari tempatnya.
function levelPercent(b) {
  if (b.min_stok === 0) return 100;
  return Math.min(Math.round((b.stok / (b.min_stok * 2)) * 100), 100);
}

// FITUR: Render halaman Rak
// Fungsi ini menggambar seluruh isi halaman Rak setiap kali dipanggil.
// Pertama menghitung dan menampilkan ringkasan: jumlah bahan, berapa yang menipis,
// dan total nilai seluruh stok berdasarkan harga satuan masing-masing bahan.
// Kemudian menggambar kartu untuk setiap bahan lengkap dengan status, progress bar,
// info stok minimum, harga, dan tombol untuk mengedit, menghapus, atau mencatat stok.
export function renderRak(bahanList) {
  const total   = bahanList.length;
  const menipis = bahanList.filter(b => b.stok < b.min_stok).length;
  const nilai   = bahanList.reduce((s, b) => s + b.stok * b.harga_satuan, 0);

  document.getElementById('summary-bar').innerHTML =
    `<span><span class="val">${total}</span> bahan</span>` +
    `<span><span class="val-red">${menipis}</span> menipis</span>` +
    `<span>Nilai stok <span class="val-green">${formatRp(nilai)}</span></span>`;

  document.getElementById('bahan-grid').innerHTML = bahanList.map(b => {
    const s   = getStatus(b);
    const pct = levelPercent(b);
    return `
      <div class="bahan-card">
        <div class="card-top">
          <span class="badge badge-${s.cls}">${s.label}</span>
          <div class="card-actions">
            <button class="btn-icon" title="Ubah" onclick="startEdit('${b._id}')">✏️</button>
            <button class="btn-icon" title="Hapus" onclick="confirmDel('${b._id}')">🗑️</button>
          </div>
        </div>
        <div class="card-name">${b.nama_bahan}</div>
        <div class="card-stok">
          <span class="num">${formatJumlah(b.stok)}</span>
          <span class="unit">${b.satuan}</span>
        </div>
        <div class="level-bar"><div class="level-fill fill-${s.cls}" style="width:${pct}%"></div></div>
        <div class="card-meta">Min ${formatJumlah(b.min_stok)} ${b.satuan}<br>${formatRp(b.harga_satuan)} per ${b.satuan}</div>
        <button class="btn-catat" onclick="catatStok('${b._id}')">Catat stok</button>
      </div>`;
  }).join('');
}

// FITUR: Render Bon Belanja di sidebar kanan
// Fungsi ini menghitung bahan-bahan yang stoknya sudah di bawah batas minimum
// lalu menampilkannya sebagai daftar belanja lengkap dengan estimasi biaya.
// Jumlah yang perlu dibeli dihitung dari selisih antara batas minimum dan stok sekarang.
// Di bagian bawah ditampilkan total keseluruhan estimasi biaya untuk semua bahan yang menipis.
// Kalau semua stok aman maka ditampilkan pesan bahwa tidak ada yang perlu dibeli.
export function renderBon(bahanList) {
  const menipis = bahanList.filter(b => b.stok < b.min_stok);
  let html = `<div class="bon-title">Bon belanja</div><div class="bon-date">${hariIni()}</div>`;

  if (!menipis.length) {
    html += `<hr class="bon-divider"><div class="bon-empty">Semua stok aman 👍</div>`;
  } else {
    let total = 0;
    html += `<hr class="bon-divider">`;
    menipis.forEach(b => {
      const perlu = b.min_stok - b.stok;
      const biaya = perlu * b.harga_satuan;
      total += biaya;
      html += `<div class="bon-line"><span class="bon-name">${b.nama_bahan}</span><span class="bon-detail">${formatJumlah(perlu)} ${b.satuan} <span class="bon-price">${formatRp(biaya)}</span></span></div>`;
    });
    html += `<hr class="bon-divider"><div class="bon-total"><span>Total</span><span class="bon-price">${formatRp(total)}</span></div>`;
    html += `<div class="bon-note">Estimasi beli sampai batas minimum.</div>`;
  }
  document.getElementById('bon-belanja').innerHTML = html;
}

// FITUR: Render tab Catat
// Fungsi ini memperbarui tampilan di halaman Catat setiap kali dipanggil.
// Pertama mengisi dropdown pilihan bahan dengan data terbaru dari daftar bahan,
// termasuk menampilkan jumlah stok saat ini di sebelah nama bahan agar mudah dilihat.
// Kemudian menampilkan 10 transaksi terakhir yang sudah dicatat sebagai riwayat singkat.
// Kalau belum ada transaksi sama sekali maka ditampilkan pesan bahwa belum ada catatan.
export function renderCatat(bahanList, riwayat, catatType) {
  const sel = document.getElementById('catat-bahan');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Pilih bahan</option>';
  bahanList.forEach(b => { sel.innerHTML += `<option value="${b._id}">${b.nama_bahan} (${formatJumlah(b.stok)})</option>`; });
  if (cur) sel.value = cur;

  const entries = [...riwayat].reverse().slice(0, 10);
  document.getElementById('recent-empty').style.display = entries.length ? 'none' : '';
  document.getElementById('recent-entries').innerHTML   = entries.map(entryHTML).join('');
}

// FITUR: Render tab Jurnal
// Fungsi ini menampilkan seluruh riwayat transaksi dari yang paling baru ke yang paling lama.
// Berbeda dengan tab Catat yang hanya menampilkan 10 terakhir,
// Jurnal menampilkan semua transaksi yang pernah terjadi selama sesi berlangsung.
// Kalau belum ada riwayat sama sekali maka ditampilkan pesan bahwa belum ada riwayat.
export function renderJurnal(riwayat) {
  const entries = [...riwayat].reverse();
  document.getElementById('jurnal-empty').style.display = entries.length ? 'none' : '';
  document.getElementById('jurnal-entries').innerHTML   = entries.map(entryHTML).join('');
}

// Fungsi pembantu untuk membuat tampilan HTML satu baris transaksi di riwayat.
// Setiap baris menampilkan waktu, nama bahan, jumlah dengan tanda plus atau minus,
// dan catatan kalau ada. Warna hijau untuk masuk dan merah untuk keluar.
export function entryHTML(r) {
  const masuk = r.tipe === 'masuk';
  const sign  = masuk ? '+' : '-';
  const color = masuk ? 'green' : 'red';
  return `
    <div class="entry">
      <div class="entry-border b-${color}"></div>
      <div class="entry-date">${formatWaktu(r.waktu)}</div>
      <div class="entry-body">
        <div class="entry-main"><span class="entry-amount a-${color}">${sign}${formatJumlah(r.jumlah)} ${r.satuan}</span> ${r.namaBahan}</div>
        ${r.catatan ? `<div class="entry-note">${r.catatan}</div>` : ''}
      </div>
    </div>`;
}
