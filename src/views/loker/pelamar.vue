<template>
  <div class="d-flex flex-column min-vh-100 bg-light-soft">
    <Header :user="user" @toggle-sidebar="toggleSidebar" @logout="logout" />

    <div class="d-flex flex-grow-1">
      <Sidebar :isOpen="sidebarOpen" />

      <main class="flex-grow-1 p-3 p-md-5" :style="mainContentStyle">
        <div class="container-fluid">
          <h2 class="fw-bold mb-3 text-dark">
            <i class="bi bi-people-fill me-2 text-primary"></i> Daftar Pelamar
          </h2>
          <hr />

          <div class="card shadow-sm border-0 mb-4 rounded-3">
            <div class="card-body py-3">
              <h5 class="card-title mb-3 text-primary fw-semibold">
                <i class="bi bi-funnel me-2"></i> Filter Data
              </h5>
              <div class="row g-3">
                <div class="col-md-3 col-sm-6">
                  <label for="startDate" class="form-label text-muted small mb-1"
                    >Tanggal Awal</label
                  >
                  <input
                    type="date"
                    v-model="filters.startDate"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-md-3 col-sm-6">
                  <label for="endDate" class="form-label text-muted small mb-1"
                    >Tanggal Akhir</label
                  >
                  <input
                    type="date"
                    v-model="filters.endDate"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-md-3 col-sm-6">
                  <label for="posisi" class="form-label text-muted small mb-1"
                    >Posisi</label
                  >
                  <select v-model="filters.posisi" class="form-select form-select-sm">
                    <option value="">-- Semua Posisi --</option>
                    <option v-for="l in lokerList" :key="l.id" :value="l.id">
                      {{ l.posisi }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3 col-sm-6 d-flex align-items-end gap-2">
                  <button @click="loadPelamar" class="btn btn-primary btn-sm flex-grow-1">
                    <i class="bi bi-search me-1"></i> Terapkan Filter
                  </button>
                  <button @click="exportExcel" class="btn btn-success btn-sm flex-grow-1">
                    <i class="bi bi-file-earmark-excel me-1"></i> Export Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="card shadow-lg border-0 rounded-4">
            <div class="card-body">
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat data pelamar...</p>
              </div>

              <div
                v-else-if="pelamar.length === 0"
                class="text-center py-5 text-muted"
              >
                <i class="bi bi-inbox-fill fs-2 mb-3"></i>
                <p>Belum ada pelamar.</p>
              </div>

              <div v-else class="table-responsive">
                <table
                  id="pelamarTable"
                  class="table table-striped table-hover align-middle w-100"
                >
                  <thead class="table-primary">
                    <tr>
                      <th class="text-center">No</th>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Telepon</th>
                      <th>Posisi Dilamar</th>
                      <th>Tanggal Lamar</th>
                      <th class="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, index) in pelamar" :key="p.id">
                      <td class="text-center">{{ index + 1 }}</td>
                      <td>{{ p.nama_lengkap }}</td>
                      <td>{{ p.email }}</td>
                      <td>{{ p.no_hp }}</td>
                      <td>{{ p.loker?.posisi || "-" }}</td>
                      <td>{{ formatDateTime(p.createdAt) }}</td>
                      <td class="text-center text-nowrap">
                        <div
                          class="btn-group btn-group-sm"
                          role="group"
                          aria-label="Aksi Pelamar"
                        >
                          <button
                            class="btn btn-outline-info me-1"
                            title="Lihat Detail"
                            @click="detailPelamar(p.id)"
                          >
                            <i class="bi bi-eye"></i>
                          </button>

                          <button
                            class="btn btn-outline-warning me-1"
                            title="Export PDF"
                            @click="exportPdf(p.id)"
                          >
                            <i class="bi bi-file-earmark-pdf"></i>
                          </button>

                          <button
                            class="btn btn-outline-danger"
                            title="Hapus Pelamar"
                            @click="confirmDelete(p.id)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

// Asumsi komponen diimpor dengan benar
import Header from "../../components/Header.vue";
import Sidebar from "../../components/Sidebar.vue";
import Footer from "../../components/Footer.vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// State utama
const pelamar = ref([]);
const loading = ref(false);
const lokerList = ref([]);
const filters = ref({
  startDate: "",
  endDate: "",
  posisi: "",
});

// UI / Sidebar
const user = ref({ name: "Admin" });
const sidebarOpen = ref(true);
const windowWidth = ref(window.innerWidth);
let table = null;

const mainContentStyle = computed(() => ({
  marginLeft: sidebarOpen.value && windowWidth.value >= 768 ? "16rem" : "0",
  transition: "margin-left 0.3s ease",
  marginTop: "56px",
}));

// Helper
const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
};

