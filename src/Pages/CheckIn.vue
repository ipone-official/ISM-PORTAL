<template>
  <v-container class="py-8">
    <v-card class="pa-6" elevation="6" rounded="xl">
      <!-- 📍 พิกัด & เวลา -->
      <v-row class="mb-2" dense>
        <v-col cols="12" md="6">
          <v-alert
            variant="tonal"
            border="start"
            density="compact"
            class="pa-3 text-md-start text-start custom-pink-alert"
          >
            <v-icon start class="mr-2">mdi-map-marker-outline</v-icon>
            พิกัดปัจจุบัน :
            {{ currentLat }}, {{ currentLon }}
          </v-alert>
        </v-col>

        <v-col cols="12" md="6">
          <v-alert
            variant="tonal"
            border="start"
            density="compact"
            class="pa-3 text-md-start text-start custom-pink-alert"
          >
            <v-icon start class="mr-2">mdi-clock-time-four-outline</v-icon>
            เวลา :
            {{ currentTime }}
          </v-alert>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- 🔽 Autocomplete -->
      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-autocomplete
            v-model="mHolidayType"
            :items="iHolidayType"
            label="ประเภททำงาน"
            item-title="holidayDesc"
            item-value="holidayTypeID"
            return-object
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi-map-search"
            class="filter-select input-field"
            :readonly="hasCheckedIn"
          />
        </v-col>
        <v-col cols="12" sm="6" md="6">
          <v-autocomplete
            v-model="mBranch"
            :items="iBranch"
            label="เลือกสถานที่"
            item-title="display"
            item-value="soldto"
            return-object
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi-map-search"
            class="filter-select input-field"
            :readonly="hasCheckedIn"
          />
        </v-col>
      </v-row>

      <!-- 📌 พิกัดของสถานที่ที่เลือก -->
      <v-row v-if="mBranch">
        <v-col cols="12" md="6">
          <v-alert
            variant="tonal"
            border="start"
            class="pa-3 text-md-start text-start custom-pink-alert"
          >
            📌 {{ mBranch.display }}: {{ latitudeFormatted }},
            {{ longitudeFormatted }}
          </v-alert>
        </v-col>
        <v-col cols="12" md="6">
          <v-alert
            v-if="routeSummary"
            class="pa-3 text-md-start text-start custom-pink-alert"
            border="start"
            variant="tonal"
          >
            <v-icon start class="mr-2">mdi-clock-time-four-outline</v-icon>
            {{ routeSummary }}
          </v-alert>
        </v-col>
      </v-row>
      <v-row justify="end">
        <v-col cols="12" md="4" class="text-end">
          <v-btn
            color="green"
            prepend-icon="mdi-directions"
            :disabled="!mBranch"
            @click="openGoogleNavigation(mBranch.latitude, mBranch.longitude)"
          >
            เปิดนำทาง Google Maps
          </v-btn>
        </v-col>
      </v-row>
      <!-- 🗺️ แผนที่ Leaflet -->
      <v-row>
        <v-col cols="12">
          <div ref="mapContainer" style="height: 400px; width: 100%" />
        </v-col>
      </v-row>

      <!-- ✅ ปุ่มเช็คอิน / เช็คเอาท์ -->
      <v-row class="mt-4" align="center" justify="space-between">
        <v-col cols="12" class="text-center">
          <!--  
          :disabled="!mBranch || !isWithinRadius" -->
          <v-btn
            color="primary"
            @click="checkInOut"
            size="large"
            prepend-icon="mdi-login"
            v-if="!hasCheckedIn"
            :disabled="!mBranch || !isWithinRadius"
          >
            เช็คอิน
          </v-btn>

          <v-btn
            color="error"
            v-if="hasCheckedIn"
            @click="checkInOut"
            size="large"
            prepend-icon="mdi-logout"
          >
            เช็คเอาท์
          </v-btn>
        </v-col>
      </v-row>

      <!-- 📝 รายการเช็คอิน -->
      <v-row v-if="checkedInItems.length" class="mt-6">
        <v-col cols="12">
          <h4 class="text-h6 mb-4">📋 รายการเช็คอิน</h4>

          <v-row
            v-for="(item, i) in checkedInItems"
            :key="i"
            class="align-center py-2 px-3 mb-2 rounded-lg"
            style="border: 1px solid #ddd; background-color: white"
          >
            <v-col cols="12" md="3" class="text-subtitle-1 font-weight-medium">
              <v-icon color="primary" size="22" class="mr-2">mdi-map-marker-check</v-icon>
              {{ item.branchName }}
            </v-col>

            <v-col cols="12" md="3" class="text-body-1 text-grey-darken-1">
              ✅ <strong>เช็คอิน:</strong> {{ formatDateTime(item.checkedIn) }}
            </v-col>

            <v-col cols="12" md="4" class="text-body-1">
              <span v-if="item.checkedOut">
                ⏹️ <strong>เช็คเอาท์:</strong> {{ formatDateTime(item.checkedOut)
                }}<br />
                ⏱️ <strong>อยู่:</strong>
                {{ calculateDuration(item.checkedIn, item.checkedOut) }}
              </span>
              <span v-else class="text-warning font-italic"> ⏳ ยังไม่เช็คเอ้าท์ </span>
            </v-col>

            <v-col cols="12" md="2" class="text-end">
              <v-btn
                v-if="!item.checkedOut && i === 0"
                color="error"
                variant="elevated"
                size="small"
                @click="removeLastCheckIn(item)"
                icon
              >
                <v-icon size="20">mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import {
  gMasterCustomers,
  gMHolidayTypes,
  pInsertWorkSessions,
  gWorkSessionsBy,
  pDeletedWorkSessions,
} from "@/services/apiISM";
import { useUserStore } from "@/stores/userStore";

