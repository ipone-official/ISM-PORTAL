<template>
  <div id="app">
    <!-- สำหรับหน้าไม่ต้องการล็อกอิน -->
    <template v-if="$route.meta.allowAnonymous">
      <transition>
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
    </template>

    <!-- สำหรับหน้าอื่นๆ ที่ต้องการล็อกอิน -->
    <template v-else>
      <v-app>
        <!-- แสดง loading จนกว่าข้อมูลผู้ใช้พร้อม -->
        <loading v-if="!user.isUserReady" :isLoading="isLoading" />
        <template v-else>
          <page-navigation :isOpen="isDrawerOpen" @close="toggleDrawer" />
          <page-toolbar @toggle-drawer="toggleDrawer" />
          <v-main>
            <page-breadcrumbs v-if="hasBreadcrumbs" :items="$route.meta.breadcrumb" />
            <router-view />
          </v-main>
          <page-footer />
        </template>
      </v-app>
    </template>
  </div>
</template>

<script>
import {
  ValidateJwtToken,
  getUser,
  RenewToken,
  isTokenNearExpiration,
} from "@/services/apiService.js";
import loading from "@/components/Loading.vue";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/userStore";

export default {
  setup() {
    const userStore = useUserStore();
    return {
      user: userStore,
    };
  },
  components: {
    loading,
  },
  name: "App",
  data() {
    return {
      isDrawerOpen: true,
      isLoading: false,
    };
  },
  async mounted() {
    if (!this.$route.meta.allowAnonymous) {
      // ตรวจสอบว่าหน้านั้นต้องการการล็อกอินหรือไม่
      if (!localStorage.getItem("accessTokenISMPortal")) {
        this.$router.push({ name: "Login" });
      } else {
        await this.ValidateJwtToken();
      }
    } else {
      if (localStorage.getItem("accessTokenISMPortal")) {
        await this.ValidateJwtToken();
        this.$router.push({ name: "CheckIn" });
      }
    }
  },
  computed: {
    hasBreadcrumbs() {
      return this.$route.meta.breadcrumb && this.$route.meta.breadcrumb.length > 0;
    },
  },
  watch: {
    // ตรวจสอบเมื่อข้อมูลผู้ใช้พร้อม
    async isUserReady(val) {
      if (val) {
        console.log("User data is ready, enabling routes.");
        // เพิ่ม logic ที่ต้องการหลังจากข้อมูลผู้ใช้พร้อมแล้ว
      }
    },
  },
  methods: {
    async ValidateJwtToken() {
      this.isLoading = true;
      try {
        const response = await ValidateJwtToken();
        const nameClaim = response.claims.find((claim) => claim.type === "name");

        if (nameClaim) {
          if (isTokenNearExpiration()) {
            // หาก Token ใกล้หมดอายุ ให้ Renew Token
            await RenewToken(localStorage.getItem("refreshTokenISMPortal"));
          }
          await this.getUser(nameClaim.value);
        } else {
          Swal.fire({
            html: `Name claim not found`,
            icon: "warning",
            showCancelButton: false,
            allowOutsideClick: false,
            confirmButtonText: "OK",
          }).then(async (result) => {
            if (result.isConfirmed) {
              localStorage.removeItem("accessTokenISMPortal");
              this.$router.push({ name: "Login" });
            }
          });
        }
      } catch (error) {
        // หากเกิดข้อผิดพลาด ให้แสดงผลข้อความ
        Swal.fire({
          html: `Token is invalid or expired.`,
          icon: "warning",
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: "OK",
        }).then(async (result) => {
          if (result.isConfirmed) {
            localStorage.removeItem("accessTokenISMPortal");
            localStorage.removeItem("refreshTokenISMPortal");
            this.$router.push({ name: "Login" });
          }
        });
        return;
      } finally {
        // ปิดการแสดงผล Loading ในทุกกรณี
        this.isLoading = false;
      }
    },
    async getUser(username) {
      this.isLoading = true;
      try {
        const response = await getUser(username);
        const initRole = this.MapRole(response.group);
        if (!initRole) {
          Swal.fire({
            html: `คุณไม่มีสิทธิ์เข้าใช้งานระบบ ISM Portal`,
            icon: "warning",
            showCancelButton: false,
            allowOutsideClick: false,
            confirmButtonText: "OK",
          }).then(async (result) => {
            if (result.isConfirmed) {
              localStorage.removeItem("accessTokenISMPortal");
              localStorage.removeItem("refreshTokenISMPortal");
              this.$router.push({ name: "Login" });
            }
          });
        }
        const userStore = useUserStore();
        // ตั้งค่าข้อมูลผู้ใช้ใน userStore
        userStore.login({
          name: response.name,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          empId: response.empId,
          group: response.group,
          samAccount: response.samAccount,
          mobile: response.mobile,
          company: response.company,
          department: response.department,
          position: response.position,
          telephone: response.telephone,
          pathUrl: response.pathUrl,
        });
        userStore.setUserReady(true);
      } catch (error) {
        // หากเกิดข้อผิดพลาด ให้แสดงผลข้อความ
        Swal.fire({
          html: `Error fetching user`,
          icon: "error",
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: "OK",
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.$router.push({ name: "Login" });
          }
        });
      } finally {
        // ปิดการแสดงผล Loading ในทุกกรณี
        this.isLoading = false;
      }
    },
    MapRole(user) {
      const rolesPriority = [
        "ISM_ADMIN",
        "ISM_MANAGER",
        "ISM_PC_BKK1",
        "ISM_PC_BKK2",
        "ISM_PC_BKK3",
        "ISM_PC_BKK4",
        "ISM_PC_BKK5",
        "ISM_PC_UPC1",
        "ISM_PC_UPC2",
        "ISM_PC_UPC3",
        "ISM_PC_UPC4",
        "ISM_PC_UPC5",
        "ISM_PC_UPC6",
        "ISM_PC_UPC7",
        "ISM_PC_UPC8",
        "ISM_SUPERVISOR_BKK1",
        "ISM_SUPERVISOR_BKK2",
        "ISM_SUPERVISOR_BKK3",
        "ISM_SUPERVISOR_BKK4",
        "ISM_SUPERVISOR_BKK5",
        "ISM_SUPERVISOR_UPC1",
        "ISM_SUPERVISOR_UPC2",
        "ISM_SUPERVISOR_UPC3",
        "ISM_SUPERVISOR_UPC4",
        "ISM_SUPERVISOR_UPC5",
        "ISM_SUPERVISOR_UPC6",
        "ISM_SUPERVISOR_UPC7",
        "ISM_SUPERVISOR_UPC8",
      ];

      for (const role of rolesPriority) {
        if (user.includes(role)) {
          return role;
        }
      }

      return null;
    },
    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen;
    },
  },
};
</script>

