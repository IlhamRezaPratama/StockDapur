# LAPORAN TUGAS PEMROGRAMAN WEB: PENJELASAN SOURCE CODE SISTEM INFORMASI STOK DAPUR

---

## COVER
* **Judul Website:** Stok Dapur — Aplikasi Manajemen Stok Bahan Baku Dapur
* **Mata Kuliah:** Pemrograman Web (Semester 5)
* **Teknologi Utama:** HTML5, CSS3, Vanilla JavaScript (ES6+), Node.js (Express.js), MongoDB Atlas Cloud
* **Deployment:** GitHub Pages (Frontend) & Vercel Serverless Functions (Backend)

---

## DAFTAR ISI

1. **Bagian HTML (`index.html`)**
   - Contoh 1: Form Catat Transaksi Stok (Masuk & Keluar)
   - Contoh 2: Halaman Login & Formulir Autentikasi
   - Contoh 3: Topbar Navigasi, Identitas Pengguna & Tombol Tema
   - Contoh 4: Tab Rak Stok & Ringkasan Metrik Bahan
   - Contoh 5: Formulir Tambah dan Edit Bahan Baku
   - Contoh 6: Sidebar Bon Belanja Kebutuhan Dapur
   - Contoh 7: Modal Konfirmasi Penghapusan & Toast Notifikasi

2. **Bagian JavaScript Frontend — Logika & State (`frontend/js/app.js`)**
   - Contoh 8: Manajemen State Global Aplikasi
   - Contoh 9: Fitur Pergantian Tema Terang dan Gelap (`setTheme`)
   - Contoh 10: Mekanisme Navigasi Antar Tab & Render Dinamis (`pindahTab` & `render`)
   - Contoh 11: Pemrosesan Login Pengguna (`prosesLogin` & `tampilkanApp`)
   - Contoh 12: Penanganan Simpan Bahan (Tambah Baru vs Edit Data) (`simpanBahan`)
   - Contoh 13: Mode Edit Bahan & Scroll Otomatis ke Form (`window.startEdit`)
   - Contoh 14: Logika Transaksi Catat Stok Masuk/Keluar (`prosesCatat` & `setTipeCatatat`)
   - Contoh 15: Konfirmasi dan Eksekusi Hapus Bahan (`window.confirmDel` & `hapusBahan`)

3. **Bagian JavaScript Frontend — Tampilan & Manipulasi DOM (`frontend/js/ui.js`)**
   - Contoh 16: Logika Klasifikasi Status Level Stok (`getStatus`)
   - Contoh 17: Perhitungan Persentase Level Bar Stok (`levelPercent`)
   - Contoh 18: Render Kartu Bahan pada Rak & Ringkasan Metrik (`renderRak`)
   - Contoh 19: Kalkulasi Kebutuhan & Render Bon Belanja (`renderBon`)
   - Contoh 20: Template Baris Riwayat Transaksi Jurnal (`entryHTML`)
   - Contoh 21: Fungsi Pembantu Format Rupiah, Angka & Waktu (`formatRp`, `formatJumlah`, `formatWaktu`)

4. **Bagian JavaScript Frontend — Komunikasi API Backend (`frontend/js/api.js`)**
   - Contoh 22: Konfigurasi Base URL & Pembuatan Opsi Request Fetch (`BASE`, `authToken`, `opt`)
   - Contoh 23: Fungsi API Autentikasi Sesi (`loginApi`, `logoutApi`, `cekSesiApi`)
   - Contoh 24: Fungsi API CRUD Data Bahan Baku (`getBahanApi`, `tambahBahanApi`, `ubahBahanApi`, `hapusBahanApi`)
   - Contoh 25: Fungsi API Transaksi Stok Masuk dan Keluar (`catatApi`)

5. **Bagian Backend Server Express & Database MongoDB (`backend/server.js`)**
   - Contoh 26: Koneksi Database MongoDB Atlas dengan Caching Serverless (`getDB`, `cachedDb`)
   - Contoh 27: Konfigurasi CORS & Header Keamanan Preflight OPTIONS
   - Contoh 28: Middleware Penjaga Autentikasi Basic Auth (`harusLogin`)
   - Contoh 29: Endpoint Login Pengguna & Penerbitan Token (`POST /api/auth/masuk`)
   - Contoh 30: Endpoint CRUD Bahan Baku (`GET /api/stok`, `POST /api/stok`, `PUT /api/stok/:id`, `DELETE /api/stok/:id`)
   - Contoh 31: Endpoint Pemrosesan Transaksi Stok Masuk/Keluar (`POST /api/stok/:id/catat`)

6. **Bagian Desain & Tata Letak CSS (`frontend/css/style.css`)**
   - Contoh 32: Variabel Desain Token & CSS Custom Properties Tema
   - Contoh 33: Grid Kartu Responsif & Komponen Level Bar

---

# 1. BAGIAN HTML (`index.html`)

### Contoh 1: Bagian HTML (`index.html` - Form Catat Stok)
*(Di sini kamu tempel screenshot potongan kodingan form catat)*

```html
<div class="toggle-group" id="catat-toggle">
    <button class="toggle-btn active" data-type="masuk">Masuk</button>
    <button class="toggle-btn" data-type="keluar">Keluar</button>
</div>

<form id="form-catat" autocomplete="off">
    <div class="field">
        <label for="catat-bahan">Bahan</label>
        <select id="catat-bahan" required>
            <option value="">Pilih bahan</option>
        </select>
    </div>
    <div class="field">
        <label id="catat-jumlah-label" for="catat-jumlah">Jumlah masuk</label>
        <input type="number" id="catat-jumlah" min="0" step="any" placeholder="0" required>
    </div>
```

**Penjelasan Source Code:** Bagian ini adalah formulir yang digunakan pengguna untuk mencatat transaksi barang, baik saat stok bahan bertambah (masuk) maupun saat bahan digunakan (keluar).
* `<button class="toggle-btn" data-type="masuk">`: Tombol pilihan jenis transaksi. Atribut `data-type` digunakan oleh JavaScript untuk mengetahui apakah pengguna sedang mencatat stok masuk atau stok keluar.
* `<form id="form-catat" autocomplete="off">`: Tag pembungkus formulir input. Diberi `autocomplete="off"` agar saran riwayat ketikan browser tidak menutupi tampilan form.
* `<select id="catat-bahan" required>`: Menu dropdown untuk memilih bahan yang transaksinya ingin dicatat. Atribut `required` memastikan formulir tidak bisa dikirim jika pengguna belum memilih bahan.
* `<input type="number" min="0" step="any" required>`: Kolom untuk memasukkan jumlah kuantitas bahan. Atribut `min="0"` mencegah pengisian angka minus, sedangkan `step="any"` mengizinkan input bilangan desimal (misalnya 1.5 kg atau 0.25 liter).

