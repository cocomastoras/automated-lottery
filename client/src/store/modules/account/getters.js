import { find } from 'lodash/collection';
import { SUPPORTED_NETWORKS } from '@/config/contracts';
import { toRaw } from 'vue';

/**
 *
 * @param state
 * @returns {null|string}
 */
export function account(state) {
  if (state.platform === 'telegram') {
    return state.telegram.wallet ? state.telegram.wallet.address : state.telegram.wallet;
  }
  if (state.platform === 'web') {
    return state.metamaskWallet.account;
  }
  return null;
}

/**
 *
 * @param state
 * @returns {null|Web3Provider|JsonRpcProvider}
 */
export function provider(state) {
  return state.provider;
}

/**
 *
 * @param state
 * @returns {null|Wallet}
 */
export function wallet(state) {
  if (state.platform === 'telegram') {
    return state.telegram.wallet;
  }
  return null;
}

export function signer(state, getters) {
  if (state.platform === 'telegram') {
    return toRaw(getters.wallet);
  }
  if (state.platform === 'web' && getters.provider) {
    return toRaw(getters.provider).getSigner();
  }
  return null;
}

/**
 *
 * @param state
 * @returns {string|null}
 */
export function encryptedKey(state) {
  if (state.platform === 'telegram') {
    const { userID, encryptedKeys } = state.telegram;
    if (userID) {
      if (Object.hasOwn(encryptedKeys, userID)) {
        return encryptedKeys[userID];
      }
    }
  }
  return null;
}

/**
 *
 * @param state
 * @returns {*}
 */
export function activeNetwork(state) {
  return find(SUPPORTED_NETWORKS, { chainId: state.activeChainId });
}

export function nativeCurrency(state, getters) {
  if (getters.activeNetwork) {
    return getters.activeNetwork.currency;
  }
  return {};
}

export function coinbaseAPIClient(state) {
  return state.coinbaseAPIClient;
}
