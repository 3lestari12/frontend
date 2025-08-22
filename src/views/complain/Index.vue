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
            <h1 class="fw-bolder text-dark-blue mb-0">Daftar Komplain</h1>
            </div>

          <div class="card border-0 rounded-4 shadow-sm p-3">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table
                  id="complainsTable"
                  class="table table-borderless table-hover mb-0 align-middle w-100"
                >
                  <thead class="text-uppercase fw-bold text-secondary border-bottom">
                    <tr>
                      <th class="text-center">No</th>
                      <th>Departemen</th>
                      <th>Tanggal</th>
                      <th>IDP</th>
                      <th>Detail</th>
                      <th class="text-center">Status</th>
                      <th class="text-nowrap text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(c, index) in complains" :key="c.id" class="border-bottom">
                      <td class="text-center">{{ index + 1 }}</td>
                      <td>{{ c.department?.name_dept }}</td>
                      <td>
                        {{ formatDate(c.createdAt) }}
                      </td>
                      <td>{{ c.idp }}</td>
                      <td class="text-truncate" style="max-width: 200px">{{ c.detail }}</td>
                      <td class="text-center">
                        <span
                          :class="{
                            'badge rounded-pill text-bg-warning-soft': c.status === 'pending',
                            'badge rounded-pill text-bg-success-soft': c.status === 'completed',
                            'badge rounded-pill text-bg-danger-soft': c.status === 'rejected',
                          }"
                        >
                          {{ c.status }}
                        </span>
                      </td>
                      <td class="text-center text-nowrap">
                        <button
                          class="btn btn-icon btn-outline-primary rounded-circle me-1"
                          @click="editComplain(c.id)"
                          title="Edit"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-icon btn-outline-danger rounded-circle"
                          @click="deleteComplain(c.id)"
                          title="Hapus"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="complains.length === 0">
                      <td colspan="7" class="text-center py-5 fs-5 text-muted">
                        Tidak ada data komplain saat ini.
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
import { ref, onMounted, nextTick } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import io from 'socket.io-client'

import Header from '../../components/Header.vue'
import Sidebar from '../../components/Sidebar.vue'
import Footer from '../../components/Footer.vue'

import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API2_BASE_URL = import.meta.env.VITE_API2_BASE_URL

const complains = ref([])
const departments = ref([])
let table = null
const socket = io(`${API2_BASE_URL}`)

const user = ref({})
const sidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function logout() {
  localStorage.removeItem('user')
  window.location.href = '/login'
}

async function loadData() {
  try {
    const [complainsRes, deptRes] = await Promise.all([
      axios.get(import.meta.env.VITE_API_BASE_URL + '/complains'),
      axios.get(import.meta.env.VITE_API_BASE_URL + '/departments')
    ])
    complains.value = complainsRes.data
    departments.value = deptRes.data
    
    await nextTick()
    if (table) {
      table.destroy()
    }
    table = $('#complainsTable').DataTable({
      pageLength: 10,
      order: [[0, 'asc']],
      lengthChange: false,
      searching: true,
      language: {
        search: "Cari:",
        zeroRecords: "Data tidak ditemukan",
        info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
        infoEmpty: "Tidak ada data tersedia",
        infoFiltered: "(difilter dari _MAX_ total data)",
        paginate: {
          next: "Berikutnya",
          previous: "Sebelumnya"
        }
      }
    })
  } catch (error) {
    console.error("Gagal memuat data:", error);
    Swal.fire('Gagal', 'Terjadi kesalahan saat memuat data.', 'error');
  }
}

function editComplain(id) {
  // Implementasi logika edit di sini
  alert('Edit: ' + id)
}

async function deleteComplain(id) {
  const result = await Swal.fire({
    title: 'Yakin ingin menghapus?',
    text: "Data complain akan dihapus secara permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(import.meta.env.VITE_API_BASE_URL + '/complains/' + id)

      complains.value = complains.value.filter(c => c.id !== id)
      if (table) {
        table.row((idx, data) => parseInt(data[0]) === id)
             .remove()
             .draw(false)
      }

      Swal.fire(
        'Terhapus!',
        'Complain berhasil dihapus.',
        'success'
      )
    } catch (error) {
      Swal.fire(
        'Gagal!',
        error.response?.data?.message || 'Terjadi kesalahan saat menghapus.',
        'error'
      )
    }
  }
}

