<template>
  <div class="d-flex flex-column min-vh-100 bg-light-subtle">
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
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white p-4 d-flex justify-content-between align-items-center">
              <h4 class="mb-0 fw-bold">Laporan Hasil Scan Ekspedisi</h4>
            </div>
            <div class="card-body p-4">
              <div class="mb-4">
                <form @submit.prevent="getReport">
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label for="date-filter" class="form-label fw-semibold">Pilih Tanggal:</label>
                      <input
                        type="date"
                        id="date-filter"
                        v-model="filters.selected_date"
                        class="form-control"
                      />
                    </div>
                    <div class="col-md-4">
                      <label for="owner-filter" class="form-label fw-semibold">Owner:</label>
                      <select
                        id="owner-filter"
                        v-model="filters.xOwner"
                        class="form-select"
                      >
                        <option value="">-- Semua Owner --</option>
                        <option v-for="o in owners" :key="o.xOwner" :value="o.xOwner">
                          {{ o.xOwner }}
                        </option>
                      </select>
                    </div>
                    <!-- <div class="col-md-4">
                      <label for="pc-filter" class="form-label fw-semibold">Nama PC:</label>
                      <select
                        id="pc-filter"
                        v-model="filters.xPC"
                        class="form-select"
                      >
                        <option value="">-- Semua PC --</option>
                        <option v-for="pc in pcs" :key="pc.xPC" :value="pc.xPC">
                          {{ pc.xPC }}
                        </option>
                      </select>
                    </div> -->
                  </div>
                  <div class="d-flex gap-2 mt-4">
                    <button
                      type="submit"
                      class="btn btn-primary"
                    >
                      <i class="bi bi-search me-2"></i>Tampilkan Data
                    </button>
                    <button
                      type="button"
                      @click="resetFilter"
                      class="btn btn-secondary"
                    >
                      <i class="bi bi-x-circle me-2"></i>Reset Filter
                    </button>
                  </div>
                </form>
              </div>

              <div class="mt-4">
                <div v-if="data.length > 0">
                  <div class="table-responsive">
                    <table id="reportTable" class="table table-striped table-hover w-100">
                      <thead class="bg-light">
                        <tr>
                          <th>Tanggal</th>
                          <th>Owner</th>
                          <th>Nama PC</th>
                          <th>Total Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in data" :key="row.id">
                          <td>{{ formatDate(row.scan_date) }}</td>
                          <td>{{ row.xOwner }}</td>
                          <td>{{ row.xPC }}</td>
                          <td>{{ row.total_qty }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else class="alert alert-info text-center">
                  Tidak ada data ditemukan. Silakan gunakan filter di atas.
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
import { ref, onMounted, nextTick, watch } from "vue";
import axios from "axios";
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'

import Header from '../../components/Header.vue'
import Sidebar from '../../components/Sidebar.vue'
import Footer from '../../components/Footer.vue'

import 'bootstrap-icons/font/bootstrap-icons.css';

const filters = ref({
  selected_date: "",
  xOwner: "",
  xPC: "",
});

const data = ref([]);
const owners = ref([]);
const pcs = ref([]);
let dataTableInstance = null;

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

const destroyDataTable = () => {
  if (dataTableInstance) {
    dataTableInstance.destroy();
    dataTableInstance = null;
  }
};

const initializeDataTable = () => {
  if (data.value.length > 0) {
    nextTick(() => {
      destroyDataTable();
      dataTableInstance = $('#reportTable').DataTable({
        "dom": 'Bfrtip',
        "buttons": ['excel', 'pdf', 'print'],
        "responsive": true,
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
      });
    });
  }
};

const getReport = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/ekspedisi/report", {
      params: filters.value,
    });
    data.value = res.data.data || [];
    initializeDataTable();
  } catch (err) {
    console.error("Error getReport:", err);
  }
};

const resetFilter = () => {
  filters.value = { selected_date: "", xOwner: "", xPC: "" };
  data.value = [];
  destroyDataTable();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

onMounted(() => {
  owners.value = [{ xOwner: "PTLS1" }, { xOwner: "PTLS2" }];
  pcs.value = [{ xPC: "PC01" }, { xPC: "PC02" }];
  
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
});
</script>

<style scoped>
/* Scoped CSS bisa ditambahkan di sini jika ada kustomisasi spesifik yang tidak dicakup oleh Bootstrap */
</style>