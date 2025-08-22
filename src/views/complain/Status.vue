<template>
  <div class="d-flex flex-column min-vh-100 bg-light">
    <Header :user="user" @toggle-sidebar="toggleSidebar" @logout="logout" />

    <div class="d-flex flex-grow-1">
      <Sidebar :isOpen="sidebarOpen" />

      <main
        class="flex-grow-1 p-4 main-content"
        :style="{
          marginLeft: sidebarOpen && windowWidth >= 768 ? '16rem' : '0',
        }"
      >
        <div class="container-fluid py-4" style="max-width: 1200px">
          <h2 class="mb-4 text-primary fw-bold">Daftar Komplain Pending</h2>

          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-body p-4">
              <div class="table-responsive">
                <table
                  id="complainsTable"
                  class="table table-hover table-borderless"
                  style="width: 100%"
                >
                  <thead class="bg-primary text-white">
                    <tr>
                      <th>ID</th>
                      <th>Departemen</th>
                      <th>IDP</th>
                      <th>Detail</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                      <th class="text-center">File</th>
                      <th class="text-center" style="min-width: 130px">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in complains" :key="c.id">
                      <td>{{ c.id }}</td>
                      <td>{{ c.department?.name_dept }}</td>
                      <td>{{ c.idp }}</td>
                      <td class="text-truncate" style="max-width: 200px">
                        {{ c.detail }}
                      </td>
                      <td>
                        <span :class="getStatusBadgeClass(c.status)">
                          {{ c.status }}
                        </span>
                      </td>
                      <td>
                        {{ formatDate(c.createdAt) }}
                      </td>
                      <td class="text-center">
                        <button
                          class="btn btn-sm"
                          :class="c.file_barcode ? 'btn-success' : 'btn-danger'"
                          :disabled="!c.file_barcode"
                          @click="openFile(c.file_barcode)"
                          :title="
                            c.file_barcode ? 'Lihat File Barcode' : 'File tidak ada'
                          "
                        >
                          <i class="bi bi-file-earmark-text"></i>
                        </button>
                      </td>
                      <td class="text-center">
                        <div class="d-flex justify-content-center">
                          <button
                            class="btn btn-sm btn-primary me-2"
                            @click="editComplain(c)"
                            title="Update"
                          >
                            <i class="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-danger"
                            @click="deleteComplain(c.id)"
                            title="Delete"
                          >
                            <i class="bi bi-trash-fill"></i>
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

        <div
          class="modal fade"
          id="editComplainModal"
          tabindex="-1"
          aria-labelledby="editComplainModalLabel"
          aria-hidden="true"
          ref="editModalRef"
        >
          <div class="modal-dialog modal-dialog-centered">
            <form @submit.prevent="submitEdit">
              <div class="modal-content rounded-4">
                <div class="modal-header bg-primary text-white border-0">
                  <h5 class="modal-title" id="editComplainModalLabel">
                    Edit Complain
                  </h5>
                  <button
                    type="button"
                    class="btn-close btn-close-white"
                    @click="closeEditModal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="mb-3">
                    <label for="department" class="form-label"
                      >Departemen</label
                    >
                    <select
                      v-model="editForm.department_id"
                      id="department"
                      class="form-select"
                      required
                    >
                      <option
                        v-for="dept in departments"
                        :key="dept.id"
                        :value="dept.id"
                      >
                        {{ dept.name_dept }}
                      </option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="idp" class="form-label">IDP</label>
                    <input
                      type="text"
                      id="idp"
                      class="form-control"
                      v-model="editForm.idp"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="detail" class="form-label">Detail</label>
                    <textarea
                      id="detail"
                      class="form-control"
                      rows="3"
                      v-model="editForm.detail"
                      required
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label for="status" class="form-label">Status</label>
                    <select
                      v-model="editForm.status"
                      id="status"
                      class="form-select"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="closeEditModal"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="isUpdating"
                  >
                    <span
                      v-if="isUpdating"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import { io } from 'socket.io-client';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import Footer from '../../components/Footer.vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API2_BASE_URL = import.meta.env.VITE_API2_BASE_URL;

const complains = ref([]);
const departments = ref([]);
let table = null;
const socket = io(`${API2_BASE_URL}`);

const user = ref({});
const sidebarOpen = ref(false);
const windowWidth = ref(window.innerWidth);

const editModalRef = ref(null);
const editForm = ref({
  id: null,
  department_id: '',
  idp: '',
  detail: '',
  status: 'pending',
});
const isUpdating = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/login';
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'badge bg-warning text-dark';
    case 'completed':
      return 'badge bg-success';
    case 'rejected':
      return 'badge bg-danger';
    default:
      return 'badge bg-secondary';
  }
}

