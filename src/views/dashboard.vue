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
          <div class="row">
            <div class="col-12">
              <div class="d-flex align-items-center mb-4">
                <h2 class="mb-0 text-primary fw-bold">Dashboard</h2>
                <span class="ms-3 text-secondary">
                  <i class="bi bi-speedometer2"></i>
                </span>
              </div>
              <p class="lead text-muted">Selamat datang kembali, <span class="fw-semibold text-dark">{{ user.name }}</span>! Kelola sistem dengan mudah.</p>
            </div>
          </div>

          <div class="row g-4 mt-2">
            <div class="col-lg-6">
              <div class="card shadow-sm border-0 rounded-4 h-100">
                <div class="card-body p-4">
                  <h5 class="card-title text-success mb-3 d-flex align-items-center">
                    <i class="bi bi-person-circle me-2"></i> Detail Pengguna
                  </h5>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">Nama:</span>
                      <span class="fw-bold">{{ user.name }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">Nomor Pegawai:</span>
                      <span class="fw-bold">{{ user.nopegawai }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <span class="text-muted">Dept:</span>
                      <span class="badge bg-primary text-uppercase">{{ user.dept }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="card shadow-sm border-0 rounded-4 h-100">
                <div class="card-body p-4 d-flex flex-column align-items-center justify-content-center">
                  <h5 class="card-title text-info mb-3 d-flex align-items-center">
                    <i class="bi bi-gear-fill me-2"></i> Sistem Aktif
                  </h5>
                  <div class="text-center">
                    <img src="/images/hallo.gif" class="img-fluid rounded-3 shadow-sm mb-3" alt="Working GIF" style="max-height: 200px;">
                    <p class="text-muted">Sistem berjalan dengan optimal. Selamat bekerja!</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4 text-center">
              <button @click="logout" class="btn btn-danger btn-lg rounded-pill shadow-lg px-5">
                <i class="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Footer from '../components/Footer.vue'

const user = ref({})
const router = useRouter()
const sidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function handleResize() {
  windowWidth.value = window.innerWidth
  if (windowWidth.value >= 768) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
}

window.addEventListener('resize', handleResize)

onMounted(() => {
  handleResize()
  const userData = localStorage.getItem('user')
  if (!userData) {
    router.push('/')
  } else {
    user.value = JSON.parse(userData)
  }
})

async function logout() {
  try {
    await axios.post(import.meta.env.VITE_API_BASE_URL + '/auth/logout', {}, { withCredentials: true })
    localStorage.removeItem('user')
    router.push('/')
  } catch {
    alert('Logout gagal')
  }
}
</script>

<style scoped></style>
