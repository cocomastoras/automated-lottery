import { SUPPORTED_NETWORKS } from '@/config/contracts';
import CoinbaseAPI from '@/services/CoinbaseAPI';

export const state = () => ({
  activeChainId: localStorage.getItem('activeChainId')
    ? JSON.parse(localStorage.getItem('activeChainId'))
    : SUPPORTED_NETWORKS[2].chainId, // Set default network
  balance: null,
  provider: null, // this is "provider" for Ethers.js
  prevRoundWinnerIndicator: false,
  coinbaseAPIClient: new CoinbaseAPI(),
  usdExchangeRate: 0,
  telegram: {
    userID: null,
    wallet: null,
    encryptedKeys: localStorage.getItem('encKeys')
      ? JSON.parse(localStorage.getItem('encKeys'))
      : {},
  },
  metamaskWallet: {
    account: null,
    isConnected: localStorage.getItem('isConnected')
      ? JSON.parse(localStorage.getItem('isConnected'))
      : false,
    chainMismatch: null,
  },
  platform: null, // Valid values 'telegram' and 'web'
});
