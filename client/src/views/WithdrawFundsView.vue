<script setup>
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import { inputValidateNumeric, isEmptyStr, normVal, rawVal } from '@/utils';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';

const store = useStore();
const router = useRouter();

const account = computed(() => store.getters['account/account']);
const activeNetwork = computed(() => store.getters['account/activeNetwork']);
const balance = computed(() => {
  const normBalance = normVal(store.state.account.balance, activeNetwork.value.currency.decimals);
  if (normBalance !== null) {
    return normBalance;
  }
  return '0';
});
const enteredAmount = ref(null);
const recipientAddress = ref(null);
const submitting = ref(false);

const withdrawAmount = async () => {
  const amount = rawVal(enteredAmount.value, activeNetwork.value.currency.decimals);
  submitting.value = true;
  store
    .dispatch('account/withdrawFunds', {
      to: recipientAddress.value,
      amount,
    })
    .then((rsp) => {
      if (rsp.success) {
        enteredAmount.value = null;
        recipientAddress.value = null;
        store.dispatch('account/fetchBalance');
        router.push('/');
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      submitting.value = false;
    });
};

const processedEnteredAmount = computed(() => inputValidateNumeric(enteredAmount.value));
const showInvalidEnterAmountMsg = computed(
  () => processedEnteredAmount.value === null && !isEmptyStr(enteredAmount.value)
);
const showInvalidRecipientAddressMsg = computed(
  () => !ethers.utils.isAddress(recipientAddress.value) && !isEmptyStr(recipientAddress.value)
);

const validateForm = computed(() => {
  if (!processedEnteredAmount.value) {
    return false;
  }
  const amount = rawVal(processedEnteredAmount.value, activeNetwork.value.currency.decimals);
  if (!store.state.account.balance.gt(amount)) {
    return false;
  }
  if (isEmptyStr(recipientAddress.value)) {
    return false;
  }
  if (recipientAddress.value.toLowerCase() === account.value.toLowerCase()) {
    return false;
  }
  return ethers.utils.isAddress(recipientAddress.value);
});
</script>

<template>
  <section class="w-full md:w-2/3 lg:w-1/2 mx-auto">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">Withdraw funds</div>
    </div>
    <div
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="font-semibold text-base text-dark">
        Withdraw {{ activeNetwork.currency.symbol }}
      </div>
      <div class="font-medium text-xs leading-[18px] text-gray">
        Transfer {{ activeNetwork.currency.symbol }} to an external wallet using the
        {{ activeNetwork.label }} network.
      </div>
      <form class="py-[30px]" @submit.prevent="withdrawAmount">
        <div class="flex items-center justify-between pb-[5px]">
          <div class="font-semibold text-xs leading-[18px] text-dark">
            {{ activeNetwork.currency.symbol }} amount
          </div>
          <div class="font-semibold text-xs leading-[18px] text-dark">
            {{ $filters.formatPrecisionNumberLocal(balance, 6) }}
            {{ activeNetwork.currency.symbol }} available
          </div>
        </div>
        <div class="relative grow flex items-center font-medium text-sm py-3.5 px-5">
          <label class="hidden" for="amount">entered amount</label>
          <input
            id="amount"
            type="text"
            name="amount"
            v-model.trim="enteredAmount"
            class="w-full bg-transparent peer focus:outline-none z-10"
            value
            :disabled="submitting"
            :placeholder="`Enter ${activeNetwork.currency.symbol} amount`"
          />
          <div
            class="absolute top-0 left-0 w-full h-12 border border-lightgray rounded-lg bg-transparent peer-focus:border-dark"
            :class="{ 'border-negative': showInvalidEnterAmountMsg }"
          >
            &nbsp;
          </div>
        </div>
        <div
          v-show="showInvalidEnterAmountMsg"
          class="font-medium text-xs leading-[18px] text-negative mt-1"
        >
          Invalid input
        </div>
        <div class="font-semibold text-xs leading-[18px] text-dark pt-5 pb-[5px]">
          Wallet address
        </div>
        <div class="relative grow flex items-center font-medium text-sm py-3.5 px-5">
          <label class="hidden" for="recipient">recipient address</label>
          <input
            id="recipient"
            type="text"
            name="recipient"
            v-model.trim="recipientAddress"
            class="w-full bg-transparent peer focus:outline-none z-10"
            value
            :disabled="submitting"
            placeholder="Enter recipient’s wallet address "
          />
          <div
            class="absolute top-0 left-0 w-full h-12 border border-lightgray rounded-lg bg-transparent peer-focus:border-dark"
            :class="{ 'border-negative': showInvalidEnterAmountMsg }"
          >
            &nbsp;
          </div>
        </div>
        <div
          v-show="showInvalidRecipientAddressMsg"
          class="font-medium text-xs leading-[18px] text-negative mt-1"
        >
          Invalid ethereum address
        </div>
        <button
          class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow mt-[15px] disabled:bg-gray"
          type="submit"
          :disabled="submitting || !validateForm"
        >
          {{ submitting ? 'Transaction in progress' : `Withdraw ${activeNetwork.currency.symbol}` }}
        </button>
      </form>
      <div class="flex items-start bg-lightnegative rounded-lg py-[15px] pl-2.5 pr-[15px] mt-2.5">
        <img class="mr-2.5" src="@/assets/images/icon/notice.svg" alt="notice icon" />
        <div class="font-medium text-[10px] leading-4 text-dark">
          Sending coin or token other than {{ activeNetwork.currency.symbol }} to this address will
          result in the loss of your deposit.
        </div>
      </div>
    </div>
  </section>
</template>