---

### Contoh 2: Bagian HTML (`index.html` - Halaman Login & Formulir Autentikasi)
*(Di sini kamu tempel screenshot potongan kodingan login)*

```html
<div id="login-page" class="login-page">
  <div class="login-box">
    <h1 class="login-title">Stok Dapur</h1>
    <p class="login-sub">Masuk untuk mengelola stok bahan baku</p>

    <div class="login-theme-row">
      <button type="button" class="theme-toggle" aria-pressed="false"> Mode gelap</button>
    </div>

    <form id="form-login" autocomplete="off">
      <div class="field">
        <label for="login-user">Username</label>
        <input type="text" id="login-user" placeholder="Masukkan username" required>
      </div>
      <div class="field">
        <label for="login-pass">Password</label>
        <input type="password" id="login-pass" placeholder="Masukkan password" required>
      </div>

      <div id="login-error" class="err" style="display:none"></div>

      <button type="submit" class="btn btn-green btn-full">Masuk</button>
    </form>
  </div>
</div>
```

**Penjelasan Source Code:** Bagian ini merupakan struktur tampilan awal antarmuka login aplikasi sebelum pengguna diberikan hak akses ke dalam dasbor manajemen stok bahan.
* `<div id="login-page" class="login-page">`: Kontainer layar penuh halaman login yang secara default berstatus aktif saat browser dibuka pertama kali.
* `<button type="button" class="theme-toggle">`: Tombol independen yang memungkinkan calon pengguna mengubah preferensi tema tampilan (terang/gelap) bahkan sebelum melakukan login.
* `<input type="text" id="login-user" required>` & `<input type="password" id="login-pass" required>`: Elemen input data kredensial akun pengguna yang divalidasi langsung oleh browser melalui atribut `required`.
* `<div id="login-error" class="err" style="display:none">`: Wadah teks notifikasi galat yang dimanipulasi oleh JavaScript untuk muncul apabila kredensial username/password salah.
* `<button type="submit" class="btn btn-green btn-full">`: Tombol eksekusi pengiriman formulir login yang memicu event listener `submit` pada JavaScript.

---

### Contoh 3: Bagian HTML (`index.html` - Topbar Navigasi, Identitas Pengguna & Navigasi Tab)
*(Di sini kamu tempel screenshot potongan kodingan topbar & tab)*

```html
<header class="topbar">
  <h1 class="topbar-title">Stok dapur</h1>
  <div class="topbar-right">
    <span class="user-tag" id="user-tag"></span>
    <button type="button" class="theme-toggle" id="theme-toggle" aria-pressed="false"> Mode gelap</button>
    <nav class="tabs" id="nav-tabs">
      <button class="tab-btn active" data-tab="rak">Rak</button>
      <button class="tab-btn" data-tab="catat">Catat</button>
      <button class="tab-btn" data-tab="jurnal">Jurnal</button>
    </nav>
  </div>
</header>
```

**Penjelasan Source Code:** Bagian ini berfungsi sebagai header aplikasi utama yang berisi branding, penampil identitas pengguna aktif, tombol pengubah tema, dan navigasi tab antar panel.
* `<header class="topbar">`: Pembungkus baris navigasi atas dengan tata letak flexbox modern untuk memisahkan judul aplikasi di kiri dan menu kontrol di kanan.
* `<span class="user-tag" id="user-tag">`: Kontainer dinamis yang nantinya diisi oleh JavaScript berisi nama staf yang sedang bertugas beserta tautan aksi keluar (`logout`).
* `<button class="theme-toggle" id="theme-toggle">`: Pengalih mode tampilan aplikasi dari tema terang (light) ke mode gelap (dark) secara realtime.
* `<nav class="tabs" id="nav-tabs">`: Wadah navigasi utama untuk sistem Single Page Application (SPA).
* `<button class="tab-btn active" data-tab="rak">`: Tombol tab yang menyertakan atribut `data-tab="rak"` agar skrip JavaScript dapat mengidentifikasi panel konten mana yang harus diaktifkan tanpa reload halaman.

---

### Contoh 4: Bagian HTML (`index.html` - Tab Rak Stok & Ringkasan Metrik Bahan)
*(Di sini kamu tempel screenshot potongan kodingan tab rak)*

```html
<section id="tab-rak" class="tab-panel active">
  <div class="summary" id="summary-bar"></div>
  <div class="bahan-grid" id="bahan-grid"></div>
  <details class="details-add" id="details-add">
    <summary>Tambah bahan baru</summary>
    ...
  </details>
  <a href="#" class="reset-link" id="reset-rak">Reset data contoh</a>
</section>
```

**Penjelasan Source Code:** Bagian ini merepresentasikan panel utama beranda "Rak" tempat visualisasi seluruh inventaris stok dapur disajikan kepada pengguna.
* `<section id="tab-rak" class="tab-panel active">`: Panel penampung yang diberi kelas `active` untuk menjadikannya tampilan awal yang langsung terlihat begitu login berhasil.
* `<div class="summary" id="summary-bar">`: Baris ringkasan metrik statistik yang menampilkan total varian bahan, jumlah stok yang menipis, dan total estimasi aset nilai rupiah dari seluruh stok.
* `<div class="bahan-grid" id="bahan-grid">`: Kontainer CSS Grid responsif yang secara dinamis dirender oleh JavaScript menjadi kartu-kartu informatif setiap bahan baku dapur.
* `<details class="details-add" id="details-add">`: Elemen akordeon bawaan HTML5 yang membungkus formulir penambahan bahan baru sehingga antarmuka tetap ringkas dan bersih saat formulir tidak digunakan.
* `<a href="#" class="reset-link" id="reset-rak">`: Tautan utilitas pintas untuk memulihkan atau mereset basis data bahan ke kumpulan sampel awal pengujian.

---

### Contoh 5: Bagian HTML (`index.html` - Formulir Tambah dan Edit Bahan Baku)
*(Di sini kamu tempel screenshot potongan kodingan form tambah/edit)*

