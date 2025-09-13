// MetaMask Provider
export const getMetaMaskProvider = () => {
  if (window.ethereum) {
    if (window.ethereum.providers) {
      return window.ethereum.providers.find((provider) => provider.isMetaMask);
    }
    if (window.ethereum.isMetaMask) {
      return window.ethereum;
    }
  }
  return null;
};