onMounted(() => {
  loadData()

  const userData = localStorage.getItem('user')
  if (userData) user.value = JSON.parse(userData)

  socket.on('complain:new', (newComplain) => {
    complains.value.unshift(newComplain)
    if (table) {
      // Perhatikan pembaruan ini
      const rowData = [
        newComplain.id, // ID untuk referensi
        newComplain.department?.name_dept || '',
        formatDate(newComplain.createdAt),
        newComplain.idp,
        newComplain.detail,
        `<span class="badge rounded-pill text-bg-warning-soft">pending</span>`,
        `<button class="btn btn-icon btn-outline-primary rounded-circle me-1" data-id="${newComplain.id}" title="Edit"><i class="bi bi-pencil"></i></button>
         <button class="btn btn-icon btn-outline-danger rounded-circle" data-id="${newComplain.id}" title="Hapus"><i class="bi bi-trash"></i></button>`
      ];
      table.row.add(rowData).draw(false);
      table.order([0, 'asc']).draw();
    }
  })

  socket.on('complain:deleted', (id) => {
    complains.value = complains.value.filter(c => c.id !== parseInt(id))
    if (table) {
      table.row((idx, data) => parseInt(data[0]) === parseInt(id))
           .remove()
           .draw(false)
    }
  })
})

function formatDate(tgl) {
  if (!tgl) return '-'
  const d = new Date(tgl)
  return `${String(d.getUTCDate()).padStart(2, '0')} ${d.toLocaleString('id-ID', { month: 'short' })} ${d.getUTCFullYear()}`
}
</script>

<style scoped>
/* Import font dari Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

/*=== General Styling & Variables ===*/
:root {
  --primary-color: #5a74ff; /* Biru yang lebih modern */
  --primary-dark: #3b50d8;
  --bg-light-soft: #f0f4f9;
  --text-dark-blue: #2c3e50;
  --text-secondary: #7f8c9a;
  --card-bg: #ffffff;
  --border-color-light: #eceff4;
  --success-soft: #eaf8f0;
  --warning-soft: #fff8eb;
  --danger-soft: #fcebeb;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--bg-light-soft);
  color: var(--text-dark-blue);
}

.min-vh-100 {
  min-height: 100vh;
}

/*=== Judul & Header ===*/
h1 {
  font-weight: 700;
  font-size: 2rem;
  color: var(--text-dark-blue);
}

/*=== Card & Bayangan ===*/
.card {
  border: 1px solid var(--border-color-light);
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(44, 62, 80, 0.05);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 15px 40px rgba(44, 62, 80, 0.08);
}

/*=== Tabel Styling ===*/
.table-responsive {
  max-height: 65vh;
  overflow-x: auto;
}

.table-borderless > :not(caption) > * > * {
  border-bottom-width: 0;
}

.table-hover > tbody > tr:hover {
  background-color: var(--bg-light-soft);
}

.table thead th {
  padding: 1.25rem 1rem;
  border-bottom: 2px solid var(--border-color-light) !important;
  color: var(--text-secondary);
}

.table tbody td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-color-light) !important;
}

.table tbody tr:last-child td {
  border-bottom: none !important;
}

/* Badge Status yang lebih lembut */
.badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.text-bg-warning-soft {
  background-color: var(--warning-soft);
  color: #d68000;
}

.text-bg-success-soft {
  background-color: var(--success-soft);
  color: #219653;
}

.text-bg-danger-soft {
  background-color: var(--danger-soft);
  color: #e74c3c;
}

/*=== Tombol Aksi ===*/
.btn-icon {
  width: 38px;
  height: 38px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.btn-icon i {
  font-size: 1rem;
}

.btn-outline-primary {
  color: var(--primary-color);
  border-color: var(--primary-color);
}
.btn-outline-primary:hover {
  background-color: var(--primary-color);
  color: #fff;
}

.btn-outline-danger {
  color: #e74c3c;
  border-color: #e74c3c;
}

.btn-outline-danger:hover {
  background-color: #e74c3c;
  color: #fff;
}

/* Datatables adjustments */
.dataTables_wrapper .dataTables_paginate .pagination .page-item .page-link {
  border-radius: 50% !important;
  margin: 0 0.2rem;
  border: none;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.dataTables_wrapper .dataTables_paginate .pagination .page-item.active .page-link {
  background-color: var(--primary-color);
  color: #fff;
  box-shadow: 0 4px 10px rgba(90, 116, 255, 0.2);
}

.dataTables_wrapper .dataTables_filter label,
.dataTables_wrapper .dataTables_info {
  color: var(--text-secondary);
}

@media (max-width: 767.98px) {
  h1 {
    font-size: 1.5rem;
    text-align: center;
  }
}
</style>