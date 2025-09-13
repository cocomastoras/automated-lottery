<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { isEmptyStr } from '@/utils/';
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN } from '@/config/contracts';
import { ethers } from 'ethers';

const store = useStore();
const router = useRouter();
const showPassword = ref(false);
const password = ref(null);
const insertPrivateKey = ref(false);
const privateKey = ref(null);
const account = computed(() => store.getters['account/account']);
const showPasswordRequirementsMsg = computed(
  () =>
    !isEmptyStr(password.value) &&
    !PASSWORD_PATTERN.test(password.value) &&
    password.value.length < PASSWORD_MIN_LENGTH
);

const toggleInsertPrivateKey = () => {
  insertPrivateKey.value = !insertPrivateKey.value;
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const importWallet = async () => {
  if (!account.value && privateKey.value && password.value) {
    const hasImported = await store.dispatch('account/importWallet', {
      privateKey: privateKey.value,
      password: password.value,
    });
    if (hasImported) {
      router.push('/');
    } else {
      console.log('Something went wrong');
    }
  }
};

const validatePrivateKeyForm = computed(() => {
  if (isEmptyStr(privateKey.value)) {
    return false;
  }
  return ethers.utils.isHexString(privateKey.value, 32);
});

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
      <div class="font-semibold text-dark text-lg">Import wallet</div>
    </div>
    <div
      v-if="insertPrivateKey"
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
          <div class="font-semibold text-dark text-base">Enter private key</div>
          <div class="font-medium text-gray text-xs">
            Enter your wallet’s private key string to import an existing wallet.
          </div>
        </div>
      </div>
      <form class="pt-[30px]" @submit.prevent="importWallet">
        <div class="font-semibold text-xs leading-[18px] text-dark pb-[5px]">Private key</div>
        <div class="relative flex items-center font-medium text-sm py-3.5 px-5">
          <label class="hidden" for="private-key">private key</label>
          <input
            id="private-key"
            type="text"
            name="private-key"
            v-model.trim="privateKey"
            class="grow bg-transparent peer focus:outline-none z-10"
            value
            placeholder="Enter your private key string"
          />
          <div
            class="absolute top-0 left-0 w-full h-12 border border-lightgray rounded-lg bg-transparent peer-focus:border-dark"
          >
            &nbsp;
          </div>
        </div>
        <button
          class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow mt-[15px] disabled:bg-gray"
          type="submit"
          :disabled="!validatePrivateKeyForm"
        >
          Import wallet
        </button>
      </form>
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
            Before you import an existing wallet (using your wallet’s private key), please create a
            password. This password will be used to verify all your transactions.
          </div>
        </div>
      </div>
      <form class="pt-[30px]" @submit.prevent="toggleInsertPrivateKey">
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
            autocomplete="current-password"
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
          Your security matters! Before you continue, take a moment to write down your new password
          and store it in a safe place. Forgetting it could lead to account loss or compromise. Stay
          safe!
        </div>
      </div>
    </div>
  </section>
</template>
