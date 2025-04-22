<template>
  <v-container class="forgot-password-container" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="4">
        <div class="image-container">
          <img
            src="@/assets/images/ip-portal.png"
            alt="User Image"
            class="styled-image animated-image"
          />
        </div>
        <v-card class="forgot-password-card">
          <v-card-title class="text-h5">Forgot Password</v-card-title>

          <v-card-text>
            <!-- Username Field with Separated Icon Button -->
            <div class="input-with-button">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-inner-icon="mdi-account"
                type="text"
                color="primary"
                outlined
                dense
                hide-details
                required
                class="input-field"
                :readonly="checkedUsername"
              ></v-text-field>
              <v-btn
                v-if="!checkedUsername"
                icon
                @click="checkUsername"
                :disabled="checkedUsername"
                class="icon-button"
              >
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </div>

            <!-- Phone Field with Separated Icon Button -->
            <div class="input-with-button" v-if="checkedUsername && !flagShowPassword">
              <v-text-field
                v-model="maskedMobile"
                label="Phone No"
                :readonly="true"
                prepend-inner-icon="mdi-phone"
                type="text"
                color="primary"
                outlined
                dense
                hide-details
                required
                class="input-field"
              ></v-text-field>
              <v-btn
                v-if="mMobile"
                icon
                @click="sendOtp"
                :disabled="timerRunning"
                class="icon-button"
              >
                <v-icon>mdi-email-fast-outline</v-icon>
              </v-btn>
            </div>

            <!-- OTP Field -->
            <v-otp-input v-if="showOtpFlag" v-model="otp"></v-otp-input>

            <div v-if="showOtpFlag">
              <span class="time-remaining">Time remaining: {{ formattedTime }}</span>
            </div>

            <!-- New Password Field with Toggle Visibility -->
            <v-text-field
              v-if="flagShowPassword"
              v-model="newPassword"
              label="New Password"
              prepend-inner-icon="mdi-lock"
              :type="showNewPassword ? 'text' : 'password'"
              :append-inner-icon="!showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="toggleNewPasswordVisibility"
              outlined
              dense
              hide-details
              required
              class="input-field"
            ></v-text-field>

            <!-- Confirm New Password Field with Toggle Visibility -->
            <v-text-field
              v-if="flagShowPassword"
              v-model="confirmPassword"
              label="Confirm Password"
              prepend-inner-icon="mdi-lock-check"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-inner-icon="!showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="toggleConfirmPasswordVisibility"
              outlined
              dense
              hide-details
              required
              class="input-field"
            ></v-text-field>
          </v-card-text>

          <v-alert
            v-if="flagShowPassword"
            border="start"
            border-color="warning"
            elevation="2"
            class="password-requirements"
          >
            <div class="requirement">
              <v-icon :class="isLengthValid ? 'status-icon-true' : 'status-icon-false'">
                mdi-check-circle
              </v-icon>
              รหัสผ่านมีความยาวขั้นต่ำ 8 ตัวอักษร
            </div>
            <div class="requirement">
              <v-icon :class="hasUppercase ? 'status-icon-true' : 'status-icon-false'">
                mdi-check-circle
              </v-icon>
              มีตัวอักษรพิมพ์ใหญ่
            </div>
            <div class="requirement">
              <v-icon :class="hasLowercase ? 'status-icon-true' : 'status-icon-false'">
                mdi-check-circle
              </v-icon>
              มีตัวอักษรพิมพ์เล็ก
            </div>
            <div class="requirement">
              <v-icon :class="hasNumber ? 'status-icon-true' : 'status-icon-false'">
                mdi-check-circle
              </v-icon>
              มีตัวเลข
            </div>
            <div class="requirement">
              <v-icon :class="hasSpecialChar ? 'status-icon-true' : 'status-icon-false'">
                mdi-check-circle
              </v-icon>
              มีอักขระพิเศษ
            </div>
            <div class="requirement">
              <v-icon :class="hasPassword ? 'status-icon-true' : 'status-icon-false'">
                mdi-check-circle
              </v-icon>
              รหัสผ่านไม่เหมือนกัน
            </div>
          </v-alert>

          <!-- Submit Button -->
          <v-card-actions>
            <v-btn
              color="primary"
              :disabled="!isPasswordValid || newPassword !== confirmPassword"
              @click="submitChangePass"
              class="submit-btn"
              large
              >Submit</v-btn
            >
          </v-card-actions>
        </v-card>

        <!-- Login Link -->
        <v-row justify="center">
          <v-col class="text-center login-link">
            <router-link to="/" class="login-link">Login</router-link>
          </v-col>
        </v-row>
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
</template>

