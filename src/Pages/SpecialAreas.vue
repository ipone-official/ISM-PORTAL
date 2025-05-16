<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container>
    <v-row dense align="center" justify="space-start" class="filter-row">
      <v-col cols="8" sm="3">
        <CustomDatepicker
          v-model="dateStart"
          label="วันที่เริ่มสร้าง"
          class="filter-select input-field"
          :minOffset="-30"
          :maxOffset="30"
          :disabled="sDisabledDate"
        />
      </v-col>
      ถึง
      <v-col cols="8" sm="3">
        <CustomDatepicker
          v-model="dateEnd"
          label="วันที่สิ้นสุด"
          class="filter-select input-field"
          :minOffset="-30"
          :maxOffset="30"
          :disabled="sDisabledDate"
        />
      </v-col>
      <v-tooltip top color="teal" v-if="!sDisabledDate">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            color="#007fc4"
            dark
            class="ma-2 small-export-button"
            v-bind="attrs"
            v-on="on"
            @click="searchSpecialAreas"
          >
            <v-icon size="20">mdi-magnify</v-icon>
          </v-btn>
        </template>
        <span>Search</span>
      </v-tooltip>
      <v-tooltip top color="teal" v-else-if="sDisabledDate">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            color="red"
            dark
            class="ma-2 small-export-button"
            v-bind="attrs"
            v-on="on"
            @click="closeSpecialAreas"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </template>
        <span>Close Search</span>
      </v-tooltip>
    </v-row>
    <v-row
      dense
      align="center"
      justify="space-around"
      class="filter-row"
      v-if="sDisabledDate"
    >
      <v-col cols="12" sm="3" md="3" class="filter-col mb-3">
        <v-autocomplete
          v-model="mFilterStatus"
          :items="iFilterStatus"
          label="สถานะ"
          item-title="display"
          item-value="key"
          outlined
          dense
          class="filter-select input-field custom-autocomplete"
          return-object
          multiple
          :color="'primary'"
          active-class="custom-active-class"
        />
      </v-col>

      <v-col cols="12" sm="4" md="3" class="filter-col mb-3">
        <v-autocomplete
          v-model="mFilterAccount"
          :items="iFilterAccount"
          label="ชื่อผู้สร้าง"
          item-title="display"
          item-value="key"
          outlined
          dense
          class="filter-select input-field custom-autocomplete"
          return-object
          multiple
          :color="'primary'"
          active-class="custom-active-class"
        />
      </v-col>

      <v-col cols="12" sm="4" md="5" class="filter-col mb-3">
        <v-text-field
          v-model="mSearch"
          label="Search"
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          class="search-bar input-field"
        />
      </v-col>
    </v-row>
    <v-row dense align="center" justify="end" class="filter-row" v-if="sDisabledDate">
      <v-col cols="auto" class="filter-col" v-if="selected.length != 0">
        <v-btn
          fab
          small
          color="primary"
          dark
          class="ma-1 small-export-button"
          v-bind="attrs"
          v-on="on"
          @click="confirmSpecialAreas"
        >
          <v-icon size="25">mdi-ticket-confirmation-outline</v-icon>
          ยืนยันพื้นที่พิเศษ
        </v-btn>
        <v-btn
          fab
          small
          color="green"
          dark
          class="ma-1 small-export-button"
          v-bind="attrs"
          v-on="on"
          @click="exportFileExcel"
        >
          <v-icon size="25">mdi-microsoft-excel</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- ตารางข้อมูล -->
    <v-data-table
      :headers="headers"
      :items="filteredReservations"
      :search="mSearch"
      class="data-table mt-5"
      dense
      rounded
      v-model="selected"
      show-select
      item-value="saID"
    >
      <template v-slot:top>
        <v-container
          fluid
          class="pa-3"
          style="background-color: #ffca28; border-radius: 16px"
        >
          <v-row align="center" dense>
            <v-col cols="12" class="text-center font-weight-bold text-h6 centered-title">
              รายการพื้นที่พิเศษ
            </v-col>
            <v-col
              cols="12"
              class="d-flex justify-end align-center"
              style="margin-top: -1.2rem"
            >
              <div
                class="rounded-pill px-4 py-1 font-weight-bold text-white text-body-2"
                style="background-color: #0288d1"
              >
                รวมทั้งหมด: {{ formatNumber(totalPriceSum) }} บาท
              </div>
              <v-btn icon variant="text" @click="searchSpecialAreas">
                <v-icon color="white">mdi-refresh</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </template>

      <!-- <template v-slot:item.specialDate="{ item }">
        <div>{{ item.specialDate ? formatDate(item.specialDate) : "-" }}</div>
      </template> -->

      <template v-slot:item.saID="{ item }">
        <div
          style="color: #007fc4; font-weight: bold; cursor: pointer"
          @click="editItem(item)"
        >
          {{ item.saID }}
        </div>
      </template>

      <template v-slot:item.totalPrice="{ item }">
        <div>
          {{ formatNumber(item.totalPrice) }}
        </div>
      </template>
      <template v-slot:item.status="{ item }">
        <div>{{ item.status ? getStatusLabel(item.status) : "-" }}</div>
      </template>

      <template v-slot:item.imagePathUrl="{ item }">
        <img
          v-if="item.imagePathUrl"
          :src="item.imagePathUrl"
          class="preview-image clickable"
          @click="openImage(item.imagePathUrl)"
        />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip
          text="แก้ไขและดูรายละเอียด"
          location="bottom"
          color="primary"
          text-color="white"
        >
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" v-bind="props" @click="editItem(item)">
              <v-icon color="primary">mdi-storefront-edit-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip
          v-if="canShowButtonDelete(item.status)"
          text="ลบรายการ"
          location="bottom"
          color="red"
          text-color="white"
        >
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" v-bind="props" @click="deleteItem(item)">
              <v-icon color="red">mdi-delete-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table>
    <v-row class="d-flex justify-center">
      <v-btn
        color="primary"
        large
        elevation="6"
        class="rounded-xl text-white font-weight-bold px-8 py-2 transition"
        @click="createSpecialAreas"
      >
        <v-icon left>mdi-plus</v-icon> เพิ่ม
      </v-btn>
    </v-row>
    <v-dialog v-model="dialog" persistent max-width="1920px">
      <v-card class="dialog-card">
        <!-- Header -->
        <v-card-title class="dialog-header">
          <span class="dialog-title"
            >✨ {{ flagCreate ? "เพิ่มพื้นที่พิเศษ" : "ข้อมูลพื้นที่พิเศษ" }} ✨</span
          >
          <v-btn icon @click="resetForm" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <!-- Form Content -->
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <!-- Row 1 -->
            <v-row justify="end" align="center" v-if="selectSpecialArea.length != 0">
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    เลขที่พื้นที่พิเศษ : {{ selectSpecialArea.saID }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-row
              justify="space-around"
              align="center"
              v-if="selectSpecialArea.length != 0"
            >
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    สร้างโดย : {{ selectSpecialArea.createdName }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    วันที่สร้าง :
                    {{
                      selectSpecialArea.createdDate
                        ? formatDateTime(selectSpecialArea.createdDate)
                        : ""
                    }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3" v-show="selectSpecialArea.updatedName">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    {{
                      selectSpecialArea.status == "CONFIRMED"
                        ? "อนุมัติโดย :"
                        : "แก้ไขโดย :"
                    }}
                    {{ selectSpecialArea.updatedName }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3" v-show="selectSpecialArea.updatedDate">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    {{
                      selectSpecialArea.status == "CONFIRMED"
                        ? "วันที่อนุมัติ :"
                        : "วันที่แก้ไข :"
                    }}

                    {{
                      selectSpecialArea.updatedDate
                        ? formatDateTime(selectSpecialArea.updatedDate)
                        : ""
                    }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                sm="4"
                md="2"
                class="filter-col"
                style="margin-top: -0.5rem"
              >
                <CustomDatepicker
                  v-model="dateSpecial"
                  label="วันที่"
                  class="filter-select input-field"
                  :minOffset="-30"
                  :maxOffset="0"
                  :disabled="!canEditData()"
                />
              </v-col>
              <v-col cols="12" sm="4" md="3" class="filter-col">
                <v-autocomplete
                  v-model="mBranch"
                  :items="iBranch"
                  item-title="display"
                  item-value="soldto"
                  outlined
                  dense
                  class="filter-select input-field"
                  return-object
                  :readonly="!canEditData()"
                >
                  <template v-slot:label>
                    <span style="color: red">*</span> ห้าง/สาขา
                  </template></v-autocomplete
                >
              </v-col>
              <v-col cols="12" sm="4" md="3" class="filter-col">
                <v-autocomplete
                  v-model="mMaterial"
                  :items="iMaterial"
                  item-title="display"
                  item-value="materialCode"
                  outlined
                  dense
                  class="filter-select input-field"
                  return-object
                  :readonly="!canEditData()"
                  ><template v-slot:label>
                    <span style="color: red">*</span> ชื่อผลิตภัณฑ์
                  </template></v-autocomplete
                >
              </v-col>

              <v-col cols="12" sm="4" md="3" class="filter-col">
                <v-autocomplete
                  v-model="mSpecialArea"
                  :items="iSpecialArea"
                  item-title="display"
                  item-value="specialAreaID"
                  outlined
                  dense
                  class="filter-select input-field"
                  return-object
                  :readonly="!canEditData()"
                  ><template v-slot:label>
                    <span style="color: red">*</span> พื้นที่พิเศษ
                  </template></v-autocomplete
                >
              </v-col>
              <v-col cols="12" sm="4" md="1" class="filter-col">
                <v-text-field
                  v-model="mQuantity"
                  outlined
                  dense
                  class="input-field"
                  maxlength="2"
                  @keydown="keyFilter.numbersOnly"
                  :readonly="!canEditData()"
                  ><template v-slot:label>
                    <span style="color: red">*</span> จำนวน
                  </template></v-text-field
                >
              </v-col>

              <v-col cols="12" sm="12" md="12" class="filter-col">
                <v-textarea
                  v-model="mLocationDesc"
                  rows="2"
                  maxlength="255"
                  variant="outlined"
                  class="filter-select input-field"
                  auto-grow
                  :readonly="!canEditData()"
                  ><template v-slot:label>
                    <span style="color: red">*</span> สถานที่จัดงาน
                  </template></v-textarea
                >
              </v-col>
              <v-col cols="12" sm="12" md="12" class="filter-col">
                <v-file-input
                  v-model="selectedFile"
                  accept="image/*"
                  show-size
                  prepend-icon="mdi-camera"
                  variant="outlined"
                  density="comfortable"
                  class="file-input-minimal input-field"
                  color="primary"
                  rounded
                  v-if="canEditData()"
                  ><template v-slot:label> เลือกรูปภาพ </template></v-file-input
                >

                <!-- แสดง preview รูป -->
                <div v-if="imagePreview" class="my-4 text-center">
                  <img :src="imagePreview" class="preview-image-fixed" alt="Preview" />
                </div>
              </v-col>
            </v-row>
          </v-form>
          <v-row class="d-flex justify-center" v-if="canEditData()">
            <v-btn
              color="success"
              large
              elevation="6"
              class="rounded-xl text-white font-weight-bold px-8 py-2 transition mt-5"
              @click="submitForm"
            >
              <v-icon left>mdi-check-circle-outline</v-icon> บันทึก
            </v-btn>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end mt-4">
          <v-btn
            color="red-darken-1"
            variant="flat"
            class="rounded-pill"
            @click="resetForm()"
          >
            ปิด
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogShowImage" max-width="700">
      <v-card class="rounded-xl elevation-10 pa-4">
        <div class="text-center">
          <v-img
            v-if="selectedImageUrl"
            :src="selectedImageUrl"
            alt="preview"
            style="
              max-height: 500px;
              max-width: 100%;
              object-fit: contain;
              border-radius: 12px;
            "
          />
          <p v-else class="text-error">ไม่พบรูปภาพ</p>
        </div>

        <v-card-actions class="justify-end mt-4">
          <v-btn
            color="red-darken-1"
            variant="flat"
            class="rounded-pill"
            @click="dialogShowImage = false"
          >
            ปิด
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="showSnackbar"
      :timeout="3000"
      :color="snackbarColor"
      rounded="pill"
      class="text-center"
    >
      {{ msgSnackbar }}
    </v-snackbar>
    <loading :isLoading="isLoading" />
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import loading from "@/components/Loading.vue";
import CustomDatepicker from "@/components/CustomDatepicker.vue";
import keyFilter from "@/utils/keyFilter.js";
import {
  gMasterSperialAreas,
  gMasterCustomers,
  gMasterMaterial,
  pInsertSpecialAreas,
  gTransactionSpecialAreas,
  pDeleteSaIdFileName,
  pUpdateStatusSpecialAreas,
} from "@/services/apiISM";
import Swal from "sweetalert2";
import XlsxPopulate from "xlsx-populate";
import heic2any from 'heic2any'

const userStore = useUserStore();
// ดึง groups จาก userStore
const userGroups = computed(() => userStore.group || []);

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

const mapRole = (userRoles = []) => {
  return rolesPriority.find((role) => userRoles.includes(role)) || null;
};

const determineFetchData = (userGroups, userStore) => {
  const role = mapRole(userGroups);

  let data;
  if (role === "ISM_ADMIN" || role === "ISM_MANAGER") {
    data = "ALL";
  } else if (role?.startsWith("ISM_SUPERVISOR")) {
    // data = role.split("_").pop();
    data = role;
  } else {
    data = userStore.empId;
  }
  return data;
};
const selected = ref([]);
const isLoading = ref(false);
const sDisabledDate = ref(false);
const selectedFile = ref(null);
const imagePreview = ref(null);
const flagCreate = ref(false);
const dialog = ref(false);
const selectSpecialArea = ref([]);
const mSpecialArea = ref(null);
const iSpecialArea = ref([]);
const mMaterial = ref(null);
const iMaterial = ref([]);
const mQuantity = ref(null);
const mBranch = ref(null);
const iBranch = ref([]);
const mLocationDesc = ref(null);
const showSnackbar = ref(false);
const msgSnackbar = ref("");
const snackbarColor = ref("success");
const rawReservations = ref([]);
const mSearch = ref(null);
const mFilterStatus = ref(null);
const mFilterAccount = ref([]);

// ฟังก์ชันแปลงวันที่เป็น yyyyMMdd
const getFirstDayOfMonth = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  return `${yyyy}${mm}01`;
};

