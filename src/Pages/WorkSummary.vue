<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-tabs
          v-model="tab"
          class="custom-tabs"
          grow
          slider-color="#f8c849"
          background-color="transparent"
        >
          <v-tab value="all" class="custom-tab">สรุปวันทำงานรายวัน</v-tab>
          <v-tab value="summary" class="custom-tab">สรุปวันทำงาน</v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <v-window v-model="tab">
      <v-window-item value="all">
        <v-container>
          <v-row dense align="center" justify="space-start" class="filter-row">
            <v-col cols="8" sm="3">
              <CustomDatepicker
                v-model="dateStart"
                label="วันที่"
                class="filter-select input-field"
                :minOffset="-30"
                :maxOffset="30"
                :disabled="sDisabledDateWork"
              />
            </v-col>
            ถึง
            <v-col cols="8" sm="3">
              <CustomDatepicker
                v-model="dateEnd"
                label="วันที่"
                class="filter-select input-field"
                :minOffset="-30"
                :maxOffset="30"
                :disabled="sDisabledDateWork"
              />
            </v-col>
            <v-tooltip top color="teal" v-if="!sDisabledDateWork">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  color="#007fc4"
                  dark
                  class="ma-2 small-export-button"
                  v-bind="attrs"
                  v-on="on"
                  @click="searchSummaryByUser"
                >
                  <v-icon size="20">mdi-magnify</v-icon>
                </v-btn>
              </template>
              <span>Search</span>
            </v-tooltip>
            <v-tooltip top color="teal" v-else-if="sDisabledDateWork">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  color="red"
                  dark
                  class="ma-2 small-export-button"
                  v-bind="attrs"
                  v-on="on"
                  @click="closeSummaryByUser"
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
            class="filter-row mb-5 mt-5"
            v-if="sDisabledDateWork && rawReservationsByUser.length != 0"
          >
            <v-col cols="12" sm="3" md="4">
              <v-autocomplete
                v-model="searchNameByUser"
                :items="uniqueNamesByUser"
                item-title="display"
                item-value="employeeID"
                label="ชื่อพนักงาน"
                prepend-inner-icon="mdi-account-search"
                variant="outlined"
                dense
                clearable
                hide-no-data
                return-object
                multiple
                class="filter-select input-field custom-autocomplete"
                :color="'primary'"
                active-class="custom-active-class"
              />
            </v-col>
            <v-col cols="12" sm="2" md="2">
              <v-autocomplete
                v-model="searchAreaByUser"
                :items="uniqueAreasByUser"
                label="เขตพื้นที่"
                prepend-inner-icon="mdi-map-marker"
                variant="outlined"
                item-title="display"
                item-value="ismArea"
                dense
                clearable
                hide-no-data
                return-object
                multiple
                class="filter-select input-field custom-autocomplete"
                :color="'primary'"
                active-class="custom-active-class"
              />
            </v-col>
            <v-col cols="9" sm="3" md="3" class="filter-col">
              <v-text-field
                v-model="mSearchByUser"
                label="Search"
                outlined
                dense
                prepend-inner-icon="mdi-magnify"
                class="search-bar input-field"
              />
            </v-col>
            <v-col cols="auto" class="filter-col mt-3">
              <v-btn
                fab
                small
                color="green"
                dark
                class="ma-1 small-export-button"
                v-bind="attrs"
                v-on="on"
                @click="exportFileExcelSummaryByUser"
              >
                <v-icon size="25">mdi-microsoft-excel</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-data-table
            :headers="headersSummaryByUser"
            :items="filteredReservationsByUser"
            :search="mSearchByUser"
            class="data-table mt-5"
            dense
            rounded
            v-model="selected"
            show-select
            item-value="index"
          >
            <template v-slot:top>
              <v-toolbar flat class="custom-toolbar">
                <v-toolbar-title class="centered-title">
                  สรุปวันทำงานรายวัน</v-toolbar-title
                >
                <v-tooltip
                  text="Refresh"
                  location="bottom"
                  color="blue"
                  text-color="white"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      v-bind="props"
                      @click="searchSummaryByUser"
                    >
                      <v-icon color="white">mdi-refresh</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-toolbar>
            </template>
            <template v-slot:item.summaryWork="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.summaryWork }}
              </div>
            </template>
            <template v-slot:item.summaryOT="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.summaryOT }}
              </div>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon variant="text" v-bind="props" @click="editItem(item)">
                <v-icon color="primary">mdi-book-search-outline</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-container>
      </v-window-item>

      <v-window-item value="summary">
        <v-container>
          <v-row justify="center" align="center">
            <!-- Picker -->
            <v-col cols="12" md="8">
              <v-row align="center">
                <v-col cols="12" md="9" sm="9">
                  <MonthYearPicker
                    v-model="selectedMonth"
                    :start-year="2025"
                    :readonly="sDisabledDate"
                  />
                </v-col>

                <!-- ปุ่ม Search / Close -->
                <v-col cols="12" md="3" sm="3" class="text-center mt-4">
                  <v-tooltip top color="teal" v-if="!sDisabledDate">
                    <template #activator="{ on, attrs }">
                      <v-btn
                        fab
                        small
                        color="#007fc4"
                        dark
                        class="ma-1"
                        v-bind="attrs"
                        v-on="on"
                        @click="searchWorkDaySummary"
                      >
                        <v-icon size="20">mdi-magnify</v-icon>
                      </v-btn>
                    </template>
                    <span>ค้นหา</span>
                  </v-tooltip>

                  <v-tooltip top color="teal" v-else>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        fab
                        small
                        color="red"
                        dark
                        class="ma-1"
                        v-bind="attrs"
                        v-on="on"
                        @click="closeWorkDaySummary"
                      >
                        <v-icon size="20">mdi-close</v-icon>
                      </v-btn>
                    </template>
                    <span>ปิดการค้นหา</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row
            dense
            align="center"
            class="filter-row mb-5 mt-5"
            v-if="sDisabledDate && rawReservations.length != 0"
          >
            <v-col cols="12" sm="3" md="4">
              <v-autocomplete
                v-model="searchName"
                :items="uniqueNames"
                item-title="display"
                item-value="employeeID"
                label="ชื่อพนักงาน"
                prepend-inner-icon="mdi-account-search"
                variant="outlined"
                dense
                clearable
                hide-no-data
                return-object
                multiple
                class="filter-select input-field custom-autocomplete"
                :color="'primary'"
                active-class="custom-active-class"
              />
            </v-col>
            <v-col cols="12" sm="2" md="2">
              <v-autocomplete
                v-model="searchArea"
                :items="uniqueAreas"
                label="เขตพื้นที่"
                prepend-inner-icon="mdi-map-marker"
                variant="outlined"
                item-title="display"
                item-value="ismArea"
                dense
                clearable
                hide-no-data
                return-object
                multiple
                class="filter-select input-field custom-autocomplete"
                :color="'primary'"
                active-class="custom-active-class"
              />
            </v-col>
            <v-col cols="9" sm="3" md="3" class="filter-col">
              <v-text-field
                v-model="mSearch"
                label="Search"
                outlined
                dense
                prepend-inner-icon="mdi-magnify"
                class="search-bar input-field"
              />
            </v-col>
            <v-col cols="auto" class="filter-col mt-3">
              <v-btn
                fab
                small
                color="green"
                dark
                class="ma-1 small-export-button"
                v-bind="attrs"
                v-on="on"
                @click="exportFileExcelSummary"
              >
                <v-icon size="25">mdi-microsoft-excel</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-data-table
            :headers="headersSummary"
            :items="filteredReservations"
            :search="mSearch"
            class="data-table mt-5"
            dense
            rounded
            item-value="employeeID"
          >
            <template v-slot:top>
              <v-toolbar flat class="custom-toolbar">
                <v-toolbar-title class="centered-title">
                  สรุปวันทำงาน {{ formatMonthYearSlash(selectedMonth) }}</v-toolbar-title
                >
                <v-tooltip
                  text="Refresh"
                  location="bottom"
                  color="blue"
                  text-color="white"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      v-bind="props"
                      @click="searchWorkDaySummary"
                    >
                      <v-icon color="white">mdi-refresh</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-toolbar>
            </template>
            <template v-slot:item.workday="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.workday }}
              </div>
            </template>
            <template v-slot:item.weeklyHoliday="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.weeklyHoliday }}
              </div>
            </template>
            <template v-slot:item.publicHoliday="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.publicHoliday }}
              </div>
            </template>
            <template v-slot:item.sickLeave="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.sickLeave }}
              </div>
            </template>
            <template v-slot:item.vacation="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.vacation }}
              </div>
            </template>
            <template v-slot:item.personalLeave="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.personalLeave }}
              </div>
            </template>
            <template v-slot:item.totalworkday="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.totalworkday }}
              </div>
            </template>
            <template v-slot:item.summaryOT="{ item }">
              <div class="flex items-center gap-2 justify-end text-right">
                {{ item.summaryOT }}
              </div>
            </template>
          </v-data-table>
        </v-container>
      </v-window-item>
    </v-window>
    <v-dialog v-model="dialog" max-width="900px" scrollable>
      <v-card class="rounded-xl">
        <v-card-title class="text-h6">
          <v-icon class="me-2" color="primary">mdi-calendar-clock</v-icon>
          รายการเข้างานของพนักงาน
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-row>
            <v-col v-for="item in ReservationsSession" :key="item.wsID" cols="12" sm="6">
              <v-card class="rounded-lg elevation-3 pa-3" color="grey-lighten-5">
                <v-card-title class="pb-1">
                  <v-icon class="me-2" color="blue-darken-2">mdi-map-marker</v-icon>
                  {{ item.branchName }} ({{ item.branchCode }})
                </v-card-title>

                <v-card-subtitle class="text-subtitle-2 pb-2">
                  {{ item.province }} - {{ item.ismArea }}
                </v-card-subtitle>

                <v-card-text class="text-body-1">
                  <div>
                    <strong>📅 วันที่:</strong> {{ formatDate(item.sessionDate) }}
                  </div>
                  <div>
                    <strong>⏰ เวลาเข้า:</strong> {{ extractTime(item.checkedIn) }}
                  </div>
                  <div>
                    <strong>⏰ เวลาออก:</strong> {{ extractTime(item.checkedOut) }}
                  </div>
                  <div v-if="item.reasonDesc">
                    <strong>⏰ เหตุผลการลงเวลา:</strong> {{ item.reasonDesc }}
                  </div>
                  <div><strong>📌 ประเภทวัน:</strong> {{ item.holidayDesc }}</div>
                </v-card-text>

                <v-card-actions v-if="canDeletedWorkSession">
                  <v-spacer />
                  <v-btn color="primary" variant="flat" @click="deleteItem(item)">
                    <v-icon start>mdi-trash-can</v-icon> ลบ
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <div v-if="ReservationsSession.length === 0" class="text-center text-grey mt-4">
            ไม่มีข้อมูลการเข้างาน
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="red-darken-1"
            variant="flat"
            class="rounded-pill"
            @click="dialog = false"
          >
            <v-icon start>mdi-close</v-icon> ปิด
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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
</template>

