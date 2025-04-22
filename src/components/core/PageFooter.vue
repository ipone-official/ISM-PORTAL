<template>
  <v-footer app color="#f8c849" class="custom-footer">
    <v-col class="text-center white--text">
      © copyright 2025 by I.P.One Co., Ltd.
    </v-col>
  </v-footer>
</template>

<script>
export default {
  name: "PageFooter",
};
</script>

<style scoped>
.custom-footer {
  height: 45px; /* ปรับความสูงของ footer */
  padding: 5px 0; /* ลด padding ด้านใน */
  font-size: 1rem; /* ลดขนาดฟอนต์ */
}
</style>