const getTodayYYYYMMDD = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

// สร้าง preview จากไฟล์ที่เลือก
watch(selectedFile, async (file) => {
  const selected = Array.isArray(file) ? file[0] : file
  if (!selected) return

  const ext = selected.name.toLowerCase()
  const isHeif = ext.endsWith('.heic') || ext.endsWith('.heif')

  try {
    if (isHeif) {
      const convertedBlob = await heic2any({
        blob: selected,
        toType: 'image/jpeg',
        multiple: false
      })
      imagePreview.value = URL.createObjectURL(convertedBlob)
    } else {
      imagePreview.value = URL.createObjectURL(selected)
    }
  } catch (error) {
    console.error('แปลง HEIC/HEIF ล้มเหลว:', error)
    imagePreview.value = null
  }
})

const formatDateTime = (input) => {
  const datePart = input.substring(0, 8);
  const timePart = input.substring(9, 14);

  const year = datePart.substring(0, 4);
  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);

  return `${day}/${month}/${year} ${timePart}`;
};

const formatDate = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "Invalid Date";
  const year = yyyymmdd.substring(0, 4);
  const month = yyyymmdd.substring(4, 6);
  const day = yyyymmdd.substring(6, 8);
  return `${day}/${month}/${year}`;
};

// ✅ ตั้งค่าให้เป็นวันที่ 01 ของเดือนปัจจุบัน
const dateStart = ref(getFirstDayOfMonth());
const dateEnd = ref(getTodayYYYYMMDD());
const dateSpecial = ref(getTodayYYYYMMDD());

