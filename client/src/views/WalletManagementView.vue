<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const store = useStore();
const router = useRouter();
const platform = computed(() => store.state.account.platform);

const disconnectWallet = () => {
  // eslint-disable-next-line default-case
  switch (platform.value) {
    case 'telegram':
      store.commit('account/clearTelegramWallet');
      break;
    case 'web':
      store.commit('account/disconnectMetamaskWallet');
      break;
  }
  router.push('/');
};
</script>

<template>
  <section class="w-full md:w-2/3 lg:w-1/2 mx-auto">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">Wallet management</div>
    </div>
    <ul class="space-y-[15px]">
      <li>
        <router-link
          to="/deposit-funds"
          class="flex items-center bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] w-full font-semibold text-sm text-dark"
        >
          <img
            class="mr-[15px]"
            height="30"
            width="30"
            src="@/assets/images/icon/win-deposit.svg"
            alt="win deposit icon"
          />
          Deposit funds
        </router-link>
      </li>
      <li>
        <router-link
          to="/withdraw-funds"
          class="flex items-center bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] w-full font-semibold text-sm text-dark"
        >
          <img
            class="mr-[15px]"
            height="30"
            width="30"
            src="@/assets/images/icon/win-withdraw.svg"
            alt="win withdraw icon"
          />
          Withdraw funds
        </router-link>
      </li>
      <li>
        <router-link
          to="/history-user"
          class="flex items-center bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] w-full font-semibold text-sm text-dark"
        >
          <img
            class="mr-[15px]"
            height="30"
            width="30"
            src="@/assets/images/icon/win-winnings.svg"
            alt="win winnings icon"
          />
          Rounds I've played
        </router-link>
      </li>
      <li v-if="platform === 'telegram'">
        <router-link
          to="/private-key"
          class="flex items-center bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] w-full font-semibold text-sm text-dark"
        >
          <img
            class="mr-[15px]"
            height="30"
            width="30"
            src="@/assets/images/icon/win-key.svg"
            alt="win key icon"
          />
          Show private key
        </router-link>
      </li>
      <li>
        <button
          class="flex items-center bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] w-full font-semibold text-sm text-dark"
          @click="disconnectWallet"
          type="button"
        >
          <img
            class="mr-[15px]"
            height="30"
            width="30"
            src="@/assets/images/icon/logout.svg"
            alt="logout icon"
          />
          Disconnect
        </button>
      </li>
    </ul>
  </section>
</template>
