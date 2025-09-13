<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import { isEmptyStr } from '@/utils/';
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN } from '@/config/contracts';

const store = useStore();
const account = computed(() => store.getters['account/account']);
const encPrivateKey = computed(() => store.getters['account/encryptedKey']);
const showPassword = ref(false);
const password = ref(null);
const tooltipEl = ref(null);
const nativeCurrency = computed(() => store.getters['account/nativeCurrency']);
const showPasswordRequirementsMsg = computed(
  () =>
    !isEmptyStr(password.value) &&
    !PASSWORD_PATTERN.test(password.value) &&
    password.value.length < PASSWORD_MIN_LENGTH
);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const copyAddress = () => {
  navigator.clipboard.writeText(account.value);
  tooltipEl.value.classList.add('show');
  setTimeout(() => {
    tooltipEl.value.classList.remove('show');
  }, 1500);
};

const createNewWallet = async () => {
  if (!account.value && !encPrivateKey.value && password.value) {
    await store.dispatch('account/createWallet', {
      password: password.value,
    });
  }
};

const validatePasswordForm = computed(() => {
  if (isEmptyStr(password.value)) {
    return false;
  }
  if (password.value.length < PASSWORD_MIN_LENGTH) {
    return false;
  }
  return PASSWORD_PATTERN.test(password.value);
});
</script>

<template>
  <section class="w-full">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">New wallet</div>
    </div>
    <div
      v-if="account"
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="flex items-center">
        <img
          class="mr-2.5"
          height="18"
          width="18"
          src="@/assets/images/icon/win-wallet.svg"
          alt="win wallet icon"
        />
        <div class="font-semibold text-base text-dark">
          Your new wallet is ready. Deposit {{ nativeCurrency.symbol }} to start playing.
        </div>
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
          Sending coin or token other than BNB to this address will result in the loss of your
          deposit.
        </div>
      </div>
      <router-link
        to="/"
        class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow mt-[15px]"
      >
        Play now
      </router-link>
    </div>
    <div
      v-else
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="flex items-start">
        <img
          class="mt-2.5 mr-2.5"
          height="18"
          width="18"
          src="@/assets/images/icon/win-passcode.svg"
          alt="win passcode icon"
        />
        <div>
          <div class="font-semibold text-dark text-base">Create a password</div>
          <div class="font-medium text-gray text-xs">
            Before we create a new wallet for you, please create a password. This password will be
            used to verify all your transactions.
          </div>
        </div>
      </div>
      <form class="pt-[30px]" @submit.prevent="createNewWallet">
        <div class="font-semibold text-xs leading-[18px] text-dark pb-[5px]">Password</div>
        <div class="relative flex items-center font-medium text-sm py-3.5 pl-5">
          <label class="hidden" for="create-password">password</label>
          <input
            id="create-password"
            :type="showPassword ? 'text' : 'password'"
            name="create-password"
            v-model="password"
            class="grow bg-transparent peer focus:outline-none z-10"
            value
            autocomplete="new-password"
            placeholder="Enter a password"
          />
          <button class="mx-2.5 z-10" @click="togglePassword" type="button">
            <img
              v-if="showPassword"
              src="@/assets/images/icon/password-hide.svg"
              alt="password hide icon"
            />
            <img v-else src="@/assets/images/icon/password-show.svg" alt="password show icon" />
          </button>
          <div
            class="absolute top-0 left-0 w-full h-12 border border-lightgray rounded-lg bg-transparent peer-focus:border-dark"
          >
            &nbsp;
          </div>
        </div>
        <div
          v-show="showPasswordRequirementsMsg"
          class="font-medium text-xs leading-[18px] text-gray mt-1"
        >
          Your password needs to be at least 8 characters long with lowercase and uppercase letters,
          numeric digits and non-alphanumeric characters [!@#$%^&*_]
        </div>
        <button
          class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow mt-[15px] disabled:bg-gray"
          type="submit"
          :disabled="!validatePasswordForm"
        >
          Create new wallet
        </button>
      </form>
      <div class="flex items-start bg-lightnegative rounded-lg py-[15px] pl-2.5 pr-[15px] mt-2.5">
        <img class="mr-2.5" src="@/assets/images/icon/notice.svg" alt="notice icon" />
        <div class="font-medium text-[10px] leading-4 text-dark">
          Before we create a new wallet for you, please create a password. This password will be
          used to verify all your transactions.
        </div>
      </div>
    </div>
  </section>
</template>
