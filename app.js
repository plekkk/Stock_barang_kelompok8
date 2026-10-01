const STORAGE_KEY = "stockPredictData";

let appData = {
    setup: {
        business: "",
        warehouse: "",
        location: "",
        manager: ""
    },
    stocks: [],
    histories: []
};

let selectedBusiness = "";
let currentPrediction = null;

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    initializeEvents();

    if (appData.setup.business && appData.setup.warehouse) {
        tampilkanAplikasi();
    }
});

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        try {
            const parsed = JSON.parse(saved);

            appData = {
                setup: parsed.setup || appData.setup,
                stocks: parsed.stocks || [],
                histories: parsed.histories || []
            };
        } catch (error) {
            console.error("Data tidak dapat dibaca.");
        }
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function initializeEvents() {

    document.querySelectorAll(".business-option").forEach(button => {
        button.addEventListener("click", () => {

            document.querySelectorAll(".business-option").forEach(item => {
                item.classList.remove("selected");
            });

            button.classList.add("selected");

            selectedBusiness = button.dataset.business;

            document.getElementById("lanjutSetupBtn").disabled = false;
            document.getElementById("selectedBusinessText").textContent = selectedBusiness;
        });
    });

    document.getElementById("gudangForm").addEventListener("submit", event => {
        event.preventDefault();

        appData.setup = {
            business: selectedBusiness,
            warehouse: document.getElementById("namaGudang").value.trim(),
            location: document.getElementById("lokasiGudang").value.trim(),
            manager: document.getElementById("pengelolaGudang").value.trim()
        };

        saveData();
        tampilkanAplikasi();
    });

    document.getElementById("stockForm").addEventListener("submit", event => {
        event.preventDefault();
        hitungPrediksi();
    });

    document.getElementById("searchStock").addEventListener("input", tampilkanDataStok);

    document.getElementById("filterStatus").addEventListener("change", tampilkanDataStok);

    document.getElementById("importFile").addEventListener("change", importData);
}

function mulaiAplikasi() {
    document.getElementById("caraPakaiPage").classList.add("hidden");
    document.getElementById("setupPage").classList.remove("hidden");
}

function kembaliKeCaraPakai() {
    document.getElementById("setupPage").classList.add("hidden");
    document.getElementById("caraPakaiPage").classList.remove("hidden");
}

function lanjutKeGudang() {

    if (!selectedBusiness) {
        alert("Silakan pilih jenis usaha terlebih dahulu.");
        return;
    }

    document.getElementById("setupPage").classList.add("hidden");
    document.getElementById("gudangPage").classList.remove("hidden");
}

function kembaliKeUsaha() {
    document.getElementById("gudangPage").classList.add("hidden");
    document.getElementById("setupPage").classList.remove("hidden");
}

function tampilkanAplikasi() {

    document.getElementById("caraPakaiPage").classList.add("hidden");
    document.getElementById("setupPage").classList.add("hidden");
    document.getElementById("gudangPage").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");

    updateInformation();
    tampilkanDashboard();
    tampilkanDataStok();
    tampilkanRiwayat();
}

function updateInformation() {

    const setup = appData.setup;

    document.getElementById("sidebarBusiness").textContent = setup.business;
    document.getElementById("topbarGudang").textContent = setup.warehouse;
    document.getElementById("topbarLokasi").textContent = setup.location;

    document.getElementById("dashboardBusiness").textContent = setup.business;

    document.getElementById("dashboardGudang").textContent =
        `${setup.warehouse} • ${setup.location}`;
}

function bukaHalaman(pageName) {

    document.querySelectorAll(".app-page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    const page = document.getElementById(`page-${pageName}`);

    if (page) {
        page.classList.add("active");
    }

    const button = document.querySelector(`.nav-btn[data-page="${pageName}"]`);

    if (button) {
        button.classList.add("active");
    }

    if (pageName === "dashboard") {
        tampilkanDashboard();
    }

    if (pageName === "stok") {
        tampilkanDataStok();
    }

    if (pageName === "riwayat") {
        tampilkanRiwayat();
    }

    document.querySelector(".sidebar").classList.remove("show");
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        bukaHalaman(button.dataset.page);
    });
});

document.getElementById("mobileMenuBtn").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("show");
});


