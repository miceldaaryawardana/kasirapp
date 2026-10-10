/* ==========================================================================
   SCRIPT.JS - KASIRKU PRO POS (POINT OF SALE MINI)
   Implementasi Front-End Vanilla: HTML5, CSS3, & JavaScript ES6+
   ========================================================================== */

// ==========================================================================
// 1. DATA PRODUK (ARRAY OBJEK HARDCODE SESUAI PERSYARATAN)
// ==========================================================================
const DAFTAR_PRODUK = [
  { id: "BRG01", nama: "Beras 5kg", harga: 65000 },
  { id: "BRG02", nama: "Minyak Goreng 2L", harga: 38000 },
  { id: "BRG03", nama: "Gula 1kg", harga: 17000 },
  { id: "BRG04", nama: "Telur 1kg", harga: 30000 },
  { id: "BRG05", nama: "Kopi Sachet", harga: 2500 },
  { id: "BRG06", nama: "Mi Instan", harga: 3500 }
];

// ==========================================================================
// 2. DEKLARASI VARIABEL & TIPE DATA EKSPLISIT
// ==========================================================================

// [VARIABEL - TIPE DATA: Array]
let keranjang = []; // Berisi koleksi objek item { id, nama, harga, qty, subtotal }

// [VARIABEL - TIPE DATA: String]
let namaPelanggan = "";
let namaBarang = "";

// [VARIABEL - TIPE DATA: Number]
let hargaBarang = 0;
let jumlah = 0;
let subtotal = 0;
let diskon = 0;
let pajak = 0;
let totalBayar = 0;
let uangBayar = 0;
let kembalian = 0;

// [VARIABEL - TIPE DATA: Boolean]
let isMember = false;
let isValid = true;

// ==========================================================================
// 3. ELEMEN DOM (DOCUMENT OBJECT MODEL)
// ==========================================================================
const inputNamaPelanggan = document.getElementById("namaPelanggan");
const checkIsMember = document.getElementById("isMember");
const selectPilihBarang = document.getElementById("pilihBarang");
const inputJumlahBeli = document.getElementById("jumlahBeli");
const inputUangBayar = document.getElementById("uangBayar");
const btnTambah = document.getElementById("btnTambah");
const btnHitung = document.getElementById("btnHitung");
const btnReset = document.getElementById("btnReset");
const btnHitungText = document.getElementById("btnHitungText");

const labelHargaSatuan = document.getElementById("labelHargaSatuan");
const badgeItemCount = document.getElementById("badgeItemCount");
const tbodyKeranjang = document.getElementById("tbodyKeranjang");
const labelSubtotalBelanja = document.getElementById("labelSubtotalBelanja");

const previewTotalBayar = document.getElementById("previewTotalBayar");
const previewKembalian = document.getElementById("previewKembalian");
const liveClock = document.getElementById("liveClock");
const toastContainer = document.getElementById("toastContainer");

// Elemen Struk Pembayaran
const receiptEmptyView = document.getElementById("receiptEmptyView");
const receiptFilledView = document.getElementById("receiptFilledView");
const strukNamaPelanggan = document.getElementById("strukNamaPelanggan");
const strukStatusMember = document.getElementById("strukStatusMember");
const strukWaktuTransaksi = document.getElementById("strukWaktuTransaksi");
const strukItemTbody = document.getElementById("strukItemTbody");
const strukSubtotal = document.getElementById("strukSubtotal");
const strukPersenDiskon = document.getElementById("strukPersenDiskon");
const strukNilaiDiskon = document.getElementById("strukNilaiDiskon");
const strukNilaiPPN = document.getElementById("strukNilaiPPN");
const strukTotalBayar = document.getElementById("strukTotalBayar");
const strukUangBayar = document.getElementById("strukUangBayar");
const strukKembalian = document.getElementById("strukKembalian");
const strukSisaPecahan = document.getElementById("strukSisaPecahan");
const strukStatusBadge = document.getElementById("strukStatusBadge");

// ==========================================================================
// 4. FUNGSI PEMBANTU (UTILITY & TOAST NOTIFICATION)
// ==========================================================================

