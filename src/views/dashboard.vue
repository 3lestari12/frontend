<template>
  <div class="d-flex flex-column min-vh-100">
    <Header :user="user" @toggle-sidebar="toggleSidebar" @logout="logout" />

    <div class="d-flex flex-grow-1">
      <Sidebar :isOpen="sidebarOpen" />

      <main
        class="flex-grow-1 p-4"
        :style="{
          marginLeft: sidebarOpen && windowWidth >= 768 ? '16rem' : '0',
          transition: 'margin-left 0.3s ease',
          marginTop: '56px',  /* supaya tidak ketutupan header */
        }"
      >
        <h2 class="mb-4">Dashboard</h2>
        <p>Selamat datang, {{ user.name }} ({{ user.nopegawai }})</p>

        <button @click="logout" class="btn btn-danger mt-3">
          Logout
        </button>
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