const headers = [
  { title: "เลขที่", align: "left", key: "saID" },
  { title: "วันที่สร้าง", align: "left", key: "formattedDate" },
  { title: "สาขา/ห้าง", align: "left", key: "branchName" },
  { title: "จังหวัด", align: "left", key: "province" },
  { title: "ชื่อผลิตภัณฑ์", align: "left", key: "productName" },
  { title: "พื้นที่พิเศษ", align: "left", key: "itemTypes" },
  { title: "จำนวน", align: "left", key: "quantity" },
  { title: "จำนวนเงิน", align: "left", key: "totalPrice" },
  { title: "สถานที่จัด", align: "left", key: "locationDesc" },
  { title: "รูปภาพ", align: "left", key: "imagePathUrl" },
  { title: "สถานะ", align: "left", key: "status" },
  { title: "ดำเนินการ", align: "left", key: "actions" },
];

const resetForm = () => {
  dialog.value = false;
  selectedFile.value = null;
  imagePreview.value = null;
  flagCreate.value = false;
  selectSpecialArea.value = [];
  mSpecialArea.value = null;
  mMaterial.value = null;
  mQuantity.value = null;
  mBranch.value = null;
  mLocationDesc.value = null;
  selected.value = [];
};

function formatNumber(value) {
  const num = parseFloat(value);
  return isNaN(num)
    ? "-"
    : num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
}

