import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import Dashboard from '../views/dashboard.vue'
import SuratjalanIndex from '../views/suratjalan/index.vue'
import SuratjalanCreate from '../views/suratjalan/create.vue'
import SuratjalanEdit from '../views/suratjalan/edit.vue'
import ComplainCreate from '../views/complain/Create.vue'
import ComplainIndex from '../views/complain/Index.vue'
import ComplainStatus from '../views/complain/Status.vue'
import UserIndex from '../views/user/index.vue'
import ProfilIndex from '../views/profil/index.vue'
import SuratmakerIndex from '../views/suratmaker/index.vue'
import ScanReportEksIndex from '../views/ekspedisi/ScanReport.vue'
import BuildingIndex from '../views/building/index.vue'
import BarangItIndex from '../views/barangit/index.vue'
import RiwayatPesanItIndex from '../views/barangit/riwayatpesanan.vue'
import IdpPoIndex from '../views/idppo/index.vue'
import BarcodeRequestIndex from '../views/barcoderequest/index.vue'
import KomplainITIndex from '../views/komplainit/index.vue'
import KomputerIndex from '../views/komputer/index.vue'
import GudangIndex from '../views/gudang/index.vue'
import PGudangIndex from '../views/gudang/pesanangudang.vue'
import LokerIndex from '../views/loker/index.vue'
import ContactMIndex from '../views/contact-messages/index.vue'
import PelamarIndex from '../views/loker/pelamar.vue'
import PlanningerpIndex from "../views/planningerp/index.vue"
import TargetIndex from "../views/target/index.vue"
import TargetFinishingIndex from "../views/target/finishingreport.vue"
import ScanOneIndex from '../views/target/scanone.vue'
import ScanLinkingIssueIndex from '../views/target/scanbarcodeLinkingIssue.vue'
import ScanLinkingCancelIndex from '../views/target/scanbarcodeLinkingCancel.vue'
import ScanLinkingReceiveIndex from '../views/target/scanbarcodeLinkingReceive.vue'
import ScanLinkingTransferIndex from '../views/target/scanbarcodeLinkingTransfer.vue'
import ScanPieceTransferIndex from '../views/target/scanbarcodePieceTransfer.vue'
import GetProd4aIndex from '../views/target/prod4.vue'
import { name } from 'dayjs/locale/id'

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

  // surat maker
  { path: '/suratmaker', name: 'SuratmakerIndex', component: SuratmakerIndex },
  { path: '/hasilscanekspedisi', name: 'ScanReportEksIndex', component: ScanReportEksIndex },

  // Building Maintenance
  { path: '/building', name: 'BuildingIndex', component: BuildingIndex },

  //Barang IT
  { path: '/barangit', name: 'BarangItIndex', component: BarangItIndex },
  { path: '/riwayat-pesananan-it', name: 'RiwayatPesanItIndex', component: RiwayatPesanItIndex },

  //idp po
  { path: '/idppo', name: 'IdpPoIndex', component: IdpPoIndex },
  //idp po
  { path: '/barcoderequest', name: 'BarcodeRequestIndex', component: BarcodeRequestIndex },
  //idp po
  { path: '/komplainit', name: 'KomplainITIndex', component: KomplainITIndex },
  //komputer
  { path: '/komputer', name: 'KomputerIndex', component: KomputerIndex },
  //Gudang
  { path: '/gudang', name: 'GudangIndex', component: GudangIndex },
  { path: '/p-gudang', name: 'PGudangIndex', component: PGudangIndex},
  //loker
  { path: '/loker', name: 'LokerIndex', component: LokerIndex},

    //loker
  { path: '/contact-messages', name: 'ContactMIndex', component: ContactMIndex},
  { path: '/daftar-pelamar', name: 'PelamarIndex', component: PelamarIndex},
  // planing erp
  { path: '/planningerp', name: 'PlanningerpIndex', component: PlanningerpIndex},
  // target
  { path: '/target', name: 'TargetIndex', component: TargetIndex},
  { path: '/target-finishing', name: 'TargetFinishingIndex', component: TargetFinishingIndex},
  { path: '/scan-barcode-detail', name: 'ScanOneIndex', component: ScanOneIndex},
  { path: '/scan-barcode-linking-issue', name: 'ScanLinkingIssueIndex', component: ScanLinkingIssueIndex},
  { path: '/scan-barcode-linking-return', name: 'ScanLinkingCancelIndex', component: ScanLinkingCancelIndex},
  { path: '/scan-barcode-linking-receive', name: 'ScanLinkingReceiveIndex', component: ScanLinkingReceiveIndex},
  { path: '/scan-barcode-linking-transfer', name: 'ScanLinkingTransferIndex', component: ScanLinkingTransferIndex},
   { path: '/piece-transfer', name: 'ScanPieceTransferIndex', component: ScanPieceTransferIndex},
   { path: '/getprod4a', name: 'GetProd4aIndex', component: GetProd4aIndex},
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