```html
<form id="form-tambah" class="form-add" autocomplete="off">
  <div class="field-row">
    <div class="field">
      <label>Nama bahan</label>
      <input type="text" id="add-nama" placeholder="Contoh: Tahu putih" required>
    </div>
    <div class="field">
      <label>Satuan</label>
      <input type="text" id="add-satuan" placeholder="Tulis satuan yang digunakan" required>
    </div>
  </div>
  <div class="field-row">
    <div class="field">
      <label>Stok awal</label>
      <input type="number" id="add-stok" min="0" step="any" value="0" required>
    </div>
    <div class="field">
      <label>Stok minimum</label>
      <input type="number" id="add-min" min="0" step="any" value="0" required>
    </div>
  </div>
  <div class="field" style="max-width:calc(50% - .5rem)">
    <label>Harga satuan</label>
    <input type="number" id="add-harga" min="0" value="0" required>
  </div>
  <input type="hidden" id="add-id" value="">
  <button type="submit" class="btn btn-green" id="btn-simpan-bahan">Simpan bahan</button>
</form>
```

**Penjelasan Source Code:** Formulir serbaguna yang digunakan untuk dua fungsi sekaligus: mendaftarkan bahan baku baru ke sistem dan mengedit parameter bahan yang telah terdaftar.
* `<div class="field-row">`: Kelas penataan layout berbasis flexbox yang membagi input menjadi dua kolom bersebelahan untuk kerapian tampilan.
* `<input type="number" id="add-stok" ...>`: Masukan kuantitas awal stok fisik yang ada. Kolom ini diproteksi dan otomatis dinonaktifkan (`disabled`) saat pengguna berada dalam mode edit bahan guna menjamin konsistensi mutasi stok.
* `<input type="number" id="add-min" ...>`: Nilai ambang batas kritis stok minimal. Jika stok berada di bawah batas ini, sistem akan mengubah status menjadi peringatan "Menipis".
* `<input type="number" id="add-harga" ...>`: Nilai harga per unit satuan yang digunakan sistem untuk mengkalkulasi estimasi anggaran belanja pengadaan ulang.
* `<input type="hidden" id="add-id" value="">`: Input tersembunyi untuk menyimpan ID MongoDB bahan saat mode pengeditan berjalan.

---

### Contoh 6: Bagian HTML (`index.html` - Sidebar Bon Belanja Kebutuhan Dapur)
*(Di sini kamu tempel screenshot potongan kodingan sidebar bon)*

```html
<aside class="bon" id="bon-belanja"></aside>
```

**Penjelasan Source Code:** Elemen `aside` struktural yang diletakkan di sisi kanan antarmuka kerja aplikasi untuk menampilkan kalkulasi daftar kebutuhan belanja bahan secara otomatis (reaktif).
* `<aside class="bon" id="bon-belanja">`: Wadah semantik HTML5 dengan posisi tetap (*sticky positioning*) di layar desktop.
* Diisi secara otomatis oleh fungsi JavaScript `renderBon()`, yang memfilter bahan dengan stok di bawah batas minimal, menghitung selisih kuantitas yang harus dibeli, dan mengalikan harga satuannya untuk memunculkan estimasi total uang belanja yang harus disiapkan.

---

### Contoh 7: Bagian HTML (`index.html` - Modal Konfirmasi Penghapusan & Toast Notifikasi)
*(Di sini kamu tempel screenshot potongan kodingan modal konfirmasi & toast)*

```html
<div id="confirm-overlay" class="overlay" style="display:none">
  <div class="confirm-box">
    <p id="confirm-text">Yakin ingin menghapus bahan ini?</p>
    <div class="confirm-actions">
      <button class="btn btn-outline" id="confirm-no">Batal</button>
      <button class="btn btn-red" id="confirm-yes">Hapus</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>
```

**Penjelasan Source Code:** Bagian antarmuka interaktif yang memberikan umpan balik langsung kepada pengguna terhadap aksi-aksi berisiko tinggi (penghapusan) dan status keberhasilan transaksi.
* `<div id="confirm-overlay" class="overlay" style="display:none">`: Lapisan latar transparan gelap bertipe modal (*dialog box*) yang memblokir interaksi di belakangnya sampai pengguna menentukan keputusan.
* `<p id="confirm-text">`: Area pesan konfirmasi dinamis yang akan menyisipkan nama spesifik bahan baku yang hendak dihapus untuk menghindari salah hapus data.
* `<button class="btn btn-red" id="confirm-yes">`: Tombol aksi destruktif untuk melanjutkan proses penghapusan data secara permanen di database backend.
* `<div id="toast" class="toast">`: Komponen penampil notifikasi pop-up mengambang di bawah layar yang muncul secara halus dan otomatis menghilang setelah 2,5 detik.

---

# 2. BAGIAN JAVASCRIPT FRONTEND — LOGIKA & STATE (`frontend/js/app.js`)

### Contoh 8: Bagian JavaScript (`app.js` - Manajemen State Global Aplikasi)
*(Di sini kamu tempel screenshot potongan kodingan state global)*

```javascript
let penggunaAktif = null;
let daftarBahan   = [];
let riwayat       = [];
let tabAktif      = 'rak';
let tipeCatatat   = 'masuk';
let idSedangEdit  = null;
let idAkanHapus   = null;

const el = id => document.getElementById(id);
```

**Penjelasan Source Code:** Blok inisialisasi state reaktif yang berfungsi sebagai memori terpusat (*single source of truth*) dalam mengelola seluruh aliran data di sisi frontend.
* `let penggunaAktif = null;`: Menyimpan objek data profil pengguna yang terautentikasi (ID, username, nama, role).
* `let daftarBahan = [];`: Array penampung seluruh koleksi data bahan baku yang ditarik dari server database MongoDB.
* `let riwayat = [];`: Array penampung catatan riwayat mutasi transaksi keluar-masuk bahan yang dicatat selama sesi pengguna aktif.
* `let tabAktif = 'rak';`: Indikator string yang menandai tab layar yang sedang dilihat oleh pengguna ('rak', 'catat', atau 'jurnal').
* `let tipeCatatat = 'masuk';`: Penanda mode transaksi stok yang sedang dipilih pengguna ('masuk' untuk penerimaan barang, 'keluar' untuk pemakaian).
* `let idSedangEdit = null;`: Penunjuk ID unik dokumen bahan yang sedang diedit melalui formulir; bernilai `null` jika pengguna dalam mode penambahan baru.
* `const el = id => document.getElementById(id);`: Fungsi panah (*arrow function helper*) untuk menyederhanakan penulisan seleksi elemen DOM HTML agar kode lebih ringkas dan mudah dibaca.