<style>
@font-face {
  font-family: "IBMPlexSansThai";
  src: url("../src/assets/fonts/IBMPlexSansThai-Light.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

* {
  font-family: "IBMPlexSansThai", sans-serif !important;
}

#app {
  font-family: "IBMPlexSansThai", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body,
#app {
  font-family: "IBMPlexSansThai", sans-serif;
}

.v-snackbar__content {
  color: white !important;
  text-align: center !important; /* จัดข้อความให้อยู่ตรงกลาง */
}

.v-card-title {
  font-family: "IBMPlexSansThai", sans-serif;
}

.gradient-toolbar {
  background: linear-gradient(135deg, #6dd5fa, #2980b9, #004e92) !important;
  /* เพิ่มมิติสีฟ้าเข้ม-ฟ้าสดใส-น้ำเงินเข้ม */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3); /* เพิ่มเงาให้ toolbar */
  border-radius: 8px; /* เพิ่มขอบมนให้ดูนุ่มนวล */
  padding: 10px 20px; /* เพิ่ม padding ให้มีพื้นที่รอบๆ ภายใน */
  color: white !important; /* บังคับให้ตัวอักษรสีขาว */
}

.gradient-toolbar-title {
  font-size: 24px; /* ปรับขนาดตัวอักษรของหัวข้อ */
  font-weight: bold; /* เพิ่มความหนาให้ตัวอักษร */
  letter-spacing: 1px; /* เพิ่มระยะห่างระหว่างตัวอักษร */
}

.logo-image {
  max-height: 65px;
  max-width: 65px;
  margin-left: 10px; /* เพิ่ม margin ด้านซ้าย */
  margin-right: 10px; /* เพิ่ม margin ด้านขวา */
}

nav {
  padding: 25px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
