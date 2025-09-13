<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import CryptoJS from 'crypto-js';
import { isEmptyStr } from '@/utils/';

const showPassword = ref(false);
const password = ref(null);
const store = useStore();
const account = computed(() => store.getters['account/account']);
const encPrivateKey = computed(() => store.getters['account/encryptedKey']);
const privateKey = ref(null);
const tooltipEl = ref(null);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const copyAddress = () => {
  navigator.clipboard.writeText(privateKey.value);
  tooltipEl.value.classList.add('show');
  setTimeout(() => {
    tooltipEl.value.classList.remove('show');
  }, 1500);
};

const showInvalidPasswordMsg = computed(
  () => privateKey.value === '' && !isEmptyStr(password.value)
);

const showPrivateKey = () => {
  if (account.value && encPrivateKey.value && password.value) {
    try {
      const bytes = CryptoJS.AES.decrypt(encPrivateKey.value, password.value);
      privateKey.value = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error(e);
      privateKey.value = '';
    }
  } else {
    privateKey.value = null;
  }
};

const validatePasswordForm = computed(() => {
  return !isEmptyStr(password.value);
});
</script>

<template>
  <section class="w-full">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">Show private key</div>
    </div>
    <div
      v-if="privateKey"
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="flex items-start">
        <img
          class="mt-2.5 mr-2.5"
          height="18"
          width="18"
          src="@/assets/images/icon/win-private-key.svg"
          alt="win private key icon"
        />
        <div>
          <div class="font-semibold text-dark text-base">Your private key</div>
          <div class="font-medium text-gray text-xs">
            Below you can find your wallet’s private key.
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between py-[30px]">
        <div class="pr-[15px] break-all">
          <div class="font-medium text-xs leading-[18px] text-gray">Private key</div>
          <div class="font-semibold text-xs leading-[18px] text-dark">
            {{ privateKey }}
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
          Never disclose this key. Anyone with your private key can steal any assets held in your
          wallet.
        </div>
      </div>
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
          <div class="font-semibold text-dark text-base">Enter your password</div>
          <div class="font-medium text-gray text-xs">Enter your password to continue</div>
        </div>
      </div>
      <form class="pt-[30px]" @submit.prevent="showPrivateKey">
        <div class="font-semibold text-xs leading-[18px] text-dark pb-[5px]">Password</div>
        <div class="relative flex items-center font-medium text-sm py-3.5 pl-5">
          <label class="hidden" for="unlock-password">password</label>
          <input
            id="unlock-password"
            :type="showPassword ? 'text' : 'password'"
            name="unlock-password"
            v-model="password"
            class="grow bg-transparent peer focus:outline-none z-10"
            value
            @keydown="privateKey = null"
            autocomplete="current-password"
            placeholder="Enter your password"
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
            :class="{ 'border-negative': showInvalidPasswordMsg }"
          >
            &nbsp;
          </div>
        </div>
        <div
          v-show="showInvalidPasswordMsg"
          class="font-medium text-xs leading-[18px] text-negative mt-1"
        >
          Invalid password
        </div>
        <button
          class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow mt-[15px] disabled:bg-gray"
          type="submit"
          :disabled="!validatePasswordForm"
        >
          Show private key
        </button>
      </form>
    </div>
  </section>
</template>