/**
 * Format angka numerik ke format mata uang Rupiah Indonesia
 * @param {number} nominal - Nilai numerik
 * @returns {string} Contoh: "Rp 25.000"
 */
function formatRupiah(nominal) {
  const nilaiAman = isNaN(nominal) ? 0 : nominal;
  return "Rp " + new Intl.NumberFormat("id-ID").format(nilaiAman);
}

/**
 * Menampilkan pesan toast modern di pojok kanan atas layar (bukan alert())
 * @param {string} pesan - Teks pesan
 * @param {string} tipe - 'success' | 'accent' | 'default'
 */
function tampilkanToast(pesan, tipe = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipe}`;

  const iconSvg = tipe === "success"
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;

  toast.innerHTML = `
    <div class="toast-icon ${tipe}">${iconSvg}</div>
    <span>${pesan}</span>
  `;

  toastContainer.appendChild(toast);

  // Otomatis hapus setelah 3.2 detik
  setTimeout(() => {
    toast.classList.add("toast-fadeout");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }, 3200);
}

/**
 * Memperbarui jam digital real-time di header setiap detik
 */
function updateJamDigital() {
  const sekarang = new Date();
  const jam = String(sekarang.getHours()).padStart(2, "0");
  const menit = String(sekarang.getMinutes()).padStart(2, "0");
  const detik = String(sekarang.getSeconds()).padStart(2, "0");
  if (liveClock) {
    liveClock.textContent = `${jam}:${menit}:${detik} WIB`;
  }
}

/**
 * Format tanggal dan jam lengkap saat struk transaksi dibuat
 * @returns {string} Contoh: "Sabtu, 10 Oktober 2026 10:15:30 WIB"
 */
function formatWaktuSekarang() {
  const sekarang = new Date();
  return sekarang.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }) + " • " + sekarang.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) + " WIB";
}

/**
 * Menampilkan pesan error di bawah input spesifik & border merah
 * @param {string} fieldId - ID input target
 * @param {string} pesan - Pesan kesalahan
 */
function tampilkanError(fieldId, pesan) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById("error-" + fieldId);

  if (inputEl) {
    inputEl.classList.remove("is-invalid");
    // Trigger reflow untuk me-restart animasi shake
    void inputEl.offsetWidth;
    inputEl.classList.add("is-invalid");
  }
  if (errorEl) {
    errorEl.textContent = pesan;
    errorEl.classList.add("active");
  }
}

/**
 * Menghapus pesan error dan border merah dari input spesifik
 * @param {string} fieldId - ID input target
 */
function bersihkanError(fieldId) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById("error-" + fieldId);

  if (inputEl) {
    inputEl.classList.remove("is-invalid");
  }
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("active");
  }
}

/**
 * Menghapus seluruh pesan error form
 */
function bersihkanSemuaError() {
  const daftarField = ["namaPelanggan", "pilihBarang", "jumlahBeli", "uangBayar", "keranjangForm"];
  daftarField.forEach(field => bersihkanError(field));
}

// ==========================================================================
// 5. INISIALISASI PRODUK KE DALAM COMBOBOX
// ==========================================================================
function inisialisasiProduk() {
  selectPilihBarang.innerHTML = '<option value="">-- Pilih Produk Belanja --</option>';

  DAFTAR_PRODUK.forEach(produk => {
    const option = document.createElement("option");
    option.value = produk.id;
    option.textContent = `${produk.nama} - ${formatRupiah(produk.harga)}`;
    selectPilihBarang.appendChild(option);
  });
}

// ==========================================================================
// 6. VALIDASI FORMULIR (INPUT VALIDATION)
// ==========================================================================

/**
 * Memvalidasi input sebelum menambahkan barang ke keranjang
 * @returns {boolean} Status validitas
 */
function validasiTambahBarang() {
  let valid = true;

  // [OPERATOR LOGIKA: AND / OR / NOT] - NOT (!) dan OR (||)
  // [OPERATOR PERBANDINGAN] - ===
  if (!selectPilihBarang.value || selectPilihBarang.value === "") {
    tampilkanError("pilihBarang", "Silakan pilih produk belanja terlebih dahulu!");
    valid = false;
  } else {
    bersihkanError("pilihBarang");
  }

  // Parse kuantitas belanja
  const qtyInput = Number(inputJumlahBeli.value);

  // [OPERATOR LOGIKA: AND / OR / NOT] - OR (||)
  // [OPERATOR PERBANDINGAN] - <= dan >
  if (!Number.isInteger(qtyInput) || qtyInput <= 0 || qtyInput > 100) {
    tampilkanError("jumlahBeli", "Jumlah beli harus berupa bilangan bulat antara 1 sampai 100 unit!");
    valid = false;
  } else {
    bersihkanError("jumlahBeli");
  }

  return valid;
}

/**
 * Memvalidasi seluruh formulir saat kasir memproses hitung & bayar
 * @returns {boolean} Status keabsahan transaksi
 */
function validasiForm() {
  // [VARIABEL - TIPE DATA: Boolean]
  isValid = true;

  // [VARIABEL - TIPE DATA: String]
  namaPelanggan = inputNamaPelanggan.value;

  // 1. Validasi Nama Pelanggan: Wajib diisi, hanya huruf dan spasi
  const regexHurufSpasi = /^[a-zA-Z\s]+$/;

  // [OPERATOR LOGIKA: AND / OR / NOT] - Menggunakan NOT (!)
  if (!namaPelanggan.trim()) {
    tampilkanError("namaPelanggan", "Nama pelanggan wajib diisi!");
    isValid = false;
  } else if (!regexHurufSpasi.test(namaPelanggan.trim())) {
    // [OPERATOR LOGIKA: AND / OR / NOT] - NOT (!)
    tampilkanError("namaPelanggan", "Nama pelanggan hanya boleh berisi huruf alfabet dan spasi!");
    isValid = false;
  } else {
    bersihkanError("namaPelanggan");
  }

  // 2. Validasi Keranjang: Tidak boleh kosong saat menghitung
  // [OPERATOR PERBANDINGAN] - ===
  if (keranjang.length === 0) {
    tampilkanError("keranjangForm", "Keranjang belanja masih kosong! Tambahkan minimal 1 produk sebelum menghitung.");
    isValid = false;
  } else {
    bersihkanError("keranjangForm");
  }

  // 3. Validasi Uang Bayar: Harus angka, tidak boleh negatif, dan >= total bayar
  const rawUangBayar = inputUangBayar.value.trim();
  // [VARIABEL - TIPE DATA: Number]
  uangBayar = Number(rawUangBayar);

  // [OPERATOR LOGIKA: AND / OR / NOT] - NOT (!) dan OR (||)
  // [OPERATOR PERBANDINGAN] - <
  if (!rawUangBayar || isNaN(uangBayar)) {
    tampilkanError("uangBayar", "Uang bayar wajib diisi angka nominal yang valid!");
    isValid = false;
  } else if (uangBayar < 0) {
    tampilkanError("uangBayar", "Uang bayar tidak boleh bernilai negatif!");
    isValid = false;
  } else {
    // Jalankan hitung total untuk memastikan nilai totalBayar terkini
    hitungTotal();

    // [OPERATOR LOGIKA: AND / OR / NOT] - NOT (!) dan AND (&&)
    // Syarat: Pembayaran valid jika !(uangBayar < totalBayar) && jumlah > 0
    if (!(uangBayar >= totalBayar)) {
      // [OPERATOR PERBANDINGAN] - <
      tampilkanError("uangBayar", `Uang bayar kurang! Total belanja adalah ${formatRupiah(totalBayar)}.`);
      isValid = false;
    } else {
      bersihkanError("uangBayar");
    }
  }

  return isValid;
}

// ==========================================================================
// 7. FUNGSI LOGIKA UTAMA (KERANJANG, HITUNG TOTAL, STRUK, RESET)
// ==========================================================================

/**
 * Menambahkan barang yang dipilih ke dalam array keranjang
 */
function tambahKeranjang() {
  bersihkanError("keranjangForm");

  if (!validasiTambahBarang()) {
    return;
  }

  const selectedId = selectPilihBarang.value;
  const produkDitemukan = DAFTAR_PRODUK.find(p => p.id === selectedId);

  // [OPERATOR LOGIKA: AND / OR / NOT] - NOT (!)
  if (!produkDitemukan) {
    tampilkanError("pilihBarang", "Produk tidak ditemukan dalam sistem!");
    return;
  }

  // [VARIABEL - TIPE DATA: String]
  namaBarang = produkDitemukan.nama;
  // [VARIABEL - TIPE DATA: Number]
  hargaBarang = produkDitemukan.harga;
  jumlah = parseInt(inputJumlahBeli.value, 10);

  // Cari apakah barang sudah ada di keranjang
  const existingIndex = keranjang.findIndex(item => item.id === selectedId);

  // [OPERATOR PERBANDINGAN] - !==
  if (existingIndex !== -1) {
    // [OPERATOR ARITMATIKA] - Operator + untuk penambahan kuantitas
    const kuantitasBaru = keranjang[existingIndex].qty + jumlah;

    // [OPERATOR PERBANDINGAN] - >
    if (kuantitasBaru > 100) {
      tampilkanError("jumlahBeli", `Total kuantitas barang ini maksimal 100 unit! (Saat ini di keranjang: ${keranjang[existingIndex].qty})`);
      return;
    }

    keranjang[existingIndex].qty = kuantitasBaru;
    // [OPERATOR ARITMATIKA] - Operator * untuk perkalian subtotal item
    keranjang[existingIndex].subtotal = keranjang[existingIndex].harga * keranjang[existingIndex].qty;
  } else {
    // [OPERATOR ARITMATIKA] - Operator * untuk perkalian harga dan jumlah item baru
    const subtotalItem = hargaBarang * jumlah;

    // [VARIABEL - TIPE DATA: Array]
    keranjang.push({
      id: selectedId,
      nama: namaBarang,
      harga: hargaBarang,
      qty: jumlah,
      subtotal: subtotalItem
    });
  }

  // Render ulang tabel keranjang
  renderTabelKeranjang();

  // Hitung ulang total transaksi terkini
  hitungTotal();

  // Reset form pilihan produk
  selectPilihBarang.value = "";
  inputJumlahBeli.value = "1";
  labelHargaSatuan.textContent = "Pilih barang terlebih dahulu";

  // Tampilkan toast notifikasi berhasil
  tampilkanToast(`"${namaBarang}" berhasil ditambahkan ke keranjang!`, "accent");
}

/**
 * Menghapus satu item dari keranjang berdasarkan index
 * @param {number} index - Index elemen pada array keranjang
 */
function hapusItem(index) {
  // [OPERATOR PERBANDINGAN] - >= dan <
  if (index >= 0 && index < keranjang.length) {
    const itemDihapus = keranjang[index].nama;
    keranjang.splice(index, 1);
    renderTabelKeranjang();
    hitungTotal();
    tampilkanToast(`"${itemDihapus}" dihapus dari keranjang.`, "default");
  }
}

/**
 * Menampilkan isi array keranjang ke tabel HTML
 */
function renderTabelKeranjang() {
  tbodyKeranjang.innerHTML = "";

  // [OPERATOR PERBANDINGAN] - ===
  if (keranjang.length === 0) {
    tbodyKeranjang.innerHTML = `
      <tr class="empty-row">
        <td colspan="6" class="text-center empty-cart-td">
          <div class="empty-cart-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span>Keranjang kosong. Pilih produk dan klik tombol "+ Tambah".</span>
          </div>
        </td>
      </tr>
    `;
    badgeItemCount.textContent = "0 Item";
    labelSubtotalBelanja.textContent = formatRupiah(0);
    return;
  }

  // [OPERATOR ARITMATIKA] - Operator + untuk akumulasi kuantitas
  let totalKuantitas = 0;

  keranjang.forEach((item, index) => {
    totalKuantitas += item.qty;

    const tr = document.createElement("tr");
    tr.className = "item-row";

    // Kolom data item
    tr.innerHTML = `
      <td class="text-center">${index + 1}</td>
      <td class="text-left font-semibold">${item.nama}</td>
      <td class="text-right font-tabular">${formatRupiah(item.harga)}</td>
      <td class="text-center">${item.qty}</td>
      <td class="text-right font-tabular font-semibold">${formatRupiah(item.subtotal)}</td>
      <td class="text-center" id="col-action-${index}"></td>
    `;

    tbodyKeranjang.appendChild(tr);

    // Tombol hapus item dibuat via DOM createElement & addEventListener (tanpa inline onclick)
    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.className = "btn-delete-row";
    btnDelete.title = `Hapus ${item.nama} dari keranjang`;
    btnDelete.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;

    // [EVENT: click] - Event listener tombol hapus baris tabel
    btnDelete.addEventListener("click", () => {
      hapusItem(index);
    });

    const colAction = document.getElementById(`col-action-${index}`);
    if (colAction) {
      colAction.appendChild(btnDelete);
    }
  });

  badgeItemCount.textContent = `${totalKuantitas} Item`;
}

/**
 * Menghitung subtotal, diskon, PPN 11%, total bayar, dan perkiraan kembalian
 */
function hitungTotal() {
  // 1. Hitung Subtotal seluruh belanjaan
  // [OPERATOR ARITMATIKA] - Operator + akumulasi iteratif
  subtotal = keranjang.reduce((acc, item) => acc + item.subtotal, 0);

  // [VARIABEL - TIPE DATA: Boolean]
  isMember = checkIsMember.checked;

  // 2. Logika Penentuan Diskon:
  // Syarat: Diskon 10% jika (subtotal >= 100000 && isMember) || subtotal >= 500000
  // [OPERATOR PERBANDINGAN] - >=
  // [OPERATOR LOGIKA: AND / OR / NOT] - Menggunakan AND (&&) dan OR (||)
  if ((subtotal >= 100000 && isMember) || subtotal >= 500000) {
    // [OPERATOR ARITMATIKA] - Operator * dan / untuk menghitung diskon 10%
    diskon = subtotal * (10 / 100);
  } else {
    diskon = 0;
  }

  // 3. Dasar Pengenaan Pajak (DPP)
  // [OPERATOR ARITMATIKA] - Operator - untuk pengurangan diskon
  const dpp = subtotal - diskon;

  // 4. Pajak Pertambahan Nilai (PPN 11%)
  // [OPERATOR ARITMATIKA] - Operator * untuk pengalian tarif PPN 11%
  pajak = dpp * 0.11;

  // 5. Total Bayar
  // [OPERATOR ARITMATIKA] - Operator + untuk menjumlahkan DPP dengan pajak
  totalBayar = dpp + pajak;

  // Tampilkan di tampilan form kasir
  labelSubtotalBelanja.textContent = formatRupiah(subtotal);
  previewTotalBayar.textContent = formatRupiah(totalBayar);

  // Update estimasi kembalian secara langsung
  updatePreviewKembalian();
}

/**
 * Memperbarui angka estimasi kembalian secara real-time saat kasir mengetik uang bayar
 */
function updatePreviewKembalian() {
  const inputNominal = Number(inputUangBayar.value) || 0;

  // [OPERATOR ARITMATIKA] - Operator - untuk pengurangan uang bayar dengan total bayar
  const estimasiKembali = inputNominal - totalBayar;

  // [OPERATOR PERBANDINGAN] - >= dan >
  if (inputNominal >= totalBayar && totalBayar > 0) {
    previewKembalian.textContent = formatRupiah(estimasiKembali);
    previewKembalian.className = "qs-value highlight-kembali kembali-positif";
  } else if (inputNominal > 0 && inputNominal < totalBayar) {
    // [OPERATOR PERBANDINGAN] - <
    previewKembalian.textContent = `Kurang ${formatRupiah(Math.abs(estimasiKembali))}`;
    previewKembalian.className = "qs-value highlight-kembali kembali-negatif";
  } else {
    previewKembalian.textContent = "Rp 0";
    previewKembalian.className = "qs-value highlight-kembali";
  }
}

/**
 * Menampilkan rincian transaksi lengkap pada panel Struk Pembayaran
 */
function tampilkanStruk() {
  namaPelanggan = inputNamaPelanggan.value.trim();
  isMember = checkIsMember.checked;
  uangBayar = Number(inputUangBayar.value) || 0;

  // [OPERATOR ARITMATIKA] - Operator - untuk kalkulasi kembalian resmi
  kembalian = uangBayar - totalBayar;

  // [OPERATOR ARITMATIKA] - Operator % (modulo) untuk sisa pembulatan ke Rp 100
  const sisaPembulatan100 = kembalian > 0 ? Math.floor(kembalian) % 100 : 0;

  // Tampilkan view struk terisi dan sembunyikan empty state
  receiptEmptyView.classList.add("hidden");
  receiptFilledView.classList.remove("hidden");

  // 1. Metadata Struk
  strukNamaPelanggan.textContent = namaPelanggan;
  strukStatusMember.textContent = isMember ? "MEMBER (Diskon Khusus 10%)" : "NON-MEMBER";
  strukWaktuTransaksi.textContent = formatWaktuSekarang();

  // 2. Render Tabel Item Struk
  strukItemTbody.innerHTML = "";
  keranjang.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-left">${item.nama}</td>
      <td class="text-center">${item.qty}</td>
      <td class="text-right font-tabular">${formatRupiah(item.harga)}</td>
      <td class="text-right font-tabular"><strong>${formatRupiah(item.subtotal)}</strong></td>
    `;
    strukItemTbody.appendChild(tr);
  });

  // 3. Rincian Finansial
  strukSubtotal.textContent = formatRupiah(subtotal);

  // [OPERATOR ARITMATIKA] - Operator / untuk persentase diskon
  // [OPERATOR PERBANDINGAN] - >
  const persentaseDiskon = subtotal > 0 ? (diskon / subtotal) * 100 : 0;
  strukPersenDiskon.textContent = `(${persentaseDiskon.toFixed(0)}%)`;
  strukNilaiDiskon.textContent = diskon > 0 ? `- ${formatRupiah(diskon)}` : "Rp 0";

  strukNilaiPPN.textContent = formatRupiah(pajak);
  strukTotalBayar.textContent = formatRupiah(totalBayar);
  strukUangBayar.textContent = formatRupiah(uangBayar);
  strukKembalian.textContent = formatRupiah(kembalian >= 0 ? kembalian : 0);

  // Rincian sisa pembulatan modulo
  strukSisaPecahan.textContent = formatRupiah(sisaPembulatan100);

  // 4. Badge Status Kelunasan Transaksi
  // [OPERATOR LOGIKA: AND / OR / NOT] - NOT (!) dan AND (&&)
  // [OPERATOR PERBANDINGAN] - < dan >
  if (!(uangBayar < totalBayar) && totalBayar > 0) {
    strukStatusBadge.textContent = "LUNAS";
    strukStatusBadge.className = "status-pill lunas";
    tampilkanToast("Transaksi berhasil dihitung & Pembayaran LUNAS!", "success");
  } else {
    strukStatusBadge.textContent = "UANG KURANG";
    strukStatusBadge.className = "status-pill kurang";
  }
}

