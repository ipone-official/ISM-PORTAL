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
            @click="searchPriceReview"
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
            @click="closePriceReview"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </template>
        <span>Close Search</span>
      </v-tooltip>
    </v-row>
    <v-row dense align="center" class="filter-row" v-if="sDisabledDate">
      <v-col cols="12" sm="4" md="4" class="filter-col mb-3">
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
          clearable
        />
      </v-col>

      <v-col cols="12" sm="7" md="7" class="filter-col mb-3">
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
    <!-- ตารางข้อมูล -->
    <v-data-table
      :headers="headers"
      :items="filteredReservations"
      :search="mSearch"
      class="data-table mt-5"
      dense
      rounded
      item-value="saID"
    >
      <template v-slot:top>
        <v-toolbar flat class="custom-toolbar">
          <v-toolbar-title class="centered-title">รายการตรวจสอบราคา</v-toolbar-title>
          <v-tooltip text="Refresh" location="bottom" color="blue" text-color="white">
            <template v-slot:activator="{ props }">
              <v-btn icon variant="text" v-bind="props" @click="searchPriceReview">
                <v-icon color="white">mdi-refresh</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-toolbar>
      </template>

      <template v-slot:item.reviewID="{ item }">
        <div
          style="color: #007fc4; font-weight: bold; cursor: pointer"
          @click="editItem(item)"
        >
          {{ item.reviewID }}
        </div>
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
              <v-icon color="primary">mdi-file-document-check-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip
          v-if="canShowButtonDelete()"
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
        @click="createPriceReview"
      >
        <v-icon left>mdi-plus</v-icon> เพิ่ม
      </v-btn>
    </v-row>
    <v-dialog v-model="dialog" persistent max-width="1920px">
      <v-card class="dialog-card">
        <!-- Header -->
        <v-card-title class="dialog-header">
          <span class="dialog-title"
            >✨ {{ flagCreate ? "ตรวจสอบราคา" : "ข้อมูลตรวจสอบราคา" }} ✨</span
          >
          <v-btn icon @click="resetForm" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <!-- Form Content -->
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <!-- Row 1 -->
            <v-row justify="end" align="center" v-if="selectPriceReview.length != 0">
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    เลขที่ตรวจสอบราคา : {{ selectPriceReview.reviewID }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-row
              justify="space-around"
              align="center"
              v-if="selectPriceReview.length != 0"
            >
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    สร้างโดย : {{ selectPriceReview.createdName }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    วันที่สร้าง :
                    {{
                      selectPriceReview.createdDate
                        ? formatDateTime(selectPriceReview.createdDate)
                        : ""
                    }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3" v-show="selectPriceReview.updatedName">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    แก้ไขโดย :
                    {{ selectPriceReview.updatedName }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3" v-show="selectPriceReview.updatedDate">
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    วันที่แก้ไข :
                    {{
                      selectPriceReview.updatedDate
                        ? formatDateTime(selectPriceReview.updatedDate)
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
                md="3"
                class="filter-col"
                style="margin-top: -0.5rem"
              >
                <CustomDatepicker
                  v-model="dateReview"
                  label="วันที่ตรวจสอบ"
                  class="filter-select input-field"
                  :minOffset="-30"
                  :maxOffset="0"
                  :disabled="!showDetail()"
                />
              </v-col>
              <v-col cols="12" sm="4" md="4" class="filter-col">
                <v-autocomplete
                  v-model="mBranch"
                  :items="iBranch"
                  item-title="display"
                  item-value="soldto"
                  outlined
                  dense
                  class="filter-select input-field"
                  return-object
                  :readonly="!showDetail()"
                >
                  <template v-slot:label>
                    <span style="color: red">*</span> ห้าง/สาขา
                  </template></v-autocomplete
                >
              </v-col>
              <v-col
                cols="12"
                sm="4"
                md="5"
                class="filter-col d-flex justify-end align-center"
                v-if="showDetail()"
              >
                <v-btn
                  color="primary"
                  large
                  elevation="6"
                  class="rounded-xl text-white font-weight-bold px-8 py-2 transition"
                  @click="createPriceReviewHead"
                >
                  <v-icon left>mdi-plus</v-icon> เพิ่มรายการ
                </v-btn>
              </v-col>
              <v-col
                cols="12"
                sm="4"
                md="5"
                class="filter-col d-flex justify-end align-center"
                v-else
              ></v-col>
              <v-container fluid v-if="isEditDetailMode">
                <v-card
                  elevation="2"
                  class="pa-2 mb-4 mx-auto"
                  style="background-color: #ffedfa; border-radius: 12px; width: 100%"
                  ref="scrollContainer"
                >
                  <v-row>
                    <!-- ช่องราคา -->
                    <v-col cols="6" sm="4" md="4" class="filter-col">
                      <v-text-field
                        v-model="formattedmNormalPrice"
                        outlined
                        dense
                        class="input-field"
                        prepend-inner-icon="mdi-cash"
                        :readonly="true"
                        @keydown="keyFilter.numbersOnly"
                        type="text"
                        inputmode="decimal"
                        pattern="[0-9]*"
                        @input="updatedmNormalPrice"
                      >
                        <template v-slot:label>
                          <span style="color: red">*</span> ราคา
                        </template>
                      </v-text-field>
                    </v-col>

                    <!-- กลุ่ม radio -->
                    <v-col
                      cols="6"
                      sm="4"
                      md="4"
                      class="filter-col d-flex justify-center align-center"
                    >
                      <v-radio-group
                        v-model="flagPrice"
                        inline
                        class="d-flex align-center pa-0 ma-0 gap-2 justify-center"
                        density="compact"
                      >
                        <v-radio
                          label="เท่ากัน"
                          value="1"
                          color="primary"
                          class="pa-0 ma-0"
                        ></v-radio>
                        <v-radio
                          label="ไม่มีขาย"
                          value="0"
                          color="primary"
                          class="pa-0 ma-0"
                        ></v-radio>
                      </v-radio-group>
                    </v-col>

                    <!-- ราคาตรวจสอบ -->
                    <v-col cols="12" sm="4" md="4" class="filter-col">
                      <v-text-field
                        v-model="formattedmReviewPrice"
                        outlined
                        dense
                        class="input-field"
                        maxlength="8"
                        type="text"
                        inputmode="decimal"
                        pattern="[0-9]*"
                        @keydown="keyFilter.numbersOnly"
                        prepend-inner-icon="mdi-cash"
                        @input="updatedmReviewPrice"
                      >
                        <template v-slot:label>
                          <span style="color: red">*</span> ราคาตรวจสอบ
                        </template>
                      </v-text-field>
                    </v-col>

                    <!-- หมายเหตุ -->
                    <v-col cols="12" class="filter-col">
                      <v-textarea
                        v-model="mRemark"
                        rows="2"
                        maxlength="255"
                        variant="outlined"
                        class="filter-select input-field"
                        auto-grow
                      >
                        <template v-slot:label> หมายเหตุ </template>
                      </v-textarea>
                    </v-col>

                    <!-- ปุ่ม -->
                    <v-col cols="12" class="filter-col d-flex justify-center">
                      <v-btn
                        color="primary"
                        large
                        elevation="6"
                        class="rounded-xl text-white font-weight-bold px-6 py-2 mt-2 transition mx-1"
                        @click="saveEditDetail"
                      >
                        <v-icon left>mdi-pencil-outline</v-icon>
                        บันทึก
                      </v-btn>
                      <v-btn
                        color="red"
                        large
                        elevation="6"
                        class="rounded-xl text-white font-weight-bold px-6 py-2 mt-2 transition mx-1"
                        @click="clearDataEdit"
                      >
                        <v-icon left>mdi-close-outline</v-icon>
                        ยกเลิก
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-container>

              <v-col cols="12" sm="4" md="2" class="filter-col" v-if="!showDetail()">
                <v-autocomplete
                  v-model="selectedProduct"
                  :items="filteredProductNames"
                  multiple
                  outlined
                  dense
                  class="filter-select input-field custom-autocomplete"
                  return-object
                  clearable
                  :color="'primary'"
                  active-class="custom-active-class"
                  ><template v-slot:label> ยี่ห้อ </template></v-autocomplete
                >
              </v-col>
              <v-col cols="12" sm="4" md="2" class="filter-col" v-if="!showDetail()">
                <v-autocomplete
                  v-model="selectedProductGroup"
                  :items="filteredProductGroups"
                  multiple
                  outlined
                  dense
                  class="filter-select input-field custom-autocomplete"
                  return-object
                  clearable
                  :color="'primary'"
                  active-class="custom-active-class"
                  ><template v-slot:label> กลุ่มสินค้า </template></v-autocomplete
                >
              </v-col>
              <v-col cols="12" sm="4" md="3" class="filter-col" v-if="!showDetail()">
                <v-autocomplete
                  v-model="selectedColor"
                  :items="filteredColors"
                  multiple
                  outlined
                  dense
                  class="filter-select input-field custom-autocomplete"
                  return-object
                  clearable
                  :color="'primary'"
                  active-class="custom-active-class"
                  ><template v-slot:label> สี </template></v-autocomplete
                >
              </v-col>
              <v-col cols="12" sm="4" md="5" class="filter-col" v-if="!showDetail()">
                <v-text-field
                  v-model="mSearchDetail"
                  label="Search"
                  outlined
                  dense
                  prepend-inner-icon="mdi-magnify"
                  class="search-bar input-field"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-5" v-if="!showDetail()">
              <v-data-table
                :headers="dialogHeader"
                :items="filteredReservationsDetail"
                class="data-table"
                :search="mSearchDetail"
                dense
                rounded
              >
                <template v-slot:item.sequenceID="{ item }">
                  <div class="flex items-center gap-2">
                    {{ item.sequenceID }}
                    <v-icon v-if="item.flagEdit" color="success" size="18"
                      >mdi-check</v-icon
                    >
                  </div>
                </template>
                <template v-slot:item.normalPrice="{ item }">
                  <div class="flex items-center gap-2 justify-end text-right">
                    {{ formatNumber(item.normalPrice, 2) }}
                  </div>
                </template>
                <template v-slot:item.reviewPrice="{ item }">
                  <div class="flex items-center gap-2 justify-end text-right">
                    {{ formatNumber(item.reviewPrice, 2) }}
                  </div>
                </template>
                <template v-slot:item.actions="{ item }">
                  <div class="action-buttons">
                    <!-- Edit Tooltip -->
                    <v-btn
                      icon
                      variant="text"
                      v-bind="props"
                      @click="editReservationsDetail(item)"
                    >
                      <v-icon color="blue">mdi-pencil-outline</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-row>
          </v-form>
          <v-row class="d-flex justify-center" v-if="!showDetail()">
            <v-btn
              color="success"
              large
              elevation="6"
              class="rounded-xl text-white font-weight-bold px-8 py-2 transition mt-5"
              @click="submitFormDetail"
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
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useUserStore } from "@/stores/userStore";
import loading from "@/components/Loading.vue";
import CustomDatepicker from "@/components/CustomDatepicker.vue";
import keyFilter from "@/utils/keyFilter.js";
import {
  gMasterCustomers,
  pPriceReviewHead,
  gTransactionPricePreview,
  gPriceReviewDetail,
  pPriceReviewDetail,
  pDeletedPriceReview,
} from "@/services/apiISM";
import Swal from "sweetalert2";

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
    data = role;
  } else {
    data = userStore.empId;
  }
  return data;
};
const isLoading = ref(false);
const showSnackbar = ref(false);
const msgSnackbar = ref("");
const snackbarColor = ref("success");
const sDisabledDate = ref(false);
const mBranch = ref(null);
const iBranch = ref([]);
const dialog = ref(false);
const flagCreate = ref(false);
const flagPrice = ref(null);
const selectPriceReview = ref([]);
const isEditDetailMode = ref(false);
const mSearch = ref(null);
const mSearchDetail = ref(null);
const rawReservations = ref([]);
const rawReservationsDetail = ref([]);
const mFilterAccount = ref(null);
const mNormalPrice = ref(null);
const mReviewPrice = ref(null);
const mRemark = ref(null);
const editId = ref(null);
const headers = [
  { title: "เลขที่", align: "left", key: "reviewID" },
  { title: "วันที่ตรวจสอบ", align: "left", key: "formattedDate" },
  { title: "สาขา/ห้าง", align: "left", key: "branchName" },
  { title: "จังหวัด", align: "left", key: "province" },
  { title: "ดำเนินการ", align: "left", key: "actions" },
];
const dialogHeader = [
  { title: "ลำดับ", align: "start", key: "sequenceID" },
  { title: "ยี่ห้อ", align: "start", key: "productName" },
  { title: "กลุ่มสินค้า", align: "start", key: "productGroup" },
  { title: "สี", align: "start", key: "color" },
  { title: "ขนาด", align: "start", key: "size" },
  { title: "ราคาสินค้า", align: "end", key: "normalPrice" },
  { title: "ราคาตรวจสอบ", align: "end", key: "reviewPrice" },
  { title: "หมายเหตุ", align: "start", key: "remark" },
  { title: "ดำเนินการ", align: "center", key: "actions" },
];

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

const formatDateTime = (input) => {
  const datePart = input.substring(0, 8);
  const timePart = input.substring(9, 14);

  const year = datePart.substring(0, 4);
  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);

  return `${day}/${month}/${year} ${timePart}`;
};

// ✅ ตั้งค่าให้เป็นวันที่ 01 ของเดือนปัจจุบัน
const dateStart = ref(getFirstDayOfMonth());
const dateEnd = ref(getTodayYYYYMMDD());
const dateReview = ref(getTodayYYYYMMDD());
const createPriceReview = () => {
  dialog.value = true;
  flagCreate.value = true;
};

const resetForm = () => {
  dialog.value = false;
  flagCreate.value = false;
  selectPriceReview.value = [];
  rawReservationsDetail.value = [];
  selectedProduct.value = [];
  selectedProductGroup.value = [];
  selectedColor.value = [];
  mSearchDetail.value = null;
  mBranch.value = null;
  dateReview.value = getTodayYYYYMMDD();
  clearDataEdit();
};
const updatedmNormalPrice = (event) => {
  let value = event.target.value.replace(/,/g, "");

  if (value === "") {
    mNormalPrice.value = "0";
    return;
  }

  if (value === ".") {
    mNormalPrice.value = "0.";
    return;
  }

  const numberRegex = /^\d*\.?\d*$/;
  if (numberRegex.test(value)) {
    mNormalPrice.value = value;
  }
};
// คำนวณฟอร์แมตราคาแบบมี comma
const formattedmNormalPrice = computed({
  get() {
    if (!mNormalPrice.value) return "0";

    const value = Number(mNormalPrice.value);
    if (isNaN(value)) return "0";

    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  },
  set(val) {
    let cleanedValue = val.replace(/,/g, "").trim();
    if (cleanedValue === "" || cleanedValue === ".") {
      mNormalPrice.value = "0";
    } else {
      mNormalPrice.value = cleanedValue;
    }
  },
});

const updatedmReviewPrice = (event) => {
  let value = event.target.value.replace(/,/g, "");

  if (value === "") {
    mReviewPrice.value = "0";
    return;
  }

  if (value === ".") {
    mReviewPrice.value = "0.";
    return;
  }

  const numberRegex = /^\d*\.?\d*$/;
  if (numberRegex.test(value)) {
    mReviewPrice.value = value;
  }
};
// คำนวณฟอร์แมตราคาแบบมี comma
const formattedmReviewPrice = computed({
  get() {
    if (!mReviewPrice.value) return "0";

    const value = Number(mReviewPrice.value);
    if (isNaN(value)) return "0";

    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  },
  set(val) {
    let cleanedValue = val.replace(/,/g, "").trim();
    if (cleanedValue === "" || cleanedValue === ".") {
      mReviewPrice.value = "0";
    } else {
      mReviewPrice.value = cleanedValue;
    }
  },
});

const showDetail = () => {
  if (flagCreate.value == true) return true;
  return false;
};
watch(
  () => flagPrice.value,
  (newVal) => {
    if (newVal === "1") {
      mReviewPrice.value = mNormalPrice.value;
    } else {
      mReviewPrice.value = 0.0;
    }
  }
);

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

const fetchTransactionPricePreview = async () => {
  isLoading.value = true;
  try {
    const dataForArea = determineFetchData(userGroups.value, userStore);
    const response = await gTransactionPricePreview({
      startDate: dateStart.value,
      endDate: dateEnd.value,
      empBy: dataForArea,
    });
    rawReservations.value = response.results.map((item) => ({
      ...item,
      formattedDate: item.reviewDate ? formatDate(item.reviewDate) : "-",
    }));
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
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
const selectedAccountKeys = computed(() =>
  Array.isArray(mFilterAccount.value) ? mFilterAccount.value.map((i) => i.key) : []
);

const filteredReservations = computed(() => {
  return rawReservations.value.filter((item) => {
    const matchAccount =
      selectedAccountKeys.value.length === 0 ||
      selectedAccountKeys.value.includes(item.createdBy);

    return matchAccount;
  });
});

const formatDate = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "Invalid Date";
  const year = yyyymmdd.substring(0, 4);
  const month = yyyymmdd.substring(4, 6);
  const day = yyyymmdd.substring(6, 8);
  return `${day}/${month}/${year}`;
};

const showSnackbars = (message, color = "yellow") => {
  msgSnackbar.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};

const createPriceReviewHead = async () => {
  if (!mBranch.value) {
    return showSnackbars("กรุณาเลือกสาขา");
  }
  isLoading.value = true;
  try {
    const data = {
      reviewDate: dateReview.value,
      branchCode: mBranch.value.soldto,
      branchName: mBranch.value.branch,
      province: mBranch.value.province,
      ismArea: mBranch.value.ismArea,
      empID: userStore.empId,
    };
    const response = await pPriceReviewHead(data);
    if (response.status == 409) {
      showSnackbars("วันที่ตรวจสอบและสาขา มีการสร้างแล้ว");
    } else {
      dialog.value = false;
      Swal.fire({
        icon: "success",
        title: "บันทึกรายการสำเร็จ 🎉",
        html: `เลขที่ตรวจสอบราคา <strong>"${response.results}"</strong>`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#007fc4",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          document.querySelector(".swal2-confirm").style.color = "white";
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          dialog.value = true;
          clearDataEdit();
          await fetchTransactionPricePreview();
          const matchedReservation = rawReservations.value.find(
            (item) => item.reviewID === response.results
          );

          editItem(matchedReservation);
        }
      });
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
  } finally {
    isLoading.value = false;
  }
};
const canShowButtonDelete = () => {
  const isAdmin = ["ISM_ADMIN", "ISM_MANAGER"].some((role) =>
    userGroups.value.includes(role)
  );
  return isAdmin;
};

const editItem = async (item) => {
  flagCreate.value = false;
  selectPriceReview.value = item;
  dateReview.value = item.reviewDate;
  mBranch.value = {
    soldto: item.branchCode,
    branch: item.branchName,
    ismArea: item.ismArea,
    province: item.province,
    display: `${item.branchCode} - ${item.branchName}`,
  };
  dialog.value = true;
  await fetchTransactionPricePreviewDetail(item.reviewID);
};

const fetchTransactionPricePreviewDetail = async (data) => {
  isLoading.value = true;
  rawReservationsDetail.value = [];
  try {
    const response = await gPriceReviewDetail(data);
    rawReservationsDetail.value = response.results.map((item) => ({
      ...item,
      flagEdit: false,
    }));
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
};

// ตัวแปรสำหรับเก็บค่าที่เลือก
const selectedProduct = ref([]); // ✅ ไม่มี string ว่าง
const selectedProductGroup = ref([]);
const selectedColor = ref([]);

function cleanText(text) {
  return (text || "").trim().replace(/^,/, "");
}

// ดึง option ของ ProductName ที่สัมพันธ์กับที่เลือก
const filteredProductNames = computed(() => {
  const filtered = filteredReservationsDetail.value.map((p) => cleanText(p.productName));
  return [...new Set(filtered)];
});

// ดึง option ของ ProductGroup ที่สัมพันธ์กับที่เลือก
const filteredProductGroups = computed(() => {
  const filtered = filteredReservationsDetail.value.map((p) => cleanText(p.productGroup));
  return [...new Set(filtered)];
});

// ดึง option ของ Color ที่สัมพันธ์กับที่เลือก
const filteredColors = computed(() => {
  const filteredColorsArray = filteredReservationsDetail.value.flatMap(
    (p) =>
      (p.color || "")
        .split(",")
        .map((c) => cleanText(c))
        .filter((c) => c.length > 0) // กันกรณี split แล้วได้ค่าว่าง
  );
  return [...new Set(filteredColorsArray)];
});

// Filter ข้อมูลหลัก
const filteredReservationsDetail = computed(() => {
  return rawReservationsDetail.value.filter((item) => {
    const matchProductName =
      selectedProduct.value.length === 0 ||
      selectedProduct.value.includes(item.productName.trim());

    const matchProductGroup =
      selectedProductGroup.value.length === 0 ||
      selectedProductGroup.value.includes(item.productGroup.trim());

    const matchColor =
      selectedColor.value.length === 0 ||
      item.color
        .split(",")
        .map((c) => c.trim())
        .some((c) => selectedColor.value.includes(c));

    return matchProductName && matchProductGroup && matchColor;
  });
});
const scrollContainer = ref(null);

const editReservationsDetail = (item) => {
  editId.value = item.sequenceID;
  mNormalPrice.value = item.normalPrice;
  mReviewPrice.value = item.reviewPrice;
  mRemark.value = item.remark;
  isEditDetailMode.value = true;
  nextTick(() => {
    scrollContainer.value?.$el?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};
const saveEditDetail = () => {
  const index = rawReservationsDetail.value.findIndex(
    (item) => item.sequenceID === Number(editId.value)
  );
  if (index !== -1) {
    rawReservationsDetail.value[index].reviewPrice = mReviewPrice.value;
    rawReservationsDetail.value[index].remark = mRemark.value;
    rawReservationsDetail.value[index].flagEdit = true;

    // เคลียร์สถานะหลังบันทึก
    clearDataEdit();
  }
};

const clearDataEdit = () => {
  isEditDetailMode.value = false;
  mNormalPrice.value = null;
  flagPrice.value = null;
  mReviewPrice.value = null;
  mRemark.value = null;
  editId.value = null;
};
const submitFormDetail = async () => {
  isLoading.value = true;
  try {
    const transformedData = {
      reviewID:
        rawReservationsDetail.value.length > 0
          ? rawReservationsDetail.value[0].reviewID
          : "",
      empID: userStore.empId,
      detail: rawReservationsDetail.value.map((item) => ({
        sequenceID: item.sequenceID,
        productCode: item.productCode,
        productName: item.productName,
        productGroup: item.productGroup,
        color: item.color,
        size: item.size,
        normalPrice: item.normalPrice,
        reviewPrice: item.reviewPrice,
        promoLabel: item.promoLabel,
        remark: item.remark,
      })),
    };

    await pPriceReviewDetail(transformedData);
    dialog.value = false;
    Swal.fire({
      icon: "success",
      title: "บันทึกรายการสำเร็จ 🎉",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#007fc4",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        document.querySelector(".swal2-confirm").style.color = "white";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        dialog.value = true;
        clearDataEdit();

        await fetchTransactionPricePreview();
        const matchedReservation = rawReservations.value.find(
          (item) => item.reviewID === transformedData.reviewID
        );
        editItem(matchedReservation);
      }
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
};
const formatNumber = (value, decimalPlaces = 0) => {
  if (value === null || value === undefined || value === "") {
    return decimalPlaces > 0 ? "0.00" : "0";
  }

  // แปลงค่าเป็นตัวเลข
  let num = parseFloat(value);
  if (isNaN(num)) return decimalPlaces > 0 ? "0.00" : "0";

  // ใช้ Intl.NumberFormat เพื่อเพิ่ม comma และทศนิยม
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};
const searchPriceReview = () => {
  fetchTransactionPricePreview();
  sDisabledDate.value = true;
};
const closePriceReview = () => {
  sDisabledDate.value = false;
  mFilterAccount.value = null;
  mSearch.value = null;
  rawReservations.value = [];
  rawReservationsDetail.value = [];
  resetForm();
  clearDataEdit();
};

const deleteItem = (item) => {
  Swal.fire({
    html: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการตรวจสอบราคา <br/> เลขที่ <strong>"${item.reviewID}"</strong> ?`,
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
          reviewID: item.reviewID,
        };
        await pDeletedPriceReview(init);
        Swal.fire({
          html: `ลบรายการตรวจสอบราคา เลขที่ ${item.reviewID} สำเร็จ 🎉`,
          icon: "success",
          confirmButtonText: "OK",
          didOpen: () => {
            document.querySelector(".swal2-confirm").style.color = "white";
          },
        }).then((result) => {
          if (result.isConfirmed) {
            resetForm();
            searchPriceReview();
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
  const dataForCustomers = determineFetchData(userGroups.value, userStore);
  fetchMasterCustomers(dataForCustomers);
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
  font-size: 1.4rem;
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
.v-radio {
  margin-right: 4px !important; /* ลดระยะห่างให้ชิด */
}
</style>
