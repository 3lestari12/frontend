<template>
  <div class="d-flex flex-column min-vh-100 bg-light-soft">
    <Header :user="user" @toggle-sidebar="toggleSidebar" @logout="logout" />

    <div class="d-flex flex-grow-1">
      <Sidebar :isOpen="sidebarOpen" />

      <main
        class="flex-grow-1 p-3 p-md-5"
        :style="{
          marginLeft: sidebarOpen && windowWidth >= 768 ? '16rem' : '0',
          transition: 'margin-left 0.3s ease',
          marginTop: '56px',
        }"
      >
        <div class="container-fluid">
          <h2 class="fw-bolder text-primary mb-4">📝 Pesanan Gudang</h2>

          <div class="card border-0 rounded-4 shadow-sm mb-4 p-3 bg-white">
            <div class="card-body p-0">
              <div class="row g-2 align-items-center">
                <div class="col-12 col-md-3">
                  <input
                    type="text"
                    v-model="filters.nama_barang"
                    placeholder="Nama Barang"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <input
                    type="text"
                    v-model="filters.peminta"
                    placeholder="Nama Peminta"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <select v-model="filters.status" class="form-select form-select-sm">
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>
                <div class="col-6 col-md-2 d-flex gap-1">
                  <input type="date" v-model="filters.startDate" class="form-control form-control-sm" title="Dari Tanggal" />
                  <input type="date" v-model="filters.endDate" class="form-control form-control-sm" title="Sampai Tanggal" />
                </div> <div></div>
                <div class="col-6 col-md-3 d-flex gap-2 justify-content-end">
                  <button class="btn btn-primary btn-sm flex-grow-1" @click="loadItems">
                    <i class="bi bi-funnel"></i> Terapkan Filter
                  </button>
                  <button class="btn btn-success btn-sm" @click="exportExcel" title="Export ke Excel">
                    <i class="bi bi-file-earmark-excel"></i> Export Excel
                  </button>
                  <a href="/p-gudang" class="btn btn-secondary">Reset</a>
                </div>
              </div>
            </div>
          </div>
          <hr class="mb-4 mt-0"/>

          <div class="card border-0 rounded-4 shadow-sm">
            <div class="card-body p-0">
              <div v-if="loading" class="text-center py-5 fs-5 text-muted">
                <i class="fas fa-spinner fa-spin me-2 text-primary"></i>Memuat data...
              </div>
              <div v-else-if="items.length === 0" class="text-center py-5 fs-5 text-muted">
                <i class="fas fa-exclamation-circle me-2"></i>Tidak ada pesanan.
              </div>
              <div v-else class="table-container">
                <div class="table-responsive">
                  <table
                    id="pesananTable"
                    class="table table-striped table-hover mb-0 align-middle w-100"
                  >
                    <thead class="text-uppercase fw-bold text-secondary border-bottom">
                      <tr>
                        <th class="text-center" style="width: 5%">No</th>
                        <th style="width: 20%">Nama Barang</th>
                        <th style="width: 10%">Qty/Satuan</th>
                        <th style="width: 15%">Peminta</th>
                        <th style="width: 15%">Departemen</th>
                        <th style="width: 15%">Dibuat Oleh</th>
                        <th style="width: 10%">Status</th>
                        <th class="text-center" style="width: 10%">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in items" :key="item.id">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td class="fw-bold text-dark">{{ item.Gudang ? item.Gudang.nama_barang : '-' }}</td>
                        <td>{{ item.qty }} <span class="text-muted small">{{ item.satuan }}</span></td>
                        <td>{{ item.peminta }}</td>
                        <td>{{ item.dept_peminta }}</td>
                        <td>{{ item.dibuat_oleh }}</td>
                        <td>
                          <span
                            :class="getStatusBadgeClass(item.status)"
                            class="badge fw-semibold text-uppercase"
                          >
                            {{ item.status }}
                          </span>
                        </td>
                        <td class="text-center">
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="deleteItem(item.id)"
                            title="Hapus Pesanan"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

import Header from "../../components/Header.vue";
import Sidebar from "../../components/Sidebar.vue";
import Footer from "../../components/Footer.vue";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const items = ref([]);
const user = ref({});
const sidebarOpen = ref(false);
const windowWidth = ref(window.innerWidth);
const loading = ref(false);
const filters = ref({
  nama_barang: "",
  peminta: "",
  status: "",
  startDate: "",
  endDate: "",
});
let table = null;