<script>
import { sendOtp, VerifyOtp, getUser, changePassword } from "@/services/apiService.js";
import Swal from "sweetalert2";
import loading from "@/components/Loading.vue";

export default {
  name: "ForgotPassword",
  components: {
    loading,
  },
  data() {
    return {
      username: "",
      token: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      showNewPassword: false, // ควบคุมการแสดง/ซ่อนรหัสผ่านในช่อง New Password
      showConfirmPassword: false, // ควบคุมการแสดง/ซ่อนรหัสผ่านในช่อง Confirm Password
      mMobile: "",
      timer: 300, // 5 minutes in seconds  = 300
      timerRunning: false,
      intervalId: null,
      showSnackbar: false,
      msgSnackbar: "",
      snackbarColor: "yellow",
      checkedUsername: false,
      flagShowPassword: false,
      showOtpFlag: false,
      isLoading: false,
    };
  },
  watch: {
    showSnackbar(newValue) {
      if (newValue) {
        setTimeout(() => {
          if (this.showSnackbar) {
            this.snackbarColor = "yellow"; // เปลี่ยนสีเป็นสีเหลือง
          }
        }, 6000);
      }
    },
    otp(val) {
      if (val.length != 6) return "Unknow";
      this.VerifyOtp();
    },
  },
  computed: {
    isLengthValid() {
      return this.newPassword.length > 7;
    },
    hasUppercase() {
      return /[A-Z]/.test(this.newPassword);
    },
    hasLowercase() {
      return /[a-z]/.test(this.newPassword);
    },
    hasNumber() {
      return /\d/.test(this.newPassword);
    },
    hasSpecialChar() {
      return /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);
    },
    hasPassword() {
      return (
        this.newPassword &&
        this.confirmPassword &&
        this.newPassword === this.confirmPassword
      );
    },
    isPasswordValid() {
      return (
        this.isLengthValid &&
        this.hasUppercase &&
        this.hasLowercase &&
        this.hasNumber &&
        this.hasSpecialChar
      );
    },
    maskedMobile: {
      get() {
        // ฟอร์แมต mMobile เป็น XXX-XXXX-1234 สำหรับการแสดงผล
        return this.mMobile.length === 10
          ? `${this.mMobile.slice(0, 4)}-XXXX-${this.mMobile.slice(8)}`
          : this.mMobile;
      },
      set(value) {
        // ลบตัวอักษรที่ไม่ใช่ตัวเลขออกและอัปเดต mMobile
        this.mMobile = value.replace(/\D/g, "").slice(0, 10); // จำกัดความยาวให้ไม่เกิน 10 ตัว
      },
    },
    formattedTime() {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    startTimer() {
      if (this.timerRunning) return;
      this.timerRunning = true;
      this.showOtpFlag = true;
      this.timer = 300; // reset to 5 minutes in seconds = 300
      this.intervalId = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          this.stopTimer();
          this.otp = "";
          this.showOtpFlag = false;
        }
      }, 1000);
    },
    stopTimer() {
      clearInterval(this.intervalId);
      this.timerRunning = false;
    },
    async submitChangePass() {
      this.isLoading = true;
      try {
        await changePassword(this.username, this.newPassword);
        Swal.fire({
          text: "successfully",
          icon: "success",
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "swal-custom-confirm-button", // เพิ่ม class ที่กำหนดเอง
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.$router.push({ name: "Login" });
          }
        });
      } catch (error) {
        Swal.fire({
          text: "500 Internal server error",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "swal-custom-confirm-button", // เพิ่ม class ที่กำหนดเอง
          },
        });
      } finally {
        // ปิดการแสดงผล Loading ในทุกกรณี
        this.isLoading = false;
      }
    },
    async checkUsername() {
      if (!this.username) {
        return this.showError("Username can't be null.");
      }
      this.isLoading = true;
      try {
        const response = await getUser(this.username);
        this.checkedUsername = true;
        this.isLoading = false;
        this.mMobile = response.mobile;
      } catch (error) {
        console.error("Login failed:", error);
        return this.showError(error, "red");
      } finally {
        // ปิดการแสดงผล Loading ในทุกกรณี
        this.isLoading = false;
      }
    },
    async sendOtp() {
      if (this.mMobile.length != 10) {
        this.msgSnackbar = "Phone number dose not contain 10 digits";
        this.showSnackbar = true;
        return;
      }
      this.isLoading = true;
      try {
        const response = await sendOtp(this.mMobile);
        this.startTimer();
        this.token = response.token;
      } catch (error) {
        this.timerRunning = false;
        this.showError(error, "red");
        return;
      } finally {
        // ปิดการแสดงผล Loading ในทุกกรณี
        this.isLoading = false;
      }
    },
    async VerifyOtp() {
      if (this.mMobile.length != 10) {
        this.msgSnackbar = "Phone number dose not contain 10 digits";
        this.showSnackbar = true;
        return;
      }
      try {
        await VerifyOtp(this.token, this.otp);
        this.flagShowPassword = true;
        this.showOtpFlag = false;
      } catch (error) {
        this.showError(error, "red");
        return;
      }
    },
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword; // สลับสถานะการแสดงรหัสผ่าน
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword; // สลับสถานะการแสดงรหัสผ่าน
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
/* จัดการรูปแบบสำหรับปุ่มกลม */
.input-with-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-button {
  background-color: #f8c849 !important; /* สีพื้นหลังสีเหลือง */
  color: white !important; /* สีไอคอนสีขาว */
  border-radius: 50%; /* ทำให้เป็นวงกลม */
  position: relative;
  top: -8px; /* ขยับปุ่มขึ้นข้างบน */
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.1);
  padding: 8px; /* ปรับ padding เพื่อขนาดที่ต้องการ */
}

