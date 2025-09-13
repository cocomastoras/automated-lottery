import binanceIcon from '@/assets/images/icon/chain-bsc.svg';
import polygonIcon from '@/assets/images/icon/chain-polygon.svg';

export const SUPPORTED_NETWORKS = [
  {
    id: 'bnb-mainnet',
    label: 'Binance Smart Chain',
    // icon: binanceIcon,
    currency: {
      // native crypto currency
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
      icon: binanceIcon,
    },
    chainName: 'BNB Smart Chain',
    chainId: 56,
    blockExplorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    mainnet: true,
  },
  {
    id: 'bnb-testnet',
    label: 'BNB Smart Chain Testnet',
    // icon: binanceIcon,
    currency: {
      // native crypto currency
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
      icon: binanceIcon,
    },
    chainName: 'BNB Smart Chain - Testnet',
    chainId: 97,
    blockExplorerUrl: 'https://testnet.bscscan.com',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    mainnet: false,
  },
  {
    id: 'polygon-testnet',
    label: 'Polygon Mumbai',
    // icon: polygonIcon,
    currency: {
      // native crypto currency
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
      icon: polygonIcon,
    },
    chainName: 'Mumbai Testnet',
    chainId: 80001,
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://endpoints.omniatech.io/v1/matic/mumbai/public', // https://rpc-mumbai.maticvigil.com/
    mainnet: false,
  },
];
export const WIN_ADDRESS = import.meta.env.VITE_APP_WIN_ADDRESS;
export const PLATFORM_FEE_BPS = 1000; // 10% platform fees for completed rounds, no fees for cancelled
export const DEFAULT_ALL_HISTORY_BATCH_SIZE = 100; // TODO set it 500
export const DEFAULT_COMPLETED_HISTORY_BATCH_SIZE = 1500;
export const DEFAULT_CANCELLED_HISTORY_BATCH_SIZE = 100; // TODO set it 2000
export const DEFAULT_USER_HISTORY_BATCH_SIZE = 1500;
export const PASSWORD_MIN_LENGTH = 8; // minimum length of the password
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_']).{1,}$/; // minimum pattern requirements of the password
export const WIN_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vrfCoordinator',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'have',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'want',
        type: 'address',
      },
    ],
    name: 'OnlyCoordinatorCanFulfill',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'RoundId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'User',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'Amount',
        type: 'uint256',
      },
    ],
    name: 'ClaimedCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'Operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'Amount',
        type: 'uint256',
      },
    ],
    name: 'ClaimedFees',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'RoundId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'User',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'Amount',
        type: 'uint256',
      },
    ],
    name: 'ClaimedWinnings',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'RoundId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'User',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'Amount',
        type: 'uint256',
      },
    ],
    name: 'EnteredRound',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'RequestId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'RandomWords',
        type: 'uint256[]',
      },
    ],
    name: 'RequestFulfilled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'RequestId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'NumOfWords',
        type: 'uint256',
      },
    ],
    name: 'RequestSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'RoundId',
        type: 'uint256',
      },
    ],
    name: 'RoundCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'RoundId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'Winner',
        type: 'address',
      },
    ],
    name: 'RoundResolved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'RoundId',
        type: 'uint256',
      },
    ],
    name: 'RoundStarted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'admin',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxEntries_',
        type: 'uint256',
      },
    ],
    name: 'changeMaxEntries',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value_',
        type: 'uint256',
      },
    ],
    name: 'changeMinValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'checkData',
        type: 'bytes',
      },
    ],
    name: 'checkUpkeep',
    outputs: [
      {
        internalType: 'bool',
        name: 'upkeepNeeded',
        type: 'bool',
      },
      {
        internalType: 'bytes',
        name: 'performData',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'roundId_',
        type: 'uint256',
      },
    ],
    name: 'claimWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'enterRound',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fees',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'filterPendingWinningEntriesForUser',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'LotteryIds',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'Status',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'Winnings',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'freezeContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'roundId_',
        type: 'uint256',
      },
    ],
    name: 'getAmountsForParticipants',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'startIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'getCancelledHistoryWithPagination',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'RoundId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalTickets',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'Winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'Expiration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'WinnerBet',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'Cancelled',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalPlayers',
            type: 'uint256',
          },
        ],
        internalType: 'struct VOWin.RoundInfo[]',
        name: 'Round',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'startIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'getCompletedHistoryWithPagination',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'RoundId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalTickets',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'Winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'Expiration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'WinnerBet',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'Cancelled',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalPlayers',
            type: 'uint256',
          },
        ],
        internalType: 'struct VOWin.RoundInfo[]',
        name: 'Round',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'fromRoundId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'getHistoryWithPagination',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'RoundId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalTickets',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'Winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'Expiration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'WinnerBet',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'Cancelled',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalPlayers',
            type: 'uint256',
          },
        ],
        internalType: 'struct VOWin.RoundInfo[]',
        name: 'Round',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'roundId_',
        type: 'uint256',
      },
    ],
    name: 'getRoundAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRoundInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'roundId_',
        type: 'uint256',
      },
    ],
    name: 'getRoundParticipants',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'roundId_',
        type: 'uint256',
      },
    ],
    name: 'getRoundWinner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'roundId_',
        type: 'uint256',
      },
    ],
    name: 'getRoundWinnerInfo',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalRoundInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'getUsersLastRoundsEntered',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'RoundId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalTickets',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'UserTotalTickets',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'Winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'Expiration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'WinnerBet',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'Cancelled',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalPlayers',
            type: 'uint256',
          },
        ],
        internalType: 'struct VOWin.UserRoundInfo[]',
        name: 'CompletedRounds',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'RoundId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalTickets',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'UserTotalTickets',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'Winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'Expiration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'WinnerBet',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'Cancelled',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'TotalPlayers',
            type: 'uint256',
          },
        ],
        internalType: 'struct VOWin.UserRoundInfo[]',
        name: 'CancelledRounds',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_admin',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'minValue',
        type: 'uint256',
      },
    ],
    name: 'initialise',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxEntries',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minimumValue',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'performData',
        type: 'bytes',
      },
    ],
    name: 'performUpkeep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: 'randomWords',
        type: 'uint256[]',
      },
    ],
    name: 'rawFulfillRandomWords',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'roundIds',
        type: 'uint256[]',
      },
    ],
    name: 'redeemAllPendingWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'roundId_',
        type: 'uint256',
      },
    ],
    name: 'redeemCancelled',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'redeemed',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'requestIdToRequest',
    outputs: [
      {
        internalType: 'bool',
        name: 'exists',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'response',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'fulfilled',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'roundIdToRequestId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unfreezeContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'feeSink_',
        type: 'address',
      },
    ],
    name: 'updateFeeSink',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
