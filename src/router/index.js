import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import SuratjalanIndex from '../views/suratjalan/index.vue'
import SuratjalanCreate from '../views/suratjalan/create.vue'
import SuratjalanEdit from '../views/suratjalan/edit.vue'
import ComplainCreate from '../views/complain/Create.vue'
import ComplainIndex from '../views/complain/Index.vue'
import ComplainStatus from '../views/complain/Status.vue'
import UserIndex from '../views/user/index.vue'
import ProfilIndex from '../views/profil/index.vue'

import ScanReportEksIndex from '../views/ekspedisi/ScanReport.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },

   // publik
  { path: '/complain/create', name: 'ComplainCreate', component: ComplainCreate },

  // butuh login
  { path: '/complain', name: 'ComplainIndex', component: ComplainIndex },
  { path: '/complain/status', name: 'ComplainStatus', component: ComplainStatus },

  // surat jalan
  { path: '/suratjalan', name: 'SuratjalanIndex', component: SuratjalanIndex },
  { path: '/suratjalan/create', name: 'SuratjalanCreate', component: SuratjalanCreate },
  { path: '/suratjalan/edit/:id', name: 'SuratjalanEdit', component: SuratjalanEdit },

   // publik user
  { path: '/user', name: 'UserIndex', component: UserIndex },
  { path: '/profile', name: 'ProfilIndex', component: ProfilIndex },

  { path: '/hasilscanekspedisi', name: 'ScanReportEksIndex', component: ScanReportEksIndex },
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('user')

  const publicPages = ['Login', 'ComplainCreate'] // halaman tanpa login
  const authRequired = !publicPages.includes(to.name)

  if (authRequired && !isLoggedIn) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isLoggedIn) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})


export default router