const createSpecialAreas = () => {
  dialog.value = true;
  flagCreate.value = true;
};

const fetchMasterSperialAreas = async () => {
  isLoading.value = true;
  try {
    const response = await gMasterSperialAreas();
    iSpecialArea.value = response.results.map((item) => ({
      ...item,
      display: `${item.itemTypes} (${item.itemDesc})`,
    }));
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
};
const fetchMasterMaterial = async () => {
  isLoading.value = true;
  try {
    const response = await gMasterMaterial();
    iMaterial.value = response.results.map((item) => ({
      ...item,
      display: `${item.materialCode} - ${item.materialDescriptionTh}`,
    }));
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchMasterCustomers = async (data) => {
  isLoading.value = true;
  try {
    const response = await gMasterCustomers(data);
    iBranch.value = response.results.map((item) => ({
      ...item,
      display: `${item.soldto} - ${item.branch}`,
    }));
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
};

const searchSpecialAreas = async () => {
  isLoading.value = true;
  sDisabledDate.value = true;
  try {
    const dataForArea = determineFetchData(userGroups.value, userStore);
    const response = await gTransactionSpecialAreas({
      startDate: dateStart.value,
      endDate: dateEnd.value,
      empBy: dataForArea,
    });
   // 🆕 เพิ่มขั้นตอน map และ format date
   rawReservations.value = response.results.map((item) => ({
      ...item,
      formattedDate: item.specialDate ? formatDate(item.specialDate) : "-"
    }));
  } catch (error) {
    console.error("❌ Error loading TSpecialAreas:", error);
  } finally {
    isLoading.value = false;
  }
};
const canShowButtonDelete = (status) => {
  const isAdmin = ["ISM_ADMIN", "ISM_MANAGER"].some((role) =>
    userGroups.value.includes(role)
  );
  return isAdmin || status !== "CONFIRMED";
};

const canEditData = () => {
  if (flagCreate.value) return true;
  if (!selectSpecialArea.value) return false;

  const status = selectSpecialArea.value.status;
  const userRoles = userGroups.value;

  const isAdmin = userRoles.includes("ISM_ADMIN");
  const isManager = userRoles.includes("ISM_MANAGER");

  if (isAdmin) {
    return true; // แก้ไขได้เสมอ
  }

  if (isManager) {
    return status !== "CONFIRMED"; // แก้ไขได้ถ้าไม่ใช่ CONFIRMED
  }

  return status === "REGISTER"; // คนทั่วไป แก้ไขได้เฉพาะตอน REGISTER
};

const closeSpecialAreas = async () => {
  resetForm();
  sDisabledDate.value = false;
  rawReservations.value = [];
  mFilterStatus.value = [];
  mFilterAccount.value = [];
  mSearch.value = "";
};
const dialogShowImage = ref(false);
const selectedImageUrl = ref("");

const openImage = (url) => {
  selectedImageUrl.value = url;
  dialogShowImage.value = true;
};
const showSnackbars = (message, color = "yellow") => {
  msgSnackbar.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};


const submitForm = async () => {
 
  if (!mBranch.value) {
    return showSnackbars("กรุณาเลือกห้าง / สาขา");
  }
  if (!mMaterial.value) {
    return showSnackbars("กรุณาเลือกชื่อผลิตภัณฑ์");
  }
  if (!mSpecialArea.value) {
    return showSnackbars("กรุณาเลือกชื่อพื้นที่พิเศษ");
  }
  if (!mQuantity.value) {
    return showSnackbars("กรุณาระบุจำนวน");
  }
  if (!mLocationDesc.value) {
    return showSnackbars("กรุณาระบุสถานที่จัดงาน");
  }
  if (!mLocationDesc.value) {
    return showSnackbars("กรุณาระบุสถานที่จัดงาน");
  }
  const isChangeImage = Boolean(selectSpecialArea.value && selectedFile.value);
  if (!isChangeImage && flagCreate.value) {
    return showSnackbars("กรุณาเลือกรูปภาพ");
  }
  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("files", selectedFile.value);
    formData.append(
      "saID",
      selectSpecialArea.value.length == 0 ? "" : selectSpecialArea.value.saID
    );
    formData.append("specialDate", dateSpecial.value);
    formData.append("branchCode", mBranch.value.soldto);
    formData.append("branchName", mBranch.value.branch);
    formData.append("province", mBranch.value.province);
    formData.append("productCode", mMaterial.value.materialCode);
    formData.append("productName", mMaterial.value.materialDescriptionTh);
    formData.append("sizeDimension", mMaterial.value.hgLv7);
    formData.append("specialAreaID", mSpecialArea.value.specialAreaID);
    formData.append("itemTypes", mSpecialArea.value.itemTypes);
    formData.append("quantity", Number(mQuantity.value));
    formData.append("locationDesc", mLocationDesc.value);
    formData.append(
      "imageFileName",
      selectSpecialArea.value.length != 0 ? selectSpecialArea.value.imageFileName : ""
    );
    formData.append("empBy", userStore.empId);
    formData.append("flagChangeImage", isChangeImage ? "true" : "false");
    formData.append("ismArea", mBranch.value.ismArea);

    const response = await pInsertSpecialAreas(formData);
    dialog.value = false;
    Swal.fire({
      icon: "success",
      title: "บันทึกรายการสำเร็จ 🎉",
      html: `เลขที่พื้นที่พิเศษ <strong>"${response.results}"</strong>`,
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#007fc4",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        document.querySelector(".swal2-confirm").style.color = "white";
      },
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm();
        searchSpecialAreas();
      }
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด!",
      text: "บันทึกรายการไม่สำเร็จ กรุณาลองใหม่",
      confirmButtonColor: "#007fc4",
      didOpen: () => {
        document.querySelector(".swal2-confirm").style.color = "white";
      },
    }).then(() => {
      dialog.value = true; // ✅ เปิด dialog อีกครั้งเมื่อเกิด error แล้วกด OK
    });
  } finally {
    isLoading.value = false;
  }
};

const iFilterAccount = computed(() => {
  const accountMap = new Map();

  rawReservations.value.forEach((item) => {
    if (item.createdBy && item.createdName) {
      accountMap.set(item.createdBy, item.createdName);
    }
  });

  return Array.from(accountMap, ([key, name]) => ({
    key,
    display: `${name} (${key})`,
  }));
});

function getStatusLabel(status) {
  const statusLabelMap = {
    REGISTER: "ลงทะเบียน",
    CONFIRMED: "ยืนยันแล้ว",
  };
  return statusLabelMap[status] || status; // ถ้าไม่มี label ก็คืนค่าต้นฉบับ
}

const statusLabelMap = {
  REGISTER: "ลงทะเบียน",
  CONFIRMED: "ยืนยันแล้ว",
};

const iFilterStatus = computed(() => {
  const statusMap = new Map();

  rawReservations.value.forEach((item) => {
    if (item.status) {
      statusMap.set(item.status, statusLabelMap[item.status] || item.status); // ✅ แปลงชื่อเป็นไทย
    }
  });

  return Array.from(statusMap, ([key, display]) => ({
    key,
    display,
  }));
});

const selectedStatusKeys = computed(() =>
  Array.isArray(mFilterStatus.value) ? mFilterStatus.value.map((i) => i.key) : []
);
const selectedAccountKeys = computed(() =>
  Array.isArray(mFilterAccount.value) ? mFilterAccount.value.map((i) => i.key) : []
);

const filteredReservations = computed(() => {
  return rawReservations.value.filter((item) => {
    const matchStatus =
      selectedStatusKeys.value.length === 0 ||
      selectedStatusKeys.value.includes(item.status);

    const matchAccount =
      selectedAccountKeys.value.length === 0 ||
      selectedAccountKeys.value.includes(item.createdBy);

    return matchStatus && matchAccount;
  });
});

const totalPriceSum = computed(() => {
  return filteredReservations.value.reduce((sum, item) => {
    const price = parseFloat(item.totalPrice);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);
});

const selectedItems = () => {
  return rawReservations.value.filter((item) => selected.value.includes(item.saID));
};

const confirmSpecialAreas = () => {
  const data = selectedItems();
  const confirmedItems = data.filter((item) => item.status === "REGISTER");

  if (confirmedItems.length === 0) {
    Swal.fire({
      html: `ไม่พบรายการที่สามารถยืนยันได้ <br/>เลือกเฉพาะรายการที่สถานะ <strong>"ลงทะเบียน"</strong> เท่านั้น`,
      icon: "warning",
      showCancelButton: false,
      allowOutsideClick: false,
      confirmButtonText: "OK",
      didOpen: () => {
        document.querySelector(".swal2-confirm").style.color = "white";
      },
    });
    return;
  }

  Swal.fire({
    html: `คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะเป็น <strong>"ยืนยันแล้ว"</strong><br/>`,
    icon: "warning",
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonText: "OK",
    didOpen: () => {
      document.querySelector(".swal2-confirm").style.color = "white";
      document.querySelector(".swal2-cancel").style.color = "white";
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        // 🔁 map รายการที่ผ่านเงื่อนไข เพื่อเตรียมข้อมูลส่งไป backend
        const payload = confirmedItems.map((item) => ({
          saId: item.saID,
          updatedBy: userStore.empId,
          status: "CONFIRMED",
        }));

        await pUpdateStatusSpecialAreas(payload);

        Swal.fire({
          html: `เปลี่ยนสถานะสำเร็จ 🎉`,
          icon: "success",
          confirmButtonText: "OK",
          didOpen: () => {
            document.querySelector(".swal2-confirm").style.color = "white";
          },
        }).then((result) => {
          if (result.isConfirmed) {
            resetForm();
            searchSpecialAreas();
          }
        });
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนสถานะข้อมูลได้", "error");
      } finally {
        isLoading.value = false;
      }
    }
  });
};
const formatDateConvert = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${day}.${month}.${year}`;
};
const exportFileExcel = async () => {
  const data = selectedItems();
  // ✅ แปลงวันที่
  const formattedData = data.map((item) => [
    item.saID,
    formatDateConvert(item.specialDate),
    item.branchName,
    item.province,
    item.productName,
    // item.sizeDimension,
    item.itemTypes,
    item.quantity,
    item.totalPrice,
    item.locationDesc,
    item.status,
    item.ismArea,
    item.createdName,
    item.createdBy
  ]);

  const header = [
    "saID",
    "specialDate",
    "branchName",
    "province",
    "productName",
    // "sizeDimension",
    "itemTypes",
    "quantity",
    "totalPrice",
    "locationDesc",
    "status",
    "ismArea",
    "createdName",
    "employeeId"
  ];

  const wb = await XlsxPopulate.fromBlankAsync();
  const sheet = wb.sheet(0);
  sheet.name("Exported");

  // ✅ เขียนหัวตาราง
  header.forEach((title, i) => {
    const cell = sheet.cell(1, i + 1);
    cell.value(title).style({
      fill: "007fc4",
      bold: true,
      fontColor: "ffffff",
      horizontalAlignment: "center",
      border: true,
    });
  });

  // ✅ เขียนข้อมูล
  formattedData.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = sheet.cell(rowIndex + 2, colIndex + 1);
      cell.value(value).style({
        border: true,
        horizontalAlignment: "left",
      });
    });
  });

  // ✅ ปรับความกว้างคอลัมน์อัตโนมัติ
  sheet.usedRange().autoFilter(); // optional: เพิ่ม filter
  header.forEach((_, colIndex) => {
    let maxLength = header[colIndex].length;

    formattedData.forEach((row) => {
      const cellValue = row[colIndex];
      if (cellValue) {
        maxLength = Math.max(maxLength, cellValue.toString().length);
      }
    });

    sheet.column(colIndex + 1).width(Math.min(maxLength * 1.2, 50)); // ✅ ความกว้างตามเนื้อหา
  });

  // ✅ Export
  const blob = await wb.outputAsync();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Exported_SpecialAreas.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const editItem = (item) => {
  selectSpecialArea.value = item;
  dateSpecial.value = item.specialDate;
  mBranch.value = {
    soldto: item.branchCode,
    display: `${item.branchCode} - ${item.branchName}`,
    branch: item.branchName,
    ismArea: item.ismArea,
    province: item.province,
  };
  mMaterial.value = {
    materialCode: item.productCode,
    display: `${item.productCode} - ${item.productName}`,
    materialDescriptionTh: item.productName,
    hgLv7: item.sizeDimension,
  };
  const filterSpecialArea = iSpecialArea.value.find(
    (area) => area.specialAreaID === item.specialAreaID
  );
  mSpecialArea.value = {
    specialAreaID: filterSpecialArea.specialAreaID,
    display: `${filterSpecialArea.itemTypes} (${filterSpecialArea.itemDesc})`,
    itemTypes: filterSpecialArea.itemTypes,
  };
  mQuantity.value = item.quantity;
  mLocationDesc.value = item.locationDesc;
  imagePreview.value = item.imagePathUrl;
  dialog.value = true;
};
const deleteItem = (item) => {
  Swal.fire({
    html: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการพื้นที่พิเศษ <br/> เลขที่ <strong>"${item.saID}"</strong> ?`,
    icon: "warning",
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonText: "OK",
    didOpen: () => {
      document.querySelector(".swal2-confirm").style.color = "white";
      document.querySelector(".swal2-cancel").style.color = "white";
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        const init = {
          saID: item.saID,
          fileName: item.imageFileName,
        };
        await pDeleteSaIdFileName(init);
        Swal.fire({
          html: `ลบรายการพื้นที่พิเศษ เลขที่ ${item.saID} สำเร็จ 🎉`,
          icon: "success",
          confirmButtonText: "OK",
          didOpen: () => {
            document.querySelector(".swal2-confirm").style.color = "white";
          },
        }).then((result) => {
          if (result.isConfirmed) {
            resetForm();
            searchSpecialAreas();
          }
        });
      } catch (e) {
        console.log(e);
      } finally {
        isLoading.value = false;
      }
    }
  });
};

