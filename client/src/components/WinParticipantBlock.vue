<script setup>
import { ref, onUnmounted, onMounted, computed } from 'vue';
import lottie from 'lottie-web';
import animationData from '@/assets/lottie/Winner (02 - Me).json';
import { useStore } from 'vuex';
import { normVal } from '@/utils/';

defineProps({
  amount: {
    type: Object,
    required: true,
  },
  multiplier: {
    type: Number,
    required: true,
  },
});

const animation = ref(null);
const store = useStore();
const nativeCurrency = computed(() => store.getters['account/nativeCurrency']);

onMounted(() => {
  animation.value = lottie.loadAnimation({
    container: document.getElementById('bm3'),
    render: 'svg',
    loop: true,
    autoplay: true,
    animationData,
  });
});

onUnmounted(() => {
  if (animation.value) {
    animation.value.destroy();
  }
});
</script>

<template>
  <div id="bm3" class="h-36 w-36 mx-auto" />
  <router-link
    to="/history-user"
    class="flex items-center justify-center w-[180px] h-[38px] rounded-[19px] bg-closed mx-auto mt-[15px] font-medium text-xs leading-[18px] text-dark"
  >
    You won
  </router-link>
  <div
    class="flex items-center justify-center mx-auto font-semibold text-xs leading-[18px] text-dark mt-[15px]"
  >
    <div>
      {{ $filters.formatNumberLocal(normVal(amount, nativeCurrency.decimals)) }}
      {{ nativeCurrency.symbol }}
    </div>
    <img src="@/assets/images/icon/dot-separator.svg" alt="dot separator icon" />
    <div>{{ $filters.formatPrecisionNumberLocal(multiplier.toString(), 2) }}x WIN</div>
  </div>
  <hr class="w-[180px] mx-auto my-[15px] border-lightgray" />
  <div class="font-medium text-xs leading-[18px] text-dark text-center">
    Congratulations on your win!!!
  </div>
</template>
