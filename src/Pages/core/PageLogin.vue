<template>
  <v-app>
    <v-container class="login-container" fluid>
      <v-row justify="center" align="center">
        <v-col cols="12" md="4">
          <div class="image-container">
            <img
              src="@/assets/images/ISMportal_logo.png"
              alt="User Image"
              class="styled-image animated-image"
            />
          </div>
          <v-card class="login-card">
            <!-- Info Icon -->
            <v-icon class="info-icon" @click="dialog = true"> mdi-information </v-icon>
            <!-- Dialog สำหรับแสดงรูปภาพ -->
            <v-dialog v-model="dialog" max-width="700" persistent>
              <v-card class="elevation-10" style="border-radius: 16px; overflow: hidden">
                <!-- Centered Image -->
                <img src="@/assets/images/I.P. Portal 2025.png" alt="Hover Image" />

                <!-- ปุ่มปิด -->
                <v-card-actions class="d-flex justify-end pa-2">
                  <v-btn color="red" class="white--text" rounded @click="dialog = false">
                    <v-icon left>mdi-close</v-icon> Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-card-text>
              <!-- Username Field -->
              <v-text-field
                v-model="username"
                label="Username"
                prepend-inner-icon="mdi-account"
                type="text"
                hide-details
                required
                class="input-field"
              ></v-text-field>

              <!-- Password Field -->
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="!showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="togglePasswordVisibility"
                hide-details
                required
                class="input-field"
                @keyup.enter="login"
              ></v-text-field>
            </v-card-text>

            <!-- Login Button -->
            <v-card-actions>
              <v-btn color="primary" @click="login" class="login-btn" large>Login</v-btn>
            </v-card-actions>
          </v-card>

        </v-col>
      </v-row>
      <v-snackbar
        v-model="showSnackbar"
        :timeout="6000"
        :color="snackbarColor"
        rounded="pill"
        class="text-center"
      >
        {{ msgSnackbar }}
      </v-snackbar>
      <loading :isLoading="isLoading" />
    </v-container>
  </v-app>
</template>

<script>
import { loginUser } from "@/services/apiService.js";
import loading from "@/components/Loading.vue";
import { useUserStore } from "@/stores/userStore";
import Swal from "sweetalert2";

