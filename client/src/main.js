import { createApp } from 'vue';
import mitt from 'mitt';
import './assets/css/style.css';
import { decimalDigits, formatNumberLocal } from '@/utils';
import App from './App.vue';
import router from './router';
import store from './store';

const emitter = mitt();
const app = createApp(App);
app.config.globalProperties.$filters = {
  ellipsis(str, start, end) {
    if (!str) return '';
    return `${str.substr(0, start)}...${str.substr(str.length - end)}`;
  },
  formatNumberLocal,
  formatPrecisionNumberLocal(strVal, decimals) {
    if (typeof strVal !== 'string') {
      return null;
    }
    const nf = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return nf.format(strVal);
  },
  formatPercent(val) {
    const nf = new Intl.NumberFormat('en-US', {
      style: 'percent',
    });
    return nf.format(val);
  },
  formatDateLocal(date) {
    const nf = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
    return nf.format(date);
  },
  formatUSD(val) {
    let dp = decimalDigits(val.toString());
    if (dp > 6) {
      dp = 6;
    }
    const nf = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    });
    return nf.format(val);
  },
};
app.config.globalProperties.emitter = emitter;
app.use(router);
app.use(store);
app.mount('#app');
