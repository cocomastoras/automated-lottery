<script setup>
import { useStore } from 'vuex';
import useEmitter from '@/composables/useEmitter';
import { computed, ref } from 'vue';
import { getMetaMaskProvider } from '@/utils/providers';

const showModal = ref(false);
const store = useStore();
const emitter = useEmitter();
const isMetamaskInstalled = computed(() => {
  const metamaskProvider = getMetaMaskProvider();
  return !!metamaskProvider;
});

const connectMetamask = async () => {
  showModal.value = false;
  await store.dispatch('account/metamaskConnect');
};
emitter.on('show-connect-wallet-modal', () => {
  showModal.value = true;
});
</script>

<template>
  <transition name="modal">
    <div
      v-if="showModal"
      class="modal fade fixed top-0 left-0 w-full h-full outline-none overflow-x-hidden overflow-y-auto z-50 bg-backdrop"
      @click="showModal = false"
    >
      <div class="modal-dialog relative w-[280px] flex items-center min-h-full mx-auto">
        <div
          class="modal-content relative flex flex-col w-full bg-white bg-opacity-80 backdrop-blur-lg shadow rounded-2xl border border-lightgray"
          @click.stop=""
        >
          <div class="modal-body pt-[30px] px-[15px] pb-[15px] text-center">
            <h3 class="font-semibold text-sm text-dark pb-[30px]">Connect your wallet</h3>
            <ul class="space-y-2.5]">
              <li v-if="!isMetamaskInstalled">
                <img
                  src="@/assets/images/icon/wallet_metamask.svg"
                  class="mx-auto"
                  alt="Metamask wallet icon"
                />
                <p class="font-medium pt-2.5 pb-[30px] text-sm text-gray leading-[18px]">
                  Metamask extension is not found in you browser. Get it to start interacting with
                  Venue One.
                </p>
                <a
                  href="https://metamask.io/download/"
                  class="inline-flex items-center font-semibold text-xs text-white h-[30px] px-2.5 rounded-lg bg-dark"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Metamask
                </a>
              </li>
              <li v-else>
                <button
                  class="w-full flex items-center p-2.5 rounded-lg font-semibold text-dark text-sm hover:bg-initial"
                  @click="connectMetamask"
                  type="button"
                >
                  <img
                    src="@/assets/images/icon/wallet_metamask.svg"
                    class="mr-4"
                    alt="Metamask wallet icon"
                  />MetaMask
                </button>
                <p class="font-medium text-sm text-gray leading-[18px] pt-10">
                  More wallets coming soon
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
