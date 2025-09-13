<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import VueQrcode from '@chenfengyuan/vue-qrcode';

const store = useStore();
const tooltipEl = ref(null);
const account = computed(() => store.getters['account/account']);
const nativeCurrency = computed(() => store.getters['account/nativeCurrency']);

const copyAddress = () => {
  navigator.clipboard.writeText(account.value);
  tooltipEl.value.classList.add('show');
  setTimeout(() => {
    tooltipEl.value.classList.remove('show');
  }, 1500);
};
</script>

<template>
  <section class="w-full md:w-2/3 lg:w-1/2 mx-auto">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">Deposit funds</div>
    </div>
    <div
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="font-semibold text-base text-dark">Deposit {{ nativeCurrency.symbol }}</div>
      <div class="font-medium text-xs leading-[18px] text-gray">
        Send only {{ nativeCurrency.symbol }} to this deposit address.
      </div>
      <VueQrcode class="mx-auto my-10" :value="account" :options="{ width: 140, margin: 0 }" />
      <div class="flex items-center justify-between pb-5">
        <div>
          <div class="font-medium text-xs leading-[18px] text-gray">ADDRESS</div>
          <div class="font-semibold text-xs leading-[18px] text-dark">
            {{ $filters.ellipsis(account, 6, 4) }}
          </div>
        </div>
        <div class="tooltip" ref="tooltipEl">
          <span class="tooltiptext tooltip-left w-28 text-center p-2.5">Copied</span>
          <button @click="copyAddress" type="button">
            <img src="@/assets/images/icon/copy.svg" alt="Copy icon" />
          </button>
        </div>
      </div>
      <div class="flex items-start bg-lightnegative rounded-lg py-[15px] pl-2.5 pr-[15px] mt-2.5">
        <img class="mr-2.5" src="@/assets/images/icon/notice.svg" alt="notice icon" />
        <div class="font-medium text-[10px] leading-4 text-dark">
          Sending coin or token other than {{ nativeCurrency.symbol }} to this address will result
          in the loss of your deposit.
        </div>
      </div>
    </div>
  </section>
</template>
