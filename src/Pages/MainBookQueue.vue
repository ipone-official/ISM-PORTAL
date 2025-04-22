<!-- eslint-disable vue/valid-v-slot -->
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

    <v-data-table :headers="headers" :items="iTQueue" class="data-table" dense rounded>
      <template v-slot:item.actions="{ item }">
        <div class="action-buttons">
          <!-- Edit Tooltip -->
          <v-tooltip text="แก้ไข" location="bottom" color="blue" text-color="white">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                variant="text"
                v-bind="props"
                @click="editDraffTransaction(item)"
              >
                <v-icon color="blue">mdi-pencil-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <!-- Delete Tooltip -->
          <v-tooltip text="ลบรายการ" location="bottom" color="red" text-color="white">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                variant="text"
                v-bind="props"
                @click="deleteDraffTransaction(item)"
              >
                <v-icon color="red">mdi-delete-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
    <loading :isLoading="isLoading" />
  </v-container>
</template>

<script>
import { useUserStore } from "@/stores/userStore";
import loading from "@/components/Loading.vue";
import CustomDatepicker from "@/components/CustomDatepicker.vue";
import { gTQueueListDistinct } from "@/services/apiTruckQueue.js";

export default {
  name: "MainBookQueue",
  components: {
    loading,
    CustomDatepicker,
  },
  setup() {
    const userStore = useUserStore();
    return {
      user: userStore,
    };
  },
  data() {
    return {
      isLoading: false,
      sDisabledDate: false,
      StartDate: "20250301",
      EndDate: "20250331",
      iTQueue: [],
      headers: [
        { title: "วันที่ส่งสินค้า", align: "left", key: "deliveryDate" },
        { title: "Actions", align: "left", key: "actions" },
      ],
    };
  },
  methods: {
    async gTQueueListDistinct() {
      this.isLoading = true;
      try {
        const data = await gTQueueListDistinct();
        this.iTQueue = data.results;
      } catch (error) {
        console.error("Error loading purchase orders:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {},
};
</script>