// --- Helper untuk Warna Status (Ditingkatkan) ---
function getStatusBadgeClass(status) {
    const statusMap = {
        pending: "bg-warning text-dark",
        diproses: "bg-info text-dark",
        selesai: "bg-success",
        dibatalkan: "bg-danger",
        return: "bg-primary",
        default: "bg-secondary",
    };
    return statusMap[status] || statusMap.default;
}

// Sidebar toggle
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
function logout() {
  localStorage.removeItem("user");
  window.location.href = "/login";
}

// Load data
async function loadItems() {
  loading.value = true;
  // Perlu diperhatikan: Parameter nama_barang dan peminta mungkin saling tumpang tindih
  // Jika API Anda mendukung, gunakan parameter ini sesuai dengan query yang diharapkan API
  try {
    const res = await axios.get(`${API_BASE_URL}/pesanan-gudang/web`, {
      params: filters.value,
    });
    items.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Tidak bisa memuat data pesanan.", "error");
  } finally {
    loading.value = false;
    reloadDataTable();
  }
}

// Delete data (Tidak berubah)
async function deleteItem(id) {
  Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Pesanan akan dihapus permanen.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/pesanan-gudang/web/${id}`);
        Swal.fire("Berhasil", "Pesanan berhasil dihapus.", "success");
        loadItems();
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Tidak bisa menghapus pesanan.", "error");
      }
    }
  });
}

// Export Excel (Tidak berubah)
async function exportExcel() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/pesanan-gudang/export/excel`,
      {
        params: filters.value,
        responseType: "blob",
      }
    );
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "pesanan_gudang.xlsx";
    link.click();
    Swal.fire("Berhasil", "Data sedang diunduh.", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Tidak bisa export Excel. Pastikan ada data yang difilter.", "error");
  }
}

// Datatables (Tidak berubah, hanya perlu pastikan kolom tabel di template sudah sesuai)
function reloadDataTable() {
  if ($.fn.DataTable.isDataTable("#pesananTable")) {
    $("#pesananTable").DataTable().destroy();
  }
  setTimeout(() => {
    table = $("#pesananTable").DataTable({
      pageLength: 10,
      lengthChange: false,
      searching: true,
      autoWidth: false,
      responsive: true,
      order: [],
      language: {
        search: "Cari:",
        zeroRecords: "Data tidak ditemukan",
        info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
        infoEmpty: "Tidak ada data tersedia",
        infoFiltered: "(difilter dari _MAX_ total data)",
        paginate: { next: "Berikutnya", previous: "Sebelumnya" },
      },
    });
  }, 0);
}

onMounted(() => {
  const userData = localStorage.getItem("user");
  if (userData) user.value = JSON.parse(userData);
  loadItems();
  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
});

onBeforeUnmount(() => {
  if ($.fn.DataTable.isDataTable("#pesananTable")) {
    $("#pesananTable").DataTable().destroy();
  }
});
</script>

<style scoped>
/* CSS Tambahan untuk tampilan yang lebih modern */
.bg-light-soft {
  background-color: #f8f9fa; /* Light grey background */
}

/* Judul dan Konten Utama */
.text-primary {
    color: #0d6efd !important;
}

/* Card dengan shadow */
.card {
    border: none;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05) !important;
}

/* Filter Bar Styling */
.form-control-sm, .form-select-sm, .btn-sm {
    font-size: 0.875rem; /* Ukuran yang lebih ringkas untuk filter */
    padding: 0.3rem 0.6rem;
}

/* Kustomisasi Tabel */
.table thead th {
    border-bottom: 2px solid #e9ecef;
    background-color: #f8f9fa;
    font-size: 0.8rem;
    color: #6c757d;
}

.table-striped > tbody > tr:nth-of-type(odd) > * {
   background-color: #f4f6f8; /* Warna stripe yang lebih lembut */
}

.table tbody td {
    font-size: 0.9rem;
    padding: 0.75rem 0.5rem;
}

/* Badge Status */
.badge {
    padding: 0.4em 0.7em;
    border-radius: 0.25rem;
    font-size: 0.75rem;
}
</style>