<script setup>
import { ref, computed } from "vue";
import MonthYearPicker from "@/components/MonthYearPicker.vue";
import {
  pWorkDaySummaryBy,
  pWorkDaySummaryByUser,
  pWorkDaySummaryByUserReport,
  pWorkSessionByUserDate,
  pDeletedWorkSessions,
} from "@/services/apiISM";
import loading from "@/components/Loading.vue";
import { useUserStore } from "@/stores/userStore";
import XlsxPopulate from "xlsx-populate";
import CustomDatepicker from "@/components/CustomDatepicker.vue";
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
    // data = role.split("_").pop();
    data = role;
  } else {
    data = userStore.empId;
  }
  return data;
};

const selectedMonth = ref(new Date().toISOString().slice(0, 7)); // ได้รูปแบบ "YYYY-MM"

const tab = ref("all");
const sDisabledDate = ref(false);
const sDisabledDateWork = ref(false);
const isLoading = ref(false);
const rawReservations = ref([]);
const rawReservationsByUser = ref([]);
const searchName = ref(null);
const searchArea = ref(null);
const searchNameByUser = ref(null);
const searchAreaByUser = ref(null);
const mSearch = ref(null);
const mSearchByUser = ref(null);
const selected = ref([]);
const showSnackbar = ref(false);
const msgSnackbar = ref("");
const snackbarColor = ref("success");
const dialog = ref(false);
const ReservationsSession = ref([]);
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
const dateStart = ref(getFirstDayOfMonth());
const dateEnd = ref(getTodayYYYYMMDD());