async function loadData() {
  const [complainsRes, deptRes] = await Promise.all([
    axios.get(API_BASE_URL + '/complains/status/pending'),
    axios.get(API_BASE_URL + '/departments'),
  ]);
  complains.value = complainsRes.data;
  departments.value = deptRes.data;

  await nextTick();
  if (table) table.destroy();
  table = $('#complainsTable').DataTable({
    pageLength: 10,
    order: [[0, 'desc']],
    lengthChange: false,
    searching: true,
    language: {
      search: 'Cari:',
      zeroRecords: 'Data tidak ditemukan',
      info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ data',
      infoEmpty: 'Tidak ada data tersedia',
      infoFiltered: '(difilter dari _MAX_ total data)',
      paginate: {
        next: 'Berikutnya',
        previous: 'Sebelumnya',
      },
    },
    columnDefs: [
      { orderable: false, targets: [6, 7] }, // Kolom File dan Aksi tidak bisa di-sort
    ],
  });
}

async function editComplain(c) {
  try {
    const res = await axios.get(`${API_BASE_URL}/complains/${c.id}`);
    const data = res.data;
    editForm.value.id = data.id;
    editForm.value.department_id = data.department_id;
    editForm.value.idp = data.idp;
    editForm.value.detail = data.detail;
    editForm.value.status = data.status;

    const modalEl = editModalRef.value;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (err) {
    Swal.fire(
      'Error',
      'Gagal mengambil data complain: ' +
        (err.response?.data?.message || err.message),
      'error'
    );
  }
}

function closeEditModal() {
  const modal = bootstrap.Modal.getInstance(editModalRef.value);
  if (modal) modal.hide();
}

async function submitEdit() {
  isUpdating.value = true;
  try {
    const id = editForm.value.id;
    const payload = {
      department_id: editForm.value.department_id,
      idp: editForm.value.idp,
      detail: editForm.value.detail,
      status: editForm.value.status,
    };
    await axios.put(API_BASE_URL + '/complains/' + id, payload);

    Swal.fire('Berhasil', 'Complain berhasil diperbarui', 'success');
    closeEditModal();

    if (editForm.value.status !== 'pending') {
      const idx = complains.value.findIndex((c) => c.id === id);
      if (idx !== -1) {
        complains.value.splice(idx, 1);
      }
      if (table) {
        const rowIdx = table
          .rows()
          .indexes()
          .filter((i) => table.row(i).data()[0] === id);
        if (rowIdx.length) {
          table.row(rowIdx[0]).remove().draw(false);
        }
      }
    } else {
      await loadData();
    }
  } catch (err) {
    Swal.fire(
      'Error',
      err.response?.data?.message || 'Gagal update complain',
      'error'
    );
  } finally {
    isUpdating.value = false;
  }
}

async function deleteComplain(id) {
  const result = await Swal.fire({
    title: 'Konfirmasi',
    text: 'Apakah Anda yakin ingin menghapus complain ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_BASE_URL}/complains/${id}`);
      const idx = complains.value.findIndex((c) => c.id === id);
      if (idx !== -1) complains.value.splice(idx, 1);
      if (table) {
        const rowIdx = table
          .rows()
          .indexes()
          .filter((i) => table.row(i).data()[0] === id);
        if (rowIdx.length) {
          table.row(rowIdx[0]).remove().draw(false);
        }
      }
      await Swal.fire('Terhapus', 'Complain berhasil dihapus', 'success');
    } catch (err) {
      Swal.fire(
        'Error',
        err.response?.data?.message || 'Gagal menghapus complain',
        'error'
      );
    }
  }
}

onMounted(() => {
  loadData();
  const userData = localStorage.getItem('user');
  if (userData) user.value = JSON.parse(userData);

  // Perbaikan pada event listener socket.io
  socket.on('complain:new', (newComplain) => {
    // Memperbarui array data
    complains.value.unshift(newComplain);

    // Memperbarui DataTable
    if (table) {
      table.row
        .add([
          newComplain.id,
          newComplain.department?.name_dept || '-',
          newComplain.idp,
          newComplain.detail,
          `<span class="${getStatusBadgeClass(newComplain.status)}">${
            newComplain.status
          }</span>`,
          formatDate(newComplain.createdAt),
          newComplain.file_barcode
            ? `<button class="btn btn-sm btn-success" title="Lihat File" onclick="openFileInNewTab('${newComplain.file_barcode}')"><i class="bi bi-file-earmark-text"></i></button>`
            : `<button class="btn btn-sm btn-danger" disabled><i class="bi bi-file-earmark-text"></i></button>`,
          `<div class="d-flex justify-content-center"><button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${newComplain.id}" title="Update"><i class="bi bi-pencil-fill"></i></button>
             <button class="btn btn-sm btn-danger delete-btn" data-id="${newComplain.id}" title="Delete"><i class="bi bi-trash-fill"></i></button></div>`,
        ])
        .order([0, 'desc'])
        .draw(false);
    }
  });

  socket.on('complain:updated', (updatedComplain) => {
    // Cek jika complain yang diperbarui tidak lagi pending
    if (updatedComplain.status !== 'pending') {
      const idx = complains.value.findIndex((c) => c.id === updatedComplain.id);
      if (idx !== -1) {
        complains.value.splice(idx, 1);
      }
      if (table) {
        const row = table.rows((idx, data) => data[0] === updatedComplain.id);
        if (row.length) {
          row.remove().draw(false);
        }
      }
    } else {
      // Jika masih pending, update baris di tabel
      const idx = complains.value.findIndex((c) => c.id === updatedComplain.id);
      if (idx !== -1) {
        complains.value[idx] = updatedComplain;
        if (table) {
          const row = table.rows((idx, data) => data[0] === updatedComplain.id);
          if (row.length) {
            row.data([
              updatedComplain.id,
              updatedComplain.department?.name_dept || '-',
              updatedComplain.idp,
              updatedComplain.detail,
              `<span class="${getStatusBadgeClass(updatedComplain.status)}">${
                updatedComplain.status
              }</span>`,
              formatDate(updatedComplain.createdAt),
              updatedComplain.file_barcode
                ? `<button class="btn btn-sm btn-success" title="Lihat File" onclick="openFileInNewTab('${updatedComplain.file_barcode}')"><i class="bi bi-file-earmark-text"></i></button>`
                : `<button class="btn btn-sm btn-danger" disabled><i class="bi bi-file-earmark-text"></i></button>`,
              `<div class="d-flex justify-content-center"><button class="btn btn-sm btn-primary me-2 edit-btn" data-id="${updatedComplain.id}" title="Update"><i class="bi bi-pencil-fill"></i></button>
                 <button class="btn btn-sm btn-danger delete-btn" data-id="${updatedComplain.id}" title="Delete"><i class="bi bi-trash-fill"></i></button></div>`,
            ]).draw(false);
          }
        }
      }
    }
  });

  socket.on('complain:deleted', (id) => {
    complains.value = complains.value.filter(
      (c) => c.id !== parseInt(id)
    );
    if (table) {
      table
        .row((idx, data) => parseInt(data[0]) === parseInt(id))
        .remove()
        .draw(false);
    }
  });

  // Delegasi event untuk tombol di DataTable
  $('#complainsTable tbody').on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    const complainToEdit = complains.value.find((c) => c.id === id);
    if (complainToEdit) editComplain(complainToEdit);
  });

  $('#complainsTable tbody').on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    deleteComplain(id);
  });
});

