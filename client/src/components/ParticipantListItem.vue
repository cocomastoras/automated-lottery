<script setup>
import { normVal } from '@/utils/';
import { useStore } from 'vuex';
import { computed } from 'vue';
import jazzicon from '@metamask/jazzicon';

const props = defineProps({
  participant: {
    type: Object,
    required: true,
  },
});

const store = useStore();
const nativeCurrency = computed(() => store.getters['account/nativeCurrency']);
const generateJazzicon = computed(() => {
  const seed = parseInt(props.participant.address.slice(2, 10), 16);
  const icon = jazzicon(18, seed); // generates a size 18 icon
  return icon.outerHTML;
});
</script>

<template>
  <li class="flex items-center justify-between">
    <div class="flex items-center">
      <span class="h-[18px] mr-2.5" v-html="generateJazzicon"></span>
      <div class="font-medium text-xs leading-[18px] text-gray">
        {{ $filters.ellipsis(participant.address, 2, 5) }}
      </div>
      <img src="@/assets/images/icon/dot-separator.svg" alt="dot separator icon" />
      <div class="font-semibold text-xs leading-[18px] text-dark">
        {{ $filters.formatNumberLocal(normVal(participant.amount, nativeCurrency.decimals)) }}
        {{ nativeCurrency.symbol }}
      </div>
    </div>
    <div
      class="flex items-center justify-center w-[42px] h-6 font-semibold text-xs leading-[18px] text-dark bg-active rounded-lg"
    >
      {{ $filters.formatPercent(participant.percent) }}
    </div>
  </li>
</template>
