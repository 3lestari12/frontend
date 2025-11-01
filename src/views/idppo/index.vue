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
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bolder text-dark-blue mb-0">📑 Manajemen IDP Jatuh Tempo</h2>
            <button
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#idpPoModal"
              @click="openAddModal"
              v-if="['it','akuntansi'].includes(user.dept?.toLowerCase())"
            >
              <i class="bi bi-cloud-plus"></i> Tambah IDP PO
            </button>
          </div>
          <hr />

          <div class="mb-3 row">
  <div class="col-md-3">
    <label class="form-label">Dari Tanggal JT</label>
    <input type="date" v-model="filters.from" class="form-control" />
  </div>
  <div class="col-md-3">
    <label class="form-label">Sampai Tanggal Terakhir JT</label>
    <input type="date" v-model="filters.to" class="form-control" />
  </div>
  <div class="col-md-6 d-flex align-items-end">
    <button class="btn btn-primary me-2" @click="loadItems">Filter</button>
    <button class="btn btn-success me-2" @click="exportExcel">
      <i class="bi bi-file-earmark-excel"></i> Export Excel
    </button>
    <a class="btn btn-secondary" href="/idppo"> Reset</a>
  </div>
</div>


          <div class="card border-0 rounded-4 shadow-sm p-3">
            <div class="card-body p-0">
              <div v-if="loading" class="text-center py-5 fs-5 text-muted">
                <i class="fas fa-spinner fa-spin me-2"></i>Memuat data...
              </div>
              <div v-else-if="items.length === 0" class="text-center py-5 fs-5 text-muted">
                <i class="fas fa-exclamation-circle me-2"></i>Tidak ada data PO.
              </div>
              <div v-else class="table-container">
                <div class="table-responsive">
                  <table
                    id="idpPoTable"
                    class="table table-borderless table-hover mb-0 align-middle w-100"
                  >
                    <thead class="text-uppercase fw-bold text-secondary border-bottom">
                      <tr>
                        <th class="text-center">No</th>
                        <th>IDP</th>
                        <th>Tgl Jatuh Tempo</th>
                        <th>PCS</th>
                        <th>No. Perjanjian Kontrak</th>
                        <th>Tanggal Buat</th>
                        <th class="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in items" :key="item.id">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ item.idp }}</td>
                        <td>{{ formatDate(item.tanggal_po) }}</td>
                        <td>{{ item.pcs }}</td>
                        <td>{{ item.nama_kontrak }}</td>
                        <td>{{ formatDateTime(item.createdAt) }}</td>
                        <td class="text-center">
                            <div class="d-flex justify-content-center">
                            <!-- hanya untuk IT & Akuntansi -->
                                <template v-if="['it', 'akuntansi'].includes(user.dept?.toLowerCase())">
                                    <button
                                        class="btn btn-sm btn-warning me-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#idpPoModal"
                                        @click="openEditModal(item)"
                                    >
                                        <i class="bi bi-pencil-square"></i>
                                    </button>
                                    <button
                                        class="btn btn-sm btn-danger"
                                        @click="deleteItem(item.id)"
                                    >
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </template>

                                <!-- untuk dept lain -->
                                <template v-else>
                                    <span class="text-muted small">No action for your dept</span>
                                </template>
                            </div>
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

  <!-- Modal Create / Edit -->
  <div class="modal fade" id="idpPoModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ editMode ? "Edit PO" : "Tambah PO" }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveItem">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">IDP</label>
                <input v-model="form.idp" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Tanggal Jatuh Tempo</label>
                <input v-model="form.tanggal_po" type="date" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">PCS</label>
                <input v-model="form.pcs" type="text" min="1" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">No. Perjanjian Kontrak</label>
                <input v-model="form.nama_kontrak" type="text" class="form-control" required />
              </div>
            </div>
            <div class="d-flex justify-content-end mt-4">
              <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">
                {{ editMode ? "Update" : "Simpan" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
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

const editMode = ref(false);
const form = ref({
  id: null,
  idp: "",
  tanggal_po: "",
  pcs: 1,
  nama_kontrak: "",
});
let table = null;

const filters = ref({
  from: "",
  to: ""
});

// Format tanggal
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
};

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

// Datatables
const reloadDataTable = () => {
  if ($.fn.DataTable.isDataTable("#idpPoTable")) {
    $("#idpPoTable").DataTable().destroy();
  }
  setTimeout(() => {
    table = $("#idpPoTable").DataTable({
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
};

watch(items, () => reloadDataTable(), { deep: true });

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "/login";
}

async function loadItems() {
  loading.value = true;
  try {
    const params = {};
    if (filters.value.from && filters.value.to) {
      params.from = filters.value.from;
      params.to = filters.value.to;
    }
    const res = await axios.get(`${API_BASE_URL}/idp-po`, { params });
    items.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Tidak bisa memuat data PO.", "error");
  } finally {
    loading.value = false;
  }
}

async function exportExcel() {
  try {
    const params = {};
    if (filters.value.from && filters.value.to) {
      params.from = filters.value.from;
      params.to = filters.value.to;
    }
    const res = await axios.get(`${API_BASE_URL}/idp-po/export`, {
      params,
      responseType: "blob" // wajib untuk file
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report-idp-po.xlsx`;
    link.click();
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Tidak bisa export Excel.", "error");
  }
}

function openAddModal() {
  editMode.value = false;
  form.value = { id: null, idp: "", tanggal_po: "", pcs: 1, nama_kontrak: "" };
}

function openEditModal(item) {
  editMode.value = true;
  form.value = { ...item };
}

async function saveItem() {
  try {
    if (editMode.value) {
      await axios.put(`${API_BASE_URL}/idp-po/${form.value.id}`, form.value);
      Swal.fire("Berhasil", "Data PO berhasil diupdate.", "success");
    } else {
      await axios.post(`${API_BASE_URL}/idp-po`, form.value);
      Swal.fire("Berhasil", "Data PO berhasil ditambahkan.", "success");
    }
    loadItems();
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
  }
}

async function deleteItem(id) {
  Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Data PO akan dihapus permanen.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/idp-po/${id}`);
        Swal.fire("Berhasil", "Data berhasil dihapus.", "success");
        loadItems();
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Tidak bisa menghapus data.", "error");
      }
    }
  });
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
  if ($.fn.DataTable.isDataTable("#idpPoTable")) {
    $("#idpPoTable").DataTable().destroy();
  }
});
</script>