// Fungsi format tanggal Indonesia
function formatDate(tgl) {
  if (!tgl) return '-';
  const d = new Date(tgl);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${d.toLocaleString('id-ID', { month: 'short' })} ${d.getUTCFullYear()}`;
}

// Fungsi buka file barcode (URL dari backend)
function openFile(filename) {
  if (!filename) return;
  const baseUrl = API_BASE_URL || 'http://localhost:8000';
  const url = `${baseUrl}/uploads/${filename}`;
  window.open(url, '_blank');
}
</script>

<style scoped>
/* Main Content Styling */
.main-content {
  margin-top: 56px; /* Sesuai tinggi Header */
  transition: margin-left 0.3s ease;
}

/* Tabel Styling */
.table-responsive {
  border-radius: 0.75rem;
  overflow: hidden;
}

.card {
  border-radius: 1rem;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa; /* Warna hover yang lebih lembut */
}

/* Header Table */
.table thead th {
  border-bottom: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.9rem;
}

/* Body Table */
.table tbody td {
  vertical-align: middle;
  padding: 1rem;
  font-size: 0.9rem;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Badge Status */
.badge {
  padding: 0.5em 0.8em;
  font-size: 0.75em;
  font-weight: 600;
  border-radius: 0.25rem;
  text-transform: capitalize;
}

/* Buttons */
.btn-primary,
.btn-danger,
.btn-success {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}
.btn-sm {
  padding: 0.35rem 0.6rem;
  border-radius: 0.5rem;
}
.btn i {
  font-size: 0.9rem;
}

/* DataTable Customization */
:deep(.dataTables_wrapper .dataTables_filter input) {
  border-radius: 0.5rem;
  border: 1px solid #ced4da;
  padding: 0.5rem 1rem;
}

:deep(.dataTables_wrapper .dataTables_paginate .paginate_button) {
  border-radius: 0.5rem !important;
  border: none !important;
  margin: 0 0.25rem;
}

:deep(.dataTables_wrapper .dataTables_paginate .paginate_button.current) {
  background-color: var(--bs-primary) !important;
  color: white !important;
}

:deep(.dataTables_wrapper .dataTables_paginate .paginate_button:not(.current):hover) {
  background-color: #e9ecef !important;
}

/* Modal Styling */
.modal-content {
  /* border-radius: 2rem; */
  width: 400px;
}

</style>