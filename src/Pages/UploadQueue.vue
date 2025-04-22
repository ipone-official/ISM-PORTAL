<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container>
    <!-- ปุ่มสำหรับเปิด dialog เลือกไฟล์ -->
    <v-row dense align="center" justify="space-between">
      <!-- ปุ่มเลือกไฟล์ Excel -->
      <v-col cols="12" sm="4" md="2">
        <v-btn
          color="primary"
          prepend-icon="mdi-file-excel-outline"
          @click="triggerFileInput"
          block
          elevation="2"
        >
          เลือกไฟล์ Excel
        </v-btn>
      </v-col>

      <!-- ปุ่มดาวน์โหลด Template -->
      <v-col cols="12" sm="4" md="2">
        <v-btn
          :href="excelTemplateUrl"
          target="_blank"
          rel="noopener noreferrer"
          color="yellow"
          prepend-icon="mdi-download"
          block
          elevation="2"
        >
          ดาวน์โหลดไฟล์ Template
        </v-btn>
      </v-col>
    </v-row>
    <!-- แสดงชื่อไฟล์ที่เลือก และปุ่มล้างไฟล์ -->
    <div v-if="selectedFile" class="file-info mt-3">
      <v-icon color="blue" size="24">mdi-file-excel</v-icon>
      <span class="file-name">{{ selectedFile.name }}</span>
      <v-btn icon variant="text" color="red" @click="clearFile">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- ซ่อน v-file-input แต่ใช้ ref เพื่อ trigger -->
    <v-file-input
      ref="fileInputRef"
      accept=".xlsx, .xls"
      style="display: none"
      @change="handleFileUpload"
    />
    <v-row dense v-if="iExcelFile.length !== 0">
      <v-col>
        <v-btn color="success" class="fab" large absolute bottom right @click="submit">
          <v-icon>mdi-plus</v-icon>บันทึก
        </v-btn>
      </v-col>
    </v-row>
    <v-row dense align="center" justify="start" class="mt-3">
      <!-- ตารางข้อมูล -->
      <v-data-table
        :headers="headers"
        :items="iExcelFile"
        class="data-table"
        dense
        rounded
      >
        <template v-slot:item.actions="{ item }">
          <v-tooltip text="ลบรายการ" location="bottom" color="red" text-color="white">
            <template v-slot:activator="{ props }">
              <v-btn icon variant="text" v-bind="props" @click="deleteItem(item)">
                <v-icon color="red">mdi-delete-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-row>

    <loading :isLoading="isLoading" />
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx"; // นำเข้า SheetJS
import { useUserStore } from "@/stores/userStore";
import loading from "@/components/Loading.vue";
import { RegisterPlanQueue } from "@/services/apiTruckQueue.js";
import Swal from "sweetalert2";

const userStore = useUserStore();
const isLoading = ref(false);
const iExcelFile = ref([]);
const selectedFile = ref(null);
const fileInputRef = ref(null);
const excelTemplateUrl =
  "https://portal.ip-one.com/Web-TruckQueue/datasource/templateUploadQueue.xlsx";

const headers = [
  { title: "ลำดับ", align: "left", key: "index" },
  { title: "เลขที่คิวรถ", align: "left", key: "queueID" },
  { title: "เลขที่ผู้ขาย", align: "left", key: "vendorID" },
  { title: "เลขที่คำสั่งซื้อ", align: "left", key: "purchaseOrderNo" },
  { title: "วันที่ส่งสินค้า", align: "left", key: "deliveryDate" },
  { title: "เวลาส่งสินค้า", align: "left", key: "startTime" },
  { title: "เวลาสื้นสุดส่งสินค้า", align: "left", key: "endTime" },
  { title: "Actions", align: "left", key: "actions" },
];

// 📌 ฟังก์ชันเปิดหน้าต่างเลือกไฟล์
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.$el.querySelector("input").click();
  }
};

// 📌 ฟังก์ชันล้างไฟล์
const clearFile = () => {
  selectedFile.value = null;
  iExcelFile.value = [];
};

