<template>
  <v-navigation-drawer
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    app
    class="navigation-drawer"
    width="300"
  >
    <!-- Drawer Header with Avatar -->
    <v-list-item class="drawer-header">
      <div class="image-container">
        <img
          src="@/assets/images/ISMportal_logo.png"
          alt="User Image"
          class="styled-image animated-image"
        />
      </div>
    </v-list-item>
    <!-- Divider -->
    <v-divider></v-divider>
    <!-- Navigation Links -->
    <v-list density="compact" nav>
          <!-- CheckIn -->
          <v-list-item
        v-if="!isHidden('CheckIn')"
        class="menu-item"
        @click="navigateTo('/CheckIn')"
        dense
        rounded="shaped"
        value="CheckIn"
      >
        <v-list-item-title class="menu-title">
          <v-icon>mdi-account-check-outline</v-icon>
          Check In
        </v-list-item-title>
      </v-list-item>
      
      <!-- SpecialAreas -->
      <v-list-item
        v-if="!isHidden('SpecialAreas')"
        class="menu-item"
        @click="navigateTo('/SpecialAreas')"
        dense
        rounded="shaped"
        value="SpecialAreas"
      >
        <v-list-item-title class="menu-title">
          <v-icon>mdi-truck-fast-outline</v-icon>
          Special Areas
        </v-list-item-title>
      </v-list-item>

      <!-- MonitorQueue -->
      <!-- <v-list-item
        v-if="!isHidden('MonitorQueue')"
        class="menu-item"
        @click="navigateTo('/MonitorQueue')"
        dense
        rounded="shaped"
        value="MonitorQueue"
      >
        <v-list-item-title class="menu-title">
          <v-icon>mdi-monitor-eye</v-icon>
          Monitor
        </v-list-item-title>
      </v-list-item> -->

      <!-- DisplayQueue (ไม่มีเงื่อนไข) -->
      <!-- <v-list-item
        class="menu-item"
        @click="navigateTo('/DisplayQueue')"
        dense
        rounded="shaped"
        value="DisplayQueue"
      >
        <v-list-item-title class="menu-title">
          <v-icon>mdi-calendar-month-outline</v-icon>
          Display
        </v-list-item-title>
      </v-list-item> -->

      <!-- ManageQueue -->
      <!-- <v-list-item
        v-if="!isHidden('ManageQueue')"
        class="menu-item"
        @click="navigateTo('/ManageQueue')"
        dense
        rounded="shaped"
        value="ManageQueue"
      >
        <v-list-item-title class="menu-title">
          <v-icon>mdi-file-document-edit-outline</v-icon>
          Manage
        </v-list-item-title>
      </v-list-item> -->

      <!-- UploadQueue -->
      <!-- <v-list-item
        v-if="!isHidden('UploadQueue')"
        class="menu-item"
        @click="navigateTo('/UploadQueue')"
        dense
        rounded="shaped"
        value="UploadQueue"
      >
        <v-list-item-title class="menu-title">
          <v-icon>mdi-cloud-upload-outline</v-icon>
          Upload
        </v-list-item-title>
      </v-list-item> -->
    </v-list>
    <div class="footer">
      <v-divider></v-divider>
      <div class="menu-container">
        <v-list-item
          style="background-color: #007fc4"
          class="menu-item"
          dense
          @click="showPdfPreview = true"
          rounded="shaped"
          value="UserManual"
        >
          <v-list-item-title class="menu-title">
            <v-icon>mdi-book-open-variant-outline</v-icon>
            User Manual
          </v-list-item-title>
        </v-list-item>
      </div>
    </div>
    <PdfPreview v-model="showPdfPreview" />
  </v-navigation-drawer>
</template>

<script>
import { ref } from "vue";
import PdfPreview from "@/components/PdfPreview.vue";
import { useUserStore } from "@/stores/userStore";

export default {
  components: { PdfPreview },
  name: "NavigationDrawer",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const showPdfPreview = ref(false);
    const userStore = useUserStore();
    const userGroups = userStore.group || [];

    const hiddenMenuRules = {
      ManageQueue: ["TruckQueue_Forklift"],
      UploadQueue: ["TruckQueue_Forklift", "TruckQueue_Vendor"],
      ShowQueueAll: ["TruckQueue_Vendor"],
      MonitorQueue: ["TruckQueue_Vendor"],
    };

    const isHidden = (menuName) => {
      const disallowedGroups = hiddenMenuRules[menuName] || [];
      return disallowedGroups.some((group) => userGroups.includes(group));
    };

    return {
      showPdfPreview,
      user: userStore,
      isHidden,
    };
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
.navigation-drawer {
  background: linear-gradient(120deg, #007fc4 10%, #a0c4e0 50%, #efeff0 100%);
  color: #ffffff;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: white;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.avatar img {
  width: 60px;
  height: auto;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.menu-title {
  font-size: 1rem !important;
  color: #ffffff;
  margin-left: 8px; /* เพิ่มระยะห่างระหว่าง icon กับ title */
}
.menu-title-color {
  font-size: 1.05rem !important;
  color: #007fc4;
  margin-left: 8px; /* เพิ่มระยะห่างระหว่าง icon กับ title */
}

.menu-icon {
  margin-right: 8px;
}

.sub-item {
  padding-left: 20px;
  color: #ffffff;
  font-size: 1rem !important;
}

.image-container {
  display: inline-block; /* ใช้เพื่อทำให้จัดวางง่าย */
  text-align: center; /* จัดให้อยู่กลาง */
  padding: 10px; /* เพิ่มระยะรอบๆ ภาพ */
}

/* สไตล์สำหรับภาพ */
.styled-image {
  width: 50%; /* ปรับให้ภาพพอดีกับ Container */
  max-width: 200px; /* กำหนดขนาดสูงสุด */
  height: auto; /* ให้สัดส่วนคงที่ */
  border-radius: 8px; /* มุมโค้งสำหรับภาพ */
  object-fit: cover; /* ครอบคลุมพื้นที่ภาพ */
}

.animated-image {
  animation: smooth-slide 3s ease-in-out infinite;
}
.footer {
  position: absolute;
  bottom: 0;
  width: 80%;
}

@keyframes smooth-slide {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px); /* จุดสูงสุด */
  }
  100% {
    transform: translateY(0); /* กลับมาที่เดิม */
  }
}

.menu-container {
  position: relative;
}

.new-label {
  position: absolute;
  top: -5px; /* ตำแหน่งเริ่มต้นด้านบน */
  right: -5px; /* ตำแหน่งเริ่มต้นด้านขวา */
  background-color: red;
  color: white;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  border-radius: 12px;
  text-transform: uppercase;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Animation */
.animated-new {
  animation: bounce 1.5s infinite; /* ใช้ keyframes "bounce" */
}

/* Keyframes for bounce effect */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0); /* ตำแหน่งเดิม */
  }
  50% {
    transform: translateY(-5px); /* เลื่อนขึ้น */
  }
}

.footer {
  position: absolute;
  bottom: 0;
  width: 80%;
}
</style>
