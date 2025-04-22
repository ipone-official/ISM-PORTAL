<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :persistent="true"
    location="bottom"
    transition="scale-transition"
    :disabled="isReadonly"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        v-bind="{ ...props, readonly: isReadonly }"
        v-model="formattedTime"
        :label="label"
        outlined
        dense
        :append-inner-icon="icon"
        class="time-picker-input filter-select input-field mt-2"
      />
    </template>

    <v-card class="time-picker-card">
      <v-card-title class="bg-primary text-white text-center">เลือกเวลา</v-card-title>
      <v-divider></v-divider>

      <v-container class="pa-3 text-center">
        <v-row justify="center" align="center">
          <!-- เลือกชั่วโมง -->
          <v-col cols="6" class="text-center">
            <h4 class="label-text">ชั่วโมง</h4>
            <v-sheet class="scroll-container">
              <v-list dense class="hour-list">
                <v-list-item
                  v-for="hour in hours"
                  :key="hour"
                  ref="hourItems"
                  class="hour-item"
                  @click="selectedHour = hour"
                  :class="{ 'active-item': selectedHour === hour }"
                >
                  {{ hour }}
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <!-- เลือกนาที -->
          <v-col cols="6" class="text-center">
            <h4 class="label-text">นาที</h4>
            <v-sheet class="scroll-container" ref="minuteScroll">
              <v-list dense class="minute-list">
                <v-list-item
                  v-for="minute in ['00', '30']"
                  :key="minute"
                  ref="minuteItems"
                  class="minute-item"
                  @click="selectedMinute = minute"
                  :class="{ 'active-item': selectedMinute === minute }"
                >
                  {{ minute }}
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>

      <v-divider></v-divider>

      <v-card-actions class="justify-end pa-2">
        <v-btn color="primary" size="small" @click="confirmTime">ตกลง</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { ref, computed, watch } from "vue";

export default {
  props: {
    modelValue: String,
    label: {
      type: String,
      default: "เลือกเวลา",
    },
    icon: {
      type: String,
      default: "mdi-golf-cart",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const menu = ref(false);
    const selectedHour = ref("00");
    const selectedMinute = ref("00");

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));

    const formattedTime = computed(() => `${selectedHour.value}:${selectedMinute.value}`);

    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue) {
          const [hour, minute] = newValue.split(":");
          selectedHour.value = hour.padStart(2, "0");
          selectedMinute.value = ["00", "30"].includes(minute) ? minute : "00";
        }
      },
      { immediate: true }
    );

    function confirmTime() {
      emit("update:modelValue", formattedTime.value);
      menu.value = false;
    }

    return {
      menu,
      selectedHour,
      selectedMinute,
      hours,
      formattedTime,
      confirmTime,
      isReadonly: computed(() => props.readonly),
    };
  },
};
</script>

<style scoped>
.time-picker-input {
  cursor: pointer;
}

.time-picker-card {
  max-width: 250px;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  padding: 5px;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

/* ✅ สไตล์ Scroll Container */
.scroll-container {
  height: 150px;
  overflow-y: auto;
  border-radius: 6px;
}

/* ✅ สไตล์รายการ "ชั่วโมง" */
.hour-list,
.minute-list {
  padding: 0;
}

/* ✅ สไตล์ปุ่มของ "ชั่วโมง" และ "นาที" */
.hour-item,
.minute-item {
  padding: 10px;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease-in-out;
}

.hour-item:hover,
.minute-item:hover {
  background-color: #f1f1f1;
}

.active-item {
  background-color: #1976d2 !important;
  color: white !important;
  border-radius: 8px !important;
}

/* ลดระยะห่างในหน้าจอเล็ก */
.filter-row {
  gap: 8px; /* ลดช่องว่างระหว่างคอลัมน์ */
  margin-bottom: 0; /* ลดระยะห่างแนวตั้งของทั้งแถว */
}

.filter-col {
  margin-bottom: 4px; /* ลดช่องว่างระหว่างฟิลด์ในแนวตั้ง */
}

.filter-select,
.search-bar {
  margin-bottom: 12px; /* เพิ่มระยะห่างแนวตั้งสำหรับจอเล็ก */
}

@media (min-width: 600px) {
  .filter-row {
    gap: 16px; /* ขยายช่องว่างเมื่อหน้าจอใหญ่ขึ้น */
  }
  .filter-col {
    margin-bottom: 8px;
  }
}
.input-field {
    margin-bottom: -1.3rem; /* สำหรับระยะห่างแนวตั้งในจอเล็ก */
    color: #007fc4 !important;
  }
@media (min-width: 960px) {
  .filter-row {
    gap: 24px; /* ระยะห่างปกติในหน้าจอขนาดใหญ่ */
  }
  .filter-col {
    margin-bottom: 0; /* เอาช่องว่างออกในหน้าจอใหญ่ */
  }
  .input-field {
    margin-bottom: -1.3rem; /* สำหรับระยะห่างแนวตั้งในจอเล็ก */
    color: #007fc4 !important;
  }
}
</style>
