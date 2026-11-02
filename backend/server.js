// server.js
// File utama backend aplikasi StockDapur.
// Di sini semua pengaturan server Express dibuat, mulai dari koneksi database,
// middleware yang dipakai, sampai semua endpoint API yang bisa diakses frontend.

const express    = require('express');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const cors       = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app  = express();
const PORT = 3001;

// Connection string MongoDB dibaca dari file .env agar tidak terekspos saat di-push ke GitHub.
// Buat file .env di folder backend lalu isi dengan: MONGO_URI=connection_string_kamu
const MONGO_URI = process.env.MONGO_URI;
// Variabel db dipakai di seluruh file ini untuk mengakses koleksi database.
// Nilainya diisi setelah koneksi ke MongoDB berhasil terbentuk.
let db;

// FITUR: Koneksi ke MongoDB Atlas
// Fungsi ini dijalankan pertama kali saat server dinyalakan.
// Server tidak akan menerima request dari frontend sebelum koneksi ini berhasil.
// Kalau koneksi gagal, server langsung berhenti dan menampilkan pesan error.
async function koneksiDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db('stockdapur');
  console.log('Terhubung ke MongoDB Atlas');
}

// Pengaturan CORS agar frontend yang berjalan di port 5500 lewat Live Server
// bisa mengirim request ke backend ini. Tanpa ini, browser akan memblokir
// semua request karena beda port dianggap beda origin oleh browser.
// credentials true diperlukan agar cookie sesi bisa ikut dikirim bersama request.
app.use(cors({ origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://ilhamrezapratama.github.io'], credentials: true }));

// Middleware ini memungkinkan server membaca isi body dari request yang dikirim
// dalam format JSON. Tanpa ini, req.body akan selalu kosong atau undefined.
app.use(express.json());

// FITUR: Sesi pengguna
// Sesi dipakai untuk menyimpan data pengguna yang sedang login di sisi server.
// Setiap pengguna yang berhasil login akan mendapat cookie berisi ID sesinya.
// Cookie itu dikirim otomatis ke server di setiap request berikutnya,
// sehingga server bisa tahu siapa yang sedang mengakses tanpa perlu login ulang.
// Sesi berlaku selama 8 jam, setelah itu pengguna harus login lagi.
app.use(session({
  secret: 'stockdapur-sesi',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, dbName: 'stockdapur' }),
  cookie: { secure: true, httpOnly: true, sameSite: 'none', maxAge: 8 * 60 * 60 * 1000 }
}));

// FITUR: Middleware penjaga route
// Fungsi ini dicek sebelum menjalankan endpoint apapun yang butuh login.
// Kalau pengguna belum login maka sesi tidak akan punya data pengguna,
// dan server langsung menolak request dengan status 401 tanpa melanjutkan prosesnya.
// Kalau sudah login, fungsi next dipanggil dan request dilanjutkan ke handler berikutnya.
function harusLogin(req, res, next) {
  if (!req.session.pengguna) return res.status(401).json({ ok: false, pesan: 'Belum login.' });
  next();
}

// FITUR: Login pengguna
// Endpoint ini menerima username dan password dari form login di frontend.
// Data tersebut dicocokkan ke koleksi users di MongoDB.
// Kalau ada yang cocok, data pengguna disimpan ke dalam sesi server
// sehingga pengguna dianggap sudah login dan bisa mengakses fitur lainnya.
// Kalau tidak ada yang cocok, server mengirim pesan bahwa login gagal.
app.post('/api/auth/masuk', async (req, res) => {
  const { username, katasandi } = req.body;
  const user = await db.collection('users').findOne({ username, password: katasandi });
  if (!user) return res.status(401).json({ ok: false, pesan: 'Username atau password salah.' });
  req.session.pengguna = { id: user._id, username: user.username, nama: user.nama, role: user.role };
  res.json({ ok: true, pengguna: req.session.pengguna });
});

// FITUR: Logout pengguna
// Endpoint ini menghancurkan sesi yang sedang aktif di server.
// Setelah ini cookie sesi di browser tidak lagi valid,
// sehingga pengguna harus login ulang untuk bisa mengakses aplikasi.
app.post('/api/auth/keluar', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// FITUR: Cek sesi yang sedang aktif
// Endpoint ini dipakai oleh frontend saat halaman pertama kali dibuka.
// Tujuannya untuk mengecek apakah pengguna sudah punya sesi login yang masih berlaku,
// sehingga kalau masih aktif pengguna tidak perlu login ulang dan langsung masuk ke aplikasi.
app.get('/api/auth/saya', harusLogin, (req, res) => {
  res.json({ ok: true, pengguna: req.session.pengguna });
});

// FITUR: Ambil semua bahan
// Endpoint ini mengambil seluruh data bahan yang tersimpan di database
// dan mengirimkannya ke frontend dalam bentuk array.
// Dipakai saat halaman Rak pertama kali dimuat atau saat data perlu diperbarui.
app.get('/api/stok', harusLogin, async (req, res) => {
  const bahan = await db.collection('bahan').find().toArray();
  res.json({ ok: true, bahan });
});

// FITUR: Tambah bahan baru
// Endpoint ini menerima data bahan baru dari form tambah bahan di frontend.
// Data tersebut langsung disimpan ke koleksi bahan di database.
// MongoDB membuat ID unik secara otomatis untuk setiap bahan yang ditambahkan.
// Setelah berhasil disimpan, data bahan yang baru dikembalikan ke frontend
// agar tampilan bisa langsung diperbarui tanpa perlu memuat ulang halaman.
app.post('/api/stok', harusLogin, async (req, res) => {
  const baru = {
    nama_bahan:   req.body.namaBahan,
    stok:         Number(req.body.stok) || 0,
    satuan:       req.body.satuan,
    min_stok:     Number(req.body.minStok) || 0,
    harga_satuan: Number(req.body.hargaSatuan) || 0
  };
  const hasil = await db.collection('bahan').insertOne(baru);
  res.json({ ok: true, bahan: { ...baru, _id: hasil.insertedId } });
});

// FITUR: Ubah data bahan yang sudah ada
// Endpoint ini menerima data yang diubah dari form edit di frontend.
// Pencarian bahan dilakukan berdasarkan ID unik MongoDB yang ada di URL.
// Hanya field yang dikirim yang akan diubah, field lain tetap seperti semula.
// Setelah diubah, data terbaru diambil lagi dari database dan dikembalikan ke frontend.
app.put('/api/stok/:id', harusLogin, async (req, res) => {
  const perubahan = {};
  if (req.body.namaBahan)                 perubahan.nama_bahan   = req.body.namaBahan;
  if (req.body.satuan)                    perubahan.satuan        = req.body.satuan;
  if (req.body.minStok !== undefined)     perubahan.min_stok     = Number(req.body.minStok);
  if (req.body.hargaSatuan !== undefined) perubahan.harga_satuan = Number(req.body.hargaSatuan);
  await db.collection('bahan').updateOne({ _id: new ObjectId(req.params.id) }, { $set: perubahan });
  const bahan = await db.collection('bahan').findOne({ _id: new ObjectId(req.params.id) });
  res.json({ ok: true, bahan });
});

// FITUR: Hapus bahan
// Endpoint ini menghapus satu data bahan dari database secara permanen.
// Pencarian bahan yang akan dihapus dilakukan berdasarkan ID di URL.
// Penghapusan ini tidak bisa dibatalkan, makanya di frontend ada konfirmasi dulu.
app.delete('/api/stok/:id', harusLogin, async (req, res) => {
  await db.collection('bahan').deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ ok: true });
});

// FITUR: Catat transaksi stok masuk atau keluar
// Endpoint ini memperbarui jumlah stok bahan berdasarkan transaksi yang dicatat.
// Kalau tipenya masuk maka stok ditambah sejumlah yang dicatat.
// Kalau tipenya keluar maka stok dikurangi, tapi sebelumnya dicek dulu
// apakah stok yang tersedia cukup agar stok tidak sampai jadi minus.
// Setelah stok diperbarui di database, data bahan terbaru dan info transaksinya
// dikembalikan ke frontend untuk ditampilkan di riwayat dan memperbarui kartu bahan.
app.post('/api/stok/:id/catat', harusLogin, async (req, res) => {
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
      oleh: req.session.pengguna.nama, catatan: catatan || ''
    }
  });
});

// Jalankan koneksi ke database dulu, baru setelah berhasil server mulai menerima request.
// Kalau koneksi gagal maka server tidak jadi dijalankan dan error ditampilkan di terminal.
koneksiDB().then(() => {
  app.listen(PORT, () => console.log('Server StockDapur berjalan di http://localhost:' + PORT));
}).catch(err => {
  console.error('Gagal koneksi ke MongoDB:', err);
});