function hitungPrediksi() {

    const nama = document.getElementById("namaBarang").value.trim();

    const stokAwal = Number(
        document.getElementById("stokSekarang").value
    );

    const satuan = document.getElementById("satuan").value;

    const terpakai = Number(
        document.getElementById("barangTerpakai").value
    );

    const masuk = Number(
        document.getElementById("barangMasuk").value
    );

    const jumlahPeriode = Number(
        document.getElementById("jumlahPeriode").value
    );

    const minimum = Number(
        document.getElementById("batasMinimum").value
    );

    if (
        !nama ||
        stokAwal < 0 ||
        terpakai < 0 ||
        masuk < 0 ||
        jumlahPeriode < 1 ||
        minimum < 0
    ) {
        alert("Periksa kembali data yang dimasukkan.");
        return;
    }

    let stokSekarang = stokAwal;
    const hasil = [];

    for (let periode = 1; periode <= jumlahPeriode; periode++) {

        const stokSebelum = stokSekarang;

        const stokAkhir =
            stokSebelum - terpakai + masuk;

        const stokFinal = Math.max(0, stokAkhir);

        let status = "aman";

        if (stokFinal <= minimum) {
            status = "restock";
        }

        hasil.push({
            periode,
            stokAwal: stokSebelum,
            terpakai,
            masuk,
            stokAkhir: stokFinal,
            status
        });

        stokSekarang = stokFinal;
    }

    currentPrediction = {
        id: Date.now(),
        nama,
        satuan,
        stokAwal,
        terpakai,
        masuk,
        jumlahPeriode,
        minimum,
        hasil,
        tanggal: new Date().toISOString()
    };

    tampilkanHasil(currentPrediction);
}


