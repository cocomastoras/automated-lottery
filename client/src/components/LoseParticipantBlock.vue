<script setup>
import { ref, onUnmounted, onMounted, computed } from 'vue';
import lottie from 'lottie-web';
import animationData from '@/assets/lottie/triumph.json';
import jazzicon from '@metamask/jazzicon';
import { useStore } from 'vuex';
import { normVal } from '@/utils/';

const props = defineProps({
  address: {
    type: String,
    required: true,
  },
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
const generateJazzicon = computed(() => {
  const seed = parseInt(props.address.slice(2, 10), 16);
  const icon = jazzicon(18, seed); // generates a size 18 icon
  return icon.outerHTML;
});

onMounted(() => {
  animation.value = lottie.loadAnimation({
    container: document.getElementById('bm1'),
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
  <div id="bm1" class="h-36 w-36 mx-auto" />
  <div
    class="flex items-center justify-center w-[180px] h-[38px] rounded-[19px] bg-lightgray2 mx-auto mt-[15px]"
  >
    <span class="h-[18px] mr-2.5" v-html="generateJazzicon"></span>
    <div class="font-medium text-xs leading-[18px] text-dark">
      {{ $filters.ellipsis(address, 2, 5) }}
    </div>
  </div>
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
    Sorry! You may win next round
  </div>
</template>
