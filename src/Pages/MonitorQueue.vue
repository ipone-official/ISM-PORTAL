<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container>
    <v-row class="justify-end">
      <v-col cols="12" sm="4" md="5" class="filter-col">
        <v-text-field
          v-model="mSearch"
          label="Search"
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          class="search-bar input-field"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4" md="3" class="filter-col">
        <v-autocomplete
          v-model="mFilterDropOffLocation"
          :items="iFilterDropOffLocation"
          label="จุดลงสินค้า"
          item-title="display"
          item-value="key"
          outlined
          dense
          class="filter-select input-field custom-autocomplete"
          return-object
          multiple
          :color="'primary'"
          active-class="custom-active-class"
        ></v-autocomplete>
      </v-col>
    </v-row>
    <v-row dense align="center" justify="start" class="mt-5">
      <!-- ตารางข้อมูล -->
      <v-data-table
        :headers="headers"
        :items="iQueueDaily"
        :search="mSearch"
        class="data-table"
        dense
        rounded
      >
        <template v-slot:top>
          <v-toolbar flat class="custom-toolbar">
            <v-toolbar-title class="centered-title">รายการคิววันนี้</v-toolbar-title>
            <v-tooltip text="Refresh" location="bottom" color="blue" text-color="white">
              <template v-slot:activator="{ props }">
                <v-btn icon variant="text" v-bind="props" @click="fetchQueueDaily">
                  <v-icon color="blue">mdi-refresh</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-toolbar>
        </template>
        <template v-slot:item="{ item, index }">
          <tr :class="getRowClass(item.status)">
            <td>{{ index + 1 }}</td>
            <td>{{ item.queueID }}</td>
            <td>{{ item.vendorDesc }}</td>
            <td>{{ item.dropOffLocationDesc }}</td>
            <td>{{ item.startTime }}</td>
            <td>{{ item.endTime }}</td>
            <td class="actions-cell">
              <!-- เช็คอิน -->
              <v-tooltip
                text="เช็คอิน"
                location="bottom"
                color="primary"
                text-color="white"
                v-if="canShowButton(item.status, 'TruckQueue_Store', 'ACCEPTED')"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    v-bind="props"
                    @click="UpdateStatusQueue(item, 'CHECKIN')"
                  >
                    <v-icon color="primary" size="35">mdi-traffic-light</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <!-- ลงสินค้า -->
              <v-tooltip
                text="ลงสินค้า"
                location="bottom"
                color="primary"
                text-color="white"
                v-if="canShowButton(item.status, 'TruckQueue_Forklift', 'CHECKIN')"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    v-bind="props"
                    @click="UpdateStatusQueue(item, 'INPROGRESS')"
                  >
                    <v-icon color="primary" size="35">mdi-forklift</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <!-- เช็คเอาท์ -->
              <v-tooltip
                text="เช็คเอาท์"
                location="bottom"
                color="primary"
                text-color="white"
                v-if="canShowButton(item.status, 'TruckQueue_Forklift', 'INPROGRESS')"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    v-bind="props"
                    @click="UpdateStatusQueue(item, 'CHECKOUT')"
                  >
                    <v-icon color="primary" size="35">mdi-truck-check-outline</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <!-- เสร็จสิ้น -->
              <v-tooltip
                text="เสร็จสิ้น"
                location="bottom"
                color="primary"
                text-color="white"
                v-if="canShowButton(item.status, 'TruckQueue_Store', 'CHECKOUT')"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    v-bind="props"
                    @click="UpdateStatusQueue(item, 'COMPLETED')"
                  >
                    <v-icon color="primary" size="35">mdi-store-check-outline</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <!-- แสดง .gif ถ้าไม่ใช่ forklift แต่สถานะเป็น INPROGRESS -->
              <v-img
                v-if="
                  item.status === 'INPROGRESS' &&
                  !hasRole('TruckQueue_Forklift') &&
                  !hasRole('TruckQueue_Admin')
                "
                :src="forkliftGif"
                max-width="70"
                class="mx-3"
                alt="กำลังดำเนินการ"
                aspect-ratio="1"
                cover
              />
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-row>

    <loading :isLoading="isLoading" />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import loading from "@/components/Loading.vue";
import { gQueueByDaily, pUpdateStatusQueue } from "@/services/apiTruckQueue.js";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/userStore";

const headers = [
  { title: "ลำดับ", align: "left", key: "index" },
  { title: "เลขที่คิวรถ", align: "left", key: "queueID" },
  { title: "ผู้ขาย", align: "left", key: "vendorDesc" },
  { title: "จุดลงสินค้า", align: "left", key: "dropOffLocationDesc" },
  { title: "เวลาส่งสินค้า", align: "left", key: "startTime" },
  { title: "เวลาสื้นสุดส่งสินค้า", align: "left", key: "endTime" },
  { title: "Actions", align: "left", key: "actions" },
];
const forkliftGif = new URL("@/assets/images/Forklift.gif", import.meta.url).href;
const mFilterDropOffLocation = ref([]);
const iQueueDaily = ref([]);
const isLoading = ref(false);
const mSearch = ref("");

