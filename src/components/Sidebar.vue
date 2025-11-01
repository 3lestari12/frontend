<template>
  <!-- <aside :class="['sidebar', isOpen ? 'open' : '']" @click.self="closeSidebarOnMobile"> -->
    <aside :class="['sidebar', { open: isOpen }]" @click.self="closeSidebarOnMobile">

    <nav class="nav flex-column pt-4 ps-3">

      <router-link
        to="/dashboard"
        class="nav-link d-flex align-items-center mb-2"
        active-class="active"
        exact
      >
        <i class="bi bi-speedometer2 me-2"></i> Dashboard
      </router-link>

      <!-- Dropdown Suratjalan -->
      <div v-if="['expedisi','it','manager','sekretaris','akuntansi'].includes(user.dept?.toLowerCase())">
        <a
          href="#"
          class="nav-link d-flex align-items-center mb-2"
          @click.prevent="toggleSuratjalanDropdown"
          :class="{ active: isSuratjalanOpen }"
          style="cursor:pointer;"
        >
          <i class="bi bi-file-earmark-text me-2"></i>
          Expedisi
          <i
            class="bi"
            :class="isSuratjalanOpen ? 'bi-caret-down-fill ms-auto' : 'bi-caret-right-fill ms-auto'"
          ></i>
        </a>

        <div v-show="isSuratjalanOpen" class="ps-3">
          <router-link
            to="/suratjalan"
            class="nav-link mb-1"
            active-class="active"
          >
            Suratjalan
          </router-link>
          <router-link
            to="/suratmaker"
            class="nav-link mb-1"
            active-class="active"
          >
            Surat Maker
          </router-link>
          <router-link
            to="/hasilscanekspedisi"
            class="nav-link mb-1"
            active-class="active"
          >
            Hasil Scan Ekspedisi 
          </router-link>
        </div>
      </div>

      <!-- Dropdown IDP PO -->
      <div v-if="['expedisi','it','manager','sekretaris','akuntansi'].includes(user.dept?.toLowerCase())">
        <a
          href="#"
          class="nav-link d-flex align-items-center mb-2"
          @click.prevent="toggleIdpPoDropdown"
          :class="{ active: isIdpPoOpen }"
          style="cursor:pointer;"
        >
          <i class="bi bi-collection-fill me-2"></i>
          IDP Jatuh Tempo
          <i
            class="bi"
            :class="isIdpPoOpen ? 'bi-caret-down-fill ms-auto' : 'bi-caret-right-fill ms-auto'"
          ></i>
        </a>

        <div v-show="isIdpPoOpen" class="ps-3">
          <router-link
            to="/idppo"
            class="nav-link mb-1"
            active-class="active"
          >
            Daftar IDP JT
          </router-link>
        </div>
      </div>

      <!-- Dropdown ERP -->
      <div v-if="['it', 'manager', 'sekretaris'].includes(user.dept?.toLowerCase())">
        <a
          href="#"
          class="nav-link d-flex align-items-center mb-2 position-relative"
          @click.prevent="toggleComplainDropdown"
          :class="{ active: isComplainOpen }"
          style="cursor:pointer;"
        >
          <i class="bi bi-file-earmark-text me-2"></i>
          ERP
          <i
            class="bi"
            :class="isComplainOpen ? 'bi-caret-down-fill ms-auto' : 'bi-caret-right-fill ms-auto'"
          ></i>
          <!-- Badge -->
          <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
        </a>

        <div v-show="isComplainOpen" class="ps-3">
          <router-link
            to="/complain/status"
            class="nav-link mb-1"
            active-class="active"
            v-if="['it', 'manager'].includes(user.dept?.toLowerCase())"
          >
            Complain Pending
          <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
          </router-link>
          <router-link
            to="/complain"
            class="nav-link mb-1"
            active-class="active"
          >
            All Complain
          </router-link>
        </div>


        <!------  USER LIST  ------->
        <router-link v-if="user.dept === 'IT'"
        to="/user"
        class="nav-link d-flex align-items-center mb-2"
        active-class="active"
        exact
      >
        <i class="bi bi-people me-2"></i> Daftar User
      </router-link>
      </div>



       <!-- Dropdown Building -->
      <div v-if="['it', 'manager', 'sekretaris', 'wakil manager', 'fco'].includes(user.dept?.toLowerCase())">
        <a
          href="#"
          class="nav-link d-flex align-items-center mb-2"
          @click.prevent="toggleBuildingDropdown"
          :class="{ active: isBuildingOpen }"
          style="cursor:pointer;"
        >
          <i class="bi bi-building-fill me-2"></i>
          General Affair
          <i
            class="bi"
            :class="isBuildingOpen ? 'bi-caret-down-fill ms-auto' : 'bi-caret-right-fill ms-auto'"
          ></i>
        </a>

        <div v-show="isBuildingOpen" class="ps-3">
          <router-link
            to="/building"
            class="nav-link mb-1"
            active-class="active"
          >
            Building Maintenance
          </router-link>
        </div>
      </div>

      <!-- Dropdown Barang IT -->
      <div v-if="['it', 'manager', 'sekretaris', 'wakil manager'].includes(user.dept?.toLowerCase())">
        <a
          href="#"
          class="nav-link d-flex align-items-center mb-2"
          @click.prevent="toggleBarangITDropdown"
          :class="{ active: isBarangITOpen }"
          style="cursor:pointer;"
        >
          <i class="bi bi-pc-display-horizontal me-2"></i>
          IT
          <i
            class="bi"
            :class="isBarangITOpen ? 'bi-caret-down-fill ms-auto' : 'bi-caret-right-fill ms-auto'"
          ></i>
        </a>

        <div v-show="isBarangITOpen" class="ps-3">
          
          <router-link
            to="/barangit"
            class="nav-link mb-1"
            active-class="active"
          >
            Barang IT
          </router-link>
          <router-link
            to="/riwayat-pesananan-it"
            class="nav-link mb-1"
            active-class="active"
          >
            Pesanan BarangIT
          </router-link>
          <hr>
          <router-link
            to="/komplainit"
            class="nav-link mb-1"
            active-class="active"
          >
            Komplain IT
          </router-link>
          <router-link
            to="/barcoderequest"
            class="nav-link mb-1"
            active-class="active"
          >
            Permintaan Barcode
          </router-link>
          <hr>
          <router-link
            to="/komputer"
            class="nav-link mb-1"
            active-class="active"
          >
            Daftar komputer
          </router-link>
          
          <router-link to="/planningerp"
           class="nav-link mb-1" 
           active-class="active">
           Planning ERP
          </router-link>
        </div>
      </div>

      <!-- Dropdown Gudang -->
      <div v-if="['administrasi','it','manager','sekretaris'].includes(user.dept?.toLowerCase())">
        <a
          href="#"
          class="nav-link d-flex align-items-center mb-2"
          @click.prevent="toggleGudangBDropdown"
          :class="{ active: isGudangBOpen }"
          style="cursor:pointer;"
        >
          <i class="bi bi-houses-fill me-2"></i>
          Gudang Barang
          <i
            class="bi"
            :class="isGudangBOpen ? 'bi-caret-down-fill ms-auto' : 'bi-caret-right-fill ms-auto'"
          ></i>
        </a>

        <div v-show="isGudangBOpen" class="ps-3">
          <router-link
            to="/gudang"
            class="nav-link mb-1"
            active-class="active"
          >
            Daftar Barang
          </router-link>
           <router-link
            to="/p-gudang"
            class="nav-link mb-1"
            active-class="active"
          >
            Pesanan Barang
          </router-link>
        </div>
      </div>

      <!-- Dropdown Gudang -->
