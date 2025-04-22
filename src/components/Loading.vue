<template>
  <div class="loading-overlay" v-if="isLoading">
    <div class="wrap">
      <div class="drop-outer">
        <svg class="drop" viewBox="0 0 40 40">
          <!-- ทำให้โลโก้เป็นวงกลม -->
          <image
            :xlink:href="logoPath"
            class="logo-circle"
            x="0"
            y="0"
            width="40"
            height="40"
          />
        </svg>
      </div>
      <div class="ripple ripple-1">
        <svg class="ripple-svg" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="24" />
        </svg>
      </div>
      <div class="ripple ripple-2">
        <svg class="ripple-svg" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="24" />
        </svg>
      </div>
      <div class="ripple ripple-3">
        <svg class="ripple-svg" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="24" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DropRippleAnimation",
  props: {
    isLoading: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      logoPath: require("@/assets/images/IPONE White - Circle.png"), // โหลดโลโก้จาก assets
    };
  },
};
</script>

<style scoped>
body {
  background: #e8e5ea;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  overflow: hidden;
}

.wrap {
  position: relative;
  width: 100px;
  height: 200px;
}

.drop-outer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
  width: 100px;
  height: 100px;
  border-bottom-left-radius: 50px;
  border-bottom-right-radius: 50px;
}

.drop {
  position: absolute;
  width: 40px;
  height: 40px;
  animation: drop 2s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite;
}

/* ทำให้โลโก้เป็นวงกลม */
.logo-circle {
  border-radius: 50%;
  overflow: hidden;
}

.ripple {
  position: absolute;
  width: 240px;
  height: 240px;
  top: 60px;
  left: -70px;
  transform: rotateX(65deg);
}

.ripple .ripple-svg {
  width: 240px;
  height: 240px;
  opacity: 0;
}

.ripple .ripple-svg circle {
  fill: none;
  stroke: #2a96ed;
  stroke-width: 6px;
}

/* Animation ของ ripple เพื่อให้กระจายออก */
.ripple-1 {
  animation: ripple 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s infinite;
}

.ripple-1 .ripple-svg {
  animation: fade-in-out 2s linear 0s infinite;
}

.ripple-2 {
  animation: ripple 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s infinite;
}

.ripple-2 .ripple-svg {
  animation: fade-in-out 2s linear 0.2s infinite;
}

.ripple-3 {
  animation: ripple 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.35s infinite;
}

.ripple-3 .ripple-svg {
  animation: fade-in-out 2s linear 0.35s infinite;
}

/* เอฟเฟกต์การตกลงมา */
@keyframes drop {
  0% {
    transform: scale(0.01) translateY(0);
  }
  10% {
    transform: scale(1);
  }
  44% {
    transform: scale(1) translateY(100px);
  }
  100% {
    transform: scale(1) translateY(100px);
  }
}

/* เอฟเฟกต์ fade-in และ fade-out */
@keyframes fade-in-out {
  0% {
    opacity: 0;
  }
  42% {
    opacity: 0;
  }
  52% {
    opacity: 1;
  }
  65% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Animation ของ ripple ให้กระจายออก */
@keyframes ripple {
  0% {
    transform: rotateX(65deg) scale(0.2);
  }
  42% {
    transform: rotateX(65deg) scale(0.2);
  }
  100% {
    transform: rotateX(65deg) scale(0.9);
  }
}
</style>