function tampilkanHasil(prediction) {

    const resultPanel = document.getElementById("resultPanel");

    resultPanel.classList.remove("hidden");

    document.getElementById("resultTitle").textContent =
        `${prediction.nama} (${prediction.satuan})`;

    const stokAkhir =
        prediction.hasil[prediction.hasil.length - 1].stokAkhir;

    const adaRestock =
        prediction.hasil.some(item => item.status === "restock");

    document.getElementById("resultSummary").innerHTML = `
        <div>
            <small>Stok Awal</small>
            <strong>${formatNumber(prediction.stokAwal)} ${prediction.satuan}</strong>
        </div>

        <div>
            <small>Prediksi Akhir</small>
            <strong>${formatNumber(stokAkhir)} ${prediction.satuan}</strong>
        </div>

        <div>
            <small>Status</small>
            <strong>${adaRestock ? "Perlu Restock" : "Aman"}</strong>
        </div>
    `;

    const tbody = document.getElementById("resultTableBody");

    tbody.innerHTML = "";

    prediction.hasil.forEach(item => {

        const statusText =
            item.status === "restock"
                ? "Perlu Restock"
                : "Aman";

        const statusClass =
            item.status === "restock"
                ? "restock"
                : "aman";

        tbody.innerHTML += `
            <tr>
                <td>Periode ${item.periode}</td>
                <td>${formatNumber(item.stokAwal)} ${prediction.satuan}</td>
                <td>${formatNumber(item.terpakai)} ${prediction.satuan}</td>
                <td>${formatNumber(item.masuk)} ${prediction.satuan}</td>
                <td><strong>${formatNumber(item.stokAkhir)} ${prediction.satuan}</strong></td>
                <td>
                    <span class="status ${statusClass}">
                        ${statusText}
                    </span>
                </td>
            </tr>
        `;
    });

    resultPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function simpanHasil() {

    if (!currentPrediction) {
        alert("Belum ada hasil perhitungan.");
        return;
    }

    const existingStockIndex = appData.stocks.findIndex(
        item => item.nama.toLowerCase() === currentPrediction.nama.toLowerCase()
    );

    const stockData = {
        id: currentPrediction.id,
        nama: currentPrediction.nama,
        satuan: currentPrediction.satuan,
        stok: currentPrediction.stokAwal,
        terpakai: currentPrediction.terpakai,
        masuk: currentPrediction.masuk,
        minimum: currentPrediction.minimum,
        updatedAt: new Date().toISOString()
    };

    if (existingStockIndex >= 0) {
        appData.stocks[existingStockIndex] = stockData;
    } else {
        appData.stocks.push(stockData);
    }

    appData.histories.unshift({
        ...currentPrediction,
        savedAt: new Date().toISOString()
    });

    saveData();

    tampilkanDashboard();
    tampilkanDataStok();
    tampilkanRiwayat();

    alert("Hasil perhitungan berhasil disimpan.");
}


function tampilkanDashboard() {

    const totalBarang = appData.stocks.length;

    const perluRestock = appData.stocks.filter(
        item => item.stok <= item.minimum
    ).length;

    document.getElementById("totalBarang").textContent = totalBarang;

    document.getElementById("perluRestock").textContent =
        perluRestock;

    document.getElementById("totalPerhitungan").textContent =
        appData.histories.length;

    if (appData.stocks.length > 0) {

        const terbaru = appData.stocks
            .map(item => new Date(item.updatedAt))
            .sort((a, b) => b - a)[0];

        document.getElementById("terakhirUpdate").textContent =
            formatDate(terbaru);
    } else {
        document.getElementById("terakhirUpdate").textContent = "-";
    }

    const container =
        document.getElementById("dashboardStockList");

    if (appData.stocks.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Belum ada data barang.
            </div>
        `;

        return;
    }

    const items = appData.stocks.slice(0, 5);

    container.innerHTML = items.map(item => {

        const restock = item.stok <= item.minimum;

        return `
            <div class="stock-item">
                <div>
                    <strong>${escapeHTML(item.nama)}</strong>
                    <small>
                        ${formatNumber(item.stok)} ${item.satuan}
                    </small>
                </div>

                <span class="status ${restock ? "restock" : "aman"}">
                    ${restock ? "Restock" : "Aman"}
                </span>
            </div>
        `;

    }).join("");
}


function tampilkanDataStok() {

    const tbody =
        document.getElementById("stockTableBody");

    if (!tbody) {
        return;
    }

    const search =
        document.getElementById("searchStock").value.toLowerCase();

    const filter =
        document.getElementById("filterStatus").value;

    let stocks = [...appData.stocks];

    stocks = stocks.filter(item =>
        item.nama.toLowerCase().includes(search)
    );

    if (filter === "aman") {
        stocks = stocks.filter(item =>
            item.stok > item.minimum
        );
    }

    if (filter === "restock") {
        stocks = stocks.filter(item =>
            item.stok <= item.minimum
        );
    }

    if (stocks.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        Belum ada data barang.
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = stocks.map((item, index) => {

        const restock = item.stok <= item.minimum;

        return `
            <tr>
                <td>${index + 1}</td>

                <td>
                    <strong>${escapeHTML(item.nama)}</strong>
                </td>

                <td>${formatNumber(item.stok)}</td>

                <td>${item.satuan}</td>

                <td>${formatNumber(item.terpakai)}</td>

                <td>${formatNumber(item.masuk)}</td>

                <td>${formatNumber(item.minimum)}</td>

                <td>
                    <span class="status ${restock ? "restock" : "aman"}">
                        ${restock ? "Perlu Restock" : "Aman"}
                    </span>
                </td>

                <td>
                    <button
                        class="action-btn"
                        onclick="hapusBarang(${item.id})"
                    >
                        Hapus
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


function hapusBarang(id) {

    const yakin =
        confirm("Hapus barang ini dari data stok?");

    if (!yakin) {
        return;
    }

    appData.stocks =
        appData.stocks.filter(item => item.id !== id);

    saveData();

    tampilkanDashboard();
    tampilkanDataStok();
}


function tampilkanRiwayat() {

    const container =
        document.getElementById("historyContainer");

    if (appData.histories.length === 0) {

        container.innerHTML = `
            <div class="panel empty-state">
                Belum ada riwayat perhitungan.
            </div>
        `;

        return;
    }

    container.innerHTML = appData.histories.map(item => {

        const stokAkhir =
            item.hasil[item.hasil.length - 1].stokAkhir;

        const restock =
            item.hasil.some(period => period.status === "restock");

        return `
            <div class="history-card">

                <div class="history-top">

                    <div>
                        <h3>
                            ${escapeHTML(item.nama)}
                        </h3>

                        <p>
                            ${item.satuan} •
                            ${formatDate(new Date(item.savedAt))}
                        </p>
                    </div>

                    <span class="status ${restock ? "restock" : "aman"}">
                        ${restock ? "Perlu Restock" : "Aman"}
                    </span>

                </div>

                <div class="history-details">

                    <div>
                        <small>Stok Awal</small>
                        <strong>
                            ${formatNumber(item.stokAwal)}
                        </strong>
                    </div>

                    <div>
                        <small>Terpakai</small>
                        <strong>
                            ${formatNumber(item.terpakai)}
                        </strong>
                    </div>

                    <div>
                        <small>Barang Masuk</small>
                        <strong>
                            ${formatNumber(item.masuk)}
                        </strong>
                    </div>

                    <div>
                        <small>Stok Akhir</small>
                        <strong>
                            ${formatNumber(stokAkhir)}
                        </strong>
                    </div>

                </div>

            </div>
        `;

    }).join("");
}


function exportData() {

    const data = {
        exportedAt: new Date().toISOString(),
        ...appData
    };

    const json =
        JSON.stringify(data, null, 2);

    const blob =
        new Blob([json], {
            type: "application/json"
        });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `backup-stockpredict-${Date.now()}.json`;

    link.click();

    URL.revokeObjectURL(url);
}


function importData(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function(e) {

        try {

            const imported =
                JSON.parse(e.target.result);

            if (
                !imported.setup ||
                !Array.isArray(imported.stocks) ||
                !Array.isArray(imported.histories)
            ) {
                throw new Error("Format tidak sesuai.");
            }

            appData = imported;

            saveData();

            alert("Data berhasil diimpor.");

            tampilkanAplikasi();

        } catch (error) {

            alert(
                "File tidak dapat digunakan. Pastikan file backup berasal dari aplikasi ini."
            );
        }
    };

    reader.readAsText(file);
}


function hapusSemuaData() {

    const yakin =
        confirm(
            "Semua data gudang, stok, dan riwayat akan dihapus. Lanjutkan?"
        );

    if (!yakin) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);

    location.reload();
}


function formatNumber(number) {

    return new Intl.NumberFormat("id-ID").format(number);
}


function formatDate(date) {

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}