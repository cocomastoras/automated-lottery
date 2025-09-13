<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const clearWallet = () => {
  store.commit('account/clearTelegramWallet');
  router.push('/');
};
</script>

<template>
  <section class="w-full">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">Forgot your password?</div>
    </div>
    <router-link
      to="/import-wallet"
      class="flex items-center bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px] w-full font-semibold text-sm text-dark"
    >
      <img
        class="mr-[15px]"
        height="30"
        width="30"
        src="@/assets/images/icon/win-import.svg"
        alt="win import icon"
      />
      Import wallet
    </router-link>
    <div
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="flex items-start pb-[30px]">
        <img
          class="mt-2.5 mr-2.5"
          height="18"
          width="18"
          src="@/assets/images/icon/win-private-key.svg"
          alt="win private key icon"
        />
        <div>
          <div class="font-semibold text-dark text-base">Lost your private key?</div>
          <div class="font-medium text-gray text-xs">
            If you have forgotten both your password and your wallet’s private key, you can only
            reset your application. All your wallet’s assets wiil be lost.<br />You will be able to
            create a new wallet and play again.
          </div>
        </div>
      </div>
      <button
        class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-negative text-white rounded-lg hover:shadow"
        @click="clearWallet"
        type="button"
      >
        I have lost my private key
      </button>
    </div>
  </section>
</template>
