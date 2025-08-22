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
          marginTop: '56px'
        }"
      >
        <div class="container" style="max-width: 100%;">
          <h1 class="mb-4">Tambah Surat Jalan Baru</h1>

          <form @submit.prevent="submitForm" novalidate>
            <!-- Baris 1: Nomor Surat | Tanggal | Kirim ke -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label for="nomor_surat" class="form-label">Nomor Surat <span class="text-danger">*</span></label>
                <input
                  id="nomor_surat"
                  v-model="form.nomor_surat"
                  type="text"
                  required
                  class="form-control"
                  :class="{ 'is-invalid': errors.nomor_surat }"
                  placeholder="Masukkan Nomor Surat"
                />
                <div class="invalid-feedback" v-if="errors.nomor_surat">{{ errors.nomor_surat }}</div>
              </div>

              <div class="col-md-4">
                <label for="tanggal" class="form-label">Tanggal <span class="text-danger">*</span></label>
                <input
                  id="tanggal"
                  v-model="form.tanggal"
                  type="date"
                  required
                  class="form-control"
                  :class="{ 'is-invalid': errors.tanggal }"
                />
                <div class="invalid-feedback" v-if="errors.tanggal">{{ errors.tanggal }}</div>
              </div>

              <div class="col-md-4">
                <label for="kirim_ke" class="form-label">Kirim Ke <span class="text-danger">*</span></label>
                <input
                  id="kirim_ke"
                  v-model="form.kirim_ke"
                  type="text"
                  required
                  class="form-control"
                  :class="{ 'is-invalid': errors.kirim_ke }"
                  placeholder="Masukkan Kirim Ke"
                />
                <div class="invalid-feedback" v-if="errors.kirim_ke">{{ errors.kirim_ke }}</div>
              </div>
            </div>

            <!-- Baris 2: BC No | Keterangan | Cust Bond Nomor -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label for="bc_no" class="form-label">BC No</label>
                <input
                  id="bc_no"
                  v-model="form.bc_no"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.bc_no }"
                  placeholder="Masukkan BC No"
                />
                <div class="invalid-feedback" v-if="errors.bc_no">{{ errors.bc_no }}</div>
              </div>

              <div class="col-md-4">
                <label for="keterangan" class="form-label">Keterangan <span class="text-danger">*</span></label>
                <input
                  id="keterangan"
                  v-model="form.keterangan"
                  type="text"
                  required
                  class="form-control"
                  :class="{ 'is-invalid': errors.keterangan }"
                  placeholder="Masukkan Keterangan"
                />
                <div class="invalid-feedback" v-if="errors.keterangan">{{ errors.keterangan }}</div>
              </div>

              <div class="col-md-4">
                <label for="cust_bond_nomor" class="form-label">Cust Bond Nomor <span class="text-danger">*</span></label>
                <input
                  id="cust_bond_nomor"
                  v-model="form.cust_bond_nomor"
                  type="text"
                  required
                  class="form-control"
                  :class="{ 'is-invalid': errors.cust_bond_nomor }"
                  placeholder="Masukkan Cust Bond Nomor"
                />
                <div class="invalid-feedback" v-if="errors.cust_bond_nomor">{{ errors.cust_bond_nomor }}</div>
              </div>
            </div>

            <!-- Baris 3: Kendaraan | No Polisi -->
            <div class="row mb-4">
              <div class="col-md-6">
                <label for="kendaraan" class="form-label">Kendaraan <span class="text-danger">*</span></label>
                <input
                  id="kendaraan"
                  v-model="form.kendaraan"
                  type="text"
                  required
                  class="form-control"
                  :class="{ 'is-invalid': errors.kendaraan }"
                  placeholder="Masukkan Kendaraan"
                />
                <div class="invalid-feedback" v-if="errors.kendaraan">{{ errors.kendaraan }}</div>
              </div>

              <div class="col-md-6">
                <label for="nopol" class="form-label">No Polisi <span class="text-danger">*</span></label>
                <input
                  id="nopol"
                  v-model="form.nopol"
                  type="text"
                  required
                  class="form-control"
                  :class="{ 'is-invalid': errors.nopol }"
                  placeholder="Masukkan No Polisi"
                />
                <div class="invalid-feedback" v-if="errors.nopol">{{ errors.nopol }}</div>
              </div>
            </div>

            <!-- ITEMS HEADER -->
            <h3 class="mb-3">Items</h3>
            <div class="row fw-bold border-bottom pb-2 mb-3 gx-2 align-items-center">
              <div class="col-3">Nama Barang</div>
              <div class="col-1">IDP</div>
              <div class="col-2">Color</div>
              <div class="col-1">Size</div>
              <div class="col-1">Qty</div>
              <div class="col-2">Pack</div>
              <div class="col-2 text-center">Aksi</div>
            </div>

            <!-- ITEMS INPUTS -->
            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="row align-items-center mb-2 gx-2"
            >
              <div class="col-3">
                <input
                  type="text"
                  v-model="item.nama_barang"
                  :class="['form-control', itemErrors[index]?.nama_barang ? 'is-invalid' : '']"
                  placeholder="Nama Barang"
                  required
                />
                <div class="invalid-feedback" v-if="itemErrors[index]?.nama_barang">{{ itemErrors[index].nama_barang }}</div>
              </div>
              <div class="col-1">
                <input
                  type="text"
                  v-model="item.idp"
                  :class="['form-control', itemErrors[index]?.idp ? 'is-invalid' : '']"
                  placeholder="IDP"
                  required
                />
                <div class="invalid-feedback" v-if="itemErrors[index]?.idp">{{ itemErrors[index].idp }}</div>
              </div>
              <div class="col-2">
                <input
                  type="text"
                  v-model="item.color"
                  :class="['form-control', itemErrors[index]?.color ? 'is-invalid' : '']"
                  placeholder="Color"
                />
                <div class="invalid-feedback" v-if="itemErrors[index]?.color">{{ itemErrors[index].color }}</div>
              </div>
              <div class="col-1">
                <input
                  type="text"
                  v-model="item.size"
                  :class="['form-control', itemErrors[index]?.size ? 'is-invalid' : '']"
                  placeholder="Size"
                />
                <div class="invalid-feedback" v-if="itemErrors[index]?.size">{{ itemErrors[index].size }}</div>
              </div>
              <div class="col-1">
                <input
                  type="text"
                 
                  v-model="item.qty"
                  :class="['form-control', itemErrors[index]?.qty ? 'is-invalid' : '']"
                  placeholder="Qty"
                  required
                />
                <div class="invalid-feedback" v-if="itemErrors[index]?.qty">{{ itemErrors[index].qty }}</div>
              </div>
              <div class="col-2">
                <input
                  type="text"
                  v-model="item.pack"
                  :class="['form-control', itemErrors[index]?.pack ? 'is-invalid' : '']"
                  placeholder="Pack"
                />
                <div class="invalid-feedback" v-if="itemErrors[index]?.pack">{{ itemErrors[index].pack }}</div>
              </div>
              <div class="col-2 text-center">
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="removeItem(index)"
                  :disabled="form.items.length === 1"
                  title="Hapus Item"
                >
                  Hapus
                </button>
              </div>
            </div>

            <button type="button" class="btn btn-secondary mb-4" @click="addItem">
              + Tambah Item
            </button>

            <div class="d-flex align-items-center gap-3">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ loading ? 'Menyimpan...' : 'Simpan Surat Jalan' }}
              </button>
              <router-link to="/suratjalan" class="btn btn-link">Batal</router-link>
            </div>
          </form>
        </div>
      </main>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import Header from '../../components/Header.vue'
