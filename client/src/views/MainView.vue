<script setup>
import { useStore } from 'vuex';
import useEmitter from '@/composables/useEmitter';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { inputValidateNumeric, isEmptyStr, normVal, rawVal } from '@/utils';
import ParticipantListItem from '@/components/ParticipantListItem.vue';
import { findIndex } from 'lodash/array';
import { ethers } from 'ethers';
import WinParticipantBlock from '@/components/WinParticipantBlock.vue';
import WinGenericBlock from '@/components/WinGenericBlock.vue';
import LoseParticipantBlock from '@/components/LoseParticipantBlock.vue';
import CanceledBlock from '@/components/CanceledBlock.vue';
import ProgressCircle from '@/components/ProgressCircle.vue';
import ConnectWalletModal from '@/components/ConnectWalletModal.vue';

const store = useStore();
const emitter = useEmitter();
const platform = computed(() => store.state.account.platform);
const account = computed(() => store.getters['account/account']);
const encPrivateKey = computed(() => store.getters['account/encryptedKey']);
const nativeCurrency = computed(() => store.getters['account/nativeCurrency']);
const usdExchangeRate = computed(() => store.state.account.usdExchangeRate);
const balance = computed(() => {
  const normBalance = normVal(store.state.account.balance, nativeCurrency.value.decimals);
  if (normBalance !== null) {
    return normBalance;
  }
  return '0';
});
const currentRound = computed(() => store.state.lottery.currentRound);
const currentRoundID = computed(() => store.state.lottery.currentRound.roundID);
const winnerIndicator = computed(() => store.state.account.prevRoundWinnerIndicator);

const remainingTime = ref(null);
const expirationHandler = ref(null);
const enteredAmount = ref(null);
const processedEnteredAmount = computed(() => inputValidateNumeric(enteredAmount.value));
const showInvalidEnterAmountMsg = computed(
  () => processedEnteredAmount.value === null && !isEmptyStr(enteredAmount.value)
);
const showMinEnteredAmountMsg = computed(() => {
  if (processedEnteredAmount.value && !isEmptyStr(enteredAmount.value)) {
    const amount = rawVal(processedEnteredAmount.value, nativeCurrency.value.decimals);
    return !amount.gt(currentRound.value.minEnterAmount);
  }
  return false;
});
const submitting = ref(false);

