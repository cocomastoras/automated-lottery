export default class CoinbaseAPI {
  constructor() {
    this.url = 'https://api.coinbase.com/v2/';
  }

  async fetch(path) {
    try {
      const response = await fetch(`${this.url}${path}`);
      return await response.json();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Could not fetch information from coinabse rest api');
      throw e;
    }
  }

  async getPrice(symbol) {
    const response = await this.fetch(`prices/${symbol}-USD/spot`);
    return response;
  }
}
