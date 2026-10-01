# Stock_barang_kelompok8
Aplikasi prediksi dan pengelolaan stok gudang berbasis web yang menggunakan relasi rekurensi untuk memperkirakan perubahan stok barang pada setiap periode.

# StockPredict

StockPredict adalah aplikasi berbasis web yang digunakan untuk membantu
mengelola stok barang gudang dan memperkirakan perubahan stok pada periode
berikutnya.

Aplikasi ini tidak hanya digunakan untuk restoran, tetapi dapat digunakan
untuk berbagai jenis usaha atau gudang, seperti toko elektronik, toko sepatu,
toko pakaian, minimarket, apotek, dan gudang umum.

## Fitur

- Pilihan jenis usaha atau gudang
- Pengelolaan data stok barang
- Perhitungan prediksi stok
- Riwayat perhitungan
- Status stok aman atau perlu restock
- Penyimpanan data menggunakan LocalStorage
- Export dan import data
- Tampilan responsif untuk komputer dan perangkat mobile
- Dapat digunakan melalui GitHub Pages

## Algoritma

Perhitungan prediksi stok menggunakan relasi rekurensi:

Sₙ = Sₙ₋₁ − Pₙ + Mₙ

Keterangan:

- Sₙ = stok pada periode berikutnya
- Sₙ₋₁ = stok pada periode sebelumnya
- Pₙ = jumlah barang yang terpakai atau terjual
- Mₙ = jumlah barang yang masuk

Hasil stok pada suatu periode digunakan sebagai stok awal
untuk menghitung periode berikutnya.

## Teknologi

- HTML
- CSS
- JavaScript
- LocalStorage

## Tujuan

Aplikasi ini dibuat sebagai penerapan konsep Matematika Diskrit,
khususnya relasi rekurensi, ke dalam permasalahan pengelolaan dan
prediksi stok barang pada gudang.