/**
 * Mengembalikan seluruh formulir, keranjang, dan struk ke kondisi semula (Reset)
 */
function resetForm() {
  // [VARIABEL - TIPE DATA: Array] Reset
  keranjang = [];

  // [VARIABEL - TIPE DATA: String] Reset
  namaPelanggan = "";
  namaBarang = "";

  // [VARIABEL - TIPE DATA: Number] Reset
  hargaBarang = 0;
  jumlah = 0;
  subtotal = 0;
  diskon = 0;
  pajak = 0;
  totalBayar = 0;
  uangBayar = 0;
  kembalian = 0;

  // [VARIABEL - TIPE DATA: Boolean] Reset
  isMember = false;
  isValid = true;

  // Reset Elemen Form
  inputNamaPelanggan.value = "";
  checkIsMember.checked = false;
  selectPilihBarang.value = "";
  inputJumlahBeli.value = "1";
  inputUangBayar.value = "";
  labelHargaSatuan.textContent = "Pilih barang terlebih dahulu";

  // Bersihkan pesan error visual
  bersihkanSemuaError();

  // Render ulang tabel keranjang kosong
  renderTabelKeranjang();

  // Reset kalkulasi ringkasan
  labelSubtotalBelanja.textContent = formatRupiah(0);
  previewTotalBayar.textContent = formatRupiah(0);
  previewKembalian.textContent = formatRupiah(0);
  previewKembalian.className = "qs-value highlight-kembali";

  // Tampilkan kembali empty state pada panel struk
  receiptEmptyView.classList.remove("hidden");
  receiptFilledView.classList.add("hidden");

  strukNamaPelanggan.textContent = "-";
  strukStatusMember.textContent = "-";
  strukWaktuTransaksi.textContent = "-";
  strukItemTbody.innerHTML = "";
  strukSubtotal.textContent = "Rp 0";
  strukPersenDiskon.textContent = "(0%)";
  strukNilaiDiskon.textContent = "- Rp 0";
  strukNilaiPPN.textContent = "Rp 0";
  strukTotalBayar.textContent = "Rp 0";
  strukUangBayar.textContent = "Rp 0";
  strukKembalian.textContent = "Rp 0";
  strukSisaPecahan.textContent = "Rp 0";
  strukStatusBadge.textContent = "MENUNGGU PEMBAYARAN";
  strukStatusBadge.className = "status-pill waiting";

  tampilkanToast("Formulir dan transaksi berhasil di-reset.", "default");
}