import Sidebar from '../../components/Sidebar.vue'
import Footer from '../../components/Footer.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API2_BASE_URL = import.meta.env.VITE_API2_BASE_URL

const router = useRouter()
const loading = ref(false)

const user = ref({})
onMounted(() => {
  try {
    const userData = localStorage.getItem('user')
    user.value = userData ? JSON.parse(userData) : { name: 'Guest' }
  } catch {
    user.value = { name: 'Guest' }
  }
})

const sidebarOpen = ref(true)
const windowWidth = ref(window.innerWidth)
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth
})

const form = reactive({
  nomor_surat: '',
  tanggal: '',
  kirim_ke: 'PT LEETEX',
  bc_no: '-',
  keterangan: '',
  cust_bond_nomor: '',
  kendaraan: '',
  nopol: '',
  items: [
    {
      nama_barang: '',
      idp: '',
      color: '',
      size: '',
      qty: '',
      pack: ''
    }
  ],
})

const errors = reactive({})
const itemErrors = reactive([])

function validate() {
  Object.keys(errors).forEach(key => (errors[key] = ''))
  itemErrors.splice(0)

  let valid = true

  const mainRequiredFields = ['nomor_surat', 'tanggal', 'kirim_ke', 'keterangan', 'cust_bond_nomor', 'kendaraan', 'nopol']
  for (const field of mainRequiredFields) {
    if (!form[field]) {
      errors[field] = `Field ini wajib diisi`
      valid = false
    }
  }

  form.items.forEach((item, idx) => {
    itemErrors[idx] = {}
    const itemRequiredFields = ['nama_barang', 'idp', 'qty']
    for (const field of itemRequiredFields) {
      if (!item[field]) {
        itemErrors[idx][field] = `Field ini wajib diisi`
        valid = false
      }
    }
  })

  return valid
}

function addItem() {
  form.items.push({
    nama_barang: '',
    idp: '',
    color: '',
    size: '',
    qty: '',
    pack: ''
  })
}

function removeItem(index) {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
  }
}

async function submitForm() {
  if (!validate()) {
    Swal.fire({
      icon: 'error',
      title: 'Form belum lengkap',
      text: 'Mohon periksa dan lengkapi data yang wajib diisi.',
    })
    return
  }

  loading.value = true
  try {
    await axios.post(`${API_BASE_URL}/suratjalan`, form)
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Surat jalan berhasil dibuat!',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    })
    router.push('/suratjalan')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal membuat surat jalan: ' + (error.response?.data?.error || error.message),
    })
  } finally {
    loading.value = false
  }
}

function logout() {
  localStorage.removeItem('user')
  router.push('/')
}

</script>
