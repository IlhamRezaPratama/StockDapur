/* ================================================
   Stok Dapur — App Logic (vanilla JS + fetch)
   ================================================ */

// ── State ──
let currentUser = null;
let bahanList   = [];
let riwayat     = [];
let currentTab  = 'rak';
let catatType   = 'masuk';   // 'masuk' | 'keluar'
let editingId   = null;
let deleteId    = null;

// ── Helpers ──
const $  = id => document.getElementById(id);
const formatRp = n => 'Rp' + Number(n).toLocaleString('id-ID');
const formatJumlah = n => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 10 });

function formatWaktu(iso) {
  const d = new Date(iso);
  const day   = d.getDate();
  const month = d.toLocaleString('id-ID', { month: 'short' });
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month}, ${h}.${m}`;
}

function hariIni() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
  });
}

function nextId() {
  return bahanList.length ? Math.max(...bahanList.map(b => b.id)) + 1 : 1;
}

function getStatus(b) {
  if (b.stok < b.min_stok)       return { label: 'Menipis',        cls: 'red'    };
  if (b.stok < b.min_stok * 1.5) return { label: 'Hampir menipis', cls: 'yellow' };
  return                                 { label: 'Aman',           cls: 'green'  };
}

function levelPercent(b) {
  if (b.min_stok === 0) return 100;
  return Math.min(Math.round((b.stok / (b.min_stok * 2)) * 100), 100);
}

// ── Toast ──
function toast(msg, type) {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast' + (type === 'red' ? ' t-red' : '') + ' show';
  setTimeout(() => el.className = 'toast', 2500);
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  localStorage.setItem('stok-dapur-theme', isDark ? 'dark' : 'light');

  document.querySelectorAll('.theme-toggle').forEach(button => {
    button.textContent = isDark ? ' Mode terang' : ' Mode gelap';
    button.setAttribute('aria-pressed', String(isDark));
  });
}

// ── Auth ──
async function login(user, pass) {
  const res  = await fetch('data/users.json');
  const data = await res.json();
  return data.users.find(u => u.username === user && u.password === pass) || null;
}

function doLogin(user) {
  currentUser = user;
  $('login-page').style.display = 'none';
  $('app').style.display = '';
  $('user-tag').innerHTML = `${user.nama} · <a href="#" id="btn-logout">Keluar</a>`;
  $('btn-logout').addEventListener('click', e => { e.preventDefault(); doLogout(); });
  loadStok();
}

function doLogout() {
  currentUser = null;
  bahanList = [];
  riwayat = [];
  $('app').style.display = 'none';
  $('login-page').style.display = 'flex';
  $('form-login').reset();
  $('login-error').style.display = 'none';
}

// ── Data ──
async function loadStok() {
  try {
    const res  = await fetch('data/stok.json');
    const data = await res.json();
    if (data.status === 'success') bahanList = data.bahan;
  } catch (e) { console.error('Gagal memuat stok.json', e); }
  render();
}

function resetData() {
  riwayat = [];
  editingId = null;
  resetForm();
  loadStok();
  toast('Data berhasil direset');
}

// ── Tab Switching ──
function switchTab(name) {
  currentTab = name;
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p =>
    p.classList.toggle('active', p.id === 'tab-' + name));
  render();
}

// ── Render Router ──
function render() {
  renderBon();
  switch (currentTab) {
    case 'rak':    renderRak();    break;
    case 'catat':  renderCatat();  break;
    case 'jurnal': renderJurnal(); break;
  }
}

// ── Render: Rak ──
function renderRak() {
  const total   = bahanList.length;
  const menipis = bahanList.filter(b => b.stok < b.min_stok).length;
  const nilai   = bahanList.reduce((s, b) => s + b.stok * b.harga_satuan, 0);

  $('summary-bar').innerHTML =
    `<span><span class="val">${total}</span> bahan</span>` +
    `<span><span class="val-red">${menipis}</span> menipis</span>` +
    `<span>Nilai stok <span class="val-green">${formatRp(nilai)}</span></span>`;

  $('bahan-grid').innerHTML = bahanList.map(b => {
    const s   = getStatus(b);
    const pct = levelPercent(b);
    return `
      <div class="bahan-card">
        <div class="card-top">
          <span class="badge badge-${s.cls}">${s.label}</span>
          <div class="card-actions">
            <button class="btn-icon" title="Ubah" onclick="startEdit(${b.id})">✏️</button>
            <button class="btn-icon" title="Hapus" onclick="confirmDel(${b.id})">🗑️</button>
          </div>
        </div>
        <div class="card-name">${b.nama_bahan}</div>
        <div class="card-stok">
          <span class="num">${formatJumlah(b.stok)}</span>
          <span class="unit">${b.satuan}</span>
        </div>
        <div class="level-bar"><div class="level-fill fill-${s.cls}" style="width:${pct}%"></div></div>
        <div class="card-meta">Min ${formatJumlah(b.min_stok)} ${b.satuan}<br>${formatRp(b.harga_satuan)} per ${b.satuan}</div>
        <button class="btn-catat" onclick="catatStok(${b.id})">Catat stok</button>
      </div>`;
  }).join('');
}

// ── Render: Bon Belanja ──
function renderBon() {
  const menipis = bahanList.filter(b => b.stok < b.min_stok);
  let html = `<div class="bon-title">Bon belanja</div><div class="bon-date">${hariIni()}</div>`;

  if (menipis.length === 0) {
    html += `<hr class="bon-divider"><div class="bon-empty">Semua stok aman 👍</div>`;
  } else {
    html += `<hr class="bon-divider">`;
    let grandTotal = 0;
    menipis.forEach(b => {
      const perlu = b.min_stok - b.stok;
      const biaya = perlu * b.harga_satuan;
      grandTotal += biaya;
      html += `
        <div class="bon-line">
          <span class="bon-name">${b.nama_bahan}</span>
          <span class="bon-detail">${formatJumlah(perlu)} ${b.satuan} <span class="bon-price">${formatRp(biaya)}</span></span>
        </div>`;
    });
    html += `<hr class="bon-divider">`;
    html += `<div class="bon-total"><span>Total</span><span class="bon-price">${formatRp(grandTotal)}</span></div>`;
    html += `<div class="bon-note">Estimasi beli sampai batas minimum.</div>`;
  }

  $('bon-belanja').innerHTML = html;
}

// ── Render: Catat ──
function renderCatat() {
  // Populate select
  const sel = $('catat-bahan');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Pilih bahan</option>';
  bahanList.forEach(b => {
    sel.innerHTML += `<option value="${b.id}">${b.nama_bahan} (${formatJumlah(b.stok)})</option>`;
  });
  if (cur) sel.value = cur;
  updateCatatJumlahLabel();

  // Recent entries (last 10)
  const entries = [...riwayat].reverse().slice(0, 10);
  if (entries.length === 0) {
    $('recent-entries').innerHTML = '';
    $('recent-empty').style.display = '';
  } else {
    $('recent-empty').style.display = 'none';
    $('recent-entries').innerHTML = entries.map(entryHTML).join('');
  }
}

// ── Render: Jurnal ──
function renderJurnal() {
  const entries = [...riwayat].reverse();
  if (entries.length === 0) {
    $('jurnal-entries').innerHTML = '';
    $('jurnal-empty').style.display = '';
  } else {
    $('jurnal-empty').style.display = 'none';
    $('jurnal-entries').innerHTML = entries.map(entryHTML).join('');
  }
}

// ── Entry HTML (shared) ──
function entryHTML(r) {
  const isMasuk = r.tipe === 'masuk';
  const sign  = isMasuk ? '+' : '-';
  const color = isMasuk ? 'green' : 'red';
  return `
    <div class="entry">
      <div class="entry-border b-${color}"></div>
      <div class="entry-date">${formatWaktu(r.waktu)}</div>
      <div class="entry-body">
        <div class="entry-main">
          <span class="entry-amount a-${color}">${sign}${formatJumlah(r.jumlah)} ${r.satuan}</span> ${r.nama_bahan}
        </div>
        ${r.catatan ? `<div class="entry-note">${r.catatan}</div>` : ''}
      </div>
    </div>`;
}

// ── Catat Stok (from card button) ──
function catatStok(id) {
  switchTab('catat');
  $('catat-bahan').value = id;
  updateCatatJumlahLabel();
  $('catat-jumlah').focus();
}

// ── Process Catat ──
function processCatat(e) {
  e.preventDefault();
  const id      = parseInt($('catat-bahan').value);
  const jumlah  = Number($('catat-jumlah').value);
  const catatan = $('catat-catatan').value.trim();
  const errEl   = $('catat-error');

  if (!id || !Number.isFinite(jumlah) || jumlah <= 0) {
    errEl.textContent = 'Masukkan jumlah yang lebih besar dari 0.';
    errEl.style.display = 'block';
    return;
  }
  const b = bahanList.find(x => x.id === id);
  if (!b) return;

  if (catatType === 'keluar') {
    if (jumlah > b.stok) {
      errEl.textContent = `Gagal! Jumlah keluar (${formatJumlah(jumlah)}) melebihi stok tersedia (${formatJumlah(b.stok)} ${b.satuan}).`;
      errEl.style.display = 'block';
      return;
    }
    b.stok -= jumlah;
  } else {
    b.stok += jumlah;
  }

  errEl.style.display = 'none';

  riwayat.push({
    waktu: new Date().toISOString(),
    tipe: catatType,
    id_bahan: b.id,
    nama_bahan: b.nama_bahan,
    jumlah,
    satuan: b.satuan,
    stok_setelah: b.stok,
    oleh: currentUser.nama,
    catatan
  });

  const verb = catatType === 'masuk' ? 'ditambahkan' : 'dikeluarkan';
  toast(`${formatJumlah(jumlah)} ${b.satuan} ${b.nama_bahan} berhasil ${verb}`);
  $('form-catat').reset();
  render();
}

// ── Toggle Masuk/Keluar ──
function setCatatType(type) {
  catatType = type;
  document.querySelectorAll('.toggle-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.type === type));
  updateCatatJumlahLabel();
  $('btn-catat-submit').textContent   = 'Catat ' + type;
  $('catat-error').style.display = 'none';
}

function updateCatatJumlahLabel() {
  const b = bahanList.find(item => item.id === Number($('catat-bahan').value));
  $('catat-jumlah-label').textContent = `Jumlah ${catatType}${b ? ` (${b.satuan})` : ''}`;
}

// ── CRUD: Tambah / Ubah ──
function resetForm() {
  $('form-tambah').reset();
  $('add-id').value = '';
  $('add-stok').disabled = false;
  $('btn-simpan-bahan').textContent = 'Simpan bahan';
  editingId = null;
}

function saveBahan(e) {
  e.preventDefault();
  const nama   = $('add-nama').value.trim();
  const satuan = $('add-satuan').value.trim();
  const stok   = Number($('add-stok').value) || 0;
  const min    = Number($('add-min').value) || 0;
  const harga  = parseInt($('add-harga').value) || 0;

  if (editingId !== null) {
    const b = bahanList.find(x => x.id === editingId);
    if (b) {
      b.nama_bahan   = nama;
      b.satuan       = satuan;
      b.min_stok     = min;
      b.harga_satuan = harga;
    }
    toast('Bahan berhasil diubah');
  } else {
    bahanList.push({ id: nextId(), nama_bahan: nama, stok, satuan, min_stok: min, harga_satuan: harga });
    toast('Bahan berhasil ditambahkan');
  }

  resetForm();
  $('details-add').open = false;
  render();
}

function startEdit(id) {
  const b = bahanList.find(x => x.id === id);
  if (!b) return;
  editingId = id;
  $('add-id').value     = b.id;
  $('add-nama').value   = b.nama_bahan;
  $('add-satuan').value = b.satuan;
  $('add-stok').value   = b.stok;
  $('add-stok').disabled = true;
  $('add-min').value    = b.min_stok;
  $('add-harga').value  = b.harga_satuan;
  $('btn-simpan-bahan').textContent = 'Simpan perubahan';

  const det = $('details-add');
  det.open = true;
  det.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── CRUD: Hapus ──
function confirmDel(id) {
  const b = bahanList.find(x => x.id === id);
  if (!b) return;
  deleteId = id;
  $('confirm-text').textContent = `Yakin ingin menghapus "${b.nama_bahan}"?`;
  $('confirm-overlay').style.display = 'flex';
}

function doDelete() {
  if (deleteId !== null) {
    bahanList = bahanList.filter(b => b.id !== deleteId);
    toast('Bahan berhasil dihapus', 'red');
    deleteId = null;
  }
  $('confirm-overlay').style.display = 'none';
  render();
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem('stok-dapur-theme') === 'dark' ? 'dark' : 'light');
  document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  }));

  // Login
  $('form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const user = await login($('login-user').value.trim(), $('login-pass').value);
    if (user) {
      $('login-error').style.display = 'none';
      doLogin(user);
    } else {
      $('login-error').textContent = 'Username atau password salah!';
      $('login-error').style.display = 'block';
    }
  });

  // Tabs
  $('nav-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (btn) switchTab(btn.dataset.tab);
  });

  // Catat toggle
  $('catat-toggle').addEventListener('click', e => {
    const btn = e.target.closest('.toggle-btn');
    if (btn) setCatatType(btn.dataset.type);
  });

  // Catat form
  $('form-catat').addEventListener('submit', processCatat);
  $('catat-bahan').addEventListener('change', updateCatatJumlahLabel);

  // Tambah/ubah form
  $('form-tambah').addEventListener('submit', saveBahan);

  // Reset form when details closes
  $('details-add').addEventListener('toggle', function () {
    if (!this.open && editingId !== null) resetForm();
  });

  // Delete confirm
  $('confirm-yes').addEventListener('click', doDelete);
  $('confirm-no').addEventListener('click', () => {
    $('confirm-overlay').style.display = 'none';
    deleteId = null;
  });
  $('confirm-overlay').addEventListener('click', e => {
    if (e.target === $('confirm-overlay')) {
      $('confirm-overlay').style.display = 'none';
      deleteId = null;
    }
  });

  // Reset data
  $('reset-rak').addEventListener('click', e => { e.preventDefault(); resetData(); });
  $('reset-jurnal').addEventListener('click', e => { e.preventDefault(); resetData(); });
});
