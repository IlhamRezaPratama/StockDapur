// api.js
// File ini berisi semua fungsi yang bertugas mengirim request ke backend.
// Seluruh komunikasi antara frontend dan server dilakukan lewat fungsi-fungsi di sini.
// Tujuan memisahkannya ke file sendiri adalah agar kalau suatu saat alamat backend berubah,
// cukup mengubah satu baris di file ini, tidak perlu mencari di seluruh kode.

const BASE = 'https://stock-dapur.vercel.app/api';

// Token disimpan di localStorage dan dimuat ulang setiap kali halaman dibuka.
// Token ini dikirim di header Authorization setiap request agar server bisa verifikasi identitas.
let authToken = localStorage.getItem('stockdapur-token') || '';

// Fungsi pembantu untuk membuat opsi request fetch secara seragam.
// Token disertakan di header Authorization setiap kali ada token yang tersimpan.
const opt = (method, body) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': 'Basic ' + authToken } : {})
  },
  ...(body ? { body: JSON.stringify(body) } : {})
});

// FITUR: Login pengguna
// Mengirim username dan password ke backend untuk dicocokkan dengan database.
// Kalau berhasil, token yang dikembalikan backend disimpan ke localStorage
// dan akan dipakai di semua request berikutnya sampai pengguna logout.
export async function loginApi(username, katasandi) {
  const res  = await fetch(`${BASE}/auth/masuk`, opt('POST', { username, katasandi }));
  const data = await res.json();
  if (data.ok) {
    authToken = data.token;
    localStorage.setItem('stockdapur-token', data.token);
  }
  return data;
}

// FITUR: Logout pengguna
// Menghapus token dari localStorage dan mengosongkan variabel token di memori.
// Tidak perlu request ke server karena auth bersifat stateless.
export async function logoutApi() {
  authToken = '';
  localStorage.removeItem('stockdapur-token');
  return { ok: true };
}

// FITUR: Cek token yang masih aktif
// Dipanggil saat halaman pertama kali dibuka oleh browser.
// Kalau token di localStorage masih valid, pengguna tidak perlu login ulang.
export async function cekSesiApi() {
  if (!authToken) return { ok: false };
  const res = await fetch(`${BASE}/auth/saya`, opt('GET'));
  return res.json();
}

// FITUR: Ambil semua data bahan dari database
// Mengirim request ke backend untuk mendapatkan seluruh daftar bahan yang tersimpan.
export async function getBahanApi() {
  const res = await fetch(`${BASE}/stok`, opt('GET'));
  return res.json();
}

// FITUR: Tambah bahan baru
// Mengirim data bahan baru dari form ke backend agar disimpan ke database.
export async function tambahBahanApi(dataBahan) {
  const res = await fetch(`${BASE}/stok`, opt('POST', dataBahan));
  return res.json();
}

// FITUR: Ubah data bahan yang sudah ada
// Mengirim data yang sudah diedit ke backend berdasarkan ID bahan yang dipilih.
export async function ubahBahanApi(id, dataBahan) {
  const res = await fetch(`${BASE}/stok/${id}`, opt('PUT', dataBahan));
  return res.json();
}

// FITUR: Hapus bahan
// Mengirim permintaan penghapusan ke backend berdasarkan ID bahan yang dipilih.
export async function hapusBahanApi(id) {
  await fetch(`${BASE}/stok/${id}`, opt('DELETE'));
}

// FITUR: Catat transaksi stok masuk atau keluar
// Mengirim data transaksi ke backend yaitu tipe transaksi, jumlah, dan catatan opsional.
export async function catatApi(id, dataTransaksi) {
  const res = await fetch(`${BASE}/stok/${id}/catat`, opt('POST', dataTransaksi));
  return res.json();
}
