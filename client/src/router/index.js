import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Base',
      component: () => import('@/views/MainView.vue'),
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/views/RoundsHistoryView.vue'),
    },
    {
      path: '/wallet-management',
      name: 'WalletManagement',
      component: () => import('@/views/WalletManagementView.vue'),
    },
    {
      path: '/deposit-funds',
      name: 'DepositFunds',
      component: () => import('@/views/DepositFundsView.vue'),
    },
    {
      path: '/withdraw-funds',
      name: 'WithdrawFunds',
      component: () => import('@/views/WithdrawFundsView.vue'),
    },
    {
      path: '/history-user',
      name: 'HistoryUser',
      component: () => import('@/views/RoundsHistoryUserView.vue'),
    },
    {
      path: '/connect-wallet',
      name: 'ConnectWallet',
      component: () => import('@/views/TelegramViews/ConnectWalletView.vue'),
    },
    {
      path: '/create-wallet',
      name: 'CreateWallet',
      component: () => import('@/views/TelegramViews/CreateWalletView.vue'),
    },
    {
      path: '/unlock-wallet',
      name: 'LoadWallet',
      component: () => import('@/views/TelegramViews/LoadWalletView.vue'),
    },
    {
      path: '/import-wallet',
      name: 'ImportWallet',
      component: () => import('@/views/TelegramViews/ImportWalletView.vue'),
    },
    {
      path: '/private-key',
      name: 'PrivateKey',
      component: () => import('@/views/TelegramViews/ShowPrivateKeyView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/views/TelegramViews/ForgotPasswordView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const isConnected = !!store.getters['account/account'];
  const hasPK = !!store.getters['account/encryptedKey'];
  const { platform } = store.state.account;
  let continueToRoute = false;
  switch (to.name) {
    case 'ConnectWallet':
    case 'CreateWallet':
      // NOT connected and NOT private key - Telegram platform ONLY
      continueToRoute = !isConnected && !hasPK && platform === 'telegram';
      break;
    case 'LoadWallet':
    case 'ForgotPassword':
      // NOT connected and private key - Telegram platform ONLY
      continueToRoute = !isConnected && hasPK && platform === 'telegram';
      break;
    case 'ImportWallet':
      // NOT connected - Telegram platform ONLY
      continueToRoute = !isConnected && platform === 'telegram';
      break;
    case 'DepositFunds':
    case 'WithdrawFunds':
    case 'HistoryUser':
    case 'WalletManagement':
      // Connected - both platforms
      continueToRoute = isConnected && platform !== null;
      break;
    case 'PrivateKey':
      // Connected - Telegram platform ONLY
      continueToRoute = isConnected && platform === 'telegram';
      break;
    default:
      continueToRoute = true;
  }

  if (continueToRoute) {
    next();
  } else {
    next({ name: 'Base' });
  }
});

export default router;