---

### Contoh 9: Bagian JavaScript (`app.js` - Fitur Pergantian Tema Terang dan Gelap)
*(Di sini kamu tempel screenshot potongan kodingan setTheme)*

```javascript
function setTheme(tema) {
  const gelap = tema === 'dark';
  document.documentElement.dataset.theme = gelap ? 'dark' : 'light';
  localStorage.setItem('stockdapur-tema', gelap ? 'dark' : 'light');
  document.querySelectorAll('.theme-toggle').forEach(b => {
    b.textContent = gelap ? ' Mode terang' : ' Mode gelap';
    b.setAttribute('aria-pressed', String(gelap));
  });
}
```

**Penjelasan Source Code:** Fungsi pengatur preferensi skema warna visual aplikasi yang secara langsung mengubah atribut data pada root dokumen dan menyimpan pilihan ke memori browser.
* `const gelap = tema === 'dark';`: Menghasilkan nilai *boolean* yang merepresentasikan status aktivasi tema gelap.
* `document.documentElement.dataset.theme = ...`: Menyematkan atribut `data-theme="dark"` atau `data-theme="light"` ke elemen root `<html>`, yang secara otomatis memicu pergantian variabel CSS (*CSS Custom Properties*).
* `localStorage.setItem('stockdapur-tema', ...)`: Menyimpan preferensi tema secara permanen pada peramban pengguna sehingga ketika halaman dimuat ulang di masa mendatang, tema sebelumnya tidak hilang.
* `b.setAttribute('aria-pressed', String(gelap))`: Memperbarui standar aksesibilitas web (*web accessibility*) agar pembaca layar mengetahui status terkini dari tombol saklar tema.

---

### Contoh 10: Bagian JavaScript (`app.js` - Mekanisme Navigasi Tab & Sinkronisasi Tampilan)
*(Di sini kamu tempel screenshot potongan kodingan pindahTab & render)*

```javascript
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
```

**Penjelasan Source Code:** Arsitektur pengontrol tampilan antarmuka yang mengelola transisi antar layar tanpa proses *page reload* serta memperbarui isi komponen DOM sesuai data paling mutakhir.
* `renderBon(daftarBahan)`: Selalu dieksekusi di awal karena panel *Bon Belanja* di sidebar bersifat permanen dan harus selalu mencerminkan status stok terkini di setiap tab.
* `if (tabAktif === ...)`: Pola optimasi komputasi rendering selektif; hanya memperbarui komponen tampilan dari tab yang saat itu sedang aktif di layar pengguna.
* `tabAktif = nama;`: Memperbarui state pelacak tab aktif sesuai argumen nama yang diterima saat tombol navigasi ditekan.
* `b.classList.toggle('active', ...)`: Memanipulasi kelas CSS secara ringkas; menambahkan kelas `active` jika kondisi bernilai `true` dan mencopotnya jika `false`.

---

### Contoh 11: Bagian JavaScript (`app.js` - Pemrosesan Login & Transisi Halaman)
*(Di sini kamu tempel screenshot potongan kodingan prosesLogin & tampilkanApp)*

```javascript
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
  el('user-tag').innerHTML = `${pengguna.nama} · <a href="#" id="btn-logout">Keluar</a>`;
  el('btn-logout').addEventListener('click', e => { e.preventDefault(); prosesLogout(); });
  const data = await getBahanApi();
  if (data.ok) daftarBahan = data.bahan;
  render();
}
```

**Penjelasan Source Code:** Rangkaian fungsi penanganan autentikasi sisi klien yang memverifikasi masukan pengguna ke server, mengontrol pergantian halaman, dan mengunduh data awal.
* `e.preventDefault()`: Menghentikan aksi standar peramban yang biasanya melakukan *refresh* atau pengiriman formulir HTTP konvensional saat formulir disubmit.
* `await loginApi(...)`: Memanggil fungsi jaringan asynchronous untuk mengirim data kredensial ke endpoint server backend.
* `el('login-error').textContent = hasil.pesan;`: Menampilkan pesan umpan balik kegagalan dari server (misal: "Username atau password salah") tepat di bawah formulir login jika gagal.
* `el('login-page').style.display = 'none';` & `el('app').style.display = '';`: Mengganti visibilitas halaman secara instan dari panel login ke panel dasbor utama.
* `const data = await getBahanApi();`: Mengambil daftar inventaris bahan baku langsung dari MongoDB setelah proses login terverifikasi.

---

### Contoh 12: Bagian JavaScript (`app.js` - Logika Simpan Bahan: Tambah Baru vs Edit)
*(Di sini kamu tempel screenshot potongan kodingan simpanBahan)*

```javascript
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
```

**Penjelasan Source Code:** Logika terpadu yang membedakan apakah pengguna sedang membuat dokumen data bahan baru atau memperbarui data dokumen yang sudah ada di database.
* `const payload = { ... }`: Membangun objek data seragam dari nilai-nilai input form dengan konversi tipe data yang aman (`Number` dan `parseInt`).
* `if (idSedangEdit !== null)`: Struktur kendali pemilihan alur; jika variabel penampung ID terisi, sistem mengeksekusi operasi `PUT /api/stok/:id` ke API.
* `daftarBahan.findIndex(...)`: Mencari indeks posisi dokumen bahan terkait di dalam array state lokal untuk langsung diperbarui tanpa perlu mengunduh ulang seluruh database.
* `daftarBahan.push(hasil.bahan)`: Menambahkan objek bahan yang baru saja disimpan oleh database ke array state lokal secara reaktif.
* `resetFormBahan()` & `el('details-add').open = false`: Mengosongkan form ke keadaan semula dan menutup kembali panel akordeon input bahan.

---

### Contoh 13: Bagian JavaScript (`app.js` - Pengaktifan Mode Edit Bahan)
*(Di sini kamu tempel screenshot potongan kodingan startEdit)*

```javascript
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
```

