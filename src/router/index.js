import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '@/Pages/core/PageLogin.vue';
import Profile from '@/Pages/Profile.vue';
import { isTokenNearExpiration, RenewToken } from "@/services/apiService.js";
import CheckIn from '@/Pages/CheckIn.vue'
import SpecialAreas from '@/Pages/SpecialAreas.vue';
import PriceReview from '@/Pages/PriceReview.vue'

const routes = [
  {
    path: '/CheckIn',
    name: 'CheckIn',
    component: CheckIn,
    meta: {
      breadcrumb: [{ name: 'เช็คอิน', link: '/CheckIn' },
      ],
    },
  },
  {
    path: '/SpecialAreas',
    name: 'SpecialAreas',
    component: SpecialAreas,
    meta: {
      breadcrumb: [{ name: 'พื้นที่พิเศษ', link: '/SpecialAreas' },
      ],
    },
  },
  {
    path: '/PriceReview',
    name: 'PriceReview',
    component: PriceReview,
    meta: {
      breadcrumb: [{ name: 'ตรวจสอบราคา', link: '/PriceReview' },
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
