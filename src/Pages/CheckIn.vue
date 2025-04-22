<template>
  <v-container class="py-8">
    <v-card class="pa-6" elevation="6" rounded="xl">
      <!-- 📍 พิกัด & เวลา -->
      <v-row class="mb-2" dense>
        <v-col cols="12" md="6">
          <v-alert
            type="primary"
            variant="tonal"
            border="start"
            density="compact"
            class="pa-3 text-md-start text-start"
          >
            <v-icon start class="mr-2">mdi-map-marker</v-icon>
            <strong>พิกัดปัจจุบัน:</strong>
            {{ currentLat }}, {{ currentLon }}
          </v-alert>
        </v-col>

        <v-col cols="12" md="6">
          <v-alert
            type="primary"
            variant="tonal"
            border="start"
            density="compact"
            class="pa-3 text-md-end text-start"
          >
            <v-icon start class="mr-2">mdi-clock-time-four</v-icon>
            <strong>เวลา:</strong>
            {{ currentTime }}
          </v-alert>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- 🔽 Autocomplete -->
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            v-model="selectedItem"
            :items="items"
            label="เลือกสถานที่"
            item-title="display"
            item-value="key"
            return-object
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi-map-search"
          />
        </v-col>
      </v-row>

      <!-- 📌 พิกัดของสถานที่ที่เลือก -->
      <v-row v-if="selectedItem">
        <v-col cols="12" md="6">
          <v-alert
            type="primary"
            variant="tonal"
            border="start"
            density="compact"
            class="pa-3 text-md-start text-start"
          >
            📌 {{ selectedItem.display }}: {{ selectedItem.lat?.toFixed(6) }},
            {{ selectedItem.lon?.toFixed(6) }}
          </v-alert>
        </v-col>
        <v-col cols="12" md="6">
          <v-alert
            v-if="routeSummary"
            type="primary"
            class="pa-3 text-md-start text-start"
            border="start"
            variant="tonal"
          >
            {{ routeSummary }}
          </v-alert>
        </v-col>
      </v-row>
      <v-row justify="end">
        <v-col cols="12" md="4" class="text-end">
          <v-btn
            color="green"
            prepend-icon="mdi-directions"
            :disabled="!selectedItem"
            @click="openGoogleNavigation(selectedItem.lat, selectedItem.lon)"
          >
            เปิดนำทาง Google Maps
          </v-btn>
        </v-col>
      </v-row>
      <!-- 🗺️ แผนที่ Leaflet -->
      <v-row>
        <v-col cols="12">
          <div id="map" style="height: 400px; width: 100%; border-radius: 12px"></div>
        </v-col>
      </v-row>

      <!-- ✅ ปุ่มเช็คอิน / เช็คเอาท์ -->
      <v-row class="mt-4" align="center" justify="space-between">
        <v-col cols="12" class="text-center">
          <v-btn
            color="primary"
            :disabled="!selectedItem || !isWithinRadius"
            @click="checkIn"
            v-if="!hasCheckedIn"
            size="large"
            prepend-icon="mdi-login"
          >
            เช็คอิน
          </v-btn>

          <v-btn
            color="error"
            v-if="hasCheckedIn"
            @click="checkOut"
            size="large"
            prepend-icon="mdi-logout"
          >
            เช็คเอ้าท์
          </v-btn>
        </v-col>
      </v-row>

      <!-- 📝 รายการเช็คอิน -->
      <v-row v-if="checkedInItems.length" class="mt-6">
        <v-col cols="12">
          <h4 class="text-h6 mb-4">📋 รายการเช็คอิน</h4>

          <v-row
            v-for="(item, i) in [...checkedInItems].slice().reverse()"
            :key="i"
            class="align-center py-2 px-3 mb-2 rounded-lg"
            style="border: 1px solid #ddd; background-color: white"
          >
            <v-col cols="12" md="3" class="text-subtitle-1 font-weight-medium">
              <v-icon color="primary" size="22" class="mr-2">mdi-map-marker-check</v-icon>
              {{ item.display }}
            </v-col>

            <v-col cols="12" md="3" class="text-body-1 text-grey-darken-1">
              ✅ <strong>เช็คอิน:</strong> {{ item.checkedInTime }}
            </v-col>

            <v-col cols="12" md="4" class="text-body-1">
              <span v-if="item.checkedOutTime">
                ⏹️ <strong>เช็คเอ้าท์:</strong> {{ item.checkedOutTime }}<br />
                ⏱️ <strong>อยู่:</strong>
                {{ calculateDuration(item.checkedInTime, item.checkedOutTime) }}
              </span>
              <span v-else class="text-warning font-italic"> ⏳ ยังไม่เช็คเอ้าท์ </span>
            </v-col>

            <v-col cols="12" md="2" class="text-end">
              <v-btn
                v-if="!item.checkedOutTime && i === 0"
                color="error"
                variant="elevated"
                size="small"
                @click="removeLastCheckIn"
                icon
              >
                <v-icon size="20">mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
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

