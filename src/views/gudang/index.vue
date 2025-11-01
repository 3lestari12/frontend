```vue
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
            <h2 class="fw-bolder text-dark-blue mb-0">📦 Manajemen Gudang</h2>
            <button
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#gudangModal"
              @click="openAddModal"
              v-if="['it','administrasi'].includes(user.dept?.toLowerCase())"
            >
              <i class="bi bi-plus-circle"></i> Tambah Barang
            </button>
          </div>
          <hr />

          <div class="card border-0 rounded-4 shadow-sm p-3">
            <div class="card-body p-0">
              <div v-if="loading" class="text-center py-5 fs-5 text-muted">
                <i class="fas fa-spinner fa-spin me-2"></i>Memuat data...
              </div>
              <div v-else-if="items.length === 0" class="text-center py-5 fs-5 text-muted">
                <i class="fas fa-exclamation-circle me-2"></i>Tidak ada data barang.
              </div>
              <div v-else class="table-container">
                <div class="table-responsive">
                  <table
                    id="gudangTable"
                    class="table table-borderless table-hover mb-0 align-middle w-100"
                  >
                    <thead class="text-uppercase fw-bold text-secondary border-bottom">
                      <tr>
                        <th class="text-center">No</th>
                        <th>Nama Barang</th>
                        <th>Stok</th>
                        <th>Satuan</th>
                        <th>Gambar</th>
                        <th class="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in items" :key="item.id">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ item.nama_barang }}</td>
                        <td>{{ item.qty }}</td>
                        <td>{{ item.satuan }}</td>
                        <td>
                          <img
                            v-if="item.gambar"
                            :src="API_BASE_URL + item.gambar"
                            alt="foto barang"
                            class="img-thumbnail"
                            style="max-height: 80px"
                          />
                          <span v-else class="text-muted small">Tidak ada gambar</span>
                        </td>
                        <td class="text-center">
                          <div class="d-flex justify-content-center">
                            <template v-if="['it','administrasi'].includes(user.dept?.toLowerCase())">
                              <button
                                class="btn btn-sm btn-warning me-2"
                                data-bs-toggle="modal"
                                data-bs-target="#gudangModal"
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
                            <template v-else>
                              <span class="text-muted small">No action</span>
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
  <div class="modal fade" id="gudangModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header">
          <h5 class="modal-title">{{ editMode ? "Edit Barang" : "Tambah Barang" }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveItem">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Nama Barang</label>
                <input v-model="form.nama_barang" type="text" class="form-control" required />
              </div>
              <div class="col-md-3">
                <label class="form-label">Stok</label>
                <input v-model="form.qty" type="number" min="0" class="form-control" required />
              </div>
              <div class="col-md-3">
                <label class="form-label">Satuan</label>
                <input v-model="form.satuan" type="text" class="form-control" required />
              </div>
              <div class="col-md-12">
                <label class="form-label">Upload Gambar</label>
                <input type="file" class="form-control" @change="handleFileUpload" />
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

const editMode = ref(false);
const form = ref({
  id: null,
  nama_barang: "",
  qty: 0,
  satuan: "",
  gambar: null,
});
let table = null;

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
  try {
    const res = await axios.get(`${API_BASE_URL}/gudang/gudang/web`);
    items.value = Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Tidak bisa memuat data gudang.", "error");
  } finally {
    loading.value = false;
    reloadDataTable();
  }
}

// Save data (add/edit)
async function saveItem() {
  try {
    const formData = new FormData();
    formData.append("nama_barang", form.value.nama_barang);
    formData.append("qty", form.value.qty);
    formData.append("satuan", form.value.satuan);
    if (form.value.gambar) {
      formData.append("gambar", form.value.gambar);
    }

    if (editMode.value) {
      await axios.put(`${API_BASE_URL}/gudang/gudang/web/${form.value.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Berhasil", "Barang berhasil diupdate.", "success");
    } else {
      await axios.post(`${API_BASE_URL}/gudang/gudang/web`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Berhasil", "Barang berhasil ditambahkan.", "success");
    }
    loadItems();
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
  }
}

// Delete data
async function deleteItem(id) {
  Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Barang akan dihapus permanen.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/gudang/gudang/web/${id}`);
        Swal.fire("Berhasil", "Barang berhasil dihapus.", "success");
        loadItems();
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Tidak bisa menghapus barang.", "error");
      }
    }
  });
}

// Open modal
function openAddModal() {
  editMode.value = false;
  form.value = { id: null, nama_barang: "", qty: 0, satuan: "", gambar: null };
}
function openEditModal(item) {
  editMode.value = true;
  form.value = { ...item, gambar: null };
}

// File handler
function handleFileUpload(event) {
  form.value.gambar = event.target.files[0];
}

// Datatables
function reloadDataTable() {
  if ($.fn.DataTable.isDataTable("#gudangTable")) {
    $("#gudangTable").DataTable().destroy();
  }
  setTimeout(() => {
    table = $("#gudangTable").DataTable({
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
  if ($.fn.DataTable.isDataTable("#gudangTable")) {
    $("#gudangTable").DataTable().destroy();
  }
});
</script>
```