const headersSummaryByUser = [
  { title: "วันที่บันทึกเวลา", align: "left", key: "formattedDate" },
  { title: "เลขพนักงาน", align: "left", key: "employeeID" },
  { title: "ชื่อ", align: "left", key: "fullName" },
  { title: "เวลาบันทึก", align: "left", key: "checkIn" },
  { title: "เวลาออก", align: "left", key: "checkOut" },
  { title: "เวลาทำงานรวม (ชม.)", align: "end", key: "summaryWork" },
  { title: "โอที (ชม.)", align: "end", key: "summaryOT" },
  { title: "ดำเนินการ", align: "left", key: "actions" },
];

const headersSummary = [
  { title: "เลขพนักงาน", align: "left", key: "employeeID" },
  { title: "ชื่อ", align: "left", key: "fullName" },
  { title: "วันที่ทำงานปกติ", align: "end", key: "workday" },
  { title: "วันหยุดประจำสัปดาห์", align: "end", key: "weeklyHoliday" },
  { title: "วันหยุดนักขัตฤกษ์", align: "end", key: "publicHoliday" },
  { title: "ลาป่วย", align: "end", key: "sickLeave" },
  { title: "พักร้อน", align: "end", key: "vacation" },
  { title: "ลากิจ", align: "end", key: "personalLeave" },
  { title: "วันที่งานทั้งหมด", align: "end", key: "totalworkday" },
  { title: "โอที (ชม.)", align: "end", key: "summaryOT" },
];
function formatMonthYearSlash(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

const searchWorkDaySummary = async () => {
  isLoading.value = true;
  sDisabledDate.value = true;
  try {
    const dataForArea = determineFetchData(userGroups.value, userStore);
    const [year, month] = selectedMonth.value.split("-");
    const response = await pWorkDaySummaryBy({
      year: year,
      month: month,
      userID: dataForArea,
    });
    // 🆕 เพิ่มขั้นตอน map และ format date
    rawReservations.value = response.results;
  } catch (error) {
    console.error("❌ Error loading pWorkDaySummaryBy:", error);
  } finally {
    isLoading.value = false;
  }
};

const uniqueNames = computed(() => {
  let filtered = rawReservations.value;

  // ถ้าเลือก ismArea → จำกัดชื่อเฉพาะที่อยู่ในพื้นที่นั้น
  if (searchArea.value?.length) {
    const selectedAreas = searchArea.value.map((i) => i.ismArea);
    filtered = filtered.filter((item) => selectedAreas.includes(item.ismArea));
  }

  const seen = new Set();
  return filtered
    .filter((item) => item.fullName && item.employeeID)
    .filter((item) => {
      if (seen.has(item.employeeID)) return false;
      seen.add(item.employeeID);
      return true;
    })
    .map((item) => ({
      employeeID: item.employeeID,
      display: `${item.fullName} (${item.employeeID})`,
    }))
    .sort((a, b) => a.display.localeCompare(b.display));
});

const uniqueAreas = computed(() => {
  let filtered = rawReservations.value;

  // ถ้าเลือกชื่อพนักงาน → จำกัดพื้นที่เฉพาะที่เกี่ยวข้อง
  if (searchName.value?.length) {
    const selectedIDs = searchName.value.map((i) => i.employeeID);
    filtered = filtered.filter((item) => selectedIDs.includes(item.employeeID));
  }

  const seen = new Set();
  return filtered
    .filter((item) => item.ismArea)
    .filter((item) => {
      if (seen.has(item.ismArea)) return false;
      seen.add(item.ismArea);
      return true;
    })
    .map((item) => ({
      ismArea: item.ismArea,
      display: item.ismArea, // หรือแปลงชื่อให้อ่านง่ายก็ได้
    }))
    .sort((a, b) => a.display.localeCompare(b.display));
});

const selectedName = computed(() =>
  Array.isArray(searchName.value) ? searchName.value.map((i) => i.employeeID) : []
);

const selectedArea = computed(() =>
  Array.isArray(searchArea.value)
    ? searchArea.value.map((i) => i.ismArea) // ปรับให้ตรง field จริง
    : []
);

const filteredReservations = computed(() => {
  return rawReservations.value.filter((item) => {
    const matchName =
      selectedName.value.length === 0 || selectedName.value.includes(item.employeeID);

    const matchArea =
      selectedArea.value.length === 0 || selectedArea.value.includes(item.ismArea);

    return matchName && matchArea;
  });
});

const closeWorkDaySummary = () => {
  sDisabledDate.value = false;
  rawReservations.value = [];
  mSearch.value = null;
};
const closeSummaryByUser = () => {
  sDisabledDateWork.value = false;
  rawReservationsByUser.value = [];
  mSearchByUser.value = null;
  selected.value = [];
  ReservationsSession.value = [];
  dialog.value = false;
};
const formatDate = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "Invalid Date";
  const year = yyyymmdd.substring(0, 4);
  const month = yyyymmdd.substring(4, 6);
  const day = yyyymmdd.substring(6, 8);
  return `${day}/${month}/${year}`;
};

