// api.js
// File ini berisi semua fungsi yang bertugas mengirim request ke backend.
// Seluruh komunikasi antara frontend dan server dilakukan lewat fungsi-fungsi di sini.
// Tujuan memisahkannya ke file sendiri adalah agar kalau suatu saat alamat backend berubah,
// kita cukup mengubah satu baris di file ini, tidak perlu mencari di seluruh kode.

const BASE = 'http://localhost:3001/api';

// Fungsi pembantu untuk membuat opsi request fetch secara seragam.
// Setiap request ke backend harus menyertakan header JSON dan kredensial berupa cookie sesi
// agar server bisa mengenali pengguna yang sedang login.
const opt = (method, body) => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {})
});

// FITUR: Login pengguna
// Mengirim username dan password yang diketik di form login ke endpoint masuk di backend.
// Backend akan mengecek ke database dan mengembalikan data pengguna kalau cocok.
export async function loginApi(username, katasandi) {
  const res = await fetch(`${BASE}/auth/masuk`, opt('POST', { username, katasandi }));
  return res.json();
}

// FITUR: Logout pengguna
// Mengirim permintaan ke backend untuk menghapus sesi login yang sedang aktif.
// Setelah ini pengguna dianggap sudah keluar dan harus login lagi untuk masuk.
export async function logoutApi() {
  await fetch(`${BASE}/auth/keluar`, opt('POST'));
}

// FITUR: Cek sesi yang masih aktif
// Dipanggil saat halaman pertama kali dibuka oleh browser.
// Kalau pengguna sebelumnya sudah login dan sesinya belum habis,
// backend akan mengembalikan data penggunanya sehingga tidak perlu login ulang.
export async function cekSesiApi() {
  const res = await fetch(`${BASE}/auth/saya`, opt('GET'));
  return res.json();
}

// FITUR: Ambil semua data bahan dari database
// Mengirim request ke backend untuk mendapatkan seluruh daftar bahan yang tersimpan.
// Hasilnya berupa array bahan yang kemudian ditampilkan di halaman Rak.
export async function getBahanApi() {
  const res = await fetch(`${BASE}/stok`, opt('GET'));
  return res.json();
}

// FITUR: Tambah bahan baru
// Mengirim data bahan baru dari form ke backend agar disimpan ke database.
// Backend akan membuat ID unik untuk bahan itu dan mengembalikan data lengkapnya.
export async function tambahBahanApi(dataBahan) {
  const res = await fetch(`${BASE}/stok`, opt('POST', dataBahan));
  return res.json();
}

// FITUR: Ubah data bahan yang sudah ada
// Mengirim data yang sudah diedit ke backend berdasarkan ID bahan yang dipilih.
// Backend hanya mengubah field yang dikirim, field lain tetap seperti semula.
export async function ubahBahanApi(id, dataBahan) {
  const res = await fetch(`${BASE}/stok/${id}`, opt('PUT', dataBahan));
  return res.json();
}

// FITUR: Hapus bahan
// Mengirim permintaan penghapusan ke backend berdasarkan ID bahan yang dipilih.
// Penghapusan ini permanen dan tidak bisa dibatalkan setelah dikonfirmasi.
export async function hapusBahanApi(id) {
  await fetch(`${BASE}/stok/${id}`, opt('DELETE'));
}

// FITUR: Catat transaksi stok masuk atau keluar
// Mengirim data transaksi ke backend, yaitu tipe transaksi, jumlah, dan catatan opsional.
// Backend akan memperbarui stok bahan di database dan mengembalikan data terbaru
// beserta informasi transaksi yang bisa disimpan ke riwayat di sisi frontend.
export async function catatApi(id, dataTransaksi) {
  const res = await fetch(`${BASE}/stok/${id}/catat`, opt('POST', dataTransaksi));
  return res.json();
}
