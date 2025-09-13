import { toRaw } from 'vue';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { getMetaMaskProvider } from '@/utils/providers';
import { SUPPORTED_NETWORKS } from '@/config/contracts';

export async function fetchExchangeRate({ getters, commit }) {
  try {
    const nativeCurrencySymbol = getters.nativeCurrency.symbol;
    const rsp = await getters.coinbaseAPIClient.getPrice(nativeCurrencySymbol);
    commit('setUSDExchangeRate', parseFloat(rsp.data.amount));
  } catch (e) {
    console.error(e);
  }
}

/**
 *
 * @param getters
 * @param {string} to
 * @param {BigNumber} amount
 * @returns {Promise<{success: boolean, hash: null}|{success: boolean, hash}>}
 */
export async function withdrawFunds({ getters }, { to, amount }) {
  if (getters.provider && getters.signer) {
    const provider = toRaw(getters.provider);
    const { signer } = getters;
    const txn = await signer.sendTransaction({
      to,
      value: amount,
    });
    const rsp = await provider.waitForTransaction(txn.hash, 1);
    if (rsp.status === 1) {
      return {
        success: true,
        hash: txn.hash,
      };
    }
    if (rsp.status === 0) {
      return {
        success: false,
        hash: txn.hash,
      };
    }
  }
  return {
    success: false,
    hash: null,
  };
}

export async function fetchBalance({ commit, getters }) {
  if (getters.provider) {
    try {
      const provider = toRaw(getters.provider);
      const balance = await provider.getBalance(getters.account);
      commit('setBalance', balance);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}

/**
 *
 * @param state
 * @param commit
 * @param getters
 * @param dispatch
 * @param {string} privateKey
 * @param {string} password
 * @returns {boolean}
 */
export function importWallet({ state, commit, getters, dispatch }, { privateKey, password }) {
  if (getters.provider && state.platform === 'telegram') {
    try {
      const provider = toRaw(getters.provider);
      const wallet = new ethers.Wallet(privateKey, provider);
      const encryptedPrivateKey = CryptoJS.AES.encrypt(wallet.privateKey, password);
      commit('setTelegramWallet', wallet);
      commit('setTelegramEncryptedKey', encryptedPrivateKey.toString());
      dispatch('fetchBalance');
      return true;
    } catch (e) {
      console.error(e);
    }
  }
  return false;
}

/**
 *
 * @param state
 * @param commit
 * @param getters
 * @param dispatch
 * @param {string} privateKey
 * @returns {boolean}
 */
export async function loadWallet({ state, commit, getters, dispatch }, { privateKey }) {
  if (getters.provider && state.platform === 'telegram') {
    try {
      const provider = toRaw(getters.provider);
      const wallet = new ethers.Wallet(privateKey, provider);
      commit('setTelegramWallet', wallet);
      dispatch('fetchBalance');
      return true;
    } catch (e) {
      console.error(e);
    }
  }
  return false;
}

/**
 *
 * @param state
 * @param commit
 * @param getters
 * @param dispatch
 * @param {string} password
 * @returns {boolean}
 */
export function createWallet({ state, commit, getters, dispatch }, { password }) {
  if (getters.provider && state.platform === 'telegram') {
    try {
      const provider = toRaw(getters.provider);
      const randomWallet = ethers.Wallet.createRandom();
      randomWallet.connect(provider);
      const encryptedPrivateKey = CryptoJS.AES.encrypt(randomWallet.privateKey, password);
      commit('setTelegramWallet', randomWallet);
      commit('setTelegramEncryptedKey', encryptedPrivateKey.toString());
      dispatch('fetchBalance');
    } catch (e) {
      console.error(e);
    }
  }
}

export async function metamaskConnect({ commit, dispatch }) {
  const metamaskProvider = getMetaMaskProvider();
  if (metamaskProvider) {
    try {
      const accounts = await metamaskProvider.request({
        method: 'eth_requestAccounts',
      });
      if (accounts) {
        await commit('setMetamaskConnected', true);
        await commit('setMetamaskAccount', accounts[0]);

        // Check chain
        const chainIdHex = await metamaskProvider.request({
          method: 'eth_chainId',
        });

        const validChainIds = SUPPORTED_NETWORKS.map((network) => network.chainId);
        if (validChainIds.indexOf(parseInt(chainIdHex, 16)) !== -1) {
          // Valid chain id
          // Set active chain id
          await commit('setActiveChainId', parseInt(chainIdHex, 16));
          // Set chain mismatch
          await commit('setMetamaskChainMismatch', false);
          await commit('setEthersBrowserProvider', metamaskProvider);
          // Fetch balance
          dispatch('fetchBalance');
        } else {
          // Set chain mismatch
          await commit('setMetamaskChainMismatch', true);
          await commit('setEthersJsonRpcProvider');
        }
      } else {
        // Change to json rpc provider
        await commit('setEthersJsonRpcProvider');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // Change to json rpc provider
      await commit('setEthersJsonRpcProvider');
    }
  } else {
    // Change to json rpc provider
    await commit('setEthersJsonRpcProvider');
  }
}

export async function checkMetamaskConnectionStatus() {
  const metamaskProvider = getMetaMaskProvider();
  if (metamaskProvider) {
    try {
      const accounts = await metamaskProvider.request({
        method: 'eth_accounts',
      });
      return accounts.length !== 0;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
  return false;
}

export async function startApp({ commit, state, dispatch }) {
  if (state.platform) {
    // eslint-disable-next-line default-case
    switch (state.platform) {
      case 'telegram':
        await commit('setEthersJsonRpcProvider');
        break;
      case 'web': {
        const metamaskProvider = getMetaMaskProvider();
        // Check if metamask extension is installed
        if (metamaskProvider) {
          // Check metamask connection status lock/unlock
          const isUnlocked = await checkMetamaskConnectionStatus();
          if (isUnlocked && state.metamaskWallet.isConnected) {
            // Trigger metamask connect
            await dispatch('metamaskConnect');
          } else {
            await commit('disconnectMetamaskWallet');
            // Change to json rpc provider
            await commit('setEthersJsonRpcProvider');
          }
        } else {
          // Change to json rpc provider
          await commit('setEthersJsonRpcProvider');
        }
        break;
      }
    }
  }
}