dayjs.extend(duration);

const items = [
  { key: 1, display: "ออฟฟิศ", lat: 13.7765941, lon: 100.669607 },
  { key: 2, display: "บ้าน", lat: 13.816193, lon: 100.610403 },
  { key: 3, display: "ร้านกาแฟ", lat: 13.75, lon: 100.51 },
];

const selectedItem = ref(null);
const currentLat = ref(null);
const currentLon = ref(null);
const currentTime = ref("");
const hasCheckedIn = ref(false);
const checkedInItems = ref([]);
const userPositionReady = ref(false);
let interval = null;
const routeSummary = ref("");
const hasAlertedLocationError = ref(false);
let currentLocationMarker = null;

const map = ref(null);

const orsApiKey = "5b3ce3597851110001cf624825291faac30d48ce9c22d595f3c69981";

let startMarker = null;
let endMarker = null;
let routeTimeout = null;
let radiusCircle = null;

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

watch(selectedItem, () => {
  if (selectedItem.value) {
    markAndCalculateOnly(selectedItem.value.lat, selectedItem.value.lon);
  }
});

// watch(selectedItem, () => {
//   if (userPositionReady.value) {
//     updateMapView();
//   }
// });
// watch(selectedItem, () => {
//   if (routeTimeout) clearTimeout(routeTimeout);

//   routeTimeout = setTimeout(() => {
//     if (selectedItem.value && currentLat.value != null && currentLon.value != null) {
//       getRouteAndDraw(
//         currentLat.value,
//         currentLon.value,
//         selectedItem.value.lat,
//         selectedItem.value.lon
//       );
//     }
//   }, 500);
// });

