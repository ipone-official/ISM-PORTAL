<template>
  <v-row dense>
    <v-col cols="7">
      <v-select
        v-model="internalMonth"
        :items="months"
        item-title="text"
        item-value="value"
        label="เดือน"
        variant="outlined"
        dense
        hide-details
        class="filter-select input-field"
        :readonly="readonly"
      />
    </v-col>
    <v-col cols="5">
      <v-select
        v-model="internalYear"
        :items="years"
        label="ปี"
        variant="outlined"
        dense
        hide-details
        class="filter-select input-field"
        :readonly="readonly"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps({
  modelValue: String, // ค่าที่รับเข้ามา: "YYYY-MM"
  startYear: { type: Number, default: 2015 },
  endYear: { type: Number, default: new Date().getFullYear() + 1 },
  readonly: { type: Boolean, default: false },
});
// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);

const months = [
  { text: "มกราคม", value: "01" },
  { text: "กุมภาพันธ์", value: "02" },
  { text: "มีนาคม", value: "03" },
  { text: "เมษายน", value: "04" },
  { text: "พฤษภาคม", value: "05" },
  { text: "มิถุนายน", value: "06" },
  { text: "กรกฎาคม", value: "07" },
  { text: "สิงหาคม", value: "08" },
  { text: "กันยายน", value: "09" },
  { text: "ตุลาคม", value: "10" },
  { text: "พฤศจิกายน", value: "11" },
  { text: "ธันวาคม", value: "12" },
];

const years = Array.from(
  { length: props.endYear - props.startYear + 1 },
  (_, i) => props.endYear - i
);

const internalMonth = ref(props.modelValue?.split("-")[1] || "01");
const internalYear = ref(
  Number(props.modelValue?.split("-")[0]) || new Date().getFullYear()
);

watch([internalYear, internalMonth], () => {
  const val = `${internalYear.value}-${internalMonth.value}`;
  emit("update:modelValue", val);
});
</script>
<style scoped>
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
