# 📦 StockDapur - Sistem Manajemen Stok Dapur

Aplikasi web untuk mengelola stok bahan baku dapur dengan fitur pencatatan stok masuk/keluar, monitoring stok menipis, dan bon belanja otomatis.

## 🌐 Live Demo

- **Frontend**: https://ilhamrezapratama.github.io/StockDapur/
- **Backend API**: https://stock-dapur.vercel.app/api

## 🎯 Fitur Utama

1. **Autentikasi Pengguna**
   - Login dengan username dan password
   - Token-based authentication (Base64)
   - Auto-login dari localStorage

2. **Manajemen Bahan**
   - Tambah, ubah, hapus bahan
   - Set stok minimum dan harga satuan
   - Status otomatis: Aman / Hampir menipis / Menipis

3. **Pencatatan Transaksi**
   - Catat stok masuk dan keluar
   - Riwayat transaksi dengan timestamp
   - Validasi stok tidak cukup

4. **Dashboard & Monitoring**
   - Summary bar (total bahan, bahan menipis, nilai stok)
   - Bon belanja otomatis untuk bahan menipis
   - Jurnal riwayat lengkap

5. **UI/UX**
   - Dark mode / Light mode
   - Lucide Icons
   - Responsive design

---

## 🏗️ Arsitektur Aplikasi

### Stack Teknologi

**Frontend:**
- HTML5, CSS3 (Custom design system)
- Vanilla JavaScript (ES6 Modules)
- Lucide Icons
- Deployed on GitHub Pages

**Backend:**
- Node.js + Express.js
- MongoDB (Database)
- Deployed on Vercel Serverless

### Struktur Folder

```
StockDapur-main/
├── index.html              # Halaman utama
├── frontend/
│   ├── css/
│   │   └── style.css      # Styling lengkap dengan dark mode
│   └── js/
│       ├── api.js         # Semua fungsi API request
│       ├── app.js         # Logic utama aplikasi
│       └── ui.js          # Fungsi rendering UI
└── backend/
    ├── server.js          # Express server & API endpoints
    ├── package.json       # Dependencies
    ├── vercel.json        # Konfigurasi Vercel
    └── data/
        ├── stok.json      # Data dummy (development)
        └── users.json     # Data user dummy
```

---

## 🔄 Alur Kerja Aplikasi

### 1. Alur Login & Autentikasi

```
┌─────────────┐
│ User buka   │
│ aplikasi    │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Cek localStorage     │
│ ada token?           │
└──────┬───────────────┘
       │
   ┌───┴───┐
   │ Ada?  │
   └───┬───┘
       │
    ┌──┴──┐
   YES    NO
    │      │
    │      ▼
    │   ┌──────────────┐
    │   │ Tampil form  │
    │   │ login        │
    │   └──────┬───────┘
    │          │
    │          ▼
    │   ┌──────────────────┐
    │   │ Input username & │
    │   │ password         │
    │   └──────┬───────────┘
    │          │
    │          ▼
    │   ┌──────────────────┐
    │   │ POST /api/auth/  │
    │   │ masuk            │
    │   └──────┬───────────┘
    │          │
    │      ┌───┴────┐
    │      │ Valid? │
    │      └───┬────┘
    │          │
    │       ┌──┴──┐
    │      YES   NO
    │       │     │
    │       │     ▼
    │       │  ┌──────────┐
    │       │  │ Tampil   │
    │       │  │ error    │
    │       │  └──────────┘
    │       │
    ├───────┘
    │
    ▼
┌──────────────────┐
│ Simpan token di  │
│ localStorage     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ GET /api/stok    │
│ (ambil data)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Render dashboard │
│ (Rak, Bon, dll)  │
└──────────────────┘
```

### 2. Alur Menambah Bahan Baru

```
┌──────────────────┐
│ User klik        │
│ "Tambah bahan"   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Buka form tambah │
│ (<details> expand)│
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Input:                   │
│ - Nama bahan             │
│ - Satuan                 │
│ - Stok awal              │
│ - Stok minimum           │
│ - Harga satuan           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│ Submit form      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ POST /api/stok   │
│ (kirim data)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Backend simpan   │
│ ke MongoDB       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Return data      │
│ bahan baru       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update array     │
│ daftarBahan[]    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Re-render UI:    │
│ - Bahan grid     │
│ - Summary bar    │
│ - Bon belanja    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Tampil toast     │
│ "Berhasil"       │
└──────────────────┘
```

### 3. Alur Catat Stok Masuk/Keluar

