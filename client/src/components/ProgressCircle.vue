<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  progress: {
    type: Number,
    required: true,
  },
  progressColor: {
    type: String,
    required: true,
  },
});

const strokeWidth = ref(10);
const direction = ref(-1);
const radius = ref(60 - strokeWidth.value / 2);
const circumference = ref(2 * Math.PI * radius.value);
const offset = computed(() => {
  if (direction.value < 0) {
    return 2 * circumference.value - circumference.value * ((100 - props.progress) / 100);
  }
  return circumference.value * ((100 - props.progress) / 100);
});
</script>

<template>
  <div class="relative">
    <svg
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
      style="transform: rotate(-90deg)"
      :class="{ rotating: Math.round(progress) === 0 }"
    >
      <circle cx="50%" cy="50%" fill="none" stroke-width="10" :r="radius" stroke="#F5F5F5" />
      <circle
        cx="50%"
        cy="50%"
        :class="{ invisible: Math.round(progress) !== 0 }"
        fill="none"
        :stroke-width="strokeWidth"
        :r="radius"
        stroke="#030303"
        stroke-linecap="round"
        :style="`stroke-dashoffset: ${0.9 * circumference}; stroke-dasharray: ${circumference};`"
      />
      <circle
        cx="50%"
        cy="50%"
        :class="{ invisible: Math.round(progress) === 0 }"
        fill="none"
        :stroke-width="strokeWidth"
        :r="radius"
        :stroke="progressColor"
        stroke-linecap="round"
        :style="`stroke-dashoffset: ${offset}; stroke-dasharray: ${circumference};`"
      />
    </svg>
    <div
      class="absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center text-dark"
    >
      <slot />
    </div>
  </div>
</template>
