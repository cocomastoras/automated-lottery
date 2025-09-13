<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import useEmitter from '@/composables/useEmitter';
import { useScriptTag } from '@vueuse/core';
import { getMetaMaskProvider } from '@/utils/providers';
import { SUPPORTED_NETWORKS } from '@/config/contracts';

const store = useStore();
const emitter = useEmitter();
const metamaskProvider = getMetaMaskProvider();
const src = 'https://telegram.org/js/telegram-web-app.js';

const fetchCurrentRoundInfoDataHandle = ref(null);
const fetchCurrentRoundInfoData = async () => {
  await store.dispatch('lottery/getCurrentRoundInfo');
  fetchCurrentRoundInfoDataHandle.value = window.setTimeout(fetchCurrentRoundInfoData, 10000); // 10 seconds
};

emitter.on('fetch-current-round-data', () => {
  window.clearTimeout(fetchCurrentRoundInfoDataHandle.value);
  fetchCurrentRoundInfoData();
});

const handleAccountsChanged = () => {
  window.location.reload();
};

const handleChainChanged = async (chainIdHex) => {
  const validChainIds = SUPPORTED_NETWORKS.map((network) => network.chainId);
  if (validChainIds.indexOf(parseInt(chainIdHex, 16)) !== -1) {
    // Valid chain id
    // Set active chain id
    await store.commit('account/setActiveChainId', parseInt(chainIdHex, 16));
    // Set chain mismatch
    await store.commit('account/setMetamaskChainMismatch', false);
  }
  window.location.reload();
};

onMounted(async () => {
  const { load } = useScriptTag(src, () => {
    // script has loaded
    if (window.Telegram && window.Telegram.WebApp) {
      // A method that informs the Telegram app that the Mini App is ready to be displayed.
      window.Telegram.WebApp.ready();
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe || {};
      if (initDataUnsafe.user) {
        store.commit('account/setTelegramUserID', initDataUnsafe.user.id);
        store.commit('account/setPlatform', 'telegram');
      } else {
        store.commit('account/setPlatform', 'web');
      }
    }
  });
  await load();
  await store.dispatch('account/startApp');
  await fetchCurrentRoundInfoData();
  await store.dispatch('account/fetchExchangeRate');
  if (metamaskProvider) {
    metamaskProvider.on('accountsChanged', handleAccountsChanged);
    metamaskProvider.on('chainChanged', handleChainChanged);
  }
});

onUnmounted(() => {
  const tag = document.querySelector(`head script[src="${src}"`);
  if (tag) {
    tag.remove();
  }
  if (metamaskProvider) {
    metamaskProvider.removeListener('accountsChanged', handleAccountsChanged);
    metamaskProvider.removeListener('chainChanged', handleChainChanged);
  }
  window.clearTimeout(fetchCurrentRoundInfoDataHandle.value);
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <main class="mb-auto">
      <div class="container py-5">
        <router-view />
      </div>
    </main>
  </div>
</template>