**Penjelasan Source Code:** Fungsi yang menyiapkan formulir input dengan data bahan yang dipilih saat tombol pensil/edit ditekan pada kartu inventaris.
* `window.startEdit = function(id)`: Didaftarkan ke objek global `window` agar dapat diakses oleh pemanggilan *inline attribute event listener* `onclick="startEdit('...')"` yang dicetak oleh modul `ui.js`.
* `el('add-stok').disabled = true;`: Mematikan kolom input stok agar pengguna tidak dapat memanipulasi angka stok fisik secara sembarangan selain melalui alur pencatatan transaksi masuk/keluar.
* `det.open = true`: Membuka elemen `<details>` secara terprogram agar form langsung terlihat oleh pengguna.
* `det.scrollIntoView({ behavior: 'smooth', block: 'center' })`: Menggulir tampilan layar peramban secara otomatis dan halus ke arah formulir sehingga pengalaman pengguna (*UX*) lebih responsif.

---

### Contoh 14: Bagian JavaScript (`app.js` - Logika Transaksi Catat Stok Masuk & Keluar)
*(Di sini kamu tempel screenshot potongan kodingan prosesCatat)*

```javascript
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
```

**Penjelasan Source Code:** Inti logika bisnis mutasi inventaris stok dapur yang memvalidasi masukan kuantitas, memanggil API backend, dan memperbarui riwayat transaksi.
* `if (!id || jumlah <= 0)`: Validasi *client-side* untuk memastikan pengguna telah memilih bahan dan memasukkan kuantitas angka di atas 0 sebelum mengirim request ke server.
* `await catatApi(...)`: Mengirim paket data mutasi transaksi ke endpoint `/api/stok/:id/catat`.
* `daftarBahan[idx] = hasil.bahan;`: Memperbarui data bahan pada indeks terkait dengan nilai stok fisik teranyar yang dihitung dan dikembalikan oleh server.
* `riwayat.push(hasil.transaksi)`: Menambahkan objek log mutasi baru ke antrean riwayat transaksi lokal untuk langsung ditampilkan pada tab Catat dan tab Jurnal.
* `toast(...)`: Memberikan umpan balik visual instan di bawah layar dengan pesan informatif kuantitas, satuan, dan aksi mutasi yang berhasil dicatat.

---

# 3. BAGIAN JAVASCRIPT FRONTEND — TAMPILAN & DOM RENDERING (`frontend/js/ui.js`)

### Contoh 15: Bagian JavaScript (`ui.js` - Logika Klasifikasi Status Level Stok)
*(Di sini kamu tempel screenshot potongan kodingan getStatus)*

```javascript
export function getStatus(b) {
  if (b.stok < b.min_stok)       return { label: 'Menipis',        cls: 'red'    };
  if (b.stok < b.min_stok * 1.5) return { label: 'Hampir menipis', cls: 'yellow' };
  return                                 { label: 'Aman',           cls: 'green'  };
}
```

**Penjelasan Source Code:** Fungsi logika penentu kondisi level stok bahan dapur berdasarkan perbandingan dinamis antara sisa stok riil dengan batas minimum persediaan.
* `b.stok < b.min_stok`: Jika stok berada di bawah kuantitas minimum, status diklasifikasikan sebagai `Menipis` dengan kelas warna penanda `red` (merah).
* `b.stok < b.min_stok * 1.5`: Jika stok masih berada di atas batas minimal namun di bawah 1,5 kali nilai batas aman, sistem mengelompokkannya sebagai peringatan dini `Hampir menipis` berkelas `yellow` (kuning).
* `return { label: 'Aman', cls: 'green' }`: Status default untuk bahan dengan persediaan berlimpah (di atas 1,5 kali kuantitas minimum) dengan indikator warna `green` (hijau).

---

### Contoh 16: Bagian JavaScript (`ui.js` - Perhitungan Persentase Level Bar Stok)
*(Di sini kamu tempel screenshot potongan kodingan levelPercent)*

```javascript
function levelPercent(b) {
  if (b.min_stok === 0) return 100;
  return Math.min(Math.round((b.stok / (b.min_stok * 2)) * 100), 100);
}
```

**Penjelasan Source Code:** Fungsi matematis yang menghitung nilai persentase lebar bilah visualisasi progres (*progress bar fill*) untuk kartu stok di rak.
* `if (b.min_stok === 0) return 100`: Pencegahan galat pembagian dengan nol (*division by zero*); jika bahan tidak memiliki ambang batas minimum, bilah dianggap terisi penuh (100%).
* `(b.stok / (b.min_stok * 2)) * 100`: Menghitung skala relatif terhadap kapasitas ideal (diasumsikan 2 kali lipat dari batas stok minimum).
* `Math.min(..., 100)`: Membatasi nilai persentase maksimal agar tidak pernah melampaui 100% sehingga tampilan bilah tidak meluap keluar dari batas kontainer pembungkusnya.

---

### Contoh 17: Bagian JavaScript (`ui.js` - Render Kartu Bahan pada Rak & Bar Ringkasan)
*(Di sini kamu tempel screenshot potongan kodingan renderRak)*

```javascript
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
```

**Penjelasan Source Code:** Fungsi utama pembangun komponen antarmuka tab Rak yang mengagregasi data statistik metrik inventaris dan mencetak kartu interaktif bahan ke DOM.
* `bahanList.reduce(...)`: Menghitung akumulasi total valuasi moneter persediaan stok yang ada di dapur dengan mengalikan kuantitas masing-masing stok dengan harga per unitnya.
* `document.getElementById('summary-bar').innerHTML = ...`: Menginjeksi elemen HTML statistik ke bar ringkasan atas.
* `bahanList.map(b => ...).join('')`: Mengiterasi array data bahan dan mentransformasikannya menjadi string potongan HTML kartu terstruktur (*template literals*).
* `<button class="btn-icon" onclick="startEdit('${b._id}')">`: Tombol aksi pengeditan yang meneruskan ID unik MongoDB bahan ke *event handler*.
* `<div class="level-fill fill-${s.cls}" style="width:${pct}%">`: Bilah visualisasi level stok dengan pewarnaan dinamis sesuai badge status (`green`, `yellow`, atau `red`).

---

### Contoh 18: Bagian JavaScript (`ui.js` - Kalkulasi Kebutuhan & Render Bon Belanja Otomatis)
*(Di sini kamu tempel screenshot potongan kodingan renderBon)*

```javascript
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
```