```
┌──────────────────┐
│ User klik        │
│ "Catat stok" di  │
│ kartu bahan      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Pindah ke tab    │
│ "Catat"          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Pilih tipe:      │
│ Masuk / Keluar   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ Bahan sudah terpilih │
│ (dari kartu)         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────┐
│ Input jumlah &   │
│ catatan opsional │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Submit form      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ POST /api/stok/:id/  │
│ catat                │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Backend:             │
│ 1. Validasi stok     │
│ 2. Hitung stok baru  │
│ 3. Update database   │
└────────┬─────────────┘
         │
     ┌───┴────┐
     │ Valid? │
     └───┬────┘
         │
      ┌──┴──┐
     YES   NO
      │     │
      │     ▼
      │  ┌──────────┐
      │  │ Return   │
      │  │ error    │
      │  └──────────┘
      │
      ▼
┌──────────────────┐
│ Return:          │
│ - Bahan updated  │
│ - Data transaksi │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update frontend: │
│ - daftarBahan[]  │
│ - riwayat[]      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Re-render:       │
│ - Kartu bahan    │
│ - Recent entries │
│ - Summary        │
│ - Bon belanja    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Tampil toast     │
│ konfirmasi       │
└──────────────────┘
```

### 4. Alur Monitoring & Status Bahan

```
┌──────────────────┐
│ Setiap render()  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ Loop daftarBahan[]   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Untuk setiap bahan:  │
│ Cek stok vs min_stok │
└────────┬─────────────┘
         │
    ┌────┴────┐
    │ Kondisi │
    └────┬────┘
         │
    ┌────┴────────────────┐
    │                     │
    ▼                     ▼
stok < min_stok    stok < min_stok * 1.5
    │                     │
    ▼                     ▼
┌─────────┐         ┌──────────────┐
│Menipis  │         │Hampir menipis│
│(Merah)  │         │(Kuning)      │
└─────────┘         └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Aman (Hijau) │
                   └──────────────┘
         │
         ▼
┌──────────────────────┐
│ Update UI:           │
│ - Badge warna        │
│ - Level bar (%)      │
│ - Summary counter    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Generate bon belanja │
│ untuk bahan menipis  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Hitung:              │
│ - Jumlah perlu beli  │
│   (min - stok)       │
│ - Total biaya        │
└──────────────────────┘
```

---

## 🔐 Cara Kerja Autentikasi

### Token-Based Auth (Stateless)

1. **Login Process:**
   ```javascript
   // Frontend mengirim credentials
   POST /api/auth/masuk
   {
     username: "sari",
     katasandi: "123"
   }
   
   // Backend cocokkan dengan database
   // Jika valid, buat token
   token = base64(username + ":" + password)
   
   // Return token ke frontend
   {
     ok: true,
     token: "c2FyaToxMjM=",
     pengguna: { ... }
   }
   ```

2. **Token Storage:**
   ```javascript
   // Simpan di localStorage
   localStorage.setItem('stockdapur-token', token)
   ```

3. **Authenticated Requests:**
   ```javascript
   // Setiap request ke API
   headers: {
     'Authorization': 'Basic c2FyaToxMjM='
   }
   ```

4. **Middleware Verification:**
   ```javascript
   // Backend decode token setiap request
   const decoded = Buffer.from(token, 'base64').toString()
   // Extract username:password
   // Query database untuk validasi
   // Jika valid, lanjutkan request
   // Jika tidak, return 401 Unauthorized
   ```

---

## 📊 Database Schema

### Collection: `users`
```json
{
  "_id": ObjectId,
  "username": String,
  "password": String,
  "nama": String,
  "role": String
}
```

### Collection: `bahan`
```json
{
  "_id": ObjectId,
  "nama_bahan": String,
  "stok": Number,
  "satuan": String,
  "min_stok": Number,
  "harga_satuan": Number
}
```

### Transaksi (tidak disimpan di DB, hanya di frontend)
```json
{
  "waktu": ISOString,
  "tipe": "masuk" | "keluar",
  "namaBahan": String,
  "jumlah": Number,
  "satuan": String,
  "stokSetelah": Number,
  "oleh": String,
  "catatan": String
}
```

---

## 🎨 State Management (Frontend)

### Global State Variables

```javascript
let penggunaAktif = null;  // Data user yang login
let daftarBahan = [];      // Array semua bahan dari database
let riwayat = [];          // Array transaksi (session-based)
let tabAktif = 'rak';      // Tab yang sedang dibuka
let tipeCatatat = 'masuk'; // Tipe transaksi aktif
let idSedangEdit = null;   // ID bahan yang sedang diedit
let idAkanHapus = null;    // ID bahan yang akan dihapus
```

### State Flow

```
Initial State
     │
     ▼
Login Success
     │
     ├─> penggunaAktif = userData
     ├─> daftarBahan = fetch dari API
     └─> render()
          │
          ├─> renderRak() - tampilkan grid bahan
          ├─> renderBon() - generate bon belanja
          └─> renderSummary() - hitung total & menipis

User Action
     │
     ├─> Tambah bahan
     │   └─> daftarBahan.push(newBahan)
     │       └─> render()
     │
     ├─> Edit bahan
     │   └─> daftarBahan[idx] = updatedBahan
     │       └─> render()
     │
     ├─> Hapus bahan
     │   └─> daftarBahan = filter(id !== deletedId)
     │       └─> render()
     │
     └─> Catat transaksi
         ├─> daftarBahan[idx].stok += jumlah
         ├─> riwayat.push(transaksi)
         └─> render()
```

---

## 🧮 Logic Perhitungan