// 📌 ฟังก์ชันอัปโหลดไฟล์ Excel และแปลงเป็น JSON
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // รีเซ็ตค่า input file เพื่อให้สามารถเลือกไฟล์เดิมได้อีกครั้ง
  event.target.value = null;

  selectedFile.value = file;
  isLoading.value = true;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0]; // ใช้ชีตแรก
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // 🔸 กรองเฉพาะแถวที่ข้อมูลครบ 3 ช่อง
    const validData = jsonData.filter(
      (item) => item["purchaseOrderNo"] && item["startTime"] && item["endTime"]
    );

    iExcelFile.value = validData.map((item, index) => ({
      index: index + 1,
      queueID: item["queueID"] || "",
      vendorID: item["vendorID"] || "",
      purchaseOrderNo: item["purchaseOrderNo"] || "",
      deliveryDate: item["deliveryDate"] || "",
      startTime: formatTime(item["startTime"]),
      endTime: formatTime(item["endTime"]),
    }));

    isLoading.value = false;
  };

  reader.readAsArrayBuffer(file);
};
// 📌 ฟังก์ชันแปลงเวลาให้อยู่ในรูปแบบ HH:mm
const formatTime = (timeValue) => {
  if (!timeValue) return "";

  // 🔹 ถ้า Excel ส่งค่ามาเป็นตัวเลข (เช่น 0.3125)
  if (typeof timeValue === "number") {
    const excelEpoch = new Date(1899, 11, 30); // Excel เริ่มที่ 1899-12-30
    const jsTimestamp = excelEpoch.getTime() + Math.round(timeValue * 86400000); // ใช้ Math.round() เพื่อป้องกันค่าคลาดเคลื่อน
    const jsDate = new Date(jsTimestamp);

    return jsDate.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  }

  return timeValue; // คืนค่าเดิมถ้าไม่ใช่ number
};

// 📌 ฟังก์ชันลบข้อมูลจากตาราง
const deleteItem = (item) => {
  Swal.fire({
    html: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการส่งของ<br>วันที่ ${item.deliveryDate} เวลา ${item.startTime} - ${item.endTime} น.
    <br>เลขที่ผู้ขาย ${item.vendorID}`,
    icon: "warning",
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonText: "OK",
  }).then(async (result) => {
    if (result.isConfirmed) {
      iExcelFile.value = iExcelFile.value.filter((i) => i !== item);
    }
  });
};

const submit = async () => {
  // ตรวจสอบว่ามีข้อมูลหรือไม่
  if (!iExcelFile.value || iExcelFile.value.length === 0) {
    console.log("ไม่มีข้อมูลใน iExcelFile");
    return;
  }

  // แปลง iExcelFile ให้เป็น array ของ models
  const models = iExcelFile.value.map((item) => ({
    queueID: item.queueID,
    vendorID: item.vendorID.toString(),
    purchaseOrderNo: item.purchaseOrderNo.toString(),
    deliveryDate: formatDate(item.deliveryDate),
    startTime: item.startTime,
    endTime: item.endTime,
    remark: "",
    createBy: userStore.empId,
  }));

  isLoading.value = true;
  try {
    await RegisterPlanQueue(models);
    Swal.fire({
      html: `บันทึกรายการสำเร็จ`,
      icon: "success",
      showCancelButton: false,
      allowOutsideClick: false,
      confirmButtonText: "OK",
      didOpen: () => {
        document.querySelector(".swal2-confirm").style.color = "white";
      },
    }).then((result) => {
      if (result.isConfirmed) {
        clearFile();
      }
    });
  } catch (error) {
    console.error("Error RegisterPlanQueue:", error);
  } finally {
    isLoading.value = false;
  }
};
const formatDate = (dateStr) => {
  const [day, month, year] = dateStr.split(".");
  return `${year}${month}${day}`;
};
</script>

<style scoped>
/* Table Styles */
.data-table {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-table .v-data-table-header th {
  background: linear-gradient(90deg, #007fc4, #005f9c);
  color: white;
  font-weight: bold;
  text-align: left;
}

::v-deep(.v-data-table__th) {
  background: linear-gradient(
    90deg,
    rgba(0, 127, 196, 1) 0%,
    rgba(0, 127, 196, 1) 35%,
    rgba(0, 127, 196, 1) 100%
  ) !important;
  color: white !important;
}

::v-deep(.data-table td, .data-table th) {
  text-align: left !important; /* บังคับข้อความให้ชิดซ้าย */
  vertical-align: middle !important; /* จัดให้อยู่ตรงกลางแนวตั้ง */
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f3f7ff, #e3eafc);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}

.file-info:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.file-name {
  flex-grow: 1;
  font-weight: 500;
  color: #333;
  font-size: 16px;
}

.v-icon {
  transition: transform 0.3s ease-in-out;
}

.v-icon:hover {
  transform: scale(1.1);
}

.fab {
  color: white !important;
  bottom: -13px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2) !important;
  z-index: 100 !important;
}
.fab:hover {
  background-color: #007fc4 !important; /* สีเหลืองเข้มเมื่อ hover */
}
.custom-confirm-button {
  color: white !important; /* เปลี่ยนสีตัวอักษรเป็นสีขาว */
  background-color: #3085d6 !important; /* สีพื้นหลังปุ่ม */
  border-color: #3085d6 !important; /* สีขอบปุ่ม */
}
</style>
