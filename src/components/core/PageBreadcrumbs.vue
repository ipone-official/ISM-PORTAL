<template>
  <v-breadcrumbs class="breadcrumb" divider="›" :items="formattedItems">
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item :to="item.to" :disabled="!item.to" class="breadcrumb-item">
        {{ item.text }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script>
export default {
  name: 'PageBreadcrumb',
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  computed: {
    formattedItems() {
      // ฟอร์แมตข้อมูลสำหรับ Vuetify breadcrumbs
      return this.items.map((item) => ({
        text: item.name,
        to: item.link,
      }));
    },
  },
};
</script>

<style scoped>
.breadcrumb {
  padding: 10px;
  background-color: #f4f5f7;
}

.breadcrumb-item {
  color: #007fc4;
  font-weight: 500;
}

.breadcrumb-item:disabled {
  color: #888888;
}
</style>
