<template>
  <v-container class="profile-page">
    <v-row dense>
      <!-- Profile Information Section -->
      <v-col cols="12" md="6">
        <v-card class="profile-card" elevation="3">
          <!-- Profile Picture -->
          <v-img
            :src="avatarUrl"
            class="profile-picture"
            lazy-src="@/"
            contain
            alt="Profile"
            @click="openFileInput"
          ></v-img>
          <input
            type="file"
            ref="fileInput"
            @change="onFileChange"
            accept=".png, .jpg, .jpeg, .gif"
            style="display: none"
          />
          <!-- Profile Info -->
          <v-card-title class="profile-name">
            {{ user.name }}
          </v-card-title>

          <v-card-subtitle class="profile-position">
            {{ user.position }}
          </v-card-subtitle>
          <v-card-subtitle class="profile-position"> ({{ user.empId }}) </v-card-subtitle>

          <!-- Department and Contact -->
          <v-card-text class="profile-details">
            <div class="detail">
              <v-icon class="detail-icon">mdi-office-building</v-icon>
              <span>{{ user.company }}</span>
            </div>
            <div class="detail">
              <v-icon class="detail-icon">mdi-graph-outline</v-icon>
              <span>{{ user.department }}</span>
            </div>
            <div class="detail">
              <v-icon class="detail-icon">mdi-phone-voip</v-icon>
              <span>{{ user.telephone }}</span>
            </div>
            <div class="detail">
              <v-icon class="detail-icon">mdi-cellphone</v-icon>
              <span>{{ formattedMobile}}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Profile Edit Section -->
      <v-col cols="12" md="6">
        <!-- Edit Mobile Section -->
        <v-card class="edit-card" elevation="3" outlined>
          <v-card-title>Change Mobile Number</v-card-title>
          <v-card-text>
            <v-form ref="formMobile">
              <v-text-field
                v-model="maskedMobile"
                label="Mobile Phone"
                outlined
                dense
                maxlength="10"
                prepend-inner-icon="mdi-cellphone"
                required
                @keypress="keyFilter.numbersOnly"
                class="input-field"
              ></v-text-field>
              <v-card-actions>
                <v-btn
                  color="primary"
                  @click="saveMobile"
                  class="submit-btn"
                  large
                  :disabled="!isMobileValid"
                  >Save</v-btn
                >
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Edit Password Section -->
        <v-card class="edit-card mt-4" elevation="3" outlined>
          <v-card-title>Change Password</v-card-title>
          <v-card-text>
            <v-form ref="formPassword">
              <!-- New Password -->
              <v-text-field
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

              <!-- Confirm Password -->
              <v-text-field
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

              <v-alert
                border="start"
                border-color="warning"
                elevation="2"
                class="password-requirements"
              >
                <div class="requirement">
                  <v-icon
                    :class="isLengthValid ? 'status-icon-true' : 'status-icon-false'"
                  >
                    mdi-check-circle
                  </v-icon>
                  รหัสผ่านมีความยาวขั้นต่ำ 8 ตัวอักษร
                </div>
                <div class="requirement">
                  <v-icon
                    :class="hasUppercase ? 'status-icon-true' : 'status-icon-false'"
                  >
                    mdi-check-circle
                  </v-icon>
                  มีตัวอักษรพิมพ์ใหญ่
                </div>
                <div class="requirement">
                  <v-icon
                    :class="hasLowercase ? 'status-icon-true' : 'status-icon-false'"
                  >
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
                  <v-icon
                    :class="hasSpecialChar ? 'status-icon-true' : 'status-icon-false'"
                  >
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

              <v-card-actions>
                <v-btn
                  color="primary"
                  :disabled="!isPasswordValid || newPassword !== confirmPassword"
                  @click="submitChangePass"
                  class="submit-btn"
                  large
                  >Save</v-btn
                >
              </v-card-actions>
            </v-form>
          </v-card-text>
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
</template>

<script>
import { UpdateMobile, changePassword, uploadImage } from "@/services/apiService.js";
import loading from "@/components/Loading.vue";
import { useUserStore } from "@/stores/userStore";
import Swal from "sweetalert2";
import keyFilter from "@/utils/keyFilter.js";

