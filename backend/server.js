// server.js
// File utama backend aplikasi StockDapur.
// Di sini semua pengaturan server Express dibuat, mulai dari koneksi database,
// middleware yang dipakai, sampai semua endpoint API yang bisa diakses frontend.

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app       = express();
const PORT      = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Koneksi MongoDB disimpan di variabel global agar tidak dibuat ulang setiap request.
// Di Vercel serverless, koneksi yang sudah ada bisa dipakai ulang di request berikutnya.
let cachedDb = null;

async function getDB() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  cachedDb = client.db('stockdapur');
  return cachedDb;
}

// CORS manual agar preflight OPTIONS selalu dibalas 200
// dan header akses diberikan ke GitHub Pages.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://ilhamrezapratama.github.io');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// FITUR: Middleware penjaga route
// Membaca token dari header Authorization yang dikirim frontend.
// Token adalah base64 dari username dan password yang disimpan di localStorage.
// Setiap request yang butuh login akan dicek ke database terlebih dahulu.
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

// FITUR: Login pengguna
// Menerima username dan password dari form login.
// Kalau cocok dengan database, mengembalikan token berupa base64 username dan password
// yang kemudian disimpan di localStorage di browser dan dikirim di setiap request berikutnya.
app.post('/api/auth/masuk', async (req, res) => {
  const db = await getDB();
  const { username, katasandi } = req.body;
  const user = await db.collection('users').findOne({ username, password: katasandi });
  if (!user) return res.status(401).json({ ok: false, pesan: 'Username atau password salah.' });
  const token = Buffer.from(username + ':' + katasandi).toString('base64');
  res.json({ ok: true, token, pengguna: { id: user._id, username: user.username, nama: user.nama, role: user.role } });
});

// FITUR: Logout pengguna
// Tidak ada sesi yang perlu dihapus di server karena auth bersifat stateless.
// Token dihapus dari localStorage di sisi frontend.
app.post('/api/auth/keluar', (req, res) => {
  res.json({ ok: true });
});

// FITUR: Cek token yang masih aktif
// Dipakai saat halaman dibuka untuk mengecek apakah token di localStorage masih valid.
app.get('/api/auth/saya', harusLogin, (req, res) => {
  res.json({ ok: true, pengguna: req.pengguna });
});

// FITUR: Ambil semua bahan
app.get('/api/stok', harusLogin, async (req, res) => {
  const db = await getDB();
  const bahan = await db.collection('bahan').find().toArray();
  res.json({ ok: true, bahan });
});

// FITUR: Tambah bahan baru
app.post('/api/stok', harusLogin, async (req, res) => {
  const db  = await getDB();
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

// FITUR: Ubah data bahan
app.put('/api/stok/:id', harusLogin, async (req, res) => {
  const db = await getDB();
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
app.delete('/api/stok/:id', harusLogin, async (req, res) => {
  const db = await getDB();
  await db.collection('bahan').deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ ok: true });
});

// FITUR: Catat transaksi stok masuk atau keluar
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

// Ekspor app untuk Vercel serverless.
// Untuk lokal, jalankan dengan node server.js seperti biasa.
if (require.main === module) {
  app.listen(PORT, () => console.log('Server berjalan di http://localhost:' + PORT));
}

module.exports = app;