**Penjelasan Source Code:** Modul kalkulator cerdas di sidebar kanan yang secara otomatis merangkum daftar belanja bahan yang menipis beserta estimasi dana yang harus dikeluarkan pemilik dapur.
* `bahanList.filter(b => b.stok < b.min_stok)`: Menyaring secara otomatis hanya bahan-bahan yang berada dalam kondisi kritis di bawah batas minimum.
* `if (!menipis.length)`: Kondisi jika semua bahan berstatus aman; menampilkan pesan ramah bahwa tidak ada kebutuhan belanja saat ini.
* `const perlu = b.min_stok - b.stok;`: Mengkalkulasi kekurangan jumlah bahan yang wajib dibeli untuk mengembalikan stok ke ambang batas minimumnya.
* `const biaya = perlu * b.harga_satuan;`: Menghitung estimasi subtotal biaya pembelian untuk satu varian bahan tertentu.
* `<div class="bon-total">`: Menampilkan total akumulasi biaya pengadaan seluruh bahan yang menipis dalam format mata uang Rupiah.

---

### Contoh 19: Bagian JavaScript (`ui.js` - Template Baris Riwayat Transaksi Jurnal)
*(Di sini kamu tempel screenshot potongan kodingan entryHTML)*

```javascript
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
```

**Penjelasan Source Code:** Komponen pembuat tampilan satu baris entri riwayat mutasi transaksi bahan yang dipakai secara bersamaan oleh tab Catat dan tab Jurnal.
* `const sign = masuk ? '+' : '-';`: Menentukan simbol matematis tanda tambah (`+`) untuk barang masuk dan tanda minus (`-`) untuk barang yang dipakai keluar.
* `const color = masuk ? 'green' : 'red';`: Menetapkan skema warna visual (hijau untuk pasokan masuk, merah untuk pengeluaran bahan).
* `<div class="entry-border b-${color}">`: Garis vertikal visual di sebelah kiri setiap baris yang mempertegas tipe transaksi secara sekilas.
* `${r.catatan ? ... : ''}`: Operator ternary untuk merender catatan khusus jika staf menyertakan keterangan opsional saat mencatat transaksi.

---

# 4. BAGIAN JAVASCRIPT FRONTEND — KOMUNIKASI API BACKEND (`frontend/js/api.js`)

### Contoh 20: Bagian JavaScript (`api.js` - Konfigurasi Base URL & Pembuatan Request Fetch)
*(Di sini kamu tempel screenshot potongan kodingan opt helper)*

```javascript
const BASE = 'https://stock-dapur.vercel.app/api';

let authToken = localStorage.getItem('stockdapur-token') || '';

const opt = (method, body) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': 'Basic ' + authToken } : {})
  },
  ...(body ? { body: JSON.stringify(body) } : {})
});
```

**Penjelasan Source Code:** Modul fondasi jaringan yang mengabstraksi komunikasi HTTP antara antarmuka peramban dengan server API backend di Vercel.
* `const BASE = 'https://stock-dapur.vercel.app/api';`: Titik akhir terpusat (*endpoint base URL*); mempermudah penggantian alamat server tanpa mengubah file kode lainnya.
* `let authToken = localStorage.getItem('stockdapur-token') || '';`: Mengambil token kredensial yang tersimpan di penyimpanan lokal peramban saat inisialisasi modul.
* `const opt = (method, body) => (...)`: Fungsi pembantu yang merakit objek parameter konfigurasi fungsi `fetch()`.
* `...(authToken ? { 'Authorization': 'Basic ' + authToken } : {})`: Penyisipan bersyarat header otorisasi menggunakan protokol Basic Authentication jika pengguna telah memiliki token aktif.
* `...(body ? { body: JSON.stringify(body) } : {})`: Melakukan serialisasi objek JavaScript ke format teks JSON jika terdapat data muatan (*request payload*).

---

### Contoh 21: Bagian JavaScript (`api.js` - Fungsi API Autentikasi Pengguna)
*(Di sini kamu tempel screenshot potongan kodingan loginApi)*

```javascript
export async function loginApi(username, katasandi) {
  const res  = await fetch(`${BASE}/auth/masuk`, opt('POST', { username, katasandi }));
  const data = await res.json();
  if (data.ok) {
    authToken = data.token;
    localStorage.setItem('stockdapur-token', data.token);
  }
  return data;
}

export async function logoutApi() {
  authToken = '';
  localStorage.removeItem('stockdapur-token');
  return { ok: true };
}
```

**Penjelasan Source Code:** Rangkaian fungsi asynchronous yang menangani pertukaran token sesi login dan pembersihan status autentikasi pada penyimpanan klien.
* `fetch(`${BASE}/auth/masuk`, opt('POST', ...))`: Mengirimkan request HTTP metode POST dengan payload username dan password dalam format JSON ke server.
* `authToken = data.token`: Memperbarui variabel token di memori sesi aktif jika server merespons verifikasi dengan status sukses (`data.ok === true`).
* `localStorage.setItem('stockdapur-token', data.token)`: Menyimpan token ke penyimpanan persisten lokal agar status sesi pengguna tidak terputus saat halaman direfresh.
* `localStorage.removeItem('stockdapur-token')`: Menghapus kunci token pada saat logout sehingga hak akses sesi ditutup sepenuhnya secara stateless.

---

### Contoh 22: Bagian JavaScript (`api.js` - Operasi CRUD Data Bahan Baku)
*(Di sini kamu tempel screenshot potongan kodingan CRUD api)*

```javascript
export async function getBahanApi() {
  const res = await fetch(`${BASE}/stok`, opt('GET'));
  return res.json();
}

export async function tambahBahanApi(dataBahan) {
  const res = await fetch(`${BASE}/stok`, opt('POST', dataBahan));
  return res.json();
}

export async function ubahBahanApi(id, dataBahan) {
  const res = await fetch(`${BASE}/stok/${id}`, opt('PUT', dataBahan));
  return res.json();
}

export async function hapusBahanApi(id) {
  await fetch(`${BASE}/stok/${id}`, opt('DELETE'));
}
```

**Penjelasan Source Code:** Implementasi pemanggilan layanan RESTful API lengkap (Create, Read, Update, Delete) untuk pengelolaan entitas inventaris bahan dapur.
* `getBahanApi()`: Menjalankan HTTP GET untuk mengambil seluruh dokumen inventaris bahan yang tersimpan di koleksi database MongoDB.
* `tambahBahanApi(dataBahan)`: Menjalankan HTTP POST untuk mengirimkan dokumen bahan baru hasil input formulir staf dapur ke server.
* `ubahBahanApi(id, dataBahan)`: Menjalankan HTTP PUT dengan parameter ID unik dokumen di URL untuk memperbarui atribut spesifik bahan yang telah diedit.
* `hapusBahanApi(id)`: Menjalankan HTTP DELETE untuk menginstruksikan penghapusan dokumen secara permanen dari basis data berdasarkan ID target.