<div v-if="['it','manager','sekretaris','hrd'].includes(user.dept?.toLowerCase())">
  <a
    href="#"
    class="nav-link d-flex align-items-center mb-2"
    @click.prevent="toggleLokerDropdown"
    :class="{ active: isLokerOpen }"
    style="cursor:pointer;"
  >
    <i class="bi bi-person-lines-fill me-2"></i>
    HRD
    <i
      class="bi"
      :class="isLokerOpen ? 'bi-caret-down-fill ms-auto' : 'bi-caret-right-fill ms-auto'"
    ></i>
  </a>

  <div v-show="isLokerOpen" class="ps-3">
    <router-link
      to="/loker"
      class="nav-link mb-1"
      active-class="active"
    >
      Daftar Loker
    </router-link>

    <router-link
      to="/daftar-pelamar"
      class="nav-link mb-1"
      active-class="active"
    >
      Daftar Pelamar
    </router-link>

    <router-link
      to="/contact-messages"
      class="nav-link mb-1"
      active-class="active"
    >
      Contact Message
    </router-link>
  </div>
</div>


 <!-- Dropdown Building -->
      <div v-if="['it', 'manager', 'sekretaris', 'wakil manager', 'target', 'expedisi'].includes(user.dept?.toLowerCase())">
        <a
          href="#"
          class="nav-link d-flex align-items-center mb-2"
          @click.prevent="toggleTargetDropdown"
          :class="{ active: isTargetOpen }"
          style="cursor:pointer;"
        >
          <i class="bi bi-easel2 me-2"></i>
          Target
          <i
            class="bi"
            :class="isTargetOpen ? 'bi-caret-down-fill ms-auto' : 'bi-caret-right-fill ms-auto'"
          ></i>
        </a>

        <div v-show="isTargetOpen" class="ps-3">
          <router-link
            to="/target"
            class="nav-link mb-1"
            active-class="active"
          >
           Laporan Target TLSI
          </router-link>
          <router-link
            to="/target-finishing"
            class="nav-link mb-1"
            active-class="active"
          >
           Hasil Piece Work
          </router-link>
          <router-link
            to="/scan-barcode-detail"
            class="nav-link mb-1"
            active-class="active"
          >
           Scan Barcode Detail
          </router-link>
          <router-link
            to="/getprod4a"
            class="nav-link mb-1"
            active-class="active"
          >
           Laporan Prod4
          </router-link>
        </div>


      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { defineProps, defineEmits } from 'vue'