const enterRound = async () => {
  try {
    const amountWEI = rawVal(processedEnteredAmount.value, nativeCurrency.value.decimals);
    submitting.value = true;
    store
      .dispatch('lottery/enterRound', { amount: amountWEI })
      .then((rsp) => {
        if (rsp.success) {
          enteredAmount.value = null;
          // Trigger current round info update
          emitter.emit('fetch-current-round-data');
          store.dispatch('account/fetchBalance');
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        submitting.value = false;
      });
  } catch (e) {
    console.error(e);
  }
};

const enterMax = () => {
  enteredAmount.value = balance.value;
};

const validateEnterRound = computed(() => {
  if (!processedEnteredAmount.value) {
    return false;
  }
  const amount = rawVal(processedEnteredAmount.value, nativeCurrency.value.decimals);
  return store.state.account.balance.gte(amount) && amount.gte(currentRound.value.minEnterAmount);
});

const elapsedTime = ref(0);
const hasExpired = ref(false);
const displayWin = ref(false);
const displayCancel = ref(false);
const displayGeneric = ref(false);
const displayLose = ref(false);
const winnerAddress = ref('');
const winnerPrize = ref(null);
const winnerMultiplier = ref(0);
const progress = computed(() => {
  return (elapsedTime.value / 300000) * 100;
});
const progressColor = computed(() => {
  const progressRound = Math.round(progress.value);
  if (progressRound <= 100 && progressRound > 40) {
    return '#50F8D2';
  }
  if (progressRound <= 40 && progressRound > 20) {
    return '#F87D50';
  }
  if (progressRound <= 20 && progressRound > 0) {
    return '#FF588F';
  }
  return '#F5F5F5';
});

const updateRemainingTime = (timeLeft) => {
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  remainingTime.value = `${
    minutes > 9
      ? `<div class="w-5">${minutes}</div>`
      : `<div class="w-2.5">0</div><div class="w-2.5">${minutes}</div>`
  }:${
    seconds > 9
      ? `<div class="w-5">${seconds}</div>`
      : `<div class="w-2.5">0</div><div class="w-2.5">${seconds}</div>`
  }`;
  elapsedTime.value = timeLeft;
  // eslint-disable-next-line no-param-reassign
  timeLeft -= 1000;
  if (timeLeft > 0) {
    expirationHandler.value = window.setTimeout(() => {
      updateRemainingTime(timeLeft);
    }, 1000);
  } else {
    hasExpired.value = true;
    remainingTime.value = null;
  }
};

const userPoolEntries = computed(() => {
  let amount = null;
  let winPerc = null;
  if (account.value) {
    const userParticipantsIndex = findIndex(currentRound.value.participants, (participant) => {
      return participant.address.toLowerCase() === account.value.toLowerCase();
    });
    if (userParticipantsIndex !== -1) {
      amount = currentRound.value.participants[userParticipantsIndex].amount;
      winPerc = currentRound.value.participants[userParticipantsIndex].percent;
    }
  }
  return {
    amount,
    winPerc,
  };
});

const userEnteredAmountPrevRound = ref(null);

watch(currentRoundID, async (curRoundID, prevRoundID) => {
  if (curRoundID) {
    if (currentRound.value.expiration) {
      const now = Date.now();
      const expirationTime = currentRound.value.expiration.toNumber() * 1000;
      const timeLeft = expirationTime - now;
      hasExpired.value = false;
      displayWin.value = false;
      store.commit('account/setPreviousRoundWinnerIndicator', false);
      displayCancel.value = false;
      displayLose.value = false;
      displayGeneric.value = false;
      winnerAddress.value = '';
      winnerPrize.value = null;
      winnerMultiplier.value = 0;
      if (ethers.BigNumber.isBigNumber(curRoundID) && ethers.BigNumber.isBigNumber(prevRoundID)) {
        if (!curRoundID.eq(prevRoundID)) {
          if (timeLeft > 285000) {
            const roundWinnerInfo = await store.dispatch('lottery/getRoundWinnerInfo', {
              roundID: prevRoundID,
            });
            if (roundWinnerInfo) {
              if (roundWinnerInfo.canceled) {
                displayCancel.value = true;
              } else if (userEnteredAmountPrevRound.value) {
                // User has participated in this round
                if (roundWinnerInfo.winnerAddress.toLowerCase() === account.value.toLowerCase()) {
                  winnerPrize.value = roundWinnerInfo.winningAmount;
                  winnerMultiplier.value = roundWinnerInfo.multiplier;
                  displayWin.value = true;
                  store.commit('account/setPreviousRoundWinnerIndicator', true);
                } else {
                  winnerAddress.value = roundWinnerInfo.winnerAddress;
                  winnerPrize.value = roundWinnerInfo.winningAmount;
                  winnerMultiplier.value = roundWinnerInfo.multiplier;
                  displayLose.value = true;
                }
                userEnteredAmountPrevRound.value = null;
              } else {
                winnerAddress.value = roundWinnerInfo.winnerAddress;
                winnerPrize.value = roundWinnerInfo.winningAmount;
                winnerMultiplier.value = roundWinnerInfo.multiplier;
                displayGeneric.value = true;
              }
              window.setTimeout(() => {
                emitter.emit('fetch-current-round-data');
              }, timeLeft - 285000);
            }
          }
        }
      }
      if (timeLeft > 0 && timeLeft < 285000) {
        window.clearTimeout(expirationHandler.value);
        updateRemainingTime(timeLeft);
      } else if (timeLeft <= 0) {
        hasExpired.value = true;
        userEnteredAmountPrevRound.value = userPoolEntries.value.amount;
      }
    }
  }
});

onMounted(async () => {
  if (currentRoundID.value) {
    if (currentRound.value.expiration) {
      const now = Date.now();
      const expirationTime = currentRound.value.expiration.toNumber() * 1000;
      const timeLeft = expirationTime - now;
      if (timeLeft > 0) {
        window.clearTimeout(expirationHandler.value);
        updateRemainingTime(timeLeft);
      } else if (timeLeft <= 0) {
        hasExpired.value = true;
      }
    }
  }
});

onUnmounted(() => {
  window.clearTimeout(expirationHandler.value);
});
</script>

<template>
  <div class="w-full md:w-2/3 lg:w-1/2 mx-auto">
    <div v-if="account" class="flex items-center justify-between mb-[15px]">
      <ul class="flex items-center space-x-[5px]">
        <li>
          <router-link to="/history">
            <img src="@/assets/images/icon/win-history.svg" alt="win history icon" />
          </router-link>
        </li>
        <li>
          <router-link to="/history-user" :class="{ 'winner-animation': winnerIndicator }">
            <svg
              width="40px"
              height="40px"
              viewBox="0 0 40 40"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
            >
              <title>Icon/win-winnings</title>
              <g
                id="Icon/win-winnings"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
              >
                <circle id="BG" fill="currentColor" cx="20" cy="20" r="20"></circle>
                <path
                  d="M20,23 C16.68629,23 14,20.3137 14,17 L14,11.44444 C14,11.0306 14,10.82367 14.06031,10.65798 C14.16141,10.38021 14.38021,10.16141 14.65798,10.06031 C14.82367,10 15.0306,10 15.44444,10 L24.5556,10 C24.9694,10 25.1763,10 25.342,10.06031 C25.6198,10.16141 25.8386,10.38021 25.9397,10.65798 C26,10.82367 26,11.0306 26,11.44444 L26,17 C26,20.3137 23.3137,23 20,23 Z M20,23 L20,26 M26,12 L28.5,12 C28.9659,12 29.1989,12 29.3827,12.07612 C29.6277,12.17761 29.8224,12.37229 29.9239,12.61732 C30,12.80109 30,13.03406 30,13.5 L30,14 C30,14.92997 30,15.39496 29.8978,15.77646 C29.6204,16.81173 28.8117,17.62038 27.7765,17.89778 C27.395,18 26.93,18 26,18 M14,12 L11.5,12 C11.03406,12 10.80109,12 10.61732,12.07612 C10.37229,12.17761 10.17761,12.37229 10.07612,12.61732 C10,12.80109 10,13.03406 10,13.5 L10,14 C10,14.92997 10,15.39496 10.10222,15.77646 C10.37962,16.81173 11.18827,17.62038 12.22354,17.89778 C12.60504,18 13.07003,18 14,18 M15.44444,30 L24.5556,30 C24.801,30 25,29.801 25,29.5556 C25,27.5919 23.4081,26 21.4444,26 L18.5556,26 C16.59188,26 15,27.5919 15,29.5556 C15,29.801 15.19898,30 15.44444,30 Z"
                  id="Shape"
                  stroke="#FFFFFF"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </g>
            </svg>
          </router-link>
        </li>
      </ul>
      <ul class="flex items-center h-12 bg-white space-x-[15px] py-3.5 px-[15px] rounded-lg shadow">
        <li
          class="flex items-center font-semibold text-sm text-dark pr-[15px] border-r border-lightgray"
        >
          <img
            :src="nativeCurrency.icon"
            class="mr-[5px]"
            width="20"
            height="20"
            alt="chain icon"
          />
          {{ $filters.formatPrecisionNumberLocal(balance, 6) }} {{ nativeCurrency.symbol }}
        </li>
        <li>
          <router-link to="/wallet-management">
            <img src="@/assets/images/icon/menu-sm.svg" alt="menu sm icon" />
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else class="flex items-center justify-between mb-[15px]">
      <ul class="flex items-center">
        <li>
          <router-link to="/history">
            <img src="@/assets/images/icon/win-history.svg" alt="win history icon" />
          </router-link>
        </li>
      </ul>
      <ul class="flex items-center">
        <li v-if="!encPrivateKey && platform === 'telegram'">
          <router-link
            to="/connect-wallet"
            class="flex items-center justify-center h-10 px-[15px] font-semibold text-sm bg-dark text-white rounded-lg hover:shadow"
          >
            Connect wallet
          </router-link>
        </li>
        <li v-else-if="encPrivateKey && !account && platform === 'telegram'">
          <router-link
            to="/unlock-wallet"
            class="flex items-center justify-center h-10 px-[15px] font-semibold text-sm bg-dark text-white rounded-lg hover:shadow"
          >
            Unlock wallet
          </router-link>
        </li>
        <li v-else-if="!account && platform === 'web'">
          <button
            class="flex items-center justify-center h-10 px-[15px] font-semibold text-sm bg-dark text-white rounded-lg hover:shadow"
            @click="emitter.emit('show-connect-wallet-modal')"
            type="button"
          >
            Connect wallet
          </button>
        </li>
      </ul>
    </div>
    <div
      v-if="currentRound.roundID"
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img src="@/assets/images/icon/win-now.svg" alt="win now" />
          <div class="pl-2.5">
            <div class="font-semibold text-base text-dark">
              Round
              {{
                [displayWin, displayCancel, displayGeneric, displayLose].indexOf(true) !== -1
                  ? currentRound.roundID.sub(1).toNumber()
                  : currentRound.roundID.toNumber()
              }}
            </div>
            <div class="font-medium text-xs text-gray">Current round</div>
          </div>
        </div>
        <div
          class="flex items-center justify-center w-[102px] h-10 rounded-[20px] font-semibold text-base leading-[18px] text-dark"
          :style="`background-color: ${progressColor};`"
        >
          <img src="@/assets/images/icon/expiration.svg" alt="expiration" />
          <div
            v-if="remainingTime"
            class="ml-[5px] flex items-center text-center"
            v-html="remainingTime"
          />
        </div>
      </div>
      <WinParticipantBlock v-if="displayWin" :amount="winnerPrize" :multiplier="winnerMultiplier" />
      <WinGenericBlock
        v-if="displayGeneric"
        :address="winnerAddress"
        :amount="winnerPrize"
        :multiplier="winnerMultiplier"
      />
      <LoseParticipantBlock
        v-if="displayLose"
        :address="winnerAddress"
        :amount="winnerPrize"
        :multiplier="winnerMultiplier"
      />
      <CanceledBlock v-if="displayCancel" />
      <div
        v-if="[displayWin, displayCancel, displayGeneric, displayLose].indexOf(true) === -1"
        class="flex items-center justify-center w-full py-5"
      >
        <ProgressCircle
          :progress="progress"
          :progress-color="progressColor"
          class="w-[220px] h-[220px]"
        >
          <div class="font-medium text-xs leading-[18px]">
            Prize Pool ({{ nativeCurrency.symbol }})
          </div>
          <div class="font-semibold text-4xl">
            {{
              $filters.formatNumberLocal(normVal(currentRound.poolPrize, nativeCurrency.decimals))
            }}
          </div>
          <div class="font-medium text-sm leading-none text-gray pb-[15px]">
            ~{{
              $filters.formatUSD(
                parseFloat(normVal(currentRound.poolPrize, nativeCurrency.decimals)) *
                  usdExchangeRate
              )
            }}
          </div>
          <div class="flex items-center font-semibold text-xs leading-[18px]">
            <img src="@/assets/images/icon/win-players.svg" class="mr-1" alt="win players" />
            {{ currentRound.participants.length }}
            {{ currentRound.participants.length === 1 ? 'Player' : 'Players' }}
          </div>
        </ProgressCircle>
      </div>
      <img
        v-if="hasExpired"
        src="@/assets/images/DrawingWinner.svg"
        class="mx-auto"
        alt="drawing winner"
      />
      <div
        v-if="[displayWin, displayCancel, displayGeneric, displayLose].indexOf(true) === -1"
        :class="{ 'pt-5': !hasExpired || userPoolEntries.amount }"
      >
        <router-link
          v-if="!encPrivateKey && !hasExpired && platform === 'telegram'"
          to="/connect-wallet"
          class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow"
        >
          Connect wallet to play
        </router-link>
        <ul
          v-else-if="encPrivateKey && !account && !hasExpired && platform === 'telegram'"
          class="space-y-2.5"
        >
          <li>
            <router-link
              to="/unlock-wallet"
              class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow"
            >
              Unlock wallet to play
            </router-link>
          </li>
          <li>
            <router-link
              to="/forgot-password"
              class="flex items-center justify-center h-10 w-full font-semibold text-sm bg-transparent text-dark border border-lightgray rounded-lg hover:shadow"
            >
              Forgot my password
            </router-link>
          </li>
        </ul>
        <button
          v-else-if="!account && !hasExpired && platform === 'web'"
          class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow"
          @click="emitter.emit('show-connect-wallet-modal')"
          type="button"
        >
          Connect wallet
        </button>
        <div v-else-if="!hasExpired">
          <div class="flex items-center">
            <div
              class="relative h-12 grow flex items-center font-medium text-lg text-dark leading-6 py-3.5 pl-[15px] pr-2 mr-2.5"
            >
              <label class="hidden" for="amount">Εntered amount</label>
              <img
                :src="nativeCurrency.icon"
                class="flex-none mr-2.5"
                width="20"
                height="20"
                alt="chain icon"
              />
              <input
                id="amount"
                type="text"
                name="amount"
                v-model.trim="enteredAmount"
                class="w-full bg-transparent peer focus:outline-none z-10"
                value
                placeholder="0"
                :disabled="submitting"
              />
              <button
                class="flex-none items-center justify-center w-10 h-8 font-bold text-[10px] leading-[12px] text-dark bg-gray2 rounded-md ml-2.5 z-10 disabled:bg-gray"
                @click="enterMax"
                type="button"
                :disabled="submitting"
              >
                MAX
              </button>
              <div
                class="absolute top-0 left-0 w-full h-12 border border-lightgray rounded-lg bg-transparent peer-focus:border-dark"
                :class="{ 'border-negative': showInvalidEnterAmountMsg }"
              >
                &nbsp;
              </div>
            </div>
            <button
              class="h-12 w-[100px] font-semibold text-sm bg-dark text-white rounded-lg hover:shadow disabled:bg-gray"
              type="button"
              @click="enterRound"
              :disabled="submitting || !validateEnterRound"
            >
              {{ submitting ? 'Wait...' : 'Play' }}
            </button>
          </div>
          <div
            v-show="showInvalidEnterAmountMsg"
            class="font-medium text-xs leading-[18px] text-negative mt-1"
          >
            Invalid input
          </div>
          <div v-show="showMinEnteredAmountMsg" class="font-medium text-xs text-gray py-1">
            Minimum enter amount:
            <span class="font-semibold"
              >{{ normVal(currentRound.minEnterAmount, nativeCurrency.decimals) }}
              {{ nativeCurrency.symbol }}</span
            >
          </div>
        </div>
        <div
          v-if="userPoolEntries.amount && userPoolEntries.winPerc"
          class="grid grid-cols-2 py-2.5 px-[15px] bg-lightgray2 rounded-lg mt-5"
        >
          <div class="font-semibold text-left border-r border-lightgray">
            <div class="text-xs leading-[18px] text-gray">My entries</div>
            <div class="text-sm text-dark">
              {{ normVal(userPoolEntries.amount, nativeCurrency.decimals) }}
              {{ nativeCurrency.symbol }}
            </div>
          </div>
          <div class="font-semibold text-right">
            <div class="text-xs leading-[18px] text-gray">My Win Chance</div>
            <div class="text-sm text-dark">
              {{ $filters.formatPercent(userPoolEntries.winPerc) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="
        currentRound.participants.length !== 0 &&
        [displayWin, displayCancel, displayGeneric, displayLose].indexOf(true) === -1
      "
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="flex items-center">
        <img src="@/assets/images/icon/win-players.svg" alt="win players" />
        <div class="pl-2.5">
          <div class="font-semibold text-base text-dark">
            {{ currentRound.participants.length }}
            {{ currentRound.participants.length === 1 ? 'Player' : 'Players' }}
          </div>
          <div class="font-medium text-xs text-gray">In current round</div>
        </div>
      </div>
      <ul class="pt-5 space-y-[15px]">
        <ParticipantListItem
          v-for="(participant, index) in currentRound.participants"
          :key="index"
          :participant="participant"
        />
      </ul>
    </div>
  </div>
  <Teleport to="body">
    <ConnectWalletModal v-if="platform === 'web'" />
  </Teleport>
</template>
