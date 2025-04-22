<template>
  <v-app>
    <v-main class="full-screen-container pa-0">
      <v-container
        fluid
        class="pa-0 fill-height d-flex flex-column"
        style="height: 100vh"
      >
        <div class="marquee-bar d-flex align-center justify-space-between px-6">
          <!-- 🔵 โลโก้ -->
          <v-img
            :src="logo"
            max-width="90"
            class="mx-3 mt-3"
            alt="กำลังดำเนินการ"
            aspect-ratio="1"
            cover
          ></v-img>

          <!-- 🔵 ป้ายวิ่ง -->
          <div class="marquee">
            <div class="marquee-text">🎉 ไอ.พี.วัน ยินดีต้อนรับ 🎉</div>
          </div>

          <!-- 🔵 เวลา -->
          <div class="clock text-h5 font-weight-bold d-flex align-center">
            <v-icon start class="me-2">mdi-calendar-clock</v-icon>
            {{ currentTime }}
          </div>
        </div>

        <!-- 🔵 ส่วนของข้อมูล (กินพื้นที่ที่เหลือ) -->
        <v-container fluid class="pa-6" style="flex: 1; overflow-y: auto">
          <v-card class="elevation-2 pa-4" style="height: 100%; border-radius: 12px">
            <!-- หัวตาราง -->
            <v-row
              class="mb-4 py-4"
              style="background-color: #f8c849; border-radius: 12px"
            >
              <v-col cols="3" class="text-center">
                <div
                  style="
                    font-size: 2.8rem;
                    font-weight: 600;
                    color: #424242;
                    letter-spacing: 0.5px;
                  "
                >
                  เลขที่คิวรถ
                </div>
              </v-col>

              <v-col cols="3" class="text-center">
                <div
                  style="
                    font-size: 2.8rem;
                    font-weight: 600;
                    color: #424242;
                    letter-spacing: 0.5px;
                  "
                >
                  จุดลงสินค้า
                </div>
              </v-col>
              <v-col cols="3" class="text-center">
                <div
                  style="
                    font-size: 2.8rem;
                    font-weight: 600;
                    color: #424242;
                    letter-spacing: 0.5px;
                  "
                >
                  เวลา
                </div>
              </v-col>
              <v-col cols="3" class="text-center">
                <div
                  style="
                    font-size: 2.8rem;
                    font-weight: 600;
                    color: #424242;
                    letter-spacing: 0.5px;
                  "
                >
                  สถานะ
                </div>
              </v-col>
            </v-row>

            <!-- รายการ -->
            <v-row v-for="(item, idx) in filteredList" :key="idx">
              <v-col cols="12">
                <div
                  class="d-flex align-center px-4 py-4"
                  style="border-left: 6px solid #1976d2; border-bottom: 1px solid #e0e0e0"
                >
                  <v-row no-gutters class="w-100">
                    <v-col cols="3" class="text-center">
                      <div
                        style="
                          font-size: 2.8rem;
                          font-weight: 600;
                          color: #1976d2;
                          letter-spacing: 0.5px;
                        "
                      >
                        {{ item.queueID }}
                      </div>
                    </v-col>
                    <v-col cols="3" class="text-center">
                      <div
                        style="
                          font-size: 2.8rem;
                          font-weight: 600;
                          color: #424242;
                          letter-spacing: 0.5px;
                        "
                      >
                        {{ item.dropOffLocationShort }}
                      </div>
                    </v-col>
                    <v-col cols="3" class="text-center">
                      <div
                        style="
                          font-size: 2.8rem;
                          font-weight: 600;
                          color: #424242;
                          letter-spacing: 0.5px;
                        "
                      >
                        {{ item.startTime }} น.
                      </div>
                    </v-col>
                    <v-col cols="3" class="text-center">
                      <div
                        style="
                          font-size: 2.8rem;
                          font-weight: 600;
                          color: #424242;
                          letter-spacing: 0.5px;
                        "
                      >
                        {{ getStatusLabel(item.status) }}
                      </div>
                    </v-col>
                  </v-row>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-container>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { gQueueShowAsync } from "@/services/apiTruckQueue.js";

const route = useRoute();

const dropOff = ref(null);
const logo = new URL("@/assets/images/white-Truckqueue-Logo.png", import.meta.url).href;

watch(
  () => route.query.dropOff,
  (val) => {
    dropOff.value = val || null;
  },
  { immediate: true }
);

const queueList = ref([]);

// กรองตาม dropOff ถ้ามี
const filteredList = computed(() => {
  if (dropOff.value) {
    return queueList.value.filter((item) => item.dropOffLocationShort === dropOff.value);
  }
  return queueList.value;
});

// เวลา
const currentTime = ref("");
const updateClock = () => {
  const now = new Date();
  const date = now.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  currentTime.value = `${date} | ${time}`;
};
const fetchQueueData = async () => {
  try {
    const data = await gQueueShowAsync();
    queueList.value = data.results;
  } catch (error) {
    console.error("Error loading queue data:", error);
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

const getStatusLabel = (status) => {
  return statusLabelMap[status] || status; // ถ้าไม่มี mapping ก็แสดงค่าตามเดิม
};

onMounted(async () => {
  updateClock();
  setInterval(updateClock, 1000);
  fetchQueueData(); // 🔸 เรียกทันทีรอบแรก
  setInterval(fetchQueueData, 5000); // 🔸 เรียกซ้ำทุก 5 วิ
});
</script>

<style scoped>
.full-screen-container {
  background-color: #f4f6f8;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.marquee-bar {
  background-color: #007fc4;
  color: white;
  height: 90px;
  min-height: 90px;
  width: 100%;
}

.marquee {
  overflow: hidden;
  white-space: nowrap;
  flex: 1;
  margin-right: 20px;
  position: relative;
}

.marquee-text {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 15s linear infinite;
  font-size: 3rem;
  font-weight: bold;
}

.clock {
  white-space: nowrap;
  color: #fff;
}

@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