import io from 'socket.io-client'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API2_BASE_URL = import.meta.env.VITE_API2_BASE_URL

const socket = io(`${API2_BASE_URL}`) // sesuaikan URL backend socket

const user = ref({ dept: '' })

const props = defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['update:isOpen'])

const pendingCount = ref(0)
const isSuratjalanOpen = ref(false)
const isComplainOpen = ref(false)
const isBuildingOpen = ref(false)
const isBarangITOpen = ref(false)
const isIdpPoOpen = ref(false)
const isGudangBOpen = ref(false)
const isLokerOpen = ref(false)
const isTargetOpen = ref(false)

function closeSidebarOnMobile() {
  if (window.innerWidth < 768) {
    emit('update:isOpen', false)
  }
}

function toggleSuratjalanDropdown() {
  isSuratjalanOpen.value = !isSuratjalanOpen.value
}

function toggleComplainDropdown() {
  isComplainOpen.value = !isComplainOpen.value
}

function toggleBuildingDropdown() {
  isBuildingOpen.value = !isBuildingOpen.value
}

function toggleBarangITDropdown() {
  isBarangITOpen.value = !isBarangITOpen.value
}

function toggleIdpPoDropdown() {
  isIdpPoOpen.value = !isIdpPoOpen.value
}

function toggleGudangBDropdown() {
  isGudangBOpen.value = !isGudangBOpen.value
}

function toggleLokerDropdown() {
  isLokerOpen.value = !isLokerOpen.value
}

function toggleTargetDropdown() {
  isTargetOpen.value = !isTargetOpen.value
}

async function fetchPendingCount() {
  try {
    const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/complains/count/pending')
    pendingCount.value = res.data.pendingCount || 0
  } catch (error) {
    console.error('Failed to fetch pending complain count:', error)
  }
}

onMounted(() => {
  try {
    const userData = localStorage.getItem('user')
    user.value = userData ? JSON.parse(userData) : { dept: '' }
  } catch {
    user.value = { dept: '' }
  }

  fetchPendingCount()
  // Jika pakai websocket, kamu juga bisa listen update realtime di sini dan update pendingCount secara realtime
   socket.on('complain:new', (newComplain) => {
    if (newComplain.status === 'pending') {
      pendingCount.value++
    }
  })

  socket.on('complain:updated', (updatedComplain) => {
    // Jika status berubah ke pending, tambah count
    if (updatedComplain.status === 'pending') {
      pendingCount.value++
    }
    // Jika status berubah dari pending ke yang lain, kurangin count
    else {
      pendingCount.value = Math.max(pendingCount.value - 1, 0)
    }
  })

  socket.on('complain:deleted', (deletedId) => {
    // Kalau perlu, bisa fetch ulang atau kurangin jika yakin data sudah tidak pending
    // Contoh asumsi data yang dihapus pasti pending
    pendingCount.value = Math.max(pendingCount.value - 1, 0)
  })
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 56px; /* di bawah header */
  left: 0;
  height: calc(100vh - 56px);
  width: 16rem;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  box-shadow: 0 0 15px rgb(0 0 0 / 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1050;
  overflow-y: auto;
  padding-bottom: 2rem;
}

.sidebar.open {
  transform: translateX(0);
}

.nav-link {
  position: relative;  /* PENTING supaya badge positioning tepat */
  color: #212529;
  font-weight: 600;
  border-radius: 0.375rem;
  transition: background-color 0.25s ease;
  user-select: none;
  padding-right: 2.5rem; /* beri ruang buat badge di kanan */
}

.nav-link.active,
.nav-link:hover {
  background-color: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.badge {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 1100;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.25em 0.55em;
  line-height: 1;
  background-color: #dc3545; /* merah */
  color: white;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  user-select: none;
  box-shadow: 0 0 4px rgb(0 0 0 / 0.15);
  transition: transform 0.15s ease;
}

.nav-link:hover .badge {
  transform: scale(1.1);
}


/* @media (min-width: 768px) {
  .sidebar {
    transform: translateX(0);
  }
} */

 @media (min-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
}

</style>
