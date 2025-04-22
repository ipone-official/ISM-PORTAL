<template>
  <v-container>
    <v-row dense align="center" justify="space-start" class="filter-row">
      <v-col cols="8" sm="3">
        <CustomDatepicker
          v-model="deliveryDateStart"
          label="วันที่เริ่มส่งสินค้า"
          class="filter-select input-field"
          :minOffset="-30"
          :maxOffset="30"
          :disabled="sDisabledDate"
        />
      </v-col>
      ถึง
      <v-col cols="8" sm="3">
        <CustomDatepicker
          v-model="deliveryDateEnd"
          label="วันที่สิ้นสุดส่งสินค้า"
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
            @click="searchQueue"
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
            @click="closeSearch"
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
      justify="space-between"
      class="filter-row"
      v-if="sDisabledDate"
    >
      <v-col cols="12" sm="4" md="3" class="filter-col">
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
        ></v-autocomplete>
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
    <Scheduler
      v-model="selectedDate"
      label="วันที่จองคิว"
      :reservations="reservations"
      class="mt-5"
    />
    <loading :isLoading="isLoading" />
  </v-container>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import Scheduler from "@/components/Scheduler.vue";
import { useUserStore } from "@/stores/userStore";
import loading from "@/components/Loading.vue";
import CustomDatepicker from "@/components/CustomDatepicker.vue";
import { gPlanQueue } from "@/services/apiTruckQueue.js";

export default {
  name: "HomePage",
  components: {
    Scheduler,
    loading,
    CustomDatepicker,
  },
  setup() {
    const userStore = useUserStore();
    const reservations = ref([]);
    const rawReservations = ref([]);
    const mFilterStatus = ref([]);
    const mFilterDropOffLocation = ref([]);

    const isLoading = ref(false);
    const sDisabledDate = ref(false);
    // ✅ ตั้งค่าให้เป็นวันที่ 01 ของเดือนปัจจุบัน
    const deliveryDateStart = ref(getFirstDayOfMonth());
    const deliveryDateEnd = ref(getTodayYYYYMMDD());

    function getFirstDayOfMonth() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      return `${yyyy}${mm}01`; // ตั้งให้เป็นวันที่ 01
    }

    function getTodayYYYYMMDD() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      return `${yyyy}${mm}${dd}`;
    }

    const closeSearch = () => {
      sDisabledDate.value = false;
      reservations.value = [];
    };
    watch(mFilterStatus, (newStatus) => {
      if (newStatus.length === 0) {
        reservations.value = rawReservations.value; // ✅ ถ้าไม่มีการเลือก ให้ใช้ค่าทั้งหมด
      } else {
        reservations.value = rawReservations.value.filter((item) =>
          newStatus.some((status) => status.key === item.status)
        ); // ✅ กรองเฉพาะรายการที่สถานะตรงกับที่เลือก
      }
    });

    watch([mFilterStatus, mFilterDropOffLocation], ([newStatus, newDropOff]) => {
      let filtered = rawReservations.value;

      // ✅ กรองตามสถานะที่เลือก
      if (newStatus.length > 0) {
        filtered = filtered.filter((item) =>
          newStatus.some((status) => status.key === item.status)
        );
      }

      // ✅ กรองตาม Drop-off Location ที่เลือก
      if (newDropOff.length > 0) {
        filtered = filtered.filter((item) =>
          item.details.some((detail) =>
            newDropOff.some((dropOff) => dropOff.key === detail.dropOffLocation)
          )
        );
      }

      reservations.value = filtered;
    });

    const iFilterDropOffLocation = computed(() => {
      const dropOffMap = new Map();

      rawReservations.value.forEach((item) => {
        item.details.forEach((detail) => {
          if (detail.dropOffLocation) {
            dropOffMap.set(detail.dropOffLocation, detail.dropOffLocationDesc);
          }
        });
      });

      // แปลง Map เป็น Array สำหรับ `v-autocomplete`
      return Array.from(dropOffMap, ([key, display]) => ({
        key,
        display,
      }));
    });

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

    const searchQueue = async () => {
      isLoading.value = true;
      sDisabledDate.value = true;
      try {
        const response = await gPlanQueue({
          vendorID:
            MapRole(userStore.group) !== "TruckQueue_Vendor" ? "All" : userStore.empId,
          deliveryDateStart: deliveryDateStart.value,
          deliveryDateEnd: deliveryDateEnd.value,
        });
        rawReservations.value = response.results;
        reservations.value = response.results;
        console.log("📅 Reservations:", reservations.value);
      } catch (error) {
        console.error("❌ Error loading TQueueList:", error);
      } finally {
        isLoading.value = false;
      }
    };

    function MapRole(user) {
      const rolesPriority = [
        "TruckQueue_Admin",
        "TruckQueue_Planning",
        "TruckQueue_Vendor",
        "TruckQueue_Store",
        "TruckQueue_Forklift",
      ];
      return rolesPriority.find((role) => user.includes(role)) || null;
    }

    onMounted(() => {
      searchQueue();
    });

    return {
      user: userStore,
      reservations,
      rawReservations,
      isLoading,
      sDisabledDate,
      deliveryDateStart,
      deliveryDateEnd,
      searchQueue,
      closeSearch,
      iFilterStatus,
      mFilterStatus,
      iFilterDropOffLocation, // ✅ เพิ่มฟิลเตอร์ drop-off location
      mFilterDropOffLocation, // ✅ ตัวแปรเก็บค่าที่เลือก
    };
  },
};
</script>

<style scoped>
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
</style>
