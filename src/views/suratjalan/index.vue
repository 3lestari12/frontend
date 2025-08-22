<template>
  <div class="d-flex flex-column min-vh-100 bg-light">
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
        <div class="container-lg">
          <h1 class="mb-4 fw-bold text-primary">Daftar Surat Jalan</h1>

          <div class="d-flex justify-content-start mb-4">
    <router-link
      to="/suratjalan/create"
      class="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4"
    >
      <i class="bi bi-plus-lg"></i> Tambah Surat Jalan Baru
    </router-link>
  </div>
    <div class="card shadow-sm rounded-3 mb-4">
    <div class="card-body">
      <div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-end gap-3">
        <div class="flex-grow-1">
          <label for="searchNomorSurat" class="form-label fw-semibold mb-1"
            >Cari Nomor Surat:</label
          >
          <multiselect
            v-model="selectedNomorSurat"
            :options="nomorSuratOptions"
            :multiple="true"
            :searchable="true"
            :loading="loadingOptions"
            :clear-on-select="false"
            :close-on-select="false"
            :preserve-search="true"
            placeholder="Pilih nomor surat..."
            label="label"
            track-by="id"
            @search-change="onSearchChange"
            class="w-100"
          >
            <template #noResult>
              <span>Tidak ditemukan nomor surat yang cocok.</span>
            </template>
          </multiselect>
        </div>

        <div class="d-flex gap-2 flex-shrink-0">
          <button
            class="btn btn-success d-flex align-items-center justify-content-center gap-2 rounded-pill px-4"
            :disabled="selectedNomorSurat.length === 0"
            @click="downloadMultiplePdf"
          >
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <a href="/suratjalan" class="btn btn-secondary">Reset</a>
        </div>
      </div>
    </div>
  </div>
  
          <div class="card shadow-sm rounded-3 overflow-hidden">
            <div class="card-body p-0">
              <div class="table-responsive" style="max-height: 65vh; overflow-y: auto;">
                <table
                  id="suratjalanTable"
                  class="table table-striped table-hover mb-0 align-middle"
                >
                  <thead class="table-light text-center align-middle text-uppercase">
                    <tr>
                      <th>Nomor Surat</th>
                      <th>Tanggal</th>
                      <th>Kirim Ke</th>
                      <th>Kendaraan</th>
                      <th>No. Polisi</th>
                      <th>dibuat</th>
                      <th style="min-width: 140px;">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="surat in suratjalans" :key="surat.id" class="align-middle">
                      <td>{{ surat.nomor_surat }}</td>
                      <td class="text-center">{{ formatTanggal(surat.tanggal) }}</td>
                      <td>{{ surat.kirim_ke }}</td>
                      <td>{{ surat.kendaraan }}</td>
                      <td>{{ surat.nopol }}</td>
                      <td :data-order="surat.created_at">{{ formatRelativeTime(surat.created_at) }}</td>
                      <td class="text-center text-nowrap">
                        <router-link
                          :to="`/suratjalan/edit/${surat.id}`"
                          class="btn btn-sm btn-warning me-1 rounded-pill"
                          title="Edit Surat Jalan"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </router-link>
                        <button
                          @click="hapusSuratjalan(surat.id)"
                          class="btn btn-sm btn-danger rounded-pill"
                          title="Hapus Surat Jalan"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="suratjalans.length === 0">
                      <td colspan="7" class="text-center py-4 fs-5 text-muted">
                        Data kosong
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
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import Multiselect from 'vue-multiselect'
import Swal from "sweetalert2";

import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'

import Header from '../../components/Header.vue'
import Sidebar from '../../components/Sidebar.vue'
import Footer from '../../components/Footer.vue'

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

const nomorSuratOptions = ref([])
const selectedNomorSurat = ref([])
const suratjalans = ref([])
const loadingOptions = ref(false)
const user = ref({})
const sidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API2_BASE_URL = import.meta.env.VITE_API2_BASE_URL

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

async function loadDefaultOptions() {
  loadingOptions.value = true
  try {
    const res = await axios.get(`${API_BASE_URL}/suratjalan/all_nomor`)
    nomorSuratOptions.value = res.data
  } catch (error) {
    nomorSuratOptions.value = []
    console.error('Gagal load default nomor surat:', error)
  } finally {
    loadingOptions.value = false
  }
}

async function onSearchChange(query) {
  if (!query) {
    await loadDefaultOptions()
    return
  }
  loadingOptions.value = true
  try {
    const res = await axios.get(`${API_BASE_URL}/suratjalan/search_nomor`, {
      params: { q: query }
    })
    nomorSuratOptions.value = res.data
  } catch (error) {
    nomorSuratOptions.value = []
    console.error('Gagal search nomor surat:', error)
  } finally {
    loadingOptions.value = false
  }
}