const userStore = useUserStore();

// ดึง groups จาก userStore
const userGroups = computed(() => userStore.group || []);

// ฟังก์ชันเช็คว่าอยู่ใน group นี้ไหม
const hasRole = (role) => userGroups.value.includes(role);

// ฟังก์ชันเช็คสิทธิ์ในการแสดงปุ่ม
const canShowButton = (status, requiredRole, requiredStatus) => {
  return (
    hasRole("TruckQueue_Admin") || // Admin เห็นทุกปุ่ม
    (hasRole(requiredRole) && status === requiredStatus)
  );
};

// ตัวแปรเก็บข้อมูลทั้งหมดที่ดึงมาจาก API
const rawReservations = ref([]);

// Watch เพื่อกรองข้อมูลเมื่อเลือก drop-off location
watch([mFilterDropOffLocation], ([newDropOff]) => {
  let filtered = rawReservations.value;

  // ✅ กรองตาม Drop-off Location ที่เลือก
  if (newDropOff.length > 0) {
    filtered = filtered.filter((item) =>
      newDropOff.some((dropOff) => dropOff.key === item.dropOffLocation)
    );
  }

  iQueueDaily.value = filtered;
});

// ตัวเลือกใน v-autocomplete สร้างจากข้อมูลทั้งหมด
const iFilterDropOffLocation = computed(() => {
  const dropOffMap = new Map();

  rawReservations.value.forEach((item) => {
    if (item.dropOffLocation) {
      dropOffMap.set(item.dropOffLocation, item.dropOffLocationDesc);
    }
  });

  return Array.from(dropOffMap, ([key, display]) => ({
    key,
    display,
  }));
});

const fetchQueueDaily = async () => {
  isLoading.value = true;
  try {
    const response = await gQueueByDaily();
    rawReservations.value = response.results;
    iQueueDaily.value = response.results;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
  } finally {
    isLoading.value = false;
  }
};
const statusLabelMap = {
  OPEN: "เปิดจอง",
  CONFIRMED: "ยืนยันแล้ว",
  ACCEPTED: "สำรองคิวแล้ว",
  CHECKIN: "เช็คอิน",
  INPROGRESS: "กำลังให้บริการ",
  CHECKOUT: "เช็คเอาท์",
  COMPLETED: "เสร็จสมบูรณ์",
  CANCELLED: "ยกเลิก",
};
const getRowClass = (status) => {
  if (status === "CHECKIN") return "row-checkin";
  if (status === "CHECKOUT") return "row-checkout";
  return "";
};

const UpdateStatusQueue = async (item, status) => {
  Swal.fire({
    html: `${`คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะเป็น <strong>"${statusLabelMap[status]}"</strong><br/> ของคิวเลขที่ ${item.queueID}`}`,
    icon: "warning",
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonText: "OK",
    didOpen: () => {
      document.querySelector(".swal2-confirm").style.color = "white"; // เปลี่ยนสีตัวอักษรเป็นสีขาว
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        const data = [
          {
            queueId: item.queueID,
            updateBy: userStore.empId,
            status: status,
          },
        ];
        await pUpdateStatusQueue(data);
        Swal.fire({
          html: `เปลี่ยนสถานะสำเร็จ`,
          icon: "success",
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: "OK",
          didOpen: () => {
            document.querySelector(".swal2-confirm").style.color = "white";
          },
        }).then((result) => {
          if (result.isConfirmed) {
            fetchQueueDaily();
          }
        });
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
      } finally {
        isLoading.value = false;
      }
    }
  });
  return;
};

onMounted(() => {
  fetchQueueDaily();
});
</script>

<style scoped>
@keyframes blink-orange {
  0%,
  100% {
    background-color: #fff1b8; /* ส้มอ่อนอมทอง */
  }
  50% {
    background-color: #ffd666; /* เหลืองนวล */
  }
}

@keyframes blink-green {
  0%,
  100% {
    background-color: #d2f8d2; /* เขียวอ่อน */
  }
  50% {
    background-color: #8fd88f; /* เขียวใบไม้กลาง ๆ */
  }
}

.row-checkin {
  animation: blink-orange 1.2s infinite ease-in-out;
}

.row-checkout {
  animation: blink-green 1.2s infinite ease-in-out;
}

.actions-cell {
  background-color: white !important;
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

/* ปรับระยะห่างและขนาดของ Filter */
.filter-row {
  gap: 8px;
  margin-bottom: 0;
}

.filter-col {
  margin-bottom: 4px;
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
  color: white;
}
</style>