const openGoogleNavigation = (lat, lon) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=car`;
  window.open(url, "_blank");
};

const getRouteAndDraw = async (fromLat, fromLon, toLat, toLon) => {
  try {
    // ลบ Layer/Source เดิมทั้งหมดถ้ามี
    if (map.value.getLayer("route-line")) map.value.removeLayer("route-line");
    if (map.value.getSource("route")) map.value.removeSource("route");

    if (map.value.getLayer("radius")) map.value.removeLayer("radius");
    if (map.value.getSource("radius")) map.value.removeSource("radius");

    if (startMarker) startMarker.remove();
    if (endMarker) endMarker.remove();

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${fromLon},${fromLat}&end=${toLon},${toLat}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`OpenRouteService error: ${res.status}`);

    const data = await res.json();
    const geometry = data.features[0].geometry;
    const distance = data.features[0].properties.segments[0].distance;
    const duration = data.features[0].properties.segments[0].duration;

    routeSummary.value = `ระยะทางจริง: ${(distance / 1000).toFixed(
      2
    )} กม. | เวลาโดยประมาณ: ${Math.round(duration / 60)} นาที`;

    // ➕ วาดเส้นทาง
    map.value.addSource("route", {
      type: "geojson",
      data: geometry,
    });

    map.value.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#FF5252",
        "line-width": 4,
      },
    });

    // ➕ Marker
    startMarker = new maplibregl.Marker({ color: "green" })
      .setLngLat([fromLon, fromLat])
      .addTo(map.value);

    endMarker = new maplibregl.Marker({ color: "red" })
      .setLngLat([toLon, toLat])
      .addTo(map.value);

    // ➕ วงรัศมี 500 เมตร
    const circleGeo = turf.circle([toLon, toLat], 0.5, {
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
      layout: {},
      paint: {
        "fill-color": "#3f51b5",
        "fill-opacity": 0.2,
      },
    });

    // ➕ Fit view
    const bounds = turf.bbox(geometry);
    map.value.fitBounds(bounds, { padding: 50 });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการโหลดเส้นทาง:", err);
    routeSummary.value = "ไม่สามารถโหลดเส้นทางได้";
  }
};

const updateMapView = () => {
  if (
    !map.value ||
    !selectedItem.value ||
    currentLat.value == null ||
    currentLon.value == null
  )
    return;

  const { lat, lon } = selectedItem.value;

  getRouteAndDraw(currentLat.value, currentLon.value, lat, lon);
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
  const start = dayjs(`2024-01-01 ${checkIn}`, "YYYY-MM-DD HH:mm:ss");
  const end = dayjs(`2024-01-01 ${checkOut}`, "YYYY-MM-DD HH:mm:ss");
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
  if (!selectedItem.value || currentLat.value == null || currentLon.value == null)
    return false;
  const d = getDistance(
    currentLat.value,
    currentLon.value,
    selectedItem.value.lat,
    selectedItem.value.lon
  );
  return d <= 1000;
});

const getLocation = async () => {
  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });
    if (permission.state === "denied" && !hasAlertedLocationError.value) {
      hasAlertedLocationError.value = true;
      currentLat.value = "ไม่สามารถเข้าถึง";
      currentLon.value = "ไม่สามารถเข้าถึง";
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถเข้าถึงตำแหน่ง",
        html: `กรุณาอนุญาตตำแหน่งผ่าน <b>การตั้งค่าเบราว์เซอร์</b><br><br>
         หากอนุญาตแล้ว กรุณา <b>รีโหลดหน้า</b>เพื่อใช้งานอีกครั้ง`,
        confirmButtonText: "รีโหลดหน้า",
      }).then(() => {
        location.reload(); // รีโหลดหน้าเพื่อให้ permission เปลี่ยนมีผล
      });

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        userPositionReady.value = true;
        currentLat.value = lat;
        currentLon.value = lon;
        hasAlertedLocationError.value = false;

        // วาง/อัปเดต marker ตำแหน่งปัจจุบัน
        if (map.value) {
          if (currentLocationMarker) {
            currentLocationMarker.setLngLat([lon, lat]);
          } else {
            currentLocationMarker = new maplibregl.Marker({
              element: createCustomIcon("mdi-account-badge-outline", "#007fc4"),
            })
              .setLngLat([lon, lat])
              .addTo(map.value);
          }
        }
      },
      () => {
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
    );
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการตรวจสอบ permission", err);
  }
};

const checkIn = () => {
  const now = formatTime(new Date());
  checkedInItems.value.push({
    ...selectedItem.value,
    checkedInTime: now,
    checkedOutTime: null,
  });
  hasCheckedIn.value = true;
};

const checkOut = () => {
  const now = formatTime(new Date());
  const lastIndex = [...checkedInItems.value]
    .reverse()
    .findIndex((item) => !item.checkedOutTime);

  if (lastIndex !== -1) {
    const realIndex = checkedInItems.value.length - 1 - lastIndex;
    checkedInItems.value[realIndex].checkedOutTime = now;
  }

  hasCheckedIn.value = false;
};

const removeLastCheckIn = () => {
  if (
    checkedInItems.value.length &&
    !checkedInItems.value[checkedInItems.value.length - 1].checkedOutTime
  ) {
    checkedInItems.value.pop();
    hasCheckedIn.value = false;
  }
};

const updateTime = () => {
  currentTime.value = formatTime(new Date());
};

onMounted(async () => {
  await nextTick();

  // สร้างแผนที่
  map.value = new maplibregl.Map({
    container: "map",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    center: [100.669607, 13.7765941],
    zoom: 13,
  });
  getLocation();
  updateTime();
  interval = setInterval(() => {
    updateTime();
    getLocation();
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>