---

# 5. BAGIAN BACKEND SERVER EXPRESS & DATABASE MONGODB (`backend/server.js`)

### Contoh 23: Bagian Backend Node.js (`server.js` - Koneksi MongoDB Atlas & Caching Serverless)
*(Di sini kamu tempel screenshot potongan kodingan getDB)*

```javascript
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app       = express();
const PORT      = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

let cachedDb = null;

async function getDB() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  cachedDb = client.db('stockdapur');
  return cachedDb;
}
```

**Penjelasan Source Code:** Pengaturan awal server backend berbasis Express.js serta penerapan pola koneksi database MongoDB yang dioptimalkan untuk arsitektur *Serverless Functions* di Vercel.
* `require('dotenv').config()`: Membaca berkas `.env` untuk memuat variabel lingkungan sensitif seperti string koneksi URI MongoDB Atlas.
* `let cachedDb = null`: Variabel lingkup global yang menyimpan referensi instans koneksi database yang telah aktif (*connection pool caching*).
* `if (cachedDb) return cachedDb`: Pola pencegahan *cold start*; jika proses serverless sebelumnya masih dalam kondisi hangat (*warm*), koneksi yang telah ada langsung digunakan kembali sehingga menghemat waktu latensi dan kuota koneksi database.
* `client.db('stockdapur')`: Mengakses basis data bernama `stockdapur` di dalam cluster cloud MongoDB Atlas.

---

### Contoh 24: Bagian Backend Node.js (`server.js` - Konfigurasi CORS & Preflight OPTIONS)
*(Di sini kamu tempel screenshot potongan kodingan CORS)*

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://ilhamrezapratama.github.io');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
```

**Penjelasan Source Code:** Middleware penanganan kebijakan lintas domain (*Cross-Origin Resource Sharing / CORS*) manual untuk memastikan komunikasi aman antara domain frontend dan backend.
* `'Access-Control-Allow-Origin', 'https://ilhamrezapratama.github.io'`: Membatasi agar API hanya dapat diakses oleh aplikasi frontend resmi yang dihosting di GitHub Pages.
* `'Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS'`: Mengizinkan metode-metode HTTP standar yang diperlukan untuk fungsionalitas CRUD sistem.
* `'Access-Control-Allow-Headers', 'Content-Type,Authorization'`: Mengizinkan peramban menyertakan header tipe konten JSON dan kredensial otorisasi keamanan.
* `if (req.method === 'OPTIONS') return res.sendStatus(200)`: Merespons permintaan awal *preflight request* dari browser dengan status HTTP 200 OK secara langsung agar transaksi API sesungguhnya tidak terblokir.
* `app.use(express.json())`: Middleware internal Express untuk mengurai (*parsing*) badan request yang berformat JSON menjadi objek JavaScript `req.body`.

---

### Contoh 25: Bagian Backend Node.js (`server.js` - Middleware Penjaga Autentikasi Basic Auth)
*(Di sini kamu tempel screenshot potongan kodingan middleware harusLogin)*

```javascript
async function harusLogin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).json({ ok: false, pesan: 'Belum login.' });
  }
  try {
    const decoded  = Buffer.from(auth.slice(6), 'base64').toString();
    const idx      = decoded.indexOf(':');
    const username = decoded.substring(0, idx);
    const password = decoded.substring(idx + 1);
    const db       = await getDB();
    const user     = await db.collection('users').findOne({ username, password });
    if (!user) return res.status(401).json({ ok: false, pesan: 'Belum login.' });
    req.pengguna = { id: user._id, username: user.username, nama: user.nama, role: user.role };
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, pesan: 'Belum login.' });
  }
}
```

**Penjelasan Source Code:** Middleware gerbang keamanan (*route guard*) yang memvalidasi otentisitas setiap request yang masuk ke endpoint terlindungi sebelum request tersebut diizinkan diproses lebih lanjut.
* `req.headers.authorization`: Memeriksa keberadaan header otorisasi pada paket request yang dikirimkan oleh browser.
* `Buffer.from(auth.slice(6), 'base64').toString()`: Mendekode string token berbasis format Base64 menjadi teks asli dengan format baku `username:password`.
* `await db.collection('users').findOne(...)`: Mencocokkan pasangan username dan kata sandi langsung ke koleksi data `users` di basis data MongoDB.
* `if (!user) return res.status(401)...`: Menolak akses dan mengembalikan respon kode status HTTP 401 Unauthorized jika akun tidak terdaftar atau kredensial salah.
* `req.pengguna = { ... }; next();`: Menyisipkan informasi profil pengguna ke objek request agar dapat digunakan oleh endpoint berikutnya, kemudian memanggil `next()` untuk melanjutkan alur eksekusi.

---

### Contoh 26: Bagian Backend Node.js (`server.js` - Endpoint Autentikasi & Pembuatan Token)
*(Di sini kamu tempel screenshot potongan kodingan endpoint login)*

```javascript
app.post('/api/auth/masuk', async (req, res) => {
  const db = await getDB();
  const { username, katasandi } = req.body;
  const user = await db.collection('users').findOne({ username, password: katasandi });
  if (!user) return res.status(401).json({ ok: false, pesan: 'Username atau password salah.' });
  const token = Buffer.from(username + ':' + katasandi).toString('base64');
  res.json({ ok: true, token, pengguna: { id: user._id, username: user.username, nama: user.nama, role: user.role } });
});
```

**Penjelasan Source Code:** Titik masuk autentikasi pengguna yang memvalidasi data form login dari klien dan menerbitkan token otorisasi jika verifikasi berhasil.
* `const { username, katasandi } = req.body`: Melakukan destrukturisasi data masukan formulir login dari badan request.
* `db.collection('users').findOne(...)`: Melakukan query pencarian dokumen pengguna pada koleksi `users`.
* `Buffer.from(username + ':' + katasandi).toString('base64')`: Mengonversi string kredensial menjadi token ringkas Base64 untuk dikembalikan ke antarmuka web.
* `res.json({ ok: true, token, pengguna: ... })`: Mengirim respons JSON sukses beserta data token dan identitas profil staf ke browser klien.

---

### Contoh 27: Bagian Backend Node.js (`server.js` - Endpoint Mutasi Stok Masuk & Keluar)
*(Di sini kamu tempel screenshot potongan kodingan catat stok backend)*

```javascript
app.post('/api/stok/:id/catat', harusLogin, async (req, res) => {
  const db = await getDB();
  const { tipe, jumlah, catatan } = req.body;
  const bahan = await db.collection('bahan').findOne({ _id: new ObjectId(req.params.id) });
  if (!bahan) return res.status(404).json({ ok: false, pesan: 'Bahan tidak ditemukan.' });
  if (tipe === 'keluar' && Number(jumlah) > bahan.stok)
    return res.status(400).json({ ok: false, pesan: 'Stok tidak cukup.' });
  const stokBaru = tipe === 'masuk' ? bahan.stok + Number(jumlah) : bahan.stok - Number(jumlah);
  await db.collection('bahan').updateOne({ _id: new ObjectId(req.params.id) }, { $set: { stok: stokBaru } });
  const bahanTerbaru = await db.collection('bahan').findOne({ _id: new ObjectId(req.params.id) });
  res.json({
    ok: true,
    bahan: bahanTerbaru,
    transaksi: {
      waktu: new Date().toISOString(), tipe,
      namaBahan: bahan.nama_bahan, jumlah: Number(jumlah),
      satuan: bahan.satuan, stokSetelah: stokBaru,
      oleh: req.pengguna.nama, catatan: catatan || ''
    }
  });
});
```

**Penjelasan Source Code:** Endpoint krusial yang menjalankan pemrosesan transaksi mutasi stok pada sisi server dengan jaminan integritas data agar stok fisik tidak menjadi minus.
* `new ObjectId(req.params.id)`: Mengubah string ID yang berasal dari parameter URL rute menjadi objek BSON `ObjectId` bawaan driver MongoDB.
* `if (tipe === 'keluar' && Number(jumlah) > bahan.stok)`: Validasi integritas kuantitas di level server; jika pengguna mencoba mengeluarkan bahan melebihi sisa stok yang ada di database, server menolak dan mengembalikan HTTP 400 Bad Request ("Stok tidak cukup").
* `const stokBaru = tipe === 'masuk' ? ... : ...`: Mengkalkulasi angka saldo stok akhir secara presisi berdasarkan tipe transaksi.
* `db.collection('bahan').updateOne(...)`: Memperbarui nilai atribut `stok` pada dokumen bahan di MongoDB menggunakan operator pembaruan `$set`.
* `transaksi: { ... }`: Membangun objek log rekapitulasi transaksi mutasi lengkap (waktu cap ISO, tipe, staf pencatat, kuantitas, saldo setelah transaksi) untuk langsung dikembalikan ke klien.

---

# 6. BAGIAN DESAIN & TATA LETAK CSS (`frontend/css/style.css`)

### Contoh 28: Bagian CSS (`style.css` - Variabel Desain Token & CSS Custom Properties Tema)
*(Di sini kamu tempel screenshot potongan kodingan variabel css)*

```css
:root {
  --bg:        #F3F5F2;
  --bg-card:   #FFFFFF;
  --bg-input:  #F8FAF8;
  --border:    #E1E7E1;
  --text:      #26332C;
  --dim:       #68766D;
  --green:     #47785D;
  --green-bg:  #E7F0E9;
  --green-t:   #356246;
  --red:       #B95046;
  --red-bg:    #F8EAE8;
  --red-t:     #99443C;
  --yellow:    #A87522;
  --yellow-bg: #F7F0DD;
  --yellow-t:  #876016;
  --radius:    10px;
  --font-h:    'Bricolage Grotesque', sans-serif;
  --font-b:    'IBM Plex Sans', sans-serif;
  --font-m:    'IBM Plex Mono', monospace;
}