export default {
  components: {
    loading,
  },
  name: "ProfilePage",
  data: () => ({
    keyFilter,
    mMobile: "",
    isLoading: false,
    newPassword: "",
    confirmPassword: "",
    showNewPassword: false, // ควบคุมการแสดง/ซ่อนรหัสผ่านในช่อง New Password
    showConfirmPassword: false, // ควบคุมการแสดง/ซ่อนรหัสผ่านในช่อง Confirm Password
    showSnackbar: false,
    msgSnackbar: "",
    snackbarColor: "yellow",
  }),
  setup() {
    const userStore = useUserStore();
    return {
      user: userStore,
    };
  },
  computed: {
    isMobileValid() {
      // เช็คว่าความยาว mMobile เท่ากับ 10 หรือไม่
      return this.mMobile.length === 10;
    },
    avatarUrl() {
      return this.user.pathUrl || require("@/assets/images/No-Image.png");
    },
    formattedMobile() {
      console.log('this.user.mobile', this.user.mobile)
      return this.user.mobile
        ? this.user.mobile.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
        : this.user.mobile;
    },
    maskedMobile: {
      get() {
        return this.mMobile.length === 10
          ? this.mMobile.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
          : this.mMobile;
      },
      set(value) {
        // ลบตัวอักษรที่ไม่ใช่ตัวเลขออกและอัปเดต mMobile
        this.mMobile = value.replace(/\D/g, "").slice(0, 10); // จำกัดความยาวให้ไม่เกิน 10 ตัว
      },
    },
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
    formatPhoneNumber(phone) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    },
    saveMobile() {
      const formattedOldPhone = this.formatPhoneNumber(this.user.mobile);
      const formattedNewPhone = this.formatPhoneNumber(this.mMobile);
      Swal.fire({
        html: `Are you sure you want to change the phone number <br> from <strong>${formattedOldPhone}</strong> to <strong>${formattedNewPhone}</strong>  ?`,
        icon: "warning",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: "#0c80c4",
        cancelButtonColor: "#C0C0C0",
        confirmButtonText: "OK",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          try {
            await UpdateMobile(this.user.samAccount, this.mMobile);
            Swal.fire({
              text: "successfully",
              icon: "success",
              showCancelButton: false,
              allowOutsideClick: false,
              confirmButtonText: "OK",
            }).then(async (result) => {
              if (result.isConfirmed) {
                this.mMobile = "";
                window.location.reload();
              }
            });
          } catch (error) {
            this.timerRunning = false;
            this.showError(error, "red");
            return;
          } finally {
            // ปิดการแสดงผล Loading ในทุกกรณี
            this.isLoading = false;
          }
        }
      });
    },
    async submitChangePass() {
      this.isLoading = true;
      try {
        await changePassword(this.user.samAccount, this.newPassword);
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
  },
};
</script>

<style scoped>
.profile-page {
  padding: 20px;
}

.profile-card,
.edit-card {
  border-radius: 16px;
  padding: 24px;
}

.profile-card {
  background: linear-gradient(135deg, #ffffff, #e8f5fe);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  transform: scale(1.05);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}

.edit-card {
  background: #f9f9f9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.edit-card:hover {
  transform: scale(1.03);
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
}
.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 24px auto;
  border: 4px solid #007fc4;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-picture:hover {
  transform: scale(1.1);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3);
}
.profile-name {
  font-size: 1.6rem;
  font-weight: bold;
  color: #333;
}

.profile-position {
  font-size: 1.2rem;
  font-weight: 500;
  color: #666;
}

.profile-details {
  margin-top: 20px;
}

.detail {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
}

.detail-icon {
  margin-right: 12px;
  color: #007fc4;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.v-card {
  margin-bottom: 16px;
}
.input-field {
  margin-bottom: 20px;
  color: #007fc4 !important;
}

.input-field .v-input__control .v-input__slot:focus-within {
  border-color: #007fc4 !important;
  box-shadow: 0 0 0 3px rgba(0, 127, 196, 0.2);
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
</style>
