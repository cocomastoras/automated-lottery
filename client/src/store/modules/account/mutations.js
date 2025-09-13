import { ethers } from 'ethers';
import { find } from 'lodash/collection';
import { SUPPORTED_NETWORKS } from '@/config/contracts';

export function setTelegramWallet(state, wallet) {
  state.telegram.wallet = wallet;
}

export function setTelegramUserID(state, userID) {
  state.telegram.userID = userID;
}

/**
 *
 * @param state
 * @param {BigNumber} balance
 */
export function setBalance(state, balance) {
  state.balance = balance;
}

export function setActiveChainId(state, chainId) {
  state.activeChainId = chainId;
  // add to persistent storage, in order to remember user's latest choice
  localStorage.setItem('activeChainId', JSON.stringify(chainId));
}

export async function setEthersBrowserProvider(state, provider) {
  state.provider = new ethers.providers.Web3Provider(provider);
}

export async function setEthersJsonRpcProvider(state) {
  const activeNetwork = find(SUPPORTED_NETWORKS, { chainId: state.activeChainId });
  if (activeNetwork) {
    state.provider = new ethers.providers.JsonRpcProvider(activeNetwork.rpcUrl);
  }
}

export function setTelegramEncryptedKey(state, key) {
  const { userID, encryptedKeys } = state.telegram;
  if (userID) {
    encryptedKeys[userID] = key;
    // add to persistent storage
    localStorage.setItem('encKeys', JSON.stringify(encryptedKeys));
  }
}

export function clearTelegramWallet(state) {
  state.balance = null;
  state.telegram.wallet = null;
  const { userID, encryptedKeys } = state.telegram;
  if (userID) {
    if (Object.hasOwn(encryptedKeys, userID)) {
      delete encryptedKeys[userID];
      localStorage.setItem('encKeys', JSON.stringify(encryptedKeys));
    }
  }
  const activeNetwork = find(SUPPORTED_NETWORKS, { chainId: state.activeChainId });
  if (activeNetwork) {
    state.provider = new ethers.providers.JsonRpcProvider(activeNetwork.rpcUrl);
  }
}

export function setUSDExchangeRate(state, exchangeRate) {
  state.usdExchangeRate = exchangeRate;
}

export function setPreviousRoundWinnerIndicator(state, isWinner) {
  state.prevRoundWinnerIndicator = isWinner;
}

export function setPlatform(state, platform) {
  state.platform = platform;
}

export function setMetamaskAccount(state, selectedAddress) {
  state.metamaskWallet.account = selectedAddress;
}

export function setMetamaskConnected(state, isConnected) {
  state.metamaskWallet.isConnected = isConnected;
  // add to persistent storage so that the user can be logged back in when revisiting website
  localStorage.setItem('isConnected', JSON.stringify(isConnected));
}

export function setMetamaskChainMismatch(state, chainMismatch) {
  state.metamaskWallet.chainMismatch = chainMismatch;
}

export function disconnectMetamaskWallet(state) {
  state.balance = null;
  state.metamaskWallet.account = null;
  state.metamaskWallet.isConnected = false;
  state.metamaskWallet.chainMismatch = null;
  localStorage.setItem('isConnected', JSON.stringify(false));
}