/* Other styles... */
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007fc4, #efeff0);
}

.forgot-password-card {
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
  transition: box-shadow 0.3s, transform 0.2s;
}

.forgot-password-card:hover {
  box-shadow: 0px 14px 24px rgba(0, 0, 0, 0.25);
  transform: translateY(-3px);
}

.input-field {
  margin-bottom: 20px;
  color: #007fc4 !important;
}

.input-field .v-input__control .v-input__slot:focus-within {
  border-color: #007fc4 !important;
  box-shadow: 0 0 0 3px rgba(0, 127, 196, 0.2);
}

.submit-btn {
  color: white;
  font-weight: bold;
  width: 100%;
  font-size: 1.1rem;
  text-transform: uppercase;
  box-shadow: 0px 5px 10px rgba(0, 127, 196, 0.3);
  transition: background-color 0.3s, box-shadow 0.3s;
}

.submit-btn:hover {
  background-color: #f8c849;
  color: white;
  box-shadow: 0px 7px 14px rgba(0, 127, 196, 0.4);
}

.login-link {
  margin-top: 15px;
}

.login-link .login-link {
  color: white;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s, text-shadow 0.3s;
}

.login-link .login-link:hover {
  color: #007fc4;
  text-shadow: 0px 2px 5px rgba(255, 255, 255, 0.3);
  text-decoration: underline;
}
/* ตั้งค่าการจัดเรียงใน v-alert */
.password-requirements {
  text-align: left;
  color: #070707;
}

/* จัดการให้ข้อความและไอคอนในแต่ละบรรทัดเรียงชิดซ้าย */
.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}

/* ตั้งค่าการสีไอคอนตามเงื่อนไข */
.status-icon-true {
  color: green !important; /* สีเขียวเมื่อผ่านเงื่อนไข */
}

.status-icon-false {
  color: red !important; /* สีแดงเมื่อไม่ผ่านเงื่อนไข */
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
</style>
