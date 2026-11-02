// server.js
// File utama backend aplikasi StockDapur.
// Di sini semua pengaturan server Express dibuat, mulai dari koneksi database,
// middleware yang dipakai, sampai semua endpoint API yang bisa diakses frontend.

const express    = require('express');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app      = express();
const PORT     = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Koneksi MongoDB disimpan di variabel global agar tidak dibuat ulang setiap request.
// Di Vercel serverless, setiap fungsi bisa dipakai ulang di request berikutnya
// sehingga koneksi yang sudah ada tidak perlu dibuka lagi dari awal.
let cachedDb = null;

async function getDB() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  cachedDb = client.db('stockdapur');
  return cachedDb;
}

// CORS manual agar preflight OPTIONS selalu dibalas 200
// tanpa harus masuk ke middleware lain terlebih dahulu.
// GitHub Pages butuh ini agar bisa kirim request ke Vercel.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://ilhamrezapratama.github.io');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// Sesi disimpan ke MongoDB agar tidak hilang saat Vercel menjalankan ulang fungsi.
// Tanpa ini login akan selalu gagal di environment serverless.
app.use(session({
  secret: 'stockdapur-sesi',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI, dbName: 'stockdapur' }),
  cookie: { secure: true, httpOnly: true, sameSite: 'none', maxAge: 8 * 60 * 60 * 1000 }
}));

// Middleware ini memastikan koneksi ke database sudah tersedia
// sebelum setiap request diproses oleh route handler.
app.use(async (req, res, next) => {
  try {
    await getDB();
    next();
  } catch (err) {
    res.status(500).json({ ok: false, pesan: 'Gagal koneksi database.' });
  }
});

function harusLogin(req, res, next) {
  if (!req.session.pengguna) return res.status(401).json({ ok: false, pesan: 'Belum login.' });
  next();
}

// FITUR: Login pengguna
app.post('/api/auth/masuk', async (req, res) => {
  const db = await getDB();
  const { username, katasandi } = req.body;
  const user = await db.collection('users').findOne({ username, password: katasandi });
  if (!user) return res.status(401).json({ ok: false, pesan: 'Username atau password salah.' });
  req.session.pengguna = { id: user._id, username: user.username, nama: user.nama, role: user.role };
  res.json({ ok: true, pengguna: req.session.pengguna });
});

// FITUR: Logout pengguna
app.post('/api/auth/keluar', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// FITUR: Cek sesi yang sedang aktif
app.get('/api/auth/saya', harusLogin, (req, res) => {
  res.json({ ok: true, pengguna: req.session.pengguna });
});

// FITUR: Ambil semua bahan
app.get('/api/stok', harusLogin, async (req, res) => {
  const db = await getDB();
  const bahan = await db.collection('bahan').find().toArray();
  res.json({ ok: true, bahan });
});

// FITUR: Tambah bahan baru
app.post('/api/stok', harusLogin, async (req, res) => {
  const db = await getDB();
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
      oleh: req.session.pengguna.nama, catatan: catatan || ''
    }
  });
});

// Ekspor app untuk Vercel serverless.
// Untuk lokal, server tetap bisa dijalankan dengan node server.js.
if (require.main === module) {
  app.listen(PORT, () => console.log('Server berjalan di http://localhost:' + PORT));
}

module.exports = app;