dayjs.extend(duration);

const mapContainer = ref(null);
const mBranch = ref(null);
const iBranch = ref([]);
const currentLat = ref(null);
const currentLon = ref(null);
const currentTime = ref("");
const hasCheckedIn = ref(false);
const checkedInItems = ref([]);
const notCheckedOutItems = ref([]);
let interval = null;
const routeSummary = ref("");
const hasAlertedLocationError = ref(false);
let currentLocationMarker = null;
const mHolidayType = ref(null);
const iHolidayType = ref([]);

const showSnackbar = ref(false);
const msgSnackbar = ref("");
const snackbarColor = ref("success");

const map = ref(null);

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

const isLoading = ref(false);

let endMarker = null;
// let routeTimeout = null;
// let radiusCircle = null;

const createCustomIcon = (mdiIcon, color) => {
  const el = document.createElement("div");
  el.innerHTML = `
    <i class="mdi ${mdiIcon}" style="font-size: 28px; color: ${color};"></i>
  `;
  el.className = "custom-marker";
  return el;
};

const markAndCalculateOnly = (lat, lon) => {
  if (!map.value || currentLat.value == null || currentLon.value == null) return;
  // 🔴 ลบ marker จุดเลือกเดิม
  if (endMarker) endMarker.remove();

  // 🔵 ลบรัศมีเดิม
  if (map.value.getLayer("radius")) map.value.removeLayer("radius");
  if (map.value.getSource("radius")) map.value.removeSource("radius");

  // 🔴 วาง marker จุดที่เลือก
  endMarker = new maplibregl.Marker({
    element: createCustomIcon("mdi-map-marker", "#E53935"),
  })
    .setLngLat([lon, lat])
    .addTo(map.value);

  // 🔵 สร้างวงกลมรัศมี 500 เมตร
  const circleGeo = turf.circle([lon, lat], 0.5, {
    steps: 64,
    units: "kilometers",
  });

  map.value.addSource("radius", {
    type: "geojson",
    data: circleGeo,
  });

  map.value.addLayer({
    id: "radius",
    type: "fill",
    source: "radius",
    paint: {
      "fill-color": "#3f51b5",
      "fill-opacity": 0.2,
    },
  });

  // 📏 คำนวณระยะทาง + เวลาโดยประมาณ
  const d = getDistance(currentLat.value, currentLon.value, lat, lon);
  const estimatedMinutes = Math.round((d / 1000 / 5) * 60);
  routeSummary.value = `ระยะทางประมาณ ${(d / 1000).toFixed(
    2
  )} กม. | เวลาเดินประมาณ ${estimatedMinutes} นาที`;

  // 🔍 Zoom ไปยังตำแหน่ง
  map.value.flyTo({ center: [lon, lat], zoom: 15 });
};

