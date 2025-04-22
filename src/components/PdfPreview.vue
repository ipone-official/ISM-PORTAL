<template>
  <v-dialog v-model="dialog" fullscreen persistent>
    <v-container fluid>
      <v-toolbar color="primary" dense>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-keyboard-backspace</v-icon>
        </v-btn>
        <v-toolbar-title>User Manual</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="downloadPDF">
          <v-icon>mdi-file-download-outline</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- ✅ โหลด PDF ทันที -->
      <div class="pdf-container">
        <embed
          v-if="pdfSrc"
          :src="pdfSrc"
          type="application/pdf"
          width="100%"
          height="100%"
        />
      </div>
    </v-container>
  </v-dialog>
</template>

<script>
import { ref, watch } from "vue";
import { saveAs } from "file-saver";

export default {
  props: {
    modelValue: Boolean, // รับค่า v-model จาก Component หลัก
  },
  emits: ["update:modelValue"], // ส่งค่าอัปเดตกลับไป
  setup(props, { emit }) {
    const dialog = ref(props.modelValue);
    const pdfSrc = ref(
      "https://portal.ip-one.com/Web-TruckQueue/UserManual/TruckQueue.pdf"
    );

    // ✅ เมื่อค่า modelValue เปลี่ยน ให้เปลี่ยนค่า dialog ตาม
    watch(
      () => props.modelValue,
      (newValue) => {
        dialog.value = newValue;
      }
    );

    const closeDialog = () => {
      emit("update:modelValue", false); // ปิด Dialog
    };

    const downloadPDF = () => {
      saveAs(pdfSrc.value, "UserManual_TruckQueue.pdf");
    };

    return { dialog, pdfSrc, closeDialog, downloadPDF };
  },
};
</script>

<style scoped>
.pdf-container {
  width: 100%;
  height: 93vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