const searchSummaryByUser = async () => {
  isLoading.value = true;
  try {
    const dataForArea = determineFetchData(userGroups.value, userStore);
    const response = await pWorkDaySummaryByUser({
      startDate: dateStart.value,
      endDate: dateEnd.value,
      empBy: dataForArea,
    });
    // 🆕 เพิ่มขั้นตอน map และ format date
    rawReservationsByUser.value = response.results.map((item, index) => ({
      ...item,
      index: index + 1, // เริ่มจาก 1 แทน 0
      formattedDate: item.sessionDate ? formatDate(item.sessionDate) : "-",
    }));
    sDisabledDateWork.value = true;
  } catch (error) {
    console.error("❌ Error loading pWorkDaySummaryBy:", error);
  } finally {
    isLoading.value = false;
  }
};
const uniqueNamesByUser = computed(() => {
  let filtered = rawReservationsByUser.value;

  // ถ้าเลือก ismArea → จำกัดชื่อเฉพาะที่อยู่ในพื้นที่นั้น
  if (searchAreaByUser.value?.length) {
    const selectedAreas = searchAreaByUser.value.map((i) => i.ismArea);
    filtered = filtered.filter((item) => selectedAreas.includes(item.ismArea));
  }

  const seen = new Set();
  return filtered
    .filter((item) => item.fullName && item.employeeID)
    .filter((item) => {
      if (seen.has(item.employeeID)) return false;
      seen.add(item.employeeID);
      return true;
    })
    .map((item) => ({
      employeeID: item.employeeID,
      display: `${item.fullName} (${item.employeeID})`,
    }))
    .sort((a, b) => a.display.localeCompare(b.display));
});