:root[data-theme="dark"] {
  --bg:        #000000;
  --bg-card:   #030303;
  --bg-input:  #03270e;
  --border:    #093f16;
  --text:      #E4ECE6;
  --dim:       #A5B2A8;
  --green:     #609474;
  --green-bg:  #2B4032;
  --green-t:   #B2D8BC;
}
```

**Penjelasan Source Code:** Implementasi sistem desain berbasis token menggunakan *CSS Custom Properties* yang memungkinkan peralihan tema instan tanpa perlu menulis ulang seluruh selektor kelas elemen.
* `:root`: Menetapkan variabel warna global standar untuk mode tampilan terang (*light mode*) dengan nuansa warna alam dapur bersih (*sage green, soft warm white*).
* `:root[data-theme="dark"]`: Selektor khusus yang secara otomatis menggantikan nilai variabel warna dasar ketika atribut `data-theme="dark"` aktif pada elemen `<html>`.
* `--font-h`, `--font-b`, `--font-m`: Penentuan tipografi terstruktur: font *Bricolage Grotesque* untuk judul, *IBM Plex Sans* untuk keterbacaan teks konten, dan *IBM Plex Mono* untuk angka kuantitas serta struk bon belanja.

---

### Contoh 29: Bagian CSS (`style.css` - Grid Responsif Kartu Bahan & Bilah Level Stok)
*(Di sini kamu tempel screenshot potongan kodingan grid kartu)*

```css
.bahan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.level-bar {
  height: 6px;
  background: var(--border);
  border-radius: 99px;
  overflow: hidden;
  margin: .75rem 0;
}

.level-fill {
  height: 100%;
  border-radius: 99px;
  transition: width .3s ease;
}

.fill-green  { background: var(--green); }
.fill-yellow { background: var(--yellow); }
.fill-red    { background: var(--red); }
```

**Penjelasan Source Code:** Aturan tata letak modern yang mengatur agar kartu-kartu inventaris tersusun rapi secara otomatis menyesuaikan berbagai resolusi layar (laptop, tablet, hingga smartphone).
* `display: grid`: Mengaktifkan modul CSS Grid untuk penyusunan elemen dua dimensi yang teratur dan seragam.
* `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`: Teknik pembuatan grid fluid responsif tanpa media query; kartu akan otomatis mengisi lebar kontainer secara fleksibel dengan ukuran minimal 220px dan membagi ruang sisa secara adil.
* `.level-bar`: Bilah kontainer kapsul abu-abu dengan radius penuh (`99px`) dan kliping tepi (`overflow: hidden`).
* `transition: width .3s ease`: Memberikan efek animasi transisi mulus selama 0,3 detik saat terjadi penambahan atau pengurangan sisa kuantitas persediaan bahan di rak.

---