async function downloadMultiplePdf() {
  if (selectedNomorSurat.value.length === 0) return
  const nomorParam = selectedNomorSurat.value.map(o => o.id).join(',')
  const url = `${API_BASE_URL}/suratjalan/export_multiplepdf?nomorsurat=${encodeURIComponent(nomorParam)}`
  window.open(url, '_blank')
}

async function loadSuratjalans() {
  try {
    const res = await axios.get(`${API_BASE_URL}/suratjalan`)
    suratjalans.value = res.data

    await nextTick()

    if ($.fn.dataTable.isDataTable('#suratjalanTable')) {
      $('#suratjalanTable').DataTable().clear().destroy()
    }

    $('#suratjalanTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      order: [[5, 'desc']],
      lengthChange: true,
      pageLength: 10,
      columnDefs: [
        { orderable: false, targets: [0, 2, 3, 4, 6] }
      ],
      language: {
        search: "_INPUT_",
        searchPlaceholder: "Cari Nomor Surat...",
        lengthMenu: "Tampilkan _MENU_ data",
        paginate: {
          previous: "<i class='bi bi-chevron-left'></i>",
          next: "<i class='bi bi-chevron-right'></i>"
        },
        info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
        infoEmpty: "Menampilkan 0 sampai 0 dari 0 data",
        emptyTable: "Data kosong"
      }
    })

  } catch (error) {
    suratjalans.value = []
    console.error('Gagal load surat jalan:', error)
  }
}

function formatTanggal(tgl) {
  if (!tgl) return '-'
  const d = new Date(tgl)
  return `${String(d.getUTCDate()).padStart(2, '0')} ${d.toLocaleString('id-ID', { month: 'short' })} ${d.getUTCFullYear()}`
}

function hapusSuratjalan(id) {
  Swal.fire({
    title: 'Yakin?',
    text: "Data surat jalan akan dihapus permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${API_BASE_URL}/suratjalan/${id}`)
        .then(() => {
          suratjalans.value = suratjalans.value.filter(s => s.id !== id)

          Swal.fire(
            'Terhapus!',
            'Surat jalan berhasil dihapus.',
            'success'
          )
        })
        .catch(() => {
          Swal.fire(
            'Gagal!',
            'Terjadi kesalahan saat menghapus surat jalan.',
            'error'
          )
        })
    }
  })
}

window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth
})

onMounted(() => {
  loadDefaultOptions()
  loadSuratjalans()
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})

function logout() {
  localStorage.removeItem('user')
  window.location.href = '/login'
}

function formatRelativeTime(date) {
  return dayjs(date).fromNow()
}
</script>

<style>
@import "vue-multiselect/dist/vue-multiselect.min.css";

/*=== General Styling ===*/
body {
  font-family: 'Inter', sans-serif;
  background-color: #f8f9fa;
}

/* Tombol Aksi */
.btn-sm {
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
}
.rounded-pill {
  border-radius: 50rem !important;
}

/*=== Multiselect Styling ===*/
.multiselect {
  font-size: 14px;
}
.multiselect__tags {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 8px 40px 0 8px;
  min-height: 38px;
}
.multiselect__select {
  top: 8px;
}
.multiselect__tag {
  background: #0d6efd;
}
.multiselect__tag-icon:after {
  color: #fff;
}
.multiselect__tag-icon:focus, .multiselect__tag-icon:hover {
  background: #0b5ed7;
}

/*=== Tabel Styling ===*/
.table-responsive {
  border-radius: 0.5rem;
  overflow-x: auto;
}
table.table {
  min-width: 800px;
}
table.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.03);
}
table.table-hover tbody tr:hover {
  background-color: #e9f5ff;
}
table thead th {
  font-weight: 600;
  vertical-align: middle !important;
  text-align: center;
  color: #6c757d;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
  padding: 1rem 0.5rem;
}

/* Datatables adjustments */
.dataTables_wrapper .dataTables_length,
.dataTables_wrapper .dataTables_filter,
.dataTables_wrapper .dataTables_info,
.dataTables_wrapper .dataTables_paginate {
  padding: 1rem;
}
.dataTables_wrapper .dataTables_paginate .pagination .page-item .page-link {
  border-radius: 50%;
  margin: 0 4px;
}

/*=== Responsiveness ===*/
@media (max-width: 767.98px) {
  main.p-3.p-md-5 {
    padding: 1rem !important;
  }
  
  .d-flex.flex-wrap.align-items-center.gap-3 {
    flex-direction: column;
    align-items: stretch !important;
  }

  .btn.d-flex.align-items-center.rounded-pill {
    width: 100%;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  
  .multiselect {
    margin-top: 0.5rem;
    width: 100%;
  }

  h1.mb-4 {
    font-size: 1.75rem;
  }

  .table-responsive {
    border-radius: 0.5rem;
    overflow-x: auto;
  }
  table.table-hover tbody tr:hover {
    background-color: transparent;
  }
}
</style>