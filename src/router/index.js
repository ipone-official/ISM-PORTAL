import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '@/Pages/core/PageLogin.vue';
import Profile from '@/Pages/Profile.vue';
import DisplayQueue from '@/Pages/DisplayQueue.vue';
import UploadQueue from '@/Pages/UploadQueue.vue';
import { isTokenNearExpiration, RenewToken } from "@/services/apiService.js";
import ManageQueue from '@/Pages/ManageQueue.vue'
import MonitorQueue from '@/Pages/MonitorQueue.vue' 
import ShowQueue from '@/Pages/ShowQueue.vue';
import CheckIn from '@/Pages/CheckIn.vue'
import SpecialAreas from '@/Pages/SpecialAreas.vue';


const routes = [
  {
    path: '/CheckIn',
    name: 'CheckIn',
    component: CheckIn,
    meta: {
      breadcrumb: [{ name: 'Check In', link: '/CheckIn' },
      ],
    },
  },
  {
    path: '/SpecialAreas',
    name: 'SpecialAreas',
    component: SpecialAreas,
    meta: {
      breadcrumb: [{ name: 'Special Areas', link: '/SpecialAreas' },
      ],
    },
  },
  {
    path: '/ShowQueue',
    name: 'ShowQueue',
    component: ShowQueue,
    meta: {
      allowAnonymous: true,
    },
  },
  {
    path: '/ShowQueueAll',
    name: 'ShowQueueAll',
    component: ShowQueue,
    meta: {
      breadcrumb: [{ name: 'Show Queue', link: '/ShowQueueAll' },
      ],
    },
  },
  {
    path: '/MonitorQueue',
    name: 'MonitorQueue',
    component: MonitorQueue,
    meta: {
      breadcrumb: [{ name: 'Monitor', link: '/MonitorQueue' },
      ],
    },
  },
  {
    path: '/DisplayQueue',
    name: 'DisplayQueue',
    component: DisplayQueue,
    meta: {
      breadcrumb: [{ name: 'Display', link: '/DisplayQueue' },
      ],
    },
  },
  {
    path: '/ManageQueue',
    name: 'ManageQueue',
    component: ManageQueue,
    meta: {
      breadcrumb: [{ name: 'Manage', link: '/ManageQueue' },
      ],
    },
  },
  {
    path: '/UploadQueue',
    name: 'UploadQueue',
    component: UploadQueue,
    meta: {
      breadcrumb: [{ name: 'Upload', link: '/UploadQueue' },
      ],
    },
  },
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: {
      allowAnonymous: true,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  try {
    // เช็คว่าหน้าปลายทางต้องการการล็อกอินหรือไม่
    if (!to.meta.allowAnonymous) {
      if (isTokenNearExpiration()) {
        // หาก Token ใกล้หมดอายุ ให้ Renew Token
        await RenewToken(localStorage.getItem('refreshTokenISMPortal'));
      }
    }
    next(); // อนุญาตให้เปลี่ยน Route
  } catch (error) {
    console.error('Error during token renewal:', error);
    localStorage.removeItem('accessTokenISMPortal');
    localStorage.removeItem('refreshTokenISMPortal');
    next({ name: 'Login' }); // ส่งกลับหน้า Login
  }
});

export default router;
