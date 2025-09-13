<script setup>
import { normVal } from '@/utils/';
import { useStore } from 'vuex';
import { computed } from 'vue';
import jazzicon from '@metamask/jazzicon';

const props = defineProps({
  dataObj: {
    type: Object,
    required: true,
  },
});

const store = useStore();
const account = computed(() => store.getters['account/account']);
const nativeCurrency = computed(() => store.getters['account/nativeCurrency']);
const winnerIndicator = computed(() => {
  if (account.value) {
    return props.dataObj.winner.toLowerCase() === account.value.toLowerCase();
  }
  return false;
});
const generateJazzicon = computed(() => {
  if (!props.dataObj.isCanceled) {
    const seed = parseInt(props.dataObj.winner.slice(2, 10), 16);
    const icon = jazzicon(18, seed); // generates a size 18 icon
    return icon.outerHTML;
  }
  return '';
});
</script>

<template>
  <li>
    <div
      class="flex items-center justify-between font-medium text-xs leading-[18px] text-gray pb-2.5"
    >
      <div class="text-left">Round {{ dataObj.roundID }}</div>
      <div class="text-right">{{ $filters.formatDateLocal(dataObj.expiredAt) }}</div>
    </div>
    <div v-if="!dataObj.isCanceled" class="flex items-center justify-between">
      <div class="flex items-center">
        <span class="h-[18px] mr-2.5" v-html="generateJazzicon"></span>
        <div v-if="!winnerIndicator" class="font-medium text-xs leading-[18px] text-gray">
          {{ $filters.ellipsis(dataObj.winner, 2, 5) }}
        </div>
        <div v-else class="font-semibold text-xs leading-[18px] text-closed">I won</div>
        <img src="@/assets/images/icon/dot-separator.svg" alt="dot separator icon" />
        <div class="font-semibold text-xs leading-[18px] text-dark">
          {{ $filters.formatNumberLocal(normVal(dataObj.poolPrize, nativeCurrency.decimals)) }}
          {{ nativeCurrency.symbol }}
        </div>
      </div>
      <div
        class="flex items-center justify-center h-6 px-2.5 font-semibold text-xs leading-[18px] text-dark rounded-lg"
        :class="{ 'bg-active': !winnerIndicator, 'bg-closed': winnerIndicator }"
      >
        {{ $filters.formatPrecisionNumberLocal(dataObj.multiplier.toString(), 2) }}x
      </div>
    </div>
    <div v-else class="flex items-center">
      <img src="@/assets/images/icon/win-cancelled.svg" class="mr-[5px]" alt="win cancelled icon" />
      <span class="font-medium text-xs leading-[18px] text-dark">Cancelled</span>
    </div>
  </li>
</template>
