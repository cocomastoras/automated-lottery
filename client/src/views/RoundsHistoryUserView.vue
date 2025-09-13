<script setup>
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import { ethers } from 'ethers';
import { normVal } from '@/utils/';
import PaginationUserList from '@/components/PaginationUserList.vue';

const store = useStore();
const account = computed(() => store.getters['account/account']);
const nativeCurrency = computed(() => store.getters['account/nativeCurrency']);

const winningAmount = ref(ethers.constants.Zero);
const winningRoundIDs = ref([]);
const calculateUserWinnings = async () => {
  try {
    if (account.value) {
      const winnings = await store.dispatch('lottery/filterPendingWinningEntriesForUser');
      if (winnings) {
        winningAmount.value = winnings.amount;
        winningRoundIDs.value = winnings.roundIDs;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const submitting = ref(false);
const redeemWinnings = async () => {
  if (!winningAmount.value.isZero() && winningRoundIDs.value.length !== 0) {
    submitting.value = true;
    store
      .dispatch('lottery/redeemAllPendingWinnings', { roundIDs: winningRoundIDs.value })
      .then((rsp) => {
        if (rsp.success) {
          calculateUserWinnings();
          store.dispatch('account/fetchBalance');
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        submitting.value = false;
      });
  }
};

calculateUserWinnings();
</script>

<template>
  <section class="w-full md:w-2/3 lg:w-1/2 mx-auto">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">Rounds I’ve played</div>
    </div>
    <div
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[30px]"
    >
      <img class="mx-auto" src="@/assets/images/winner.svg" alt="winner trophy image" />
      <div class="font-semibold text-xl leading-6 text-dark text-center pt-2.5">
        {{ $filters.formatNumberLocal(normVal(winningAmount, nativeCurrency.decimals)) }}
        {{ nativeCurrency.symbol }}
      </div>
      <div class="font-medium text-xs leading-[18px] text-gray text-center">Winnings to redeem</div>
      <button
        class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow mt-[15px] disabled:bg-gray"
        @click="redeemWinnings"
        type="button"
        :disabled="submitting || winningAmount.isZero()"
      >
        {{ submitting ? 'Transaction in progress' : 'Redeem winnings' }}
      </button>
    </div>
    <PaginationUserList />
  </section>
</template>
