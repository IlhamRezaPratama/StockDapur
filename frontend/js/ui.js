export const formatRp = n => 'Rp' + Number(n).toLocaleString('id-ID');

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

export const formatJumlah = n => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 10 });

export function formatWaktu(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}, ${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}`;
}

export const hariIni = () => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

export function getStatus(b) {
  if (b.stok < b.min_stok)       return { label: 'Menipis',        cls: 'red'    };
  if (b.stok < b.min_stok * 1.5) return { label: 'Hampir menipis', cls: 'yellow' };
  return                                 { label: 'Aman',           cls: 'green'  };
}

function levelPercent(b) {
  if (b.min_stok === 0) return 100;
  return Math.min(Math.round((b.stok / (b.min_stok * 2)) * 100), 100);
}

export function renderRak(bahanList) {
  const total   = bahanList.length;
  const menipis = bahanList.filter(b => b.stok < b.min_stok).length;
  const nilai   = bahanList.reduce((s, b) => s + b.stok * b.harga_satuan, 0);

  document.getElementById('summary-bar').innerHTML =
    `<span><i data-lucide="package-2"></i> <span class="val">${total}</span> bahan</span>` +
    `<span><i data-lucide="triangle-alert"></i> <span class="val-red">${menipis}</span> menipis</span>` +
    `<span><i data-lucide="banknote"></i> Nilai stok <span class="val-green">${formatRp(nilai)}</span></span>`;

  document.getElementById('bahan-grid').innerHTML = bahanList.map(b => {
    const s   = getStatus(b);
    const pct = levelPercent(b);
    return `
      <div class="bahan-card">
        <div class="card-top">
          <span class="badge badge-${s.cls}">${s.label}</span>
          <div class="card-actions">
            <button class="btn-icon" title="Ubah" onclick="startEdit('${b._id}')"><i data-lucide="pencil"></i></button>
            <button class="btn-icon" title="Hapus" onclick="confirmDel('${b._id}')"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <div class="card-name">${b.nama_bahan}</div>
        <div class="card-stok">
          <span class="num">${formatJumlah(b.stok)}</span>
          <span class="unit">${b.satuan}</span>
        </div>
        <div class="level-bar"><div class="level-fill fill-${s.cls}" style="width:${pct}%"></div></div>
        <div class="card-meta">Min ${formatJumlah(b.min_stok)} ${b.satuan}<br>${formatRp(b.harga_satuan)} per ${b.satuan}</div>
        <button class="btn-catat" onclick="catatStok('${b._id}')"><i data-lucide="clipboard-pen"></i> Catat stok</button>
      </div>`;
  }).join('');
  
  refreshIcons();
}

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
  refreshIcons();
}

export function renderCatat(bahanList, riwayat, catatType) {
  const sel = document.getElementById('catat-bahan');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Pilih bahan</option>';
  bahanList.forEach(b => { sel.innerHTML += `<option value="${b._id}">${b.nama_bahan} (${formatJumlah(b.stok)})</option>`; });
  if (cur) sel.value = cur;

  const entries = [...riwayat].reverse().slice(0, 10);
  document.getElementById('recent-empty').style.display = entries.length ? 'none' : '';
  document.getElementById('recent-entries').innerHTML   = entries.map(entryHTML).join('');
  refreshIcons();
}

export function renderJurnal(riwayat) {
  const entries = [...riwayat].reverse();
  document.getElementById('jurnal-empty').style.display = entries.length ? 'none' : '';
  document.getElementById('jurnal-entries').innerHTML   = entries.map(entryHTML).join('');
  refreshIcons();
}

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