// ==========================================================================
// 8. EVENT LISTENERS DENGAN addEventListener (MINIMAL 2, DIBUAT 4+)
// ==========================================================================

// [EVENT: click] - Tombol "+ Tambah ke Keranjang"
btnTambah.addEventListener("click", () => {
  tambahKeranjang();
});

// [EVENT: click] - Tombol "Hitung & Bayar" (dengan animasi spinner singkat)
btnHitung.addEventListener("click", () => {
  if (validasiForm()) {
    // Tampilkan efek loading spinner singkat untuk UX interaktif
    btnHitung.classList.add("loading");
    btnHitungText.textContent = "Menghitung...";

    setTimeout(() => {
      btnHitung.classList.remove("loading");
      btnHitungText.textContent = "Hitung & Bayar";
      hitungTotal();
      tampilkanStruk();
    }, 280);
  }
});

// [EVENT: click] - Tombol "Reset Form"
btnReset.addEventListener("click", () => {
  resetForm();
});

// [EVENT: change] - ComboBox / Select "Pilih Barang" (Harga otomatis tampil)
selectPilihBarang.addEventListener("change", (e) => {
  bersihkanError("pilihBarang");
  const selectedId = e.target.value;

  // [OPERATOR PERBANDINGAN] - ===
  if (selectedId === "") {
    labelHargaSatuan.textContent = "Pilih barang terlebih dahulu";
    return;
  }

  const produk = DAFTAR_PRODUK.find(p => p.id === selectedId);
  // [OPERATOR PERBANDINGAN] - !==
  if (produk !== undefined) {
    labelHargaSatuan.textContent = formatRupiah(produk.harga);
  }
});

// [EVENT: input] - Input Number "Uang Bayar" (Kembalian tampil real-time)
inputUangBayar.addEventListener("input", () => {
  bersihkanError("uangBayar");
  updatePreviewKembalian();
});

// [EVENT: input] - Input Text "Nama Pelanggan" (Bersihkan pesan error saat diketik ulang)
inputNamaPelanggan.addEventListener("input", () => {
  bersihkanError("namaPelanggan");
});

// [EVENT: input] - Input Number "Jumlah Beli" (Bersihkan pesan error saat kuantitas diubah)
inputJumlahBeli.addEventListener("input", () => {
  bersihkanError("jumlahBeli");
});

// [EVENT: change] - Checkbox Switch "Pelanggan Member" (Hitung ulang diskon secara dinamis)
checkIsMember.addEventListener("change", () => {
  hitungTotal();
  // Jika struk sudah pernah dicetak, perbarui struk
  if (!receiptFilledView.classList.contains("hidden")) {
    tampilkanStruk();
  }
});

// ==========================================================================
// 9. STARTUP & SIKLUS HIDUP APLIKASI
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  inisialisasiProduk();
  resetForm();

  // Jalankan jam digital real-time
  updateJamDigital();
  setInterval(updateJamDigital, 1000);
});
