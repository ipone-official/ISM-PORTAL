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
      justify="space-start"
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
          v-model="mFilterVendors"
          :items="iFilterVendors"
          label="ชื่อผู้ขาย"
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
      <v-col cols="12" sm="4" md="5" class="filter-col">
        <v-text-field
          v-model="mSearch"
          label="Search"
          outlined
          dense
          prepend-inner-icon="mdi-magnify"
          class="search-bar input-field"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row dense align="center" justify="end" class="filter-row" v-if="sDisabledDate">
      <v-col cols="auto" class="filter-col" v-if="selected.length != 0">
        <v-btn
          fab
          small
          color="primary"
          dark
          class="ma-1 small-export-button"
          v-bind="attrs"
          v-on="on"
          @click="confirmQueue"
        >
          <v-icon size="25">mdi-ticket-confirmation-outline</v-icon>
          ยืนยันคิว
        </v-btn>
        <v-btn
          fab
          small
          color="green"
          dark
          class="ma-1 small-export-button"
          v-bind="attrs"
          v-on="on"
          @click="ExportFileExcel"
        >
          <v-icon size="25">mdi-microsoft-excel</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- ตารางข้อมูล -->
    <v-data-table
      :headers="headers"
      :items="reservations"
      :search="mSearch"
      class="data-table mt-5"
      dense
      rounded
      v-model="selected"
      show-select
      item-value="queueID"
    >
      <!-- :item-selectable="isSelectable" -->
      <template v-slot:item.deliveryDate="{ item }">
        <div>{{ item.deliveryDate ? formatDate(item.deliveryDate) : "-" }}</div>
      </template>
      <template v-slot:item.status="{ item }">
        <div>{{ item.status ? getStatusLabel(item.status) : "-" }}</div>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip
          text="แก้ไขและดูรายละเอียด"
          location="bottom"
          color="primary"
          text-color="white"
          v-if="canShowButtonEdit(item.status)"
        >
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" v-bind="props" @click="editItem(item)">
              <v-icon color="primary">mdi-storefront-edit-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip
          text="ยกเลิกรายการ"
          location="bottom"
          color="red"
          text-color="white"
          v-if="canShowButtonCancel(item.status)"
        >
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" v-bind="props" @click="cancelItem(item)">
              <v-icon color="red">mdi-timer-cancel-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table>
    <v-row class="d-flex justify-center" v-if="canShowPlus()">
      <v-btn
        color="primary"
        large
        elevation="6"
        class="rounded-xl text-white font-weight-bold px-8 py-2 transition"
        @click="CreateQueue"
      >
        <v-icon left>mdi-plus</v-icon> เพิ่ม
      </v-btn>
    </v-row>

    <v-dialog v-model="dialog" persistent max-width="1920px">
      <v-card class="dialog-card">
        <!-- Header -->
        <v-card-title class="dialog-header">
          <span class="dialog-title"
            >✨ {{ flagCreateQueue ? "เพิ่มคิวรถ" : "ข้อมูลคิวรถ" }} ✨</span
          >
          <v-btn icon @click="resetForm" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <!-- Form Content -->
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <!-- Row 1 -->
            <v-row justify="end" align="center">
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined v-if="selectQueue.length != 0">
                  <v-card-text class="text-left">
                    เลขที่คิวรถ : {{ selectQueue.queueID }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-row justify="space-around" align="center">
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined v-if="selectQueue.length != 0">
                  <v-card-text class="text-left">
                    สร้างโดย : {{ selectQueue.createName }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card class="grey-card" outlined v-if="selectQueue.length != 0">
                  <v-card-text class="text-left">
                    วันที่สร้าง :
                    {{
                      selectQueue.createDate ? formatDateTime(selectQueue.createDate) : ""
                    }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                md="3"
                v-if="selectQueue.length != 0 && selectQueue.updateName"
              >
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    แก้ไขโดย : {{ selectQueue.updateName }}
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                md="3"
                v-if="selectQueue.length != 0 && selectQueue.updateDate"
              >
                <v-card class="grey-card" outlined>
                  <v-card-text class="text-left">
                    วันที่แก้ไข :
                    {{
                      selectQueue.updateDate ? formatDateTime(selectQueue.updateDate) : ""
                    }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-row dense align="center" justify="space-start" class="filter-row">
              <v-col cols="12" sm="2" md="2">
                <CustomDatepicker
                  v-model="dialogModels.deliveryDate"
                  label="วันที่ส่งสินค้า"
                  class="filter-select input-field"
                  :minOffset="-0"
                  :maxOffset="3"
                  :disabled="!flagCreateQueue"
                />
              </v-col>
              <v-col cols="12" sm="2" md="2">
                <CustomTimePicker
                  v-model="dialogModels.startTime"
                  label="เวลาส่งสินค้า"
                  :readonly="!flagCreateQueue"
                />
              </v-col>
              <v-col cols="12" sm="2" md="2">
                <CustomTimePicker
                  v-model="dialogModels.endTime"
                  label="เวลาสิ้นสุดส่งของ"
                  :readonly="true"
                  :icon="`mdi-truck-cargo-container`"
                />
              </v-col>
              <v-col cols="12" sm="3" md="3" v-if="flagCreateQueue">
                <v-autocomplete
                  v-model="dialogModels.Vendor"
                  :items="dialogModels.iVendors"
                  label="ผู้ขาย"
                  item-title="display"
                  item-value="key"
                  outlined
                  dense
                  class="filter-select input-field"
                  return-object
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="2" md="2">
                <v-autocomplete
                  v-model="dialogModels.purchaseOrder"
                  :items="dialogModels.iPurchaseOrders"
                  label="เลขที่คำสั่งซื้อ"
                  item-title="display"
                  item-value="key"
                  outlined
                  dense
                  class="filter-select input-field"
                  return-object
                  :readonly="!flagCreateQueue"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row v-if="!flagCreateQueue && canShowButtonSubmit()">
              <v-col cols="12" sm="2" md="2" class="filter-col">
                <v-autocomplete
                  v-model="dialogModels.material"
                  :items="dialogModels.iMaterial"
                  label="เลขที่ผลิตภัณฑ์"
                  item-title="display"
                  item-value="key"
                  outlined
                  dense
                  class="filter-select input-field"
                  return-object
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="3" md="3" class="filter-col">
                <v-text-field
                  v-model="dialogModels.MaterialName"
                  label="ชื่อผลิตภัณฑ์"
                  outlined
                  :readonly="true"
                  dense
                  class="input-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="2" md="2" class="filter-col">
                <v-text-field
                  v-model="materialQtyFormatted"
                  label="จำนวน"
                  outlined
                  :readonly="true"
                  dense
                  class="input-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3" md="3" class="filter-col">
                <v-autocomplete
                  v-model="dialogModels.dropOffLocation"
                  :items="dialogModels.iLocation"
                  label="จุดลงสินค้า"
                  item-title="display"
                  item-value="key"
                  outlined
                  dense
                  class="filter-select input-field"
                  return-object
                  :color="'primary'"
                  active-class="custom-active-class"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row v-if="!flagCreateQueue && canShowButtonSubmit()">
              <v-col cols="12" sm="3" md="3" class="filter-col">
                <v-text-field
                  v-model="dialogModels.driverName"
                  label="ชื่อคนขับรถ"
                  outlined
                  dense
                  class="input-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="2" md="2" class="filter-col">
                <v-text-field
                  v-model="dialogModels.licensePlate"
                  label="ทะเบียนรถ"
                  outlined
                  dense
                  class="input-field"
                  @keydown="keyFilter.allowThaiNumberOnly"
                  maxlength="15"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                :sm="dialogModels.isEditMode ? 2 : 3"
                :md="dialogModels.isEditMode ? 2 : 3"
                class="filter-col"
              >
                <v-text-field
                  v-model="dialogModels.phoneNumber"
                  label="เบอร์โทรศัพท์"
                  outlined
                  dense
                  class="input-field"
                  @keydown="keyFilter.numbersOnly"
                  maxlength="10"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="2" md="2" class="filter-col">
                <v-text-field
                  v-model="formattedQuantity"
                  label="จำนวนสินค้า"
                  outlined
                  dense
                  class="input-field"
                  @keydown="keyFilter.numbersOnly"
                  maxlength="10"
                  @input="onQuantityInput"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                :sm="dialogModels.isEditMode ? 2 : 1"
                :md="dialogModels.isEditMode ? 2 : 1"
                class="filter-col d-flex justify-center"
              >
                <v-btn
                  color="primary"
                  large
                  elevation="6"
                  class="rounded-xl text-white font-weight-bold px-6 py-2 mt-2 transition mx-1"
                  @click="plusDraffTransactions"
                >
                  <v-icon left>
                    {{ dialogModels.isEditMode ? "mdi-pencil-outline" : "mdi-plus" }}
                  </v-icon>
                </v-btn>
                <v-btn
                  v-if="dialogModels.isEditMode"
                  color="red"
                  large
                  elevation="6"
                  class="rounded-xl text-white font-weight-bold px-6 py-2 mt-2 transition mx-1"
                  @click="clearDataPlus"
                >
                  <v-icon left>mdi-close-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="mt-5" v-if="!flagCreateQueue">
              <v-data-table
                :headers="dialogHeader"
                :items="dialogModels.iDraffTransaction"
                class="data-table"
                dense
                rounded
              >
                <template v-slot:item.productQuantity="{ item }">
                  <div>
                    {{ item.productQuantity ? formatNumber(item.productQuantity) : "-" }}
                  </div>
                </template>
                <template v-slot:item.actions="{ item }">
                  <div class="action-buttons" v-if="canShowButtonSubmit()">
                    <!-- Edit Tooltip -->
                    <v-tooltip
                      text="แก้ไข"
                      location="bottom"
                      color="blue"
                      text-color="white"
                    >
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
                    <v-tooltip
                      text="ลบรายการ"
                      location="bottom"
                      color="red"
                      text-color="white"
                    >
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
                  <div v-else>
                    <v-btn icon variant="text" v-bind="props">
                      <v-icon color="green">mdi-check-circle-outline</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-row>
          </v-form>
          <v-row class="d-flex justify-center" v-if="canShowButtonSubmit()">
            <v-btn
              color="success"
              large
              elevation="6"
              class="rounded-xl text-white font-weight-bold px-8 py-2 transition mt-5"
              @click="submitForm"
            >
              <v-icon left>mdi-check-circle-outline</v-icon> บันทึก
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="showSnackbar"
      :timeout="3000"
      :color="snackbarColor"
      rounded="pill"
      class="text-center"
    >
      {{ msgSnackbar }}
    </v-snackbar>
    <loading :isLoading="isLoading" />
  </v-container>
</template>

<script>
import loading from "@/components/Loading.vue";
import CustomDatepicker from "@/components/CustomDatepicker.vue";
import {
  gPlanQueue,
  gPurchaseOrderByVendor,
  gMLocations,
  ProcessQueueAsync,
  gVendorBy,
  pUpdateStatusQueue,
} from "@/services/apiTruckQueue.js";
import { useUserStore } from "@/stores/userStore";
import CustomTimePicker from "@/components/CustomTimePicker.vue";
import { isEmpty } from "lodash";
import Swal from "sweetalert2";
import keyFilter from "@/utils/keyFilter.js";
import XlsxPopulate from "xlsx-populate";

export default {
  name: "HomePage",
  components: {
    loading,
    CustomDatepicker,
    CustomTimePicker,
  },
  setup() {
    const userStore = useUserStore();
    return {
      user: userStore,
    };
  },
  data() {
    return {
      keyFilter,
      showSnackbar: false,
      msgSnackbar: "",
      snackbarColor: "yellow",
      reservations: [],
      rawReservations: [],
      isLoading: false,
      sDisabledDate: false,
      deliveryDateStart: this.getFirstDayOfMonth(),
      deliveryDateEnd: this.getTodayYYYYMMDD(),
      mSearch: "",
      headers: [
        { title: "เลขที่คิวรถ", align: "left", key: "queueID" },
        { title: "เลขที่ผู้ขาย", align: "left", key: "vendorID" },
        { title: "ชื่อผู้ขาย", align: "left", key: "vendorDesc" },
        { title: "เลขที่คำสั่งซื้อ", align: "left", key: "purchaseOrderNo" },
        { title: "วันที่ส่งสินค้า", align: "left", key: "deliveryDate" },
        { title: "เวลาส่งสินค้า", align: "left", key: "startTime" },
        { title: "เวลาสื้นสุดส่งสินค้า", align: "left", key: "endTime" },
        { title: "สถานะ", align: "left", key: "status" },
        { title: "Actions", align: "left", key: "actions" },
      ],
      selected: [],
      dialog: false,
      selectQueue: [],
      dialogModels: {
        deliveryDate: "",
        startTime: "",
        endTime: "",
        purchaseOrder: "",
        iPurchaseOrders: [],
        iLocation: [],
        dropOffLocation: "",
        material: "",
        iMaterial: [],
        MaterialName: "",
        MaterialQty: "",
        driverName: "",
        licensePlate: "",
        phoneNumber: "",
        productQuantity: "",
        iDraffTransaction: [],
        isEditMode: false,
        editingIndex: null,
        sequenceID: "",
        Vendor: "",
        iVendors: [],
      },
      dialogHeader: [
        { title: "ลำดับ", align: "left", key: "index" },
        { title: "เลขที่ผลิตภัณฑ์", align: "left", key: "materialNo" },
        { title: "รายละเอียดผลิตภัณฑ์", align: "left", key: "materialDesc" },
        { title: "จุดลงของ", align: "left", key: "dropOffLocationDesc" },
        { title: "รถคันที่", align: "left", key: "sequenceID" },
        { title: "ชื่อคนขับ", align: "left", key: "driverName" },
        { title: "ทะเบียนรถ", align: "left", key: "licensePlate" },
        { title: "เบอร์โทร", align: "left", key: "phoneNumber" },
        { title: "จำนวนสินค้า", align: "left", key: "productQuantity" },
        { title: "Actions", align: "left", key: "actions" },
      ],
      flagCreateQueue: false,
      mFilterStatus: [],
      mFilterVendors: [],
      formattedQuantity: "",
    };
  },
  computed: {
    materialQtyFormatted: {
      get() {
        const val = this.dialogModels.MaterialQty;
        if (val == null || val === "") return "";
        const number = parseFloat(val);
        if (isNaN(number)) return val;
        return number.toLocaleString("en-US");
      },
      set(val) {
        const raw = val.replace(/,/g, "");
        const number = parseFloat(raw);
        if (!isNaN(number)) {
          this.dialogModels.MaterialQty = number;
        } else {
          this.dialogModels.MaterialQty = null;
        }
      },
    },
    selectedItems() {
      return this.reservations.filter((item) => this.selected.includes(item.queueID));
    },
    selectedOrder() {
      return this.dialogModels.iPurchaseOrders.find(
        (po) =>
          po.key ===
          (this.dialogModels.purchaseOrder ? this.dialogModels.purchaseOrder.key : null)
      );
    },
    iFilterStatus() {
      const statusMap = new Map();

      this.rawReservations.forEach((item) => {
        if (item.status) {
          statusMap.set(item.status);
        }
      });

      // แปลง Map เป็นอาร์เรย์ของ Object สำหรับ `v-autocomplete`
      return Array.from(statusMap, ([status]) => ({
        key: status,
        display: this.getStatusLabel(status),
      }));
    },
    iFilterVendors() {
      const statusMap = new Map();

      this.rawReservations.forEach((item) => {
        if (item.vendorID && item.vendorDesc) {
          statusMap.set(item.vendorID, item.vendorDesc);
        }
      });

      // แปลง Map เป็นอาร์เรย์ของ Object สำหรับ `v-autocomplete`
      return Array.from(statusMap, ([vendorID, vendorDesc]) => ({
        key: vendorID,
        display: vendorDesc,
      }));
    },
  },
  watch: {
    "dialogModels.productQuantity": {
      immediate: true,
      handler(val) {
        if (val != null && val !== "") {
          this.formattedQuantity = Number(val).toLocaleString("en-US");
        } else {
          this.formattedQuantity = "";
        }
      },
    },
    mFilterStatus() {
      this.filterListQueue();
    },
    mFilterVendors() {
      this.filterListQueue();
    },
    "dialogModels.startTime"(newVal) {
      if (this.flagCreateQueue && newVal) {
        const [hours, minutes] = newVal.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours);
        startDate.setMinutes(minutes + 30); // บวก 30 นาที

        const endHours = String(startDate.getHours()).padStart(2, "0");
        const endMinutes = String(startDate.getMinutes()).padStart(2, "0");

        this.dialogModels.endTime = `${endHours}:${endMinutes}`;
      }
    },
    "dialogModels.Vendor": {
      handler(Vendor) {
        this.dialogModels.iPurchaseOrders = [];
        if (!Vendor) {
          return;
        }
        this.fetchPurchaseOrders(this.dialogModels.deliveryDate, Vendor.key);
      },
      deep: true, // ✅ ติดตามการเปลี่ยนแปลงของ Object
      immediate: true, // ✅ ให้ Watch ทำงานทันทีเมื่อ Component โหลด
    },
    "dialogModels.purchaseOrder": {
      handler(newPO) {
        if (!newPO) {
          // ✅ รีเซ็ตค่าถ้าไม่มี Purchase Order
          this.resetMaterialFields();
          return;
        }
        // ✅ หา Purchase Order ที่เลือกจาก iPurchaseOrders
        const order = this.dialogModels.iPurchaseOrders.find(
          (po) => po.key === newPO.key
        );

        // ✅ อัปเดตรายการ Material จาก Order ที่เลือก
        this.dialogModels.iMaterial = order
          ? order.Details.map((detail) => ({
              key: detail.materialCode,
              display: detail.materialCode,
            }))
          : [];
        // ✅ ถ้ามีเพียง 1 Material ในรายการ ให้เลือกตัวแรกอัตโนมัติ
        if (this.dialogModels.iMaterial.length === 1) {
          this.$nextTick(() => {
            // ✅ ใช้ Vue.nextTick() ได้เลย
            this.dialogModels.material = this.dialogModels.iMaterial[0];
          });
        } else {
          this.dialogModels.material = null;
        }

        // ✅ รีเซ็ตข้อมูล Material อื่นๆ
        this.dialogModels.MaterialName = "";
        this.dialogModels.MaterialQty = "";
      },
      deep: true, // ✅ ติดตามการเปลี่ยนแปลงของ Object
      immediate: true, // ✅ ให้ Watch ทำงานทันทีเมื่อ Component โหลด
    },
    "dialogModels.material": {
      handler(newMaterial) {
        if (!newMaterial || !this.selectedOrder) {
          this.resetMaterialFields();
          return;
        }
        console.log(newMaterial, "newMaterial");
        // ✅ หา Material ที่ตรงกับ `newMaterial`
        const detail = this.selectedOrder.Details.find(
          (d) => d.materialCode === newMaterial.key
        );

        console.log("🔍 Material Detail:", detail);

        if (!detail) {
          this.resetMaterialFields();
          return;
        }

        // ✅ อัปเดตค่าใน `dialogModels`
        this.dialogModels.MaterialName = detail.materialDesc_TH;

        if (detail.locationID) {
          this.dialogModels.dropOffLocation = {
            key: detail.locationID,
            display: detail.dropOffLocationDesc,
          };
        }

        // ✅ ตรวจสอบก่อนว่า `iDraffTransaction` มีค่าหรือไม่
        const transactions = Array.isArray(this.dialogModels.iDraffTransaction)
          ? this.dialogModels.iDraffTransaction
          : [];

        // ✅ คำนวณยอดรวมที่ถูกใช้ไป
        const usedQty = transactions
          .filter((tran) => tran.materialNo === detail.materialCode)
          .reduce((sum, tran) => sum + Number(tran.productQuantity || 0), 0); // ✅ ป้องกัน NaN

        // ✅ หักจำนวนที่ถูกใช้ไปออกจาก `totalQuantity`
        this.dialogModels.MaterialQty = detail.totalQuantity - usedQty;
      },
      deep: true, // ✅ ให้ Vue ตรวจจับการเปลี่ยนแปลงของ Object
      immediate: true, // ✅ ให้ Watch ทำงานทันทีเมื่อ Component โหลด
    },
  },
  methods: {
    formatNumber(val) {
      if (val == null || val === "") return "";
      const number = parseFloat(val);
      if (isNaN(number)) return val;
      return number.toLocaleString("en-US");
    },
    onQuantityInput() {
      const raw = this.formattedQuantity.replace(/,/g, "");
      const number = parseInt(raw);

      if (!isNaN(number)) {
        this.dialogModels.productQuantity = number;
        this.formattedQuantity = number.toLocaleString("en-US");
      } else {
        this.dialogModels.productQuantity = null;
        this.formattedQuantity = "";
      }
    },
    async confirmQueue() {
      const data = this.selectedItems;

      if (!data || data.length === 0) {
        console.warn("ไม่มีข้อมูลให้ Confirmed");
        return;
      }

      // 🔎 กรองเฉพาะรายการที่ status = 'OPEN'
      const openItems = data.filter((item) => item.status === "OPEN");

      if (openItems.length === 0) {
        Swal.fire({
          html: `ไม่พบรายการที่สามารถยืนยันได้ <br/>เลือกเฉพาะรายการที่สถานะ <strong>"เปิดจอง"</strong> เท่านั้น`,
          icon: "warning",
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: "OK",
          didOpen: () => {
            document.querySelector(".swal2-confirm").style.color = "white";
          },
        });
        return;
      }

      Swal.fire({
        html: `คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะเป็น <strong>"ยืนยันแล้ว"</strong><br/>`,
        icon: "warning",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "OK",
        didOpen: () => {
          document.querySelector(".swal2-confirm").style.color = "white";
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          try {
            // 🔁 map รายการที่ผ่านเงื่อนไข เพื่อเตรียมข้อมูลส่งไป backend
            const payload = openItems.map((item) => ({
              queueId: item.queueID,
              updateBy: this.user.empId,
              status: "CONFIRMED",
            }));

            await pUpdateStatusQueue(payload);

            Swal.fire({
              html: `เปลี่ยนสถานะสำเร็จ`,
              icon: "success",
              confirmButtonText: "OK",
              didOpen: () => {
                document.querySelector(".swal2-confirm").style.color = "white";
              },
            }).then((result) => {
              if (result.isConfirmed) {
                this.searchQueue(); // โหลดใหม่
              }
            });
          } catch (error) {
            console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
            Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
          } finally {
            this.isLoading = false;
          }
        }
      });
    },
    canShowButtonEdit(status) {
      return !["OPEN"].includes(status);
    },
    canShowButtonCancel(status) {
      return (
        !["TruckQueue_Vendor"].includes(this.user.group) &&
        ["OPEN", "CONFIRMED", "ACCEPTED"].includes(status)
      );
    },
    canShowButtonSubmit() {
      // ถ้ามีการสร้างใหม่ ให้แสดงปุ่มได้เลย
      if (this.flagCreateQueue) return true;

      // ถ้า selectQueue ยังไม่มีค่าเลย → ไม่แสดง
      if (!this.selectQueue) return false;

      const status = this.selectQueue.status;
      const groups = this.user.group;

      if (groups.includes("TruckQueue_Admin")) {
        return true;
      }

      if (groups.includes("TruckQueue_Vendor")) {
        return status === "CONFIRMED";
      }

      if (["OPEN", "CONFIRMED", "ACCEPTED"].includes(status)) {
        return true;
      }

      // ถ้าไม่เข้าเงื่อนไขใดเลย
      return false;
    },
    canShowPlus() {
      const groups = this.user.group;
      if (groups.includes("TruckQueue_Vendor")) {
        return false;
      }
      return true;
    },
    cancelItem(item) {
      Swal.fire({
        html: `${`คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะเป็น <strong>"ยกเลิก"</strong><br/> ของคิวเลขที่ ${item.queueID}`}`,
        icon: "warning",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "OK",
        didOpen: () => {
          document.querySelector(".swal2-confirm").style.color = "white"; // เปลี่ยนสีตัวอักษรเป็นสีขาว
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          try {
            const data = [
              {
                queueId: item.queueID,
                updateBy: this.user.empId,
                status: "CANCELLED",
              },
            ];
            await pUpdateStatusQueue(data);
            Swal.fire({
              html: `เปลี่ยนสถานะสำเร็จ`,
              icon: "success",
              showCancelButton: false,
              allowOutsideClick: false,
              confirmButtonText: "OK",
              didOpen: () => {
                document.querySelector(".swal2-confirm").style.color = "white";
              },
            }).then((result) => {
              if (result.isConfirmed) {
                this.searchQueue();
              }
            });
          } catch (error) {
            console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
            Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
          } finally {
            this.isLoading = false;
          }
        }
      });
    },
    getStatusLabel(status) {
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
      return statusLabelMap[status] || status; // ถ้าไม่มี label ก็คืนค่าต้นฉบับ
    },
    filterListQueue() {
      // ถ้ายังไม่มีข้อมูล ให้ return ทันที
      if (!this.rawReservations || this.rawReservations.length === 0) {
        this.reservations = [];
        return;
      }

      // กรองข้อมูลตามค่าที่เลือก
      this.reservations = this.rawReservations.filter((item) => {
        const matchStatus =
          this.mFilterStatus.length === 0 ||
          this.mFilterStatus.some((status) => status.key === item.status);

        const matchVendor =
          this.mFilterVendors.length === 0 ||
          this.mFilterVendors.some((vendor) => vendor.key === item.vendorID);

        return matchStatus && matchVendor; // ✅ ต้องตรงกับฟิลเตอร์ทั้งคู่
      });
    },
    plusDraffTransactions() {
      if (isEmpty(this.dialogModels.material)) {
        return this.showSnackbars("กรุณาเลือกเลขที่ผลิตภัณฑ์");
      }
      if (isEmpty(this.dialogModels.dropOffLocation)) {
        return this.showSnackbars("กรุณาเลือกจุดลงสินค้า");
      }
      if (isEmpty(this.dialogModels.driverName)) {
        return this.showSnackbars("กรุณาระบุชื่อคนขับรถ");
      }
      if (isEmpty(this.dialogModels.licensePlate)) {
        return this.showSnackbars("กรุณาระบุชื่อทะเบียนรถ");
      }
      if (isEmpty(this.dialogModels.phoneNumber)) {
        return this.showSnackbars("กรุณาระบุเบอร์โทรศัพท์");
      }
      if (
        !this.dialogModels.productQuantity &&
        Number(this.dialogModels.productQuantity) == 0
      ) {
        return this.showSnackbars("กรุณาระบุจำนวนสินค้า");
      }

      const existingTransactions = !Array.isArray(this.dialogModels.iDraffTransaction)
        ? []
        : this.dialogModels.iDraffTransaction.filter(
            (tran) =>
              tran.materialNo === this.dialogModels.material.key &&
              tran.dropOffLocation === this.dialogModels.dropOffLocation.key
          );

      const newSequenceID = existingTransactions.length + 1;

      const newTransaction = {
        index: this.dialogModels.isEditMode
          ? this.dialogModels.editingIndex
          : this.dialogModels.iDraffTransaction.length + 1,
        materialNo: this.dialogModels.material.key,
        materialDesc: this.dialogModels.MaterialName || "",
        dropOffLocation: this.dialogModels.dropOffLocation.key,
        dropOffLocationDesc: this.dialogModels.dropOffLocation.display,
        sequenceID: newSequenceID,
        // this.dialogModels.isEditMode
        //   ? this.dialogModels.sequenceID
        //   : newSequenceID,
        driverName: this.dialogModels.driverName,
        licensePlate: this.dialogModels.licensePlate,
        phoneNumber: this.dialogModels.phoneNumber,
        productQuantity: parseInt(this.dialogModels.productQuantity, 10), // ✅ แปลงเป็นตัวเลขเพื่อให้บวกค่าได้
      };
      if (this.dialogModels.isEditMode && this.dialogModels.editingIndex !== null) {
        // ✅ กรณีแก้ไข → แทนที่ข้อมูลเดิม
        this.dialogModels.iDraffTransaction[this.dialogModels.editingIndex - 1] = {
          ...newTransaction,
        };
      } else {
        // ✅ ถ้าเป็นการเพิ่มใหม่
        this.dialogModels.iDraffTransaction.push(newTransaction);
      }

      this.clearDataPlus();
    },
    editDraffTransaction(item) {
      // นำข้อมูลจาก item ที่เลือก มาใส่ในตัวแปรหลักเพื่อแก้ไข
      this.dialogModels.isEditMode = true;
      this.dialogModels.editingIndex = item.index;
      this.dialogModels.material =
        this.dialogModels.iMaterial.find((m) => m.key == item.materialNo) || null;
      this.dialogModels.dropOffLocation = {
        key: item.dropOffLocation,
        display: item.dropOffLocationDesc,
      };
      this.dialogModels.driverName = item.driverName;
      this.dialogModels.licensePlate = item.licensePlate;
      this.dialogModels.phoneNumber = item.phoneNumber;
      this.dialogModels.productQuantity = item.productQuantity;
      this.dialogModels.sequenceID = item.sequenceID;
    },
    deleteDraffTransaction(item) {
      this.dialog = false;
      Swal.fire({
        html: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการลำดับที่ ${item.index} <br>
        เลขผลิตภัณฑ์ ${item.materialNo}: ${item.materialDesc}<br>
        รถคันที่ ${item.sequenceID} คนขับชื่อ ${item.driverName}<br> ทะเบียนรถเลขที่ ${item.licensePlate}
        จำนวนสินค้า ${item.productQuantity}<br>
        จุดลงสินค้า ${item.dropOffLocationDesc}`,
        icon: "warning",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "OK",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.dialogModels.iDraffTransaction = this.dialogModels.iDraffTransaction.filter(
            (transaction) =>
              !(
                transaction.materialNo === item.materialNo &&
                transaction.dropOffLocation === item.dropOffLocation &&
                transaction.sequenceID === item.sequenceID
              )
          );
          this.recalculateSequenceAndIndex();
          this.dialog = true;
        } else {
          this.dialog = true;
        }
      });
    },
    recalculateSequenceAndIndex() {
      if (!Array.isArray(this.dialogModels.iDraffTransaction)) {
        this.dialogModels.iDraffTransaction = [];
        return;
      }

      // ✅ จัดกลุ่มข้อมูลตาม `materialNo` และ `dropOffLocation`
      const groupedTransactions = {};
      this.dialogModels.iDraffTransaction.forEach((tran) => {
        const key = `${tran.materialNo}-${tran.dropOffLocation}`;
        if (!groupedTransactions[key]) {
          groupedTransactions[key] = [];
        }
        groupedTransactions[key].push(tran);
      });

      // ✅ รีรัน `sequenceID` ให้ใหม่สำหรับแต่ละกลุ่ม
      Object.keys(groupedTransactions).forEach((key) => {
        groupedTransactions[key]
          .sort((a, b) => a.index - b.index) // ✅ เรียงลำดับตาม index เดิมก่อน
          .forEach((tran, index) => {
            tran.sequenceID = index + 1; // ✅ กำหนด sequenceID ใหม่ เริ่มจาก 1
          });
      });

      // ✅ รีรัน `index` ใหม่ให้ทั้ง array
      this.dialogModels.iDraffTransaction = this.dialogModels.iDraffTransaction.map(
        (tran, index) => ({
          ...tran,
          index: index + 1, // ✅ กำหนด index ใหม่ให้เรียงต่อกัน
        })
      );

      console.log("✅ Updated Transactions:", this.dialogModels.iDraffTransaction);
    },
    showSnackbars(message, color = "yellow") {
      this.msgSnackbar = message;
      this.snackbarColor = color;
      this.showSnackbar = true;
    },
    clearDataPlus() {
      this.resetMaterialFields();
      this.dialogModels.purchaseOrder = null;
      this.dialogModels.purchaseOrder = {
        key: this.selectQueue.purchaseOrderNo,
        display: this.selectQueue.purchaseOrderNo,
      };
      this.dialogModels.dropOffLocation = null;
      this.dialogModels.driverName = "";
      this.dialogModels.licensePlate = "";
      this.dialogModels.phoneNumber = "";
      this.dialogModels.productQuantity = "";
      this.dialogModels.isEditMode = false;
      this.dialogModels.editingIndex = null;
    },
    resetMaterialFields() {
      this.dialogModels.iMaterial = [];
      this.dialogModels.material = null;
      this.dialogModels.MaterialName = "";
      this.dialogModels.MaterialQty = "";
      this.dialogModels.dropOffLocation = "";
    },
    getFirstDayOfMonth() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      return `${yyyy}${mm}01`; // ตั้งให้เป็นวันที่ 01
    },
    getTodayYYYYMMDD() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      return `${yyyy}${mm}${dd}`;
    },
    formatDate(yyyymmdd) {
      if (!yyyymmdd || yyyymmdd.length !== 8) return "Invalid Date";
      const year = yyyymmdd.substring(0, 4);
      const month = yyyymmdd.substring(4, 6);
      const day = yyyymmdd.substring(6, 8);
      return `${day}/${month}/${year}`;
    },
    formatDateConvert(dateStr) {
      if (!dateStr || dateStr.length !== 8) return dateStr;
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return `${day}.${month}.${year}`;
    },
    async searchQueue() {
      this.isLoading = true;
      this.sDisabledDate = true;
      this.reservations = [];
      this.rawReservations = [];
      try {
        const response = await gPlanQueue({
          vendorID:
            this.MapRole(this.user.group) !== "TruckQueue_Vendor"
              ? "All"
              : this.user.empId,
          deliveryDateStart: this.deliveryDateStart,
          deliveryDateEnd: this.deliveryDateEnd,
        });
        this.rawReservations = response.results;
        this.reservations = this.rawReservations;
        console.log(this.rawReservations, "rawReservations");
      } catch (error) {
        console.error("❌ Error loading TQueueList:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPurchaseOrders(deliveryDate, vendorID) {
      this.isLoading = true;
      try {
        const data = await gPurchaseOrderByVendor({
          deliveryDate: deliveryDate,
          vendorNo: vendorID,
        });

        this.dialogModels.iPurchaseOrders = data.map((order) => ({
          key: order.purchaseOrderNo,
          display: order.purchaseOrderNo,
          Details: order.details,
        }));

        // ถ้ามีเพียง 1 purchaseOrderNo ให้เลือกอัตโนมัติ
        // if (this.iPurchaseOrders.length === 1) {
        //   this.purchaseOrderNo = this.iPurchaseOrders[0];
        // }
      } catch (error) {
        console.error("Error loading purchase orders:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async gMLocations() {
      this.isLoading = true;
      try {
        const data = await gMLocations();

        this.dialogModels.iLocation = data.results.map((location) => ({
          key: location.locationID,
          display: location.locationDesc,
        }));
      } catch (error) {
        console.error("Error loading gMLocations:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async gVendorBy() {
      this.isLoading = true;
      try {
        const response = await gVendorBy("All");
        this.dialogModels.iVendors = response.results.map((vendor) => ({
          key: vendor.vendorNo,
          display: `${vendor.vendorNo} : ${vendor.vendorDesc}`,
        }));
      } catch (error) {
        console.error("Error loading gVendorBy:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async CreateQueue() {
      this.resetForm();
      this.dialog = true;
      this.dialogModels.deliveryDate = this.getTodayYYYYMMDD();
      this.flagCreateQueue = true;
      this.dialogModels.startTime = "00:00";
      await Promise.all([this.gVendorBy()]);
    },
    closeSearch() {
      this.sDisabledDate = false;
      this.reservations = [];
      this.rawReservations = [];
      this.resetForm();
    },
    async editItem(item) {
      this.dialog = true;
      this.selectQueue = item;
      this.dialogModels.deliveryDate = item.deliveryDate;
      this.dialogModels.startTime = item.startTime;
      this.dialogModels.endTime = item.endTime;
      await Promise.all([
        this.fetchPurchaseOrders(item.deliveryDate, item.vendorID),
        this.gMLocations(),
      ]);
      this.dialogModels.purchaseOrder = {
        key: item.purchaseOrderNo,
        display: item.purchaseOrderNo,
      };
      this.dialogModels.iDraffTransaction = item.details.map((detail, index) => ({
        ...detail,
        index: index + 1, // ให้ index เริ่มจาก 1
      }));
    },
    async submitForm() {
      let dataTran = {};
      if (this.flagCreateQueue) {
        if (isEmpty(this.dialogModels.Vendor)) {
          return this.showSnackbars("กรุณาเลือกผู้ขาย");
        }
        if (isEmpty(this.dialogModels.purchaseOrder)) {
          return this.showSnackbars("กรุณาเลือกเลขที่คำสั่งซื้อ");
        }
        dataTran = {
          queueID: "",
          vendorID: this.dialogModels.Vendor.key,
          purchaseOrderNo: this.dialogModels.purchaseOrder.key,
          deliveryDate: this.dialogModels.deliveryDate,
          startTime: this.dialogModels.startTime,
          endTime: this.dialogModels.endTime,
          status: "PLANNED",
          remark: "",
          createBy: this.user.empId,
          details: [],
        };
      } else {
        if (isEmpty(this.dialogModels.iDraffTransaction)) {
          return this.showSnackbars("รายละเอียดข้อมูลการส่งสินค้ายังไม่มี!");
        }
        const {
          queueID,
          vendorID,
          purchaseOrderNo,
          deliveryDate,
          startTime,
          endTime,
          status,
          remark,
        } = this.selectQueue;

        if (!queueID || !vendorID || !purchaseOrderNo) {
          console.error("Missing required queue data");
          return;
        }
        const groups = this.user.group;

        dataTran = {
          queueID,
          vendorID,
          purchaseOrderNo,
          deliveryDate,
          startTime,
          endTime,
          status: groups.includes("TruckQueue_Admin") ? status : "ACCEPTED",
          remark,
          createBy: this.user.empId,
          details: this.dialogModels.iDraffTransaction.map(
            ({
              sequenceID,
              materialNo,
              dropOffLocation,
              driverName,
              licensePlate,
              phoneNumber,
              productQuantity,
            }) => ({
              sequenceID,
              materialNo,
              dropOffLocation,
              driverName,
              licensePlate,
              phoneNumber,
              productQuantity,
            })
          ),
        };
      }
      this.dialog = false;
      Swal.fire({
        html: `${
          dataTran.queueID
            ? `คุณแน่ใจหรือไม่ว่าต้องการบันทึกรายการคิวที่ ${dataTran.queueID}`
            : "คุณต้องการเพิ่มรายการคิวใหม่หรือไม่"
        }`,
        icon: "warning",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: "OK",
        didOpen: () => {
          document.querySelector(".swal2-confirm").style.color = "white"; // เปลี่ยนสีตัวอักษรเป็นสีขาว
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          try {
            const response = await ProcessQueueAsync(dataTran);
            this.dialog = false;
            if (response.status === 409) {
              this.isLoading = false;
              await this.showAlert(
                "ไม่สามารถบันทึกได้เนื่องจากเวลาและสถานที่ลงสินค้ามีการจองไปแล้ว !",
                "error"
              );
              this.dialog = true;
            } else {
              this.isLoading = false;
              await this.showAlert(
                `บันทึกสำเร็จ คิวเลขที่ ${
                  response.queueId ? response.queueId : dataTran.queueID
                } `,
                "success"
              );
              this.resetForm();
              if (this.sDisabledDate) {
                await this.searchQueue();
                if (!this.flagCreateQueue) {
                  const dataFind = this.reservations.find(
                    (element) => element.queueID === dataTran.queueID
                  );
                  if (dataFind) this.editItem(dataFind);
                }
              }
            }
          } catch (error) {
            console.error("Error loading purchase orders:", error);
          } finally {
            this.isLoading = false;
          }
        } else {
          this.dialog = true;
        }
      });
    },

    // ฟังก์ชันช่วยลดโค้ดซ้ำสำหรับ Swal
    async showAlert(message, icon) {
      return Swal.fire({
        html: message,
        icon: icon,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: "OK",
      });
    },
    resetForm() {
      this.dialog = false;
      this.selectQueue = [];
      this.flagCreateQueue = false;
      this.selected = [];
      this.dialogModels = {
        deliveryDate: "",
        startTime: "",
        endTime: "",
        purchaseOrder: "",
        iPurchaseOrders: [],
        iLocation: [],
        dropOffLocation: "",
        material: "",
        iMaterial: [],
        MaterialName: "",
        MaterialQty: "",
        driverName: "",
        licensePlate: "",
        phoneNumber: "",
        productQuantity: "",
        iDraffTransaction: [],
        isEditMode: false,
        editingIndex: null,
        sequenceID: "",
        Vendor: "",
      };
    },
    formatDateTime(input) {
      const datePart = input.substring(0, 8);
      const timePart = input.substring(9, 14);

      const year = datePart.substring(0, 4);
      const month = datePart.substring(4, 6);
      const day = datePart.substring(6, 8);

      return `${day}/${month}/${year} ${timePart}`;
    },
    MapRole(user) {
      const rolesPriority = [
        "TruckQueue_Admin",
        "TruckQueue_Planning",
        "TruckQueue_Vendor",
        "TruckQueue_Store",
        "TruckQueue_Forklift",
      ];
      return rolesPriority.find((role) => user.includes(role)) || null;
    },

    async ExportFileExcel() {
      const data = this.selectedItems;
      if (!data || data.length === 0) {
        console.warn("ไม่มีข้อมูลให้ export");
        return;
      }

      // ✅ แปลงวันที่
      const formattedData = data.map((item) => [
        item.queueID,
        item.vendorID,
        item.vendorDesc,
        item.purchaseOrderNo,
        this.formatDateConvert(item.deliveryDate),
        item.startTime,
        item.endTime,
        item.status,
        item.remark,
      ]);

      const header = [
        "queueID",
        "vendorID",
        "vendorDesc",
        "purchaseOrderNo",
        "deliveryDate",
        "startTime",
        "endTime",
        "status",
        "remark",
      ];

      const wb = await XlsxPopulate.fromBlankAsync();
      const sheet = wb.sheet(0);
      sheet.name("Exported");

      // ✅ เขียนหัวตาราง
      header.forEach((title, i) => {
        const cell = sheet.cell(1, i + 1);
        cell.value(title).style({
          fill: "007fc4",
          bold: true,
          fontColor: "ffffff",
          horizontalAlignment: "center",
          border: true,
        });
      });

      // ✅ เขียนข้อมูล
      formattedData.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const cell = sheet.cell(rowIndex + 2, colIndex + 1);
          cell.value(value).style({
            border: true,
            horizontalAlignment: "left",
          });
        });
      });

      // ✅ ปรับความกว้างคอลัมน์อัตโนมัติ
      sheet.usedRange().autoFilter(); // optional: เพิ่ม filter
      header.forEach((_, colIndex) => {
        let maxLength = header[colIndex].length;

        formattedData.forEach((row) => {
          const cellValue = row[colIndex];
          if (cellValue) {
            maxLength = Math.max(maxLength, cellValue.toString().length);
          }
        });

        sheet.column(colIndex + 1).width(Math.min(maxLength * 1.2, 50)); // ✅ ความกว้างตามเนื้อหา
      });

      // ✅ Export
      const blob = await wb.outputAsync();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Exported_Queue.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  },
  mounted() {
    console.log("📅 Initial Dates: ", {
      deliveryDateStart: this.deliveryDateStart,
      deliveryDateEnd: this.deliveryDateEnd,
    });
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

/* Table Styles */
.data-table {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-table .v-data-table-header th {
  background: linear-gradient(90deg, #007fc4, #005f9c);
  color: white;
  font-weight: bold;
  text-align: left;
}

::v-deep(.v-data-table__th) {
  background: linear-gradient(
    90deg,
    rgba(0, 127, 196, 1) 0%,
    rgba(0, 127, 196, 1) 35%,
    rgba(0, 127, 196, 1) 100%
  ) !important;
  color: white !important;
}

::v-deep(.data-table td, .data-table th) {
  text-align: left !important; /* บังคับข้อความให้ชิดซ้าย */
  vertical-align: middle !important; /* จัดให้อยู่ตรงกลางแนวตั้ง */
}

/* Dialog Card Styles */
.dialog-card {
  border-radius: 24px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.25);
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  animation: fadeIn 0.5s ease-in-out;
  overflow: hidden; /* ป้องกันส่วนที่เกินจาก Header */
  position: relative; /* สำหรับปุ่ม Close */
  max-height: 100vh;
  overflow-y: auto;
}

/* Header */
.dialog-header {
  background: linear-gradient(90deg, #007fc4, #005f9c);
  color: white;
  padding: 16px;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: white;
  color: #007fc4;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  z-index: 10;
}
.close-btn:hover {
  background-color: #f8c849;
  color: white !important;
}

.grey-card {
  background-color: #daf0fc; /* สีเทาอ่อน */
  color: #424242; /* สีข้อความ */
  height: 40px; /* กำหนดความสูงให้เล็กลง */
  padding: 8px; /* ลดระยะห่างภายใน */
  border-radius: 8px; /* ขอบมน */
  display: flex; /* จัดข้อความให้อยู่กลางแนวตั้ง */
  align-items: center; /* จัดข้อความให้อยู่กลางแนวตั้ง */
  justify-content: center; /* จัดข้อความให้อยู่กลางแนวนอน */
  font-size: 13px; /* ลดขนาดตัวอักษร */
}

::v-deep(.v-data-table tbody .v-selection-control .v-icon) {
  color: #007fc4 !important; /* สีเขียวของ Vuetify หรือจะใช้ green ก็ได้ */
}
</style>
