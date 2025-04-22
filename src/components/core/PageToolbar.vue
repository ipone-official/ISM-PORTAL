<template>
  <v-app-bar app color="#007fc4">
    <!-- Button to toggle the navigation drawer -->
    <v-btn icon @click="$emit('toggle-drawer')">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <v-spacer></v-spacer>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
      transition="slide-x-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" class="avatar-btn">
          <v-avatar :image="avatarUrl" size="45"></v-avatar>
        </v-btn>
      </template>

      <v-card min-width="400">
        <v-list>
          <v-list-item
            :prepend-avatar="avatarUrl"
            :title="`${user.name}`"
            :subtitle="`${user.empId}`"
          >
            <template v-slot:append>
              <v-btn class="text-primary" icon @click="openFileInput">
                <v-icon>mdi-camera-outline</v-icon>
              </v-btn>
              <input
                type="file"
                ref="fileInput"
                @change="onFileChange"
                accept=".png, .jpg, .jpeg, .gif"
                style="display: none"
              />
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            color="primary"
            @click="item.method"
          >
            <template v-slot:prepend>
              <v-avatar :color="item.color">
                <v-icon color="white">{{ item.icon }}</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
    <v-snackbar
      v-model="showSnackbar"
      :timeout="6000"
      :color="snackbarColor"
      rounded="pill"
      class="text-center"
    >
      {{ msgSnackbar }}
    </v-snackbar>
  </v-app-bar>
</template>

<script>
import { useUserStore } from "@/stores/userStore";
import { uploadImage } from "@/services/apiService.js";
import Swal from "sweetalert2";

export default {
  name: "PageToolbar",
  data: () => ({
    menu: false,
    formData: null,
    showSnackbar: false,
    msgSnackbar: "",
    snackbarColor: "yellow",
    noImage: "../assets/images/No-Image.png",
  }),
  setup() {
    const userStore = useUserStore();
    return {
      user: userStore,
    };
  },
  computed: {
    items() {
      return [
        {
          text: "Profile",
          icon: "mdi-account",
          color: "primary",
          method: () => this.goToProfile(),
        },
        {
          text: "Logout",
          icon: "mdi-logout",
          color: "yellow",
          method: () => this.logout(),
        },
      ];
    },
    avatarUrl() {
      return this.user.pathUrl || require("@/assets/images/No-Image.png");
    },
  },
  methods: {
    openFileInput() {
      this.$refs.fileInput.click();
    },
    async onFileChange(event) {
      const file = event.target.files[0];
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

      if (file && validTypes.includes(file.type)) {
        try {
          await uploadImage(file, this.user.empId);
          Swal.fire({
            text: "successfully",
            icon: "success",
            showCancelButton: false,
            allowOutsideClick: false,
            confirmButtonText: "OK",
          }).then(async (result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        } catch (error) {
          Swal.fire({
            text: "500 Internal server error",
            icon: "error",
            showCancelButton: false,
            confirmButtonText: "OK",
          });
        } finally {
          // ปิดการแสดงผล Loading ในทุกกรณี
          this.isLoading = false;
        }
      } else {
        this.showError("Invalid file type. Only .png, .gif, and .jpg files are allowed.");
      }
    },
    showError(message, color = "yellow") {
      this.msgSnackbar = message;
      this.snackbarColor = color;
      this.showSnackbar = true;
    },
    goToProfile() {
      this.$router.push({ name: "profile" });
      this.menu = false; // ปิดเมนูหลังจากคลิก
    },
    logout() {
      // เพิ่มโค้ดการออกจากระบบที่นี่ เช่น เคลียร์ข้อมูลและไปยังหน้าเข้าสู่ระบบ
      this.user.$reset(); // สมมติว่าใช้ Pinia และมีฟังก์ชันรีเซ็ตใน store
      localStorage.removeItem("accessTokenISMPortal");
      this.$router.push({ name: "Login" });
      this.menu = false; // ปิดเมนูหลังจากคลิก
    },
  },
};
</script>

<style scoped>
.avatar-btn {
  padding: 0;
}
</style>
