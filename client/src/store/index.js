import { createStore } from 'vuex';
import account from './modules/account';
import lottery from './modules/lottery';

export default createStore({
  modules: {
    account,
    lottery,
  },
});
