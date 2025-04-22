<template>
  <div class="calendar-container">
    <FullCalendar ref="calendar" :options="calendarOptions" />
    <v-dialog v-model="dialog" max-width="700px">
      <v-card class="rounded-xl elevation-12">
        <v-card-title class="bg-primary text-white">
          <v-icon start>mdi-calendar-check</v-icon>
          {{ dialogEvent?.title }}
        </v-card-title>

        <v-card-text class="pa-5" style="max-height: 70vh; overflow-y: auto">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-icon start class="me-2">mdi-calendar</v-icon>
              <strong>วันที่:</strong>
              {{ formatDate(dialogEvent.extendedProps.deliveryDate) }}
            </v-col>
            <v-col cols="12" sm="6">
              <v-icon start class="me-2">mdi-clock-time-four-outline</v-icon>
              <strong>เวลา:</strong> {{ dialogEvent.extendedProps.startTime }} -
              {{ dialogEvent.extendedProps.endTime }}
            </v-col>
            <v-col cols="12" sm="6">
              <v-icon start class="me-2">mdi-office-building</v-icon>
              <strong>บริษัท:</strong> {{ dialogEvent.extendedProps.vendorDesc }}
            </v-col>
            <v-col cols="12" sm="6">
              <v-icon start class="me-2">mdi-file-document-outline</v-icon>
              <strong>คำสั่งซื้อ:</strong> {{ dialogEvent.extendedProps.purchaseOrderNo }}
            </v-col>
            <v-col cols="12">
              <v-icon start class="me-2">mdi-information</v-icon>
              <strong>สถานะ:</strong>
              {{ getStatusLabel(dialogEvent.extendedProps.status) }}
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div v-if="dialogEvent.extendedProps.details.length">
            <div
              v-for="(detail, index) in dialogEvent.extendedProps.details"
              :key="index"
              class="mb-4 pa-4 rounded-lg"
              style="background: #f5f5f5; border: 1px solid #ddd"
            >
              <div class="mb-1">
                🚗 <strong>รถคันที่:</strong> {{ detail.sequenceID }}
              </div>
              <div class="mb-1">👨‍✈️ <strong>คนขับ:</strong> {{ detail.driverName }}</div>
              <div class="mb-1">
                🚏 <strong>จุดลงสินค้า:</strong> {{ detail.dropOffLocationDesc }}
              </div>
              <div class="mb-1">
                📦 <strong>สินค้า:</strong> {{ detail.materialDesc }}
              </div>
              <div class="mb-1">
                ☎️ <strong>เบอร์โทร:</strong> {{ detail.phoneNumber }}
              </div>
              <div class="mb-1">
                📊 <strong>จำนวนสินค้า:</strong> {{ detail.productQuantity }}
              </div>
            </div>
          </div>
          <div v-else class="text-error font-weight-bold text-center">
            ❌ ไม่มีรายละเอียดสินค้า
          </div>
        </v-card-text>

        <v-card-actions class="justify-end px-5 pb-4">
          <v-btn color="primary" variant="flat" @click="dialog = false">
            <v-icon start>mdi-close</v-icon> ปิด
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default {
  name: "SchedulerPage",
  components: {
    FullCalendar,
  },
  props: {
    reservations: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    let persistentTooltip = null;
    const dialog = ref(false);
    const dialogEvent = ref(null);

    const openDialog = (eventInfo) => {
      dialogEvent.value = eventInfo;
      dialog.value = true;
    };

    const handleClickOutside = (e) => {
      if (
        persistentTooltip &&
        !persistentTooltip.contains(e.target) &&
        !e.target.closest(".fc-event")
      ) {
        persistentTooltip.remove();
        persistentTooltip = null;
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    const formatDate = (dateString) => {
      if (!dateString || dateString.length !== 8) return dateString;
      return `${dateString.substring(6, 8)}/${dateString.substring(
        4,
        6
      )}/${dateString.substring(0, 4)}`;
    };
    const colorPalette = [
      "#4A90E2", // ฟ้าเข้ม
      "#45A049", // เขียวมิ้นต์เข้ม
      "#FF9F1C", // ส้มพาสเทลเข้ม
      "#E57373", // ชมพูพีชเข้ม
      "#AF69EE", // ม่วงลาเวนเดอร์เข้ม
      "#FFC107", // เหลืองเข้มแบบทอง
      "#8E44AD", // ม่วงเข้ม
      "#16A085", // เขียวอมฟ้า
      "#D35400", // ส้มอิฐ
      "#C0392B", // แดงเข้ม
      "#2C3E50", // น้ำเงินเข้ม
      "#F39C12", // เหลืองสว่าง
      "#27AE60", // เขียวเข้ม
      "#3498DB", // ฟ้าน้ำทะเล
      "#E67E22", // ส้มอ่อน
    ];

    const events = computed(() => {
      return props.reservations.map((res, index) => {
        const eventColor = colorPalette[index % colorPalette.length]; // 🔁 สลับสี
        return {
          title: `คิวเลขที่ : ${res.queueID}`,
          start: `${res.deliveryDate.substring(0, 4)}-${res.deliveryDate.substring(
            4,
            6
          )}-${res.deliveryDate.substring(6, 8)}T${res.startTime}:00`,
          end: `${res.deliveryDate.substring(0, 4)}-${res.deliveryDate.substring(
            4,
            6
          )}-${res.deliveryDate.substring(6, 8)}T${res.endTime}:00`,
          color: eventColor,
          extendedProps: {
            deliveryDate: res.deliveryDate,
            startTime: res.startTime,
            endTime: res.endTime,
            vendorID: res.vendorID,
            vendorDesc: res.vendorDesc,
            purchaseOrderNo: res.purchaseOrderNo,
            status: res.status,
            details: res.details.map((detail) => ({
              materialNo: detail.materialNo || "-",
              materialDesc: detail.materialDesc || "-",
              sequenceID: detail.sequenceID || "-",
              dropOffLocation: detail.dropOffLocation || "-",
              dropOffLocationDesc: detail.dropOffLocationDesc || "-",
              driverName: detail.driverName || "-",
              licensePlate: detail.licensePlate || "-",
              phoneNumber: detail.phoneNumber || "-",
              productQuantity: detail.productQuantity || "-",
            })),
          },
        };
      });
    });

    const getStatusLabel = (statusCode) => {
      const map = {
        OPEN: "📝 เปิดจอง",
        CONFIRMED: "✅ ยืนยันแล้ว",
        ACCEPTED: "📌 สำรองคิวแล้ว",
        CHECKIN: "🚪 เช็คอิน",
        INPROGRESS: "🔄 กำลังให้บริการ",
        CHECKOUT: "🚚 เช็คเอาท์",
        COMPLETED: "✔️ เสร็จสมบูรณ์",
        CANCELLED: "❌ ยกเลิก",
      };
      return map[statusCode] || statusCode;
    };
    const calendarOptions = ref({
      locale: "th", // ✅ เปลี่ยนภาษาเป็นไทย
      dayHeaderFormat: {
        weekday: "long", // ✅ แสดงชื่อวันแบบเต็ม เช่น จันทร์, อังคาร
      },
      firstDay: 1,
      contentHeight: "auto",
      aspectRatio: 2,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: "dayGridMonth", // ✅ แสดงเป็นเดือน
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay", // ✅ สลับมุมมองได้
      },
      buttonText: {
        today: "วันนี้",
        month: "เดือน",
        week: "สัปดาห์",
        day: "วัน",
      },
      slotMinTime: "00:00:00", // ✅ เริ่มที่ 00:00
      slotMaxTime: "23:59:00", // ✅ จบที่ 23:30
      slotLabelInterval: "00:30", // ✅ แสดงทุก 30 นาที
      allDaySlot: false,
      selectable: false, // ❌ ปิดการเลือกวัน
      editable: false, // ❌ ปิดการแก้ไข
      eventOverlap: false,
      weekends: true, // ✅ เปิดเสาร์-อาทิตย์
      events: events,
      eventTimeFormat: {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // ❌ ปิด AM/PM
      },
      slotLabelFormat: {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // ❌ ปิดการแสดงผล AM/PM
      },

      //     eventMouseEnter: (info) => {
      //       if (persistentTooltip) return;
      //       const tooltip = document.createElement("div");
      //       tooltip.classList.add("fc-tooltip", "show");

      //       // ✅ ตรวจสอบว่า details มีค่าหรือไม่
      //       const details = info.event.extendedProps.details || [];

      //       const detailsHtml = details.length
      //         ? details
      //             .map(
      //               (detail) => `
      //         <hr>
      //         🚗 <strong>รถคันที่:</strong> ${detail.sequenceID || "-"}<br/>
      //         👨‍✈️ <strong>คนขับ:</strong> ${detail.driverName || "-"}<br/>
      //         🚏 <strong>จุดลงสินค้า:</strong> ${detail.dropOffLocationDesc || "-"}<br/>
      //         📦 <strong>สินค้า:</strong> ${detail.materialDesc || "-"}<br/>
      //         ☎️ <strong>เบอร์โทร:</strong> ${detail.phoneNumber || "-"}<br/>
      //         📊 <strong>จำนวนสินค้า:</strong> ${detail.productQuantity || "-"}<br/>
      //       `
      //             )
      //             .join("")
      //         : `<hr>❌ <strong>ไม่มีรายละเอียดสินค้า</strong><br/>`;

      //       tooltip.innerHTML = `
      //   <strong>${info.event.title}</strong><br/>
      //   📅 <strong>วันที่:</strong> ${formatDate(info.event.extendedProps.deliveryDate)}<br/>
      //   ⏰ <strong>เวลา:</strong> ${info.event.extendedProps.startTime} - ${
      //         info.event.extendedProps.endTime
      //       }<br/>
      //   🏢 <strong>บริษัท:</strong> ${info.event.extendedProps.vendorDesc}<br/>
      //   🔢 <strong>คำสั่งซื้อ:</strong> ${info.event.extendedProps.purchaseOrderNo}<br/>
      //   <strong>สถานะ:</strong> ${getStatusLabel(info.event.extendedProps.status)}<br/>
      //   ${detailsHtml}
      // `;

      //       document.body.appendChild(tooltip);

      //       tooltip.style.position = "absolute";
      //       tooltip.style.top = `${info.jsEvent.clientY + 15}px`;
      //       tooltip.style.left = `${info.jsEvent.clientX + 15}px`;

      //       info.el.addEventListener("mouseleave", () => {
      //         tooltip.remove();
      //       });
      //     },

      eventClick: (info) => {
        openDialog(info.event);
      },
    });

    return {
      calendarOptions,
      formatDate,
      getStatusLabel,
      dialog,
      dialogEvent,
    };
  },
};
</script>

<style>
.calendar-container {
  max-width: 1800px;
  margin: auto;
  padding: 10px;
}
/* ปรับ Tooltip ให้มีพื้นหลัง */

.fc-tooltip {
  z-index: 1000;
  background: #007fc4 !important; /* ✅ พื้นหลังสีฟ้าเข้ม */
  color: white;
  max-height: 310px; /* ✅ จำกัดความสูง */
  overflow-y: auto; /* ✅ ถ้าข้อมูลเยอะ ให้ scroll ได้ */
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  max-width: 450px;
  white-space: normal;
  line-height: 1.6;
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid white;
  opacity: 1;
}

.fc-col-header {
  background-color: #e3f2fd !important; /* ✅ ฟ้าอ่อน */
}

.fc-day-header {
  background-color: #e3f2fd !important; /* ✅ ฟ้าอ่อน */
  color: #1565c0 !important; /* ✅ เปลี่ยนสีตัวอักษรเป็นน้ำเงิน */
  font-weight: bold;
  padding: 10px;
  border-bottom: 1px solid #bbdefb; /* ✅ เพิ่มขอบล่าง */
}

/* ปรับให้ Tooltip มี Animation */
.fc-tooltip.show {
  transition: all 0.2s ease-in-out;
  transform: translateY(5px);
}

/* เส้นแบ่งใน Tooltip */
.fc-tooltip hr {
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  margin: 6px 0;
}

.fc-event {
  cursor: pointer;
}
/* ✅ เส้นแบ่งระหว่างข้อมูล */
.fc-tooltip hr {
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  margin: 6px 0;
}

/* ปุ่ม Prev, Next, Today */
.fc .fc-button {
  background: linear-gradient(to right, #1976d2, #1e88e5);
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  font-size: 14px;
  font-weight: bold;
  padding: 8px 16px !important;
  transition: all 0.3s ease-in-out;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.fc .fc-button:hover {
  background: linear-gradient(to right, #1565c0, #1976d2);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
}

/* ปรับขนาดปุ่ม Prev / Next ให้กลม */
.fc-prev-button,
.fc-next-button {
  width: 38px !important;
  height: 38px !important;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ปรับปุ่ม View Switcher */
.fc .fc-button-group .fc-button {
  background: #424242 !important;
  color: white !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
  transition: all 0.3s ease-in-out;
  font-size: 14px;
  font-weight: bold;
}

/* ปุ่มที่ Active อยู่ (Month, Week, Day ที่ถูกเลือก) */
.fc .fc-button-group .fc-button-active {
  background: linear-gradient(to right, #ff9800, #ff5722) !important;
  color: white !important;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(255, 87, 34, 0.7);
}

/* เพิ่ม Transition เวลาสลับเดือน */
.fc-view {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