export default {
  components: {
    loading,
  },
  name: "PageLogin",
  data() {
    return {
      dialog: false,
      username: "",
      password: "",
      showPassword: false, // ตัวแปรเพื่อควบคุมการแสดงรหัสผ่าน
      showSnackbar: false,
      msgSnackbar: "",
      isLoading: false,
      snackbarColor: "yellow",
      showImage: false,
    };
  },
  methods: {
    MapRole(user) {
      const rolesPriority = [
        "TruckQueue_Admin",
        "TruckQueue_Planning",
        "TruckQueue_Vendor",
        "TruckQueue_Store",
        "TruckQueue_Forklift",
      ];

      for (const role of rolesPriority) {
        if (user.includes(role)) {
          return role;
        }
      }

      return null;
    },
    async login() {
      // ตรวจสอบว่ากรอก Username และ Password หรือไม่
      if (!this.username || !this.password) {
        this.showError("Username and Password can't be null.");
        return;
      }
      // เริ่มการแสดงผล Loading
      this.isLoading = true;
      try {
        // เรียกใช้งานฟังก์ชัน loginUser ด้วยข้อมูล Username และ Password
        const response = await loginUser(this.username, this.password);
        if (!response.locked) {
          const initRole = this.MapRole(response.group);
        if (!initRole) {
          Swal.fire({
            html: `คุณไม่มีสิทธิ์เข้าใช้งานระบบ Truck Queue`,
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
          // เรียกใช้ userStore เพื่อจัดการข้อมูลผู้ใช้
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
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
          userStore.setUserReady(true);
          // เก็บ accessToken ใน localStorage สำหรับการตรวจสอบสิทธิ์
          localStorage.setItem("accessTokenISMPortal", response.accessToken);
          localStorage.setItem("refreshTokenISMPortal", response.refreshToken);
          // เปลี่ยนเส้นทางไปยังหน้าหลัก
          this.$router.push({ name: "CheckIn" });
        } else {
          this.showError("Login failed. User locked.", " red");
        }
      } catch (error) {
        // หากเกิดข้อผิดพลาด ให้แสดงผลข้อความ
        this.showError("Login failed. Please check your credentials.", "red");
      } finally {
        // ปิดการแสดงผล Loading ในทุกกรณี
        this.isLoading = false;
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    showError(message, color = "yellow") {
      this.msgSnackbar = message;
      this.snackbarColor = color;
      this.showSnackbar = true;
    },
  },
};
</script>

<style scoped>
/* Background gradient for the login container */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007fc4, #efeff0);
}

/* Login card styling */
.login-card {
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
  transition: box-shadow 0.3s, transform 0.2s;
}
.login-card:hover {
  box-shadow: 0px 14px 24px rgba(0, 0, 0, 0.25);
  transform: translateY(-3px);
}

/* Input field styling */
.input-field {
  margin-bottom: 20px;
  color: #007fc4 !important;
}
.input-field .v-input__control .v-input__slot:focus-within {
  border-color: #007fc4 !important;
  box-shadow: 0 0 0 3px rgba(0, 127, 196, 0.2);
}
.custom-icon-color .v-icon {
  color: #007fc4 !important; /* เปลี่ยนเป็นสีฟ้าหรือสีที่คุณต้องการ */
}

/* Login button styling */
.login-btn {
  color: white;
  font-weight: bold;
  width: 100%;
  font-size: 1.1rem;
  text-transform: uppercase;
  box-shadow: 0px 5px 10px rgba(0, 127, 196, 0.3);
  transition: background-color 0.3s, box-shadow 0.3s, color 0.3s, text-shadow 0.3s;
}
.login-btn:hover {
  background-color: #f8c849;
  color: white;
  /* text-shadow: 0px 0px 2px rgba(255, 255, 255, 0.8); */
  box-shadow: 0px 7px 14px rgba(0, 127, 196, 0.4);
}

/* Forgot password link styling */
.forgot-password {
  margin-top: 15px;
}
.forgot-link {
  color: white;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s, text-shadow 0.3s;
}
.forgot-link:hover {
  color: #007fc4;
  text-shadow: 0px 2px 5px rgba(0, 127, 196, 0.3);
  text-decoration: underline;
}
.swal-custom-confirm-button {
  background-color: #007fc4 !important; /* สีพื้นหลังของปุ่ม */
  color: white !important; /* สีข้อความเป็นสีขาว */
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 4px;
}
.avatar-btn {
  width: 42px;
  height: 42px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  display: inline-block; /* ใช้เพื่อทำให้จัดวางง่าย */
  text-align: center; /* จัดให้อยู่กลาง */
  padding: 10px; /* เพิ่มระยะรอบๆ ภาพ */
}

/* สไตล์สำหรับภาพ */
.styled-image {
  width: 100%; /* ปรับให้ภาพพอดีกับ Container */
  max-width: 200px; /* กำหนดขนาดสูงสุด */
  height: auto; /* ให้สัดส่วนคงที่ */
  border-radius: 8px; /* มุมโค้งสำหรับภาพ */
  object-fit: cover; /* ครอบคลุมพื้นที่ภาพ */
}

.animated-image {
  animation: smooth-slide 3s ease-in-out infinite;
}

@keyframes smooth-slide {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px); /* จุดสูงสุด */
  }
  100% {
    transform: translateY(0); /* กลับมาที่เดิม */
  }
}

/* ไอคอน Info */
.info-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 28px; /* ขนาดใหญ่พอประมาณ */
  cursor: pointer;
  color: #3498db; /* สีฟ้าเรียบง่าย */
  transition: transform 0.2s ease, color 0.2s ease; /* เพิ่มการเปลี่ยนสีและขนาด */
}

.info-icon:hover {
  color: #1d6fa5; /* สีเข้มขึ้นเมื่อ hover */
  transform: scale(1.1); /* ขยายเล็กน้อยเมื่อ hover */
}

/* ตกแต่งพื้นหลัง Dialog */
.v-overlay__scrim {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

/* ตกแต่งภาพ */
.v-img-rounded-top {
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
}
</style>