onMounted(async () => {
  fetchMasterSperialAreas();
  const dataForCustomers = determineFetchData(userGroups.value, userStore);
  fetchMasterCustomers(dataForCustomers);
  fetchMasterMaterial();
});
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

.filter-select,
.search-bar {
  margin-bottom: 12px;
}

@media (min-width: 600px) {
  .filter-row {
    gap: 16px;
  }
  .filter-col {
    margin-bottom: 8px;
  }
}
.input-field {
  margin-bottom: -2rem;
  color: #007fc4 !important;
}
@media (min-width: 960px) {
  .filter-row {
    gap: 24px;
  }
  .filter-col {
    margin-bottom: 0;
  }
  .input-field {
    margin-bottom: -2rem;
    color: #007fc4 !important;
  }
}
.custom-toolbar {
  background: linear-gradient(
    360deg,
    rgba(255, 219, 122, 1) 0%,
    rgba(248, 200, 73, 1) 35%,
    rgba(240, 176, 6, 1) 100%
  ) !important;
  border-radius: 10px 10px 0px 0px !important;
}

/* Center the title */
::v-deep(.centered-title) {
  flex: 1; /* ใช้ flex เต็มพื้นที่ */
  text-align: center;
  font-weight: bold;
  color: #1e1e1e;
}

