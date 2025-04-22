// src/stores/userStore.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    empId: "",
    group: "",
    samAccount: "",
    mobile: "",
    company: "",
    department: "",
    position: "",
    telephone: "",
    isAuthenticated: false, // ใช้ในการตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
    pathUrl: "",
    isUserReady: false, // สถานะผู้ใช้พร้อมหรือไม่
    accessToken: '',
    refreshToken: ''
  }),
  actions: {
    login(userData) {
      // กำหนดค่าข้อมูลของผู้ใช้เมื่อเข้าสู่ระบบ
      this.name = userData.name;
      this.firstName = userData.firstName;
      this.lastName = userData.lastName;
      this.email = userData.email;
      this.empId = userData.empId;
      this.group = userData.group;
      this.samAccount = userData.samAccount;
      this.mobile = userData.mobile;
      this.company = userData.company;
      this.department = userData.department;
      this.position = userData.position;
      this.telephone = userData.telephone;
      this.pathUrl = userData.pathUrl;
      this.isAuthenticated = true;
      this.isUserReady = true; // กำหนดสถานะผู้ใช้พร้อมใช้งานหลังล็อกอิน
      this.accessToken = userData.accessToken;
      this.refreshToken = userData.refreshToken
    },
    logout() {
      // เคลียร์ข้อมูลของผู้ใช้เมื่อออกจากระบบ
      this.$reset(); // ใช้ $reset เพื่อรีเซ็ต state กลับเป็นค่าเริ่มต้น
    },
    setUserReady(status) {
      // กำหนดสถานะผู้ใช้ว่าพร้อมใช้งานหรือไม่
      this.isUserReady = status;
    },
  },
});