watch(mBranch, () => {
  const lat = parseFloat(mBranch.value?.latitude);
  const lon = parseFloat(mBranch.value?.longitude);

  if (mBranch.value && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
    markAndCalculateOnly(lat, lon);
  } else {
    // 🔴 ลบรัศมีออกจากแผนที่
    if (map.value) {
      if (map.value.getLayer("radius")) map.value.removeLayer("radius");
      if (map.value.getSource("radius")) map.value.removeSource("radius");
    }

    // 🔄 ลบ marker ปลายทางถ้ามี
    if (endMarker) {
      endMarker.remove();
      endMarker = null;
    }

    // 🔄 ล้างข้อความระยะทางด้วย
    routeSummary.value = "";
  }
});

const latitudeFormatted = computed(() => {
  const lat = parseFloat(mBranch.value.latitude);
  return isNaN(lat) ? 0.0 : lat.toFixed(6);
});
const longitudeFormatted = computed(() => {
  const lat = parseFloat(mBranch.value.longitude);
  return isNaN(lat) ? 0.0 : lat.toFixed(6);
});

const openGoogleNavigation = (lat, lon) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=car`;
  window.open(url, "_blank");
};

const formatTime = (date) => {
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const calculateDuration = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;

  const start = dayjs(checkIn, "YYYYMMDD HH:mm");
  const end = dayjs(checkOut, "YYYYMMDD HH:mm");

  const diff = dayjs.duration(end.diff(start));
  const h = diff.hours();
  const m = diff.minutes();

  return `${h > 0 ? `${h} ชม.` : ""} ${m} นาที`;
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isWithinRadius = computed(() => {
  if (!mBranch.value || currentLat.value == null || currentLon.value == null)
    return false;

  const branchLat = mBranch.value.latitude;
  const branchLon = mBranch.value.longitude;

  // ✅ ถ้า latitude หรือ longitude เป็น 0, null, undefined, "" → ให้ผ่านได้เลย
  const isLatLonMissing =
    !branchLat || !branchLon || isNaN(branchLat) || isNaN(branchLon);

  if (isLatLonMissing) return true;

  const d = getDistance(
    currentLat.value,
    currentLon.value,
    Number(branchLat),
    Number(branchLon)
  );

  return d <= 1000;
});

const getLocation = async () => {
  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });

    // ถ้ายังไม่อนุญาตหรือไม่เคยให้สิทธิ์เลย
    if (permission.state === "prompt") {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
      return;
    }

    // ถ้าเคยอนุญาตแล้ว
    if (permission.state === "granted") {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
      return;
    }

    // ถ้าผู้ใช้ "เคยปฏิเสธไปแล้ว" -> ต้องให้ user ไป reset เอง
    if (permission.state === "denied" && !hasAlertedLocationError.value) {
      hasAlertedLocationError.value = true;
      currentLat.value = "ไม่สามารถเข้าถึง";
      currentLon.value = "ไม่สามารถเข้าถึง";

      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถเข้าถึงตำแหน่ง",
        html: `
          <p>คุณได้ปฏิเสธการขออนุญาตตำแหน่ง</p>
          <p>กรุณาเปิดอนุญาตตำแหน่งผ่าน <b>การตั้งค่าเบราว์เซอร์</b></p>
          <ul style="text-align:left;">
            <li>คลิกที่ไอคอน 🔒 ข้าง URL</li>
            <li>เลือก "Site settings" หรือ "การตั้งค่าเว็บไซต์"</li>
            <li>เปลี่ยน Location เป็น "Allow"</li>
          </ul>
          <p>จากนั้นให้รีโหลดหน้าเว็บอีกครั้ง</p>
        `,
        confirmButtonText: "รีโหลดหน้า",
      }).then(() => location.reload());

      return;
    }
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการตรวจสอบ permission", err);
  }

  // ฟังก์ชัน callback สำเร็จ
  function successCallback(pos) {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    currentLat.value = lat;
    currentLon.value = lon;
    hasAlertedLocationError.value = false;

    if (map.value && map.value.isStyleLoaded()) {
      if (currentLocationMarker) {
        currentLocationMarker.setLngLat([lon, lat]);
      } else {
        currentLocationMarker = new maplibregl.Marker({
          element: createCustomIcon("mdi-account-badge-outline", "#007fc4"),
        })
          .setLngLat([lon, lat])
          .addTo(map.value);
      }
    } else {
      console.warn("🕗 map ยังโหลดไม่สมบูรณ์ เลยยังไม่วาง marker");
    }
  }

  // ฟังก์ชัน callback ล้มเหลว
  function errorCallback() {
    if (!hasAlertedLocationError.value) {
      hasAlertedLocationError.value = true;
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงตำแหน่งของคุณได้",
        confirmButtonText: "รับทราบ",
      });
    }
    currentLat.value = "ไม่สามารถเข้าถึง";
    currentLon.value = "ไม่สามารถเข้าถึง";
  }
};
const resetForm = () => {
  mHolidayType.value = {
    holidayTypeID: "H01",
    holidayDesc: "วันทำงานปกติ",
  };
  mBranch.value = null;
  hasCheckedIn.value = false;
  checkedInItems.value = [];
  notCheckedOutItems.value = [];
};
const showSnackbars = (message, color = "yellow") => {
  msgSnackbar.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};

const checkInOut = async () => {
  isLoading.value = true;
  if (!mBranch.value) {
    return showSnackbars("กรุณาเลือกสถานที่");
  }
  try {
    const data = {
      wsID: notCheckedOutItems.value.length != 0 ? notCheckedOutItems.value[0].wsID : "",
      userID: userStore.empId,
      latitude: mBranch.value.latitude == 0 ? currentLat.value : mBranch.value.latitude,
      longitude:
        mBranch.value.longitude == 0 ? currentLon.value : mBranch.value.longitude,
      branchCode: mBranch.value.soldto,
      branchName: mBranch.value.branch,
      province: mBranch.value.province,
      holidayTypeID: mHolidayType.value.holidayTypeID,
      ismArea: mBranch.value.ismArea,
    };
    const response = await pInsertWorkSessions(data);
    Swal.fire({
      icon: "success",
      title: "บันทึกรายการสำเร็จ 🎉",
      html: `บันทึกเวลาเลขที่ <strong>"${response.results}"</strong>`,
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#007fc4",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        document.querySelector(".swal2-confirm").style.color = "white";
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        resetForm();
        fetchWorkSessionsList(userStore.empId);
      }
    });
  } catch (error) {
    console.error("❌ Error pInsertWorkSessions:", error);
  } finally {
    isLoading.value = false;
  }
};

const removeLastCheckIn = (item) => {
  Swal.fire({
    html: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการเช็คอิน <br/> ร้าน : <strong>${
      item.branchName
    }</strong> <br/> วันที่เวลา : ${formatDateTime(item.checkedIn)} ?`,
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
          wsID: item.wsID,
        };
        await pDeletedWorkSessions(init);
        Swal.fire({
          html: `ลบรายการเช็คอินร้าน ${item.branchName} สำเร็จ 🎉`,
          icon: "success",
          confirmButtonText: "OK",
          didOpen: () => {
            document.querySelector(".swal2-confirm").style.color = "white";
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            resetForm();
            fetchWorkSessionsList(userStore.empId);
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

const updateTime = () => {
  currentTime.value = formatTime(new Date());
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

const formatDateTime = (input) => {
  const datePart = input.substring(0, 8);
  const timePart = input.substring(9, 14);

  const year = datePart.substring(0, 4);
  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);

  return `${day}/${month}/${year} ${timePart}`;
};

const fetchMasterHolidayType = async () => {
  isLoading.value = true;
  try {
    const response = await gMHolidayTypes();
    iHolidayType.value = response.results.map((item) => ({
      ...item,
    }));
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
};
const fetchWorkSessionsList = async (item) => {
  isLoading.value = true;
  try {
    const response = await gWorkSessionsBy(item);
    // map พร้อม flag
    const mappedItems = response.results.map((item) => ({
      ...item,
      isCheckedOut: !!item.checkedOut && item.checkedOut.trim() !== "",
    }));

    // อัปเดตตัวแปรทั้งหมด

    // ✅ เรียง wsID มาก → น้อย
    mappedItems.sort((a, b) => {
      const aNum = parseInt(a.wsID.replace(/\D/g, ""));
      const bNum = parseInt(b.wsID.replace(/\D/g, ""));
      return bNum - aNum;
    });

    checkedInItems.value = mappedItems;

    // กรองเฉพาะรายการที่ยังไม่เช็คเอาท์
    notCheckedOutItems.value = mappedItems.filter((item) => !item.isCheckedOut);
    if (notCheckedOutItems.value.length != 0) {
      hasCheckedIn.value = true;
      mHolidayType.value = {
        holidayTypeID: notCheckedOutItems.value[0].holidayTypeID,
        holidayDesc: notCheckedOutItems.value[0].holidayDesc,
      };
      mBranch.value = {
        soldto: notCheckedOutItems.value[0].branchCode,
        name: notCheckedOutItems.value[0].branchName,
        branch: notCheckedOutItems.value[0].branchName,
        ismArea: notCheckedOutItems.value[0].ismArea,
        province: notCheckedOutItems.value[0].province,
        latitude: notCheckedOutItems.value[0].latitude,
        longitude: notCheckedOutItems.value[0].longitude,
        display: `${notCheckedOutItems.value[0].branchCode} - ${notCheckedOutItems.value[0].branchName}`,
      };
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  nextTick(() => {
    map.value = new maplibregl.Map({
      container: mapContainer.value, // ✅ ใช้ ref ปลอดภัยกว่า id
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [100.5018, 13.7563],
      zoom: 14,
    });

    // ✅ รอให้ map โหลด style เสร็จก่อน
    map.value.on("load", () => {
      // ✅ เช็คซ้ำด้วย isStyleLoaded() เพื่อความชัวร์
      const waitForStyle = () => {
        if (!map.value.isStyleLoaded()) {
          requestAnimationFrame(waitForStyle);
        } else {
          getLocation(); // 👉 ปักหมุด / แสดงตำแหน่งผู้ใช้
          updateTime(); // 👉 อัปเดตเวลาแสดงผล
          interval = setInterval(() => {
            updateTime();
            getLocation();
          }, 1000); // ✅ อัปเดตทุก 1 วิ
        }
      };
      waitForStyle();
    });
  });

  // ✅ คำสั่งอื่นๆ ที่ไม่เกี่ยวกับ map สามารถเรียกได้ทันที
  const dataForCustomers = determineFetchData(userGroups.value, userStore);
  fetchMasterCustomers(dataForCustomers);
  fetchMasterHolidayType();
  mHolidayType.value = {
    holidayTypeID: "H01",
    holidayDesc: "วันทำงานปกติ",
  };
});

watch(currentLat, (val) => {
  if (val !== null) {
    fetchWorkSessionsList(userStore.empId);
  }
});
onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  if (map.value) map.value.remove();
});
</script>
<style scoped>
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

.custom-pink-alert {
  background-color: #ffd6dd !important;
  color: #4a1c2b !important;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 192, 203, 0.2);
}
</style>