// Helper untuk baris detail yang lebih rapi
const detailRow = (label, value) => `<p class="mb-2"><b>${label}:</b> ${value || "-"}</p>`;

// --- DataTable ---
const initDataTable = () => {
  if (table) {
    table.destroy();
    table = null;
  }
  setTimeout(() => {
    if ($("#pelamarTable").length) {
      table = $("#pelamarTable").DataTable({
        pageLength: 10,
        lengthChange: false,
        searching: true,
        responsive: true,
        order: [[5, "desc"]],
        language: {
          search: "Cari:",
          zeroRecords: "Data tidak ditemukan",
          info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
          infoEmpty: "Tidak ada data",
          paginate: { next: "Berikutnya", previous: "Sebelumnya" },
        },
      });
    }
  }, 0);
};

// --- CRUD & Data Load ---
async function loadPelamar() {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE_URL}/rekruitment-tlsi`, {
      params: {
        from: filters.value.startDate || null,
        to: filters.value.endDate || null,
        posisi: filters.value.posisi || null,
      },
    });
    pelamar.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Error loading pelamar:", err);
    Swal.fire("Gagal", "Tidak bisa memuat data pelamar", "error");
    pelamar.value = [];
  } finally {
    loading.value = false;
  }
}

// --- FUNGSI DETAIL DUA KOLOM ---
async function detailPelamar(id) {
  try {
    const res = await axios.get(`${API_BASE_URL}/rekruitment-tlsi/${id}`);
    const p = res.data;

    const dokumenUrl = p.dokumen_tambahan
      ? `${API_BASE_URL}/${p.dokumen_tambahan}`
      : null;

    // Kolom Kiri: Data Pribadi
    const dataPribadi = `
      <h5 class="text-primary fw-bold mb-3">Data Pribadi</h5>
      ${detailRow("Nama Lengkap", p.nama_lengkap)}
      ${detailRow("Email", p.email)}
      ${detailRow("No HP", p.no_hp)}
      ${detailRow("NIK", p.nik)}
      ${detailRow("Jenis Kelamin", p.jenis_kelamin)}
      ${detailRow("Tempat, Tanggal Lahir", `${p.tempat_lahir || "-"}, ${p.tanggal_lahir || "-"}`)}
      ${detailRow("Alamat", p.alamat)}
    `;

    // Kolom Kanan: Data Posisi & Pendidikan
    const dataPendidikan = `
      <h5 class="text-success fw-bold mb-3">Data Posisi & Pendidikan</h5>
      ${detailRow("Posisi Dilamar", p.loker?.posisi)}
      ${detailRow("Jenjang Pendidikan", p.jenjang_pendidikan)}
      ${detailRow("Nama Sekolah", p.nama_sekolah)}
      ${detailRow("Jurusan", p.jurusan)}
      ${detailRow("Nilai", p.nilai_sekolah)}
    `;

    // Bagian Bawah: Dokumen & Tanggal
    const dataTambahan = `
      <hr class="mt-4 mb-3">
      ${detailRow("Tanggal Lamar", formatDateTime(p.createdAt))}
      <p class="mb-2"><b>Dokumen Tambahan:</b> 
        ${
          dokumenUrl
            ? `<a href="${dokumenUrl}" target="_blank" class="btn btn-sm btn-primary ms-2" style="font-size: 0.8rem;">
                <i class="bi bi-file-earmark-text"></i> Lihat Dokumen
              </a>`
            : "Tidak ada"
        }
      </p>
    `;

    Swal.fire({
      title: `<strong class="text-primary">Detail Pelamar 📋</strong>`,
      // Lebar lebih besar untuk layout 2 kolom
      width: 900, 
      html: `
        <div class="container-fluid text-start">
          <div class="row">
            <div class="col-md-6 border-end pe-4">${dataPribadi}</div>
            <div class="col-md-6 ps-4">${dataPendidikan}</div>
          </div>
          <div class="row">
            <div class="col-12">${dataTambahan}</div>
          </div>
        </div>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: "Tutup",
    });
  } catch (err) {
    console.error("Error detail pelamar:", err);
    Swal.fire("Error", "Gagal mengambil detail pelamar", "error");
  }
}
// --- Akhir FUNGSI DETAIL DUA KOLOM ---