### 1. Status Bahan
```javascript
function getStatus(bahan) {
  if (bahan.stok < bahan.min_stok) {
    return { label: 'Menipis', cls: 'red' }
  }
  if (bahan.stok < bahan.min_stok * 1.5) {
    return { label: 'Hampir menipis', cls: 'yellow' }
  }
  return { label: 'Aman', cls: 'green' }
}
```

### 2. Level Bar Percentage
```javascript
function levelPercent(bahan) {
  if (bahan.min_stok === 0) return 100
  
  // Target ideal = 2x min_stok
  const target = bahan.min_stok * 2
  const percent = (bahan.stok / target) * 100
  
  return Math.min(percent, 100) // Max 100%
}
```

### 3. Bon Belanja
```javascript
// Filter bahan yang menipis
const menipis = daftarBahan.filter(b => b.stok < b.min_stok)

// Untuk setiap bahan menipis
menipis.forEach(bahan => {
  // Hitung jumlah perlu dibeli
  const perlu = bahan.min_stok - bahan.stok
  
  // Hitung biaya
  const biaya = perlu * bahan.harga_satuan
  
  // Akumulasi total
  total += biaya
})
```

### 4. Summary Bar
```javascript
const total = daftarBahan.length
const menipis = daftarBahan.filter(b => b.stok < b.min_stok).length
const nilaiStok = daftarBahan.reduce((sum, b) => {
  return sum + (b.stok * b.harga_satuan)
}, 0)
```

---

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/masuk` - Login user
- `POST /api/auth/keluar` - Logout user
- `GET /api/auth/saya` - Cek token valid

### Bahan (Protected)
- `GET /api/stok` - Ambil semua bahan
- `POST /api/stok` - Tambah bahan baru
- `PUT /api/stok/:id` - Edit bahan
- `DELETE /api/stok/:id` - Hapus bahan
- `POST /api/stok/:id/catat` - Catat transaksi stok

### Request Example

```javascript
// Login
POST /api/auth/masuk
Content-Type: application/json

{
  "username": "sari",
  "katasandi": "123"
}

// Response
{
  "ok": true,
  "token": "c2FyaToxMjM=",
  "pengguna": {
    "id": "...",
    "username": "sari",
    "nama": "Bu Sari",
    "role": "admin"
  }
}

// Catat Stok Masuk
POST /api/stok/abc123/catat
Authorization: Basic c2FyaToxMjM=
Content-Type: application/json

{
  "tipe": "masuk",
  "jumlah": 10,
  "catatan": "Beli di pasar"
}

// Response
{
  "ok": true,
  "bahan": {
    "_id": "abc123",
    "nama_bahan": "Tahu putih",
    "stok": 25,
    "satuan": "pcs",
    "min_stok": 10,
    "harga_satuan": 500
  },
  "transaksi": {
    "waktu": "2026-11-03T10:30:00.000Z",
    "tipe": "masuk",
    "namaBahan": "Tahu putih",
    "jumlah": 10,
    "satuan": "pcs",
    "stokSetelah": 25,
    "oleh": "Bu Sari",
    "catatan": "Beli di pasar"
  }
}
```

---

## 🚀 Deployment

### Frontend (GitHub Pages)
```bash
# Push ke branch main
git add .
git commit -m "Update frontend"
git push origin main

# GitHub Pages auto-deploy dari branch main
# URL: https://ilhamrezapratama.github.io/StockDapur/
```

### Backend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd backend
vercel --prod

# Environment Variables (set di Vercel Dashboard)
MONGO_URI=mongodb+srv://...
PORT=3001
```

---

## 🛠️ Development

### Setup Lokal

1. **Clone repository**
   ```bash
   git clone https://github.com/IlhamRezaPratama/StockDapur.git
   cd StockDapur
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Buat file .env
   MONGO_URI=mongodb://localhost:27017
   PORT=3001
   
   # Jalankan server
   node server.js
   ```

3. **Setup Frontend**
   ```bash
   # Karena pakai ES Modules, perlu HTTP server
   # Bisa pakai Live Server di VS Code
   # Atau:
   npx http-server . -p 8080
   
   # Buka http://localhost:8080
   ```

4. **Update API URL**
   ```javascript
   // frontend/js/api.js
   const BASE = 'http://localhost:3001/api';
   ```

---

## 📝 Todo / Future Improvements

- [ ] Export data ke Excel/PDF
- [ ] Notifikasi browser untuk stok menipis
- [ ] Multi-user dengan role (admin/staff)
- [ ] Grafik trend stok
- [ ] Barcode scanning
- [ ] Integrasi printer untuk bon belanja
- [ ] PWA support (offline mode)
- [ ] Backup & restore database

---

## 👨‍💻 Developer

**Ilham Reza Pratama**
- GitHub: [@IlhamRezaPratama](https://github.com/IlhamRezaPratama)
- Live: [StockDapur](https://ilhamrezapratama.github.io/StockDapur/)

---

## 📄 License

MIT License - feel free to use this project for learning purposes.

---

**Built with ❤️ using Vanilla JavaScript & MongoDB**