/* Dialog Card Styles */
.dialog-card {
  border-radius: 24px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.25);
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  animation: fadeIn 0.5s ease-in-out;
  overflow: hidden; /* ป้องกันส่วนที่เกินจาก Header */
  position: relative; /* สำหรับปุ่ม Close */
  max-height: 100vh;
  overflow-y: auto;
}

/* Header */
.dialog-header {
  background: linear-gradient(90deg, #007fc4, #005f9c);
  color: white;
  padding: 16px;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: white;
  color: #007fc4;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  z-index: 10;
}
.close-btn:hover {
  background-color: #f8c849;
  color: white !important;
}

.grey-card {
  background-color: #daf0fc; /* สีเทาอ่อน */
  color: #424242; /* สีข้อความ */
  height: 40px; /* กำหนดความสูงให้เล็กลง */
  padding: 8px; /* ลดระยะห่างภายใน */
  border-radius: 8px; /* ขอบมน */
  display: flex; /* จัดข้อความให้อยู่กลางแนวตั้ง */
  align-items: center; /* จัดข้อความให้อยู่กลางแนวตั้ง */
  justify-content: center; /* จัดข้อความให้อยู่กลางแนวนอน */
  font-size: 13px; /* ลดขนาดตัวอักษร */
}
.preview-image-fixed {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  object-fit: cover;
}
.preview-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.v-img {
  transition: transform 0.3s ease-in-out;
}

.v-img:hover {
  transform: scale(1.01);
}

::v-deep(.v-data-table tbody .v-selection-control .v-icon) {
  color: #007fc4 !important;
}
</style>