const uniqueAreasByUser = computed(() => {
  let filtered = rawReservationsByUser.value;

  // ถ้าเลือกชื่อพนักงาน → จำกัดพื้นที่เฉพาะที่เกี่ยวข้อง
  if (searchNameByUser.value?.length) {
    const selectedIDs = searchNameByUser.value.map((i) => i.employeeID);
    filtered = filtered.filter((item) => selectedIDs.includes(item.employeeID));
  }

  const seen = new Set();
  return filtered
    .filter((item) => item.ismArea)
    .filter((item) => {
      if (seen.has(item.ismArea)) return false;
      seen.add(item.ismArea);
      return true;
    })
    .map((item) => ({
      ismArea: item.ismArea,
      display: item.ismArea, // หรือแปลงชื่อให้อ่านง่ายก็ได้
    }))
    .sort((a, b) => a.display.localeCompare(b.display));
});

const selectedNameByUser = computed(() =>
  Array.isArray(searchNameByUser.value)
    ? searchNameByUser.value.map((i) => i.employeeID)
    : []
);

const selectedAreaByUser = computed(() =>
  Array.isArray(searchAreaByUser.value)
    ? searchAreaByUser.value.map((i) => i.ismArea) // ปรับให้ตรง field จริง
    : []
);
const filteredReservationsByUser = computed(() => {
  return rawReservationsByUser.value.filter((item) => {
    const matchName =
      selectedNameByUser.value.length === 0 ||
      selectedNameByUser.value.includes(item.employeeID);

    const matchArea =
      selectedAreaByUser.value.length === 0 ||
      selectedAreaByUser.value.includes(item.ismArea);

    return matchName && matchArea;
  });
});
const selectedItems = () => {
  return rawReservationsByUser.value.filter((item) =>
    selected.value.includes(item.index)
  );
};
const fetchReportByUser = async (data) => {
  isLoading.value = true;
  try {
    const response = await pWorkDaySummaryByUserReport(data);
    return response.results;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatDateConvert = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${day}.${month}.${year}`;
};

const showSnackbars = (message, color = "yellow") => {
  msgSnackbar.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};

const editItem = async (item) => {
  const response = await pWorkSessionByUserDate({
    sessionDate: item.sessionDate,
    employeeID: item.employeeID,
  });
  ReservationsSession.value = response.results;
  dialog.value = true;
};
const deleteItem = async (item) => {
  dialog.value = false;
  Swal.fire({
    html: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการเข้างาน <br/> วันที่ ${formatDate(
      item.sessionDate
    )} เวลา ${extractTime(item.checkedIn)} - ${extractTime(item.checkedOut)} น. ?`,
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
        await pDeletedWorkSessions({
          wsID: item.wsID,
        });

        Swal.fire({
          html: `ลบรายการสำเร็จ 🎉`,
          icon: "success",
          confirmButtonText: "OK",
          didOpen: () => {
            document.querySelector(".swal2-confirm").style.color = "white";
          },
        }).then((result) => {
          if (result.isConfirmed) {
            closeSummaryByUser();
            searchSummaryByUser();
          }
        });
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
        Swal.fire(
          "เกิดข้อผิดพลาด",
          "ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง!",
          "error"
        );
      } finally {
        isLoading.value = false;
      }
    } else {
      dialog.value = true;
    }
  });
};
const extractTime = (dateTimeStr) => {
  return dateTimeStr?.split(" ")[1] || "-";
};

