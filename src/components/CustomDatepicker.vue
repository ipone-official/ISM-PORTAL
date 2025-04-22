<template>
  <v-row>
    <v-col cols="12">
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        full-width
        :disabled="disabled"
      >
        <template #activator="{ props }">
          <v-text-field
            v-bind="props"
            v-model="displayDate"
            :label="label"
            outlined
            dense
            append-inner-icon="mdi-calendar-range"
            @click:append-inner="openMenu"
            class="mt-2"
          />
        </template>
        <v-date-picker
          v-model="internalDate"
          :min="computedMinDate"
          :max="computedMaxDate"
          color="primary"
          header-color="primary"
          @update:model-value="onDateSelect"
        />
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
import { ref, watch, computed, onMounted } from "vue";

export default {
  name: "DatePicker",
  props: {
    modelValue: {
      type: [String, Number],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "วันที่",
    },
    minOffset: {
      type: Number,
      default: -90, // ค่าเริ่มต้นย้อนหลัง 90 วัน
    },
    maxOffset: {
      type: Number,
      default: 3, // ค่าเริ่มต้นล่วงหน้า 3 วัน
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const menu = ref(false);
    const internalDate = ref(null);
    const displayDate = ref("");

    const computedMinDate = computed(() => {
      const date = new Date();
      date.setDate(date.getDate() + props.minOffset);
      return date.toISOString().split("T")[0];
    });

    const computedMaxDate = computed(() => {
      const today = new Date();
      today.setDate(today.getDate() + props.maxOffset);
      return today.toISOString().split("T")[0];
    });

    const openMenu = () => {
      menu.value = true;
    };

    const parseDateFromYYYYMMDD = (date) => {
      if (!date) return null;
      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = date.slice(6, 8);
      return new Date(`${year}-${month}-${day}`);
    };

    const formatToDDMMYYYY = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatToYYYYMMDD = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    };

    const onDateSelect = (date) => {
      if (date) {
        const selected = new Date(date);
        internalDate.value = selected;
        displayDate.value = formatToDDMMYYYY(selected);
        emit("update:modelValue", formatToYYYYMMDD(selected));
        menu.value = false;
      }
    };

    onMounted(() => {
      if (props.modelValue) {
        const parsedDate = parseDateFromYYYYMMDD(props.modelValue);
        internalDate.value = parsedDate;
        displayDate.value = formatToDDMMYYYY(parsedDate);
      }
    });

    watch(
      () => props.modelValue,
      (newVal) => {
        if (newVal) {
          const parsedDate = parseDateFromYYYYMMDD(newVal);
          internalDate.value = parsedDate;
          displayDate.value = formatToDDMMYYYY(parsedDate);
        } else {
          internalDate.value = null;
          displayDate.value = "";
        }
      },
      { immediate: true }
    );

    return {
      menu,
      internalDate,
      displayDate,
      computedMaxDate,
      computedMinDate,
      openMenu,
      onDateSelect,
    };
  },
};
</script>