async function confirmDelete(id) {
  const result = await Swal.fire({
    title: "Yakin hapus? ⚠️",
    text: "Data pelamar ini akan dihapus permanen.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    cancelButtonText: "Batal",
    confirmButtonText: "Ya, Hapus!",
  });

  if (result.isConfirmed) {
    deletePelamar(id);
  }
}

async function deletePelamar(id) {
  try {
    await axios.delete(`${API_BASE_URL}/rekruitment-tlsi/${id}`);
    Swal.fire("Berhasil", "Data pelamar dihapus. ✅", "success");
    await loadPelamar();
  } catch (err) {
    console.error("Error deleting pelamar:", err);
    Swal.fire("Gagal", "Terjadi kesalahan saat menghapus pelamar.", "error");
  }
}

// --- Export PDF & Excel ---
const exportPdf = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/rekruitment-tlsi/export-pdf/${id}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pelamar-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    Swal.fire("Berhasil", "Data pelamar berhasil diexport ke PDF.", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Gagal export PDF", "error");
  }
};

const exportExcel = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/rekruitment-tlsi/export-excel`, {
      params: filters.value,
      responseType: "blob",
    });
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Data-Pelamar.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    Swal.fire("Berhasil", "Data pelamar berhasil diexport ke Excel.", "success");
  } catch (err) {
    console.error("Gagal export:", err);
    Swal.fire("Error", "Gagal export Excel", "error");
  }
};

// --- Sidebar handler ---
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
const logout = () => {
  Swal.fire("Logout", "Anda berhasil logout", "success");
};

// --- Lifecycle ---
onMounted(async () => {
  await loadPelamar();
  try {
    const res = await axios.get(`${API_BASE_URL}/loker`);
    lokerList.value = res.data;
  } catch (error) {
    console.error("Gagal memuat daftar loker:", error);
    lokerList.value = [];
  }
  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
});

onBeforeUnmount(() => {
  if (table) {
    table.destroy();
    table = null;
  }
});
watch(pelamar, (newVal, oldVal) => {
  if (newVal.length > 0 && !loading.value) {
    initDataTable();
  } else if (newVal.length === 0 && oldVal?.length > 0) {
    if (table) {
      table.destroy();
      table = null;
    }
  }
});
</script>

<style scoped>
/* Styling tambahan untuk tampilan yang lebih baik */
.bg-light-soft {
  background-color: #f8f9fa !important;
}
.card.rounded-4 {
  border-radius: 1.5rem !important;
}
.card.rounded-3 {
  border-radius: 0.75rem !important;
}

/* Tambahkan sedikit styling untuk border pemisah kolom */
.border-end {
  border-right: 1px solid #dee2e6 !important;
}

/* Kustomisasi untuk tombol aksi pada tabel agar sejajar dan rapi */
.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}
</style>