<template>
  <header
    class="header d-flex justify-content-between align-items-center px-3 px-md-4 py-2 shadow-sm sticky-top"
  >
    <div class="d-flex align-items-center">
      <button
        class="btn btn-outline-primary me-3"
        @click="$emit('toggle-sidebar')"
        aria-label="Toggle sidebar"
      >
        <i class="bi bi-list fs-3"></i>
      </button>
      
      <h1 class="h5 mb-0">TLSI <span>App</span></h1>
    </div>

    <div class="d-flex align-items-center gap-3">
      <div class="dropdown">
        <button
          class="btn rounded-pill d-flex align-items-center gap-2"
          type="button"
          id="profileDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span class="d-none d-sm-inline">{{ user.name || 'User' }}</span>
          <img
            :src="user.image || 'https://i.pravatar.cc/32'"
            alt="User"
            class="rounded-circle"
            width="32"
            height="32"
          />
          <i class="bi bi-caret-down-fill"></i>
        </button>

        <ul
          class="dropdown-menu dropdown-menu-end"
          aria-labelledby="profileDropdown"
        >
          <li><a class="dropdown-item" href="/profile">Update Profil</a></li>
          <li><hr class="dropdown-divider" /></li>
          <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API2_BASE_URL = import.meta.env.VITE_API2_BASE_URL

const router = useRouter();

// Deklarasikan variabel user sebagai ref
const user = ref({
  name: 'User',
  image: 'https://i.pravatar.cc/32', // Placeholder awal
});

// Pindahkan logika fetchUserProfile ke dalam <script setup>
async function fetchUserProfile() {
  const userData = localStorage.getItem('user');
  if (userData) {
    const parsedUser = JSON.parse(userData);
    
    try {
      const res = await axios.get(`${API_BASE_URL}/profile/${parsedUser.id}`);
      
      let userProfile = res.data;
      
      if (userProfile.image) {
        userProfile.image = `${API2_BASE_URL}/${userProfile.image}`;
      } else {
        userProfile.image = 'https://i.pravatar.cc/32';
      }
      
      user.value = userProfile;
      
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
      user.value.name = parsedUser.name;
    }
  }
}

async function logout() {
  try {
    await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    localStorage.removeItem('user');
    router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout gagal: ' + (error.response?.data?.message || error.message));
  }
}

// Panggil fungsi fetchUserProfile saat komponen selesai dimuat
onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.header {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  z-index: 1070;
  height: 56px;
}

button[aria-label="Toggle sidebar"] {
  display: inline-flex !important;
  z-index: 2000;
}
</style>