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
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bolder text-dark-blue mb-0">📅 Manajemen Planning Office</h2>
            <button
              class="btn btn-primary btn-add-item"
              data-bs-toggle="modal"
              data-bs-target="#planningModal"
              @click="openAddModal"
            >
              <i class="fas fa-plus me-2"></i>Tambah Planning
            </button>
          </div>
          <hr />

          <!-- Card -->
          <div class="card border-0 rounded-4 shadow-sm p-3">
            <div class="card-body p-0">
              <div v-if="loading" class="text-center py-5 fs-5 text-muted">
                <i class="fas fa-spinner fa-spin me-2"></i>Memuat data...
              </div>
              <div v-else-if="items.length === 0" class="text-center py-5 fs-5 text-muted">
                <i class="fas fa-exclamation-circle me-2"></i>Tidak ada data planning.
              </div>
              <div v-else class="table-container">
                <div class="table-responsive">
                  <table
                    id="planningTable"
                    class="table table-borderless table-hover mb-0 align-middle w-100"
                  >
                    <thead class="text-uppercase fw-bold text-secondary border-bottom">
                      <tr>
                        <th class="text-center">No</th>
                        <th>Tanggal</th>
                        <th>Planning</th>
                        <th class="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in items" :key="item.id">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ formatDate(item.xDate) }}</td>
                        <td>{{ item.planning }}</td>
                        <td class="text-center">
                          <div class="d-flex justify-content-center">
                            <button
                              class="btn btn-sm btn-warning me-2"
                              data-bs-toggle="modal"
                              data-bs-target="#planningModal"
                              @click="openEditModal(item)"
                            >
                              <i class="bi bi-pencil-square"></i>
                            </button>
                            <button
                              class="btn btn-sm btn-danger"
                              @click="deletePlanning(item.id)"
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
        </div>
      </main>
    </div>

    <Footer />
  </div>

  <!-- Modal Form -->
  <div class="modal fade" id="planningModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ editMode ? "Edit Planning" : "Tambah Planning" }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="savePlanning">
            <div class="mb-3">
              <label class="form-label">Tanggal</label>
              <input
                v-model="form.xDate"
                type="date"
                class="form-control"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Planning</label>
              <textarea
                v-model="form.planning"
                class="form-control"
                rows="3"
                required
              ></textarea>
            </div>
            <div class="d-flex justify-content-end">
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
const form = ref({ id: null, xDate: "", planning: "" });
let table = null;

// === Fungsi Datatables ===
const reloadDataTable = () => {
  if ($.fn.DataTable.isDataTable("#planningTable")) {
    $("#planningTable").DataTable().destroy();
  }
  setTimeout(() => {
    table = $("#planningTable").DataTable({
      pageLength: 10,
      lengthChange: false,
      searching: true,
      autoWidth: false,
      responsive: true,
      language: {
        search: "Cari:",
        zeroRecords: "Data tidak ditemukan",
        info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
        infoEmpty: "Tidak ada data tersedia",
        infoFiltered: "(difilter dari _MAX_ total data)",
        paginate: {
          next: "Berikutnya",
          previous: "Sebelumnya",
        },
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

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function loadPlanning() {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE_URL}/planningoffice`);
    items.value = Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Tidak bisa memuat data planning.", "error");
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  editMode.value = false;
  form.value = { id: null, xDate: "", planning: "" };
}

// function openEditModal(item) {
//   editMode.value = true;
//   form.value = { ...item };
// }
function openEditModal(item) {
  editMode.value = true;

  // Format tanggal agar cocok untuk input type="date"
  let formattedDate = "";
  if (item.xDate) {
    const d = new Date(item.xDate);
    formattedDate = d.toISOString().split("T")[0]; // hasil: 2025-10-17
  }

  form.value = {
    id: item.id,
    xDate: formattedDate,
    planning: item.planning,
  };
}

async function savePlanning() {
  try {
    if (editMode.value) {
      await axios.put(`${API_BASE_URL}/planningoffice/${form.value.id}`, form.value);
      Swal.fire("Berhasil", "Planning berhasil diupdate.", "success");
    } else {
      await axios.post(`${API_BASE_URL}/planningoffice`, form.value);
      Swal.fire("Berhasil", "Planning berhasil ditambahkan.", "success");
    }
    loadPlanning();
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
  }
}

async function deletePlanning(id) {
  Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Data planning akan dihapus permanen.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/planningoffice/${id}`);
        Swal.fire("Berhasil", "Planning berhasil dihapus.", "success");
        loadPlanning();
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
  loadPlanning();

  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
});

onBeforeUnmount(() => {
  if ($.fn.DataTable.isDataTable("#planningTable")) {
    $("#planningTable").DataTable().destroy();
  }
});
</script>
