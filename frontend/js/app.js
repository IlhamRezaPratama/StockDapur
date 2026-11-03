import { loginApi, logoutApi, cekSesiApi, getBahanApi, tambahBahanApi, ubahBahanApi, hapusBahanApi, catatApi } from './api.js';
import { renderRak, renderBon, renderCatat, renderJurnal, formatJumlah } from './ui.js';

let penggunaAktif = null;
let daftarBahan   = [];
let riwayat       = [];
let tabAktif      = 'rak';
let tipeCatatat   = 'masuk';
let idSedangEdit  = null;
let idAkanHapus   = null;

const el = id => document.getElementById(id);

function toast(pesan, tipe) {
  const t = el('toast');
  t.textContent = pesan;
  t.className = 'toast' + (tipe === 'red' ? ' t-red' : '') + ' show';
  setTimeout(() => t.className = 'toast', 2500);
}

function setTheme(tema) {
  const gelap = tema === 'dark';
  document.documentElement.dataset.theme = gelap ? 'dark' : 'light';
  localStorage.setItem('stockdapur-tema', gelap ? 'dark' : 'light');
  document.querySelectorAll('.theme-toggle').forEach(b => {
    b.innerHTML = gelap ? '<i data-lucide="sun"></i> Mode terang' : '<i data-lucide="moon"></i> Mode gelap';
    b.setAttribute('aria-pressed', String(gelap));
  });
  if (window.lucide) window.lucide.createIcons();
}

function render() {
  renderBon(daftarBahan);
  if (tabAktif === 'rak')    renderRak(daftarBahan);
  if (tabAktif === 'catat')  renderCatat(daftarBahan, riwayat, tipeCatatat);
  if (tabAktif === 'jurnal') renderJurnal(riwayat);
}

function pindahTab(nama) {
  tabAktif = nama;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === nama));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + nama));
  render();
}

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

async function tampilkanApp(pengguna) {
  penggunaAktif = pengguna;
  el('login-page').style.display = 'none';
  el('app').style.display = '';
  el('user-tag').innerHTML = `<i data-lucide="user-circle"></i> ${pengguna.nama} · <a href="#" id="btn-logout"><i data-lucide="log-out"></i> Keluar</a>`;
  lucide.createIcons();
  el('btn-logout').addEventListener('click', e => { e.preventDefault(); prosesLogout(); });
  const data = await getBahanApi();
  if (data.ok) daftarBahan = data.bahan;
  render();
}

async function prosesLogout() {
  await logoutApi();
  penggunaAktif = null;
  daftarBahan   = [];
  riwayat       = [];
  el('app').style.display = 'none';
  el('login-page').style.display = 'flex';
  el('form-login').reset();
}

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
  el('btn-simpan-bahan').innerHTML = '<i data-lucide="save"></i> Simpan perubahan';
  if (window.lucide) window.lucide.createIcons();
  const det = el('details-add');
  det.open = true;
  det.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

function resetFormBahan() {
  el('form-tambah').reset();
  el('add-id').value      = '';
  el('add-stok').disabled = false;
  el('btn-simpan-bahan').innerHTML = '<i data-lucide="save"></i> Simpan bahan';
  if (window.lucide) window.lucide.createIcons();
  idSedangEdit = null;
}

window.confirmDel = function(id) {
  const b = daftarBahan.find(x => x._id === id);
  if (!b) return;
  idAkanHapus = id;
  el('confirm-text').textContent = `Yakin ingin menghapus ${b.nama_bahan}?`;
  el('confirm-overlay').style.display = 'flex';
};

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

window.catatStok = function(id) {
  pindahTab('catat');
  el('catat-bahan').value = id;
  updateLabelJumlah();
  el('catat-jumlah').focus();
};

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

  const hasil = await catatApi(id, { tipe: tipeCatatat, jumlah, catatan });
  if (!hasil.ok) {
    errEl.textContent = hasil.pesan;
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  const idx = daftarBahan.findIndex(b => b._id === id);
  if (idx !== -1) daftarBahan[idx] = hasil.bahan;
  riwayat.push(hasil.transaksi);

  const verb = tipeCatatat === 'masuk' ? 'ditambahkan' : 'dikeluarkan';
  toast(`${formatJumlah(jumlah)} ${hasil.bahan.satuan} ${hasil.bahan.nama_bahan} berhasil ${verb}`);
  el('form-catat').reset();
  render();
}

function setTipeCatatat(tipe) {
  tipeCatatat = tipe;
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.type === tipe));
  const icon = tipe === 'masuk' ? 'arrow-down-to-line' : 'arrow-up-from-line';
  el('btn-catat-submit').innerHTML = `<i data-lucide="${icon}"></i> Catat ${tipe}`;
  if (window.lucide) window.lucide.createIcons();
  el('catat-error').style.display = 'none';
  updateLabelJumlah();
}

function updateLabelJumlah() {
  const b = daftarBahan.find(x => x._id === el('catat-bahan').value);
  el('catat-jumlah-label').innerHTML = `<i data-lucide="hash"></i> Jumlah ${tipeCatatat}${b ? ` (${b.satuan})` : ''}`;
  if (window.lucide) window.lucide.createIcons();
}

async function resetData() {
  riwayat      = [];
  idSedangEdit = null;
  resetFormBahan();
  const data = await getBahanApi();
  if (data.ok) daftarBahan = data.bahan;
  toast('Data berhasil dimuat ulang');
  render();
}

document.addEventListener('DOMContentLoaded', async () => {
  setTheme(localStorage.getItem('stockdapur-tema') === 'dark' ? 'dark' : 'light');

  document.querySelectorAll('.theme-toggle').forEach(b =>
    b.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'))
  );

  const sesi = await cekSesiApi().catch(() => ({ ok: false }));
  if (sesi.ok) { tampilkanApp(sesi.pengguna); return; }

  el('form-login').addEventListener('submit', prosesLogin);
  el('nav-tabs').addEventListener('click', e => { const b = e.target.closest('.tab-btn'); if (b) pindahTab(b.dataset.tab); });
  el('catat-toggle').addEventListener('click', e => { const b = e.target.closest('.toggle-btn'); if (b) setTipeCatatat(b.dataset.type); });
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