const canDeletedWorkSession = () => {
  const allowedRoles = ["ISM_ADMIN", "ISM_MANAGER"];
  return userGroups.value.some((role) => allowedRoles.includes(role));
};

const exportFileExcelSummaryByUser = async () => {
  const data = selectedItems();
  if (data.length == 0) {
    return showSnackbars("กรุณาเลือกรายการที่ต้องการ export");
  }
  const requestList = data.map((item) => ({
    sessionDate: item.sessionDate,
    employeeID: item.employeeID,
  }));

  const initData = await fetchReportByUser(requestList);

  const grouped = initData.reduce((acc, item) => {
    const key = item.employeeID;
    if (!acc[key]) {
      acc[key] = {
        fullName: item.fullName,
        employeeID: item.employeeID,
        rows: [],
      };
    }

    acc[key].rows.push([
      formatDateConvert(item.sessionDate),
      item.employeeID,
      item.fullName,
      item.ismArea,
      item.branch1,
      item.checkIn1,
      item.checkOut1,
      item.reason1,
      item.branch2,
      item.checkIn2,
      item.checkOut2,
      item.reason2,
      item.branch3,
      item.checkIn3,
      item.checkOut3,
      item.reason3,
      item.branch4,
      item.checkIn4,
      item.checkOut4,
      item.reason4,
      item.summaryOT,
    ]);
    return acc;
  }, {});

  const header = [
    "วันที่บันทึกเวลา",
    "เลขพนักงาน",
    "ชื่อ",
    "เขต",
    "สาขาที่ 1",
    "เข้า",
    "ออก",
    "หมายเหตุ",
    "สาขาที่ 2",
    "เข้า",
    "ออก",
    "หมายเหตุ",
    "สาขาที่ 3",
    "เข้า",
    "ออก",
    "หมายเหตุ",
    "สาขาที่ 4",
    "เข้า",
    "ออก",
    "หมายเหตุ",
    "โอที",
  ];

  const wb = await XlsxPopulate.fromBlankAsync();

  const sheetKeys = Object.keys(grouped);

  sheetKeys.forEach((key, index) => {
    const { fullName, rows, employeeID } = grouped[key];

    const rawName = `(${employeeID}) ${fullName}`;
    const safeSheetName = rawName.replace(/[:\\/?*\[\]]/g, " ").substring(0, 31);

    const sheet =
      index === 0 ? wb.sheet(0).name(safeSheetName) : wb.addSheet(safeSheetName);

    // ✅ เขียนหัวตาราง
    header.forEach((title, i) => {
      sheet
        .cell(1, i + 1)
        .value(title)
        .style({
          fill: "007fc4",
          bold: true,
          fontColor: "ffffff",
          horizontalAlignment: "center",
          border: true,
        });
    });

    // ✅ เขียนข้อมูล
    rows.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        sheet
          .cell(rowIndex + 2, colIndex + 1)
          .value(value)
          .style({
            border: true,
            horizontalAlignment: "left",
          });
      });
    });

    // ✅ ปรับความกว้าง
    header.forEach((_, colIndex) => {
      let maxLength = header[colIndex].length;

      rows.forEach((row) => {
        const val = row[colIndex];
        if (val) maxLength = Math.max(maxLength, val.toString().length);
      });

      sheet.column(colIndex + 1).width(Math.min(maxLength * 1.2, 50));
    });

    sheet.usedRange().autoFilter(); // เพิ่ม filter
  });

  // ✅ Export
  const blob = await wb.outputAsync();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `WorkSummaryByUser.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const exportFileExcelSummary = async () => {
  const formattedData = rawReservations.value.map((item) => [
    item.employeeID,
    item.fullName,
    item.ismArea,
    item.workday,
    item.weeklyHoliday,
    item.publicHoliday,
    item.sickLeave,
    item.vacation,
    item.personalLeave,
    item.totalworkday,
    item.summaryOT,
  ]);

  const header = [
    "เลขพนักงาน",
    "ชื่อ",
    "เขต",
    "วันที่ทำงานปกติ",
    "วันหยุดประจำสัปดาห์",
    "วันหยุดนักขัตฤกษ์",
    "ลาป่วย",
    "พักร้อน",
    "ลากิจ",
    "วันที่งานทั้งหมด",
    "โอที",
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
  link.download = `Exported_WorkSummary_${selectedMonth.value}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
</script>

<style scoped>
.custom-tabs .v-tab {
  background-color: #007fc4;
  color: white;
  transition: background-color 0.3s ease;
  justify-content: center;
  text-align: center;
  height: 48px; /* ปรับความสูงถ้าต้องการ */
}
.custom-tabs .v-tab--selected {
  background-color: #f8c849 !important;
  color: black;
}
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
  margin-bottom: -1.2rem;
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
::v-deep(.v-data-table tbody .v-selection-control .v-icon) {
  color: #007fc4 !important;
}
</style>
