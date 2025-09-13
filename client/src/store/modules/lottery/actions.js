import { toRaw } from 'vue';
import { ethers } from 'ethers';
import {
  DEFAULT_USER_HISTORY_BATCH_SIZE,
  PLATFORM_FEE_BPS,
  WIN_ABI,
  WIN_ADDRESS,
} from '@/config/contracts';
import { normVal, formatNumberLocal } from '@/utils/';
import { orderBy } from 'lodash/collection';

export async function getCurrentRoundInfo({ commit, rootGetters }) {
  if (rootGetters['account/provider'] && rootGetters['account/nativeCurrency']) {
    try {
      const provider = toRaw(rootGetters['account/provider']);
      const nativeCurrency = toRaw(rootGetters['account/nativeCurrency']);
      const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, provider);
      let roundID;
      let poolPrize;
      let expiration;
      let minEnterAmount;
      let maxRoundParticipants;
      let participantsAddresses;
      let participantsAmounts;
      /* eslint-disable prefer-const */
      [
        roundID,
        poolPrize,
        expiration,
        minEnterAmount,
        maxRoundParticipants,
        participantsAddresses,
        participantsAmounts,
      ] = await contract.getRoundInfo();
      /* eslint-enable prefer-const */
      commit('setCurrentRound', {
        roundID,
        poolPrize,
        participants: participantsAddresses.map((address, index) => ({
          address,
          amount: participantsAmounts[index],
          percent:
            formatNumberLocal(normVal(participantsAmounts[index], nativeCurrency.decimals)) /
            formatNumberLocal(normVal(poolPrize, nativeCurrency.decimals)),
        })),
        minEnterAmount,
        maxRoundParticipants: maxRoundParticipants.toNumber(),
        expiration,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}

/**
 *
 * @param rootGetters
 * @param roundID
 * @returns {Promise<{canceled: boolean}|{canceled: boolean, winningAmount, multiplier: number, winnerAddress}|null>}
 */
export async function getRoundWinnerInfo({ rootGetters }, { roundID }) {
  if (rootGetters['account/provider'] && rootGetters['account/nativeCurrency']) {
    try {
      const provider = toRaw(rootGetters['account/provider']);
      const nativeCurrency = toRaw(rootGetters['account/nativeCurrency']);
      const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, provider);
      let winnerAddress;
      let poolPrize;
      let enteredAmount;
      // eslint-disable-next-line prefer-const
      [winnerAddress, poolPrize, enteredAmount] = await contract.getRoundWinnerInfo(roundID);
      const canceled = winnerAddress === ethers.constants.AddressZero;
      let winningAmount = poolPrize;
      let multiplier = 0;
      if (!canceled) {
        const platformFees = winningAmount.mul(PLATFORM_FEE_BPS).div(10000);
        winningAmount = winningAmount.sub(platformFees);
        multiplier =
          formatNumberLocal(normVal(winningAmount, nativeCurrency.decimals)) /
          formatNumberLocal(normVal(enteredAmount, nativeCurrency.decimals));
      }
      return canceled ? { canceled } : { canceled, winnerAddress, winningAmount, multiplier };
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}

export async function redeemAllPendingWinnings({ rootGetters }, { roundIDs }) {
  if (rootGetters['account/provider'] && rootGetters['account/signer']) {
    const provider = toRaw(rootGetters['account/provider']);
    const signer = rootGetters['account/signer'];
    const nonce = await signer.getTransactionCount();
    const feeData = await provider.getFeeData();
    const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, signer);
    const txn = await contract.redeemAllPendingWinnings(roundIDs, {
      nonce,
      gasPrice: feeData.gasPrice,
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

export async function filterPendingWinningEntriesForUser({ rootGetters }) {
  if (rootGetters['account/signer']) {
    try {
      const signer = rootGetters['account/signer'];
      const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, signer);
      let roundIDs;
      let statuses;
      let winningAmounts;
      // eslint-disable-next-line prefer-const
      [roundIDs, statuses, winningAmounts] = await contract.filterPendingWinningEntriesForUser();
      let sum = ethers.constants.Zero;
      for (let i = 0; i < winningAmounts.length; i += 1) {
        let platformFee = ethers.constants.Zero;
        if (statuses[i].isZero()) {
          platformFee = winningAmounts[i].mul(PLATFORM_FEE_BPS).div(10000);
        }
        sum = sum.add(winningAmounts[i]);
        sum = sum.sub(platformFee);
      }
      return {
        roundIDs,
        amount: sum,
      };
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}

export async function enterRound({ rootGetters }, { amount }) {
  if (rootGetters['account/provider'] && rootGetters['account/signer']) {
    const provider = toRaw(rootGetters['account/provider']);
    const signer = rootGetters['account/signer'];
    const nonce = await signer.getTransactionCount();
    const feeData = await provider.getFeeData();
    const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, signer);
    const txn = await contract.enterRound({
      value: amount,
      nonce,
      gasPrice: feeData.gasPrice,
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

export async function getTotalRoundInfo({ rootGetters }) {
  let totalItems = 0;
  let completedItems = 0;
  let cancelledItems = 0;
  if (rootGetters['account/provider']) {
    try {
      const provider = toRaw(rootGetters['account/provider']);
      const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, provider);
      [totalItems, completedItems, cancelledItems] = await contract.getTotalRoundInfo();
      return {
        totalItems: totalItems.toNumber(),
        completedItems: completedItems.toNumber(),
        cancelledItems: cancelledItems.toNumber(),
      };
    } catch (e) {
      console.error(e);
    }
  }
  return {
    totalItems,
    completedItems,
    cancelledItems,
  };
}

export async function getPastRounds({ rootGetters }, { startRoundID, roundsToBring }) {
  if (rootGetters['account/provider'] && rootGetters['account/nativeCurrency']) {
    try {
      const provider = toRaw(rootGetters['account/provider']);
      const nativeCurrency = toRaw(rootGetters['account/nativeCurrency']);
      const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, provider);
      const rsp = await contract.getHistoryWithPagination(startRoundID, roundsToBring);
      return rsp.map((round) => {
        const isCanceled = !round.Cancelled.isZero();
        let multiplier = 0;
        let poolPrize = round.TotalTickets;
        if (!isCanceled) {
          const platformFees = poolPrize.mul(PLATFORM_FEE_BPS).div(10000);
          poolPrize = poolPrize.sub(platformFees);
          multiplier =
            formatNumberLocal(normVal(poolPrize, nativeCurrency.decimals)) /
            formatNumberLocal(normVal(round.WinnerBet, nativeCurrency.decimals));
        }
        return {
          roundID: round.RoundId,
          winner: round.Winner,
          winnerEnterAmount: round.WinnerBet,
          poolPrize,
          participants: round.TotalPlayers,
          expiredAt: round.Expiration.mul(1000),
          multiplier,
          isCanceled,
        };
      });
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export async function getPastRoundsCompleted({ rootGetters }, { startIndex, roundsToBring }) {
  if (rootGetters['account/provider'] && rootGetters['account/nativeCurrency']) {
    try {
      const provider = toRaw(rootGetters['account/provider']);
      const nativeCurrency = toRaw(rootGetters['account/nativeCurrency']);
      const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, provider);
      const rsp = await contract.getCompletedHistoryWithPagination(startIndex, roundsToBring);
      return rsp
        .map((round) => {
          const platformFees = round.TotalTickets.mul(PLATFORM_FEE_BPS).div(10000);
          const poolPrize = round.TotalTickets.sub(platformFees);
          const multiplier =
            formatNumberLocal(normVal(poolPrize, nativeCurrency.decimals)) /
            formatNumberLocal(normVal(round.WinnerBet, nativeCurrency.decimals));
          return {
            roundID: round.RoundId,
            winner: round.Winner,
            winnerEnterAmount: round.WinnerBet,
            poolPrize,
            participants: round.TotalPlayers,
            expiredAt: round.Expiration.mul(1000),
            multiplier,
            isCanceled: false,
          };
        })
        .reverse();
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export async function getPastRoundsCancelled({ rootGetters }, { startIndex, roundsToBring }) {
  if (rootGetters['account/provider']) {
    try {
      const provider = toRaw(rootGetters['account/provider']);
      const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, provider);
      const rsp = await contract.getCancelledHistoryWithPagination(startIndex, roundsToBring);
      return rsp
        .map((round) => {
          return {
            roundID: round.RoundId,
            winner: round.Winner,
            winnerEnterAmount: round.WinnerBet,
            poolPrize: round.TotalTickets,
            participants: round.TotalPlayers,
            expiredAt: round.Expiration.mul(1000),
            multiplier: 0,
            isCanceled: true,
          };
        })
        .reverse();
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export async function getUsersLatestPastRoundsEntered({ rootGetters }) {
  let allRounds = [];
  let completedRounds = [];
  let canceledRounds = [];
  if (
    rootGetters['account/provider'] &&
    rootGetters['account/account'] &&
    rootGetters['account/nativeCurrency']
  ) {
    try {
      const provider = toRaw(rootGetters['account/provider']);
      const account = toRaw(rootGetters['account/account']);
      const nativeCurrency = toRaw(rootGetters['account/nativeCurrency']);
      const contract = new ethers.Contract(WIN_ADDRESS, WIN_ABI, provider);
      [completedRounds, canceledRounds] = await contract.getUsersLastRoundsEntered(
        account,
        DEFAULT_USER_HISTORY_BATCH_SIZE
      );
      completedRounds = completedRounds
        .map((round) => {
          const platformFees = round.TotalTickets.mul(PLATFORM_FEE_BPS).div(10000);
          const poolPrize = round.TotalTickets.sub(platformFees);
          const multiplier =
            formatNumberLocal(normVal(poolPrize, nativeCurrency.decimals)) /
            formatNumberLocal(normVal(round.WinnerBet, nativeCurrency.decimals));
          return {
            roundID: round.RoundId,
            winner: round.Winner,
            winnerEnterAmount: round.WinnerBet,
            poolPrize,
            participants: round.TotalPlayers,
            expiredAt: round.Expiration.mul(1000),
            multiplier,
            isCanceled: false,
          };
        })
        .reverse();
      canceledRounds = canceledRounds
        .map((round) => {
          return {
            roundID: round.RoundId,
            winner: round.Winner,
            winnerEnterAmount: round.WinnerBet,
            poolPrize: round.TotalTickets,
            participants: round.TotalPlayers,
            expiredAt: round.Expiration.mul(1000),
            multiplier: 0,
            isCanceled: true,
          };
        })
        .reverse();
      allRounds = orderBy(
        [...completedRounds, ...canceledRounds],
        [(round) => round.roundID.toNumber()],
        ['desc']
      );
    } catch (e) {
      console.error(e);
    }
  }
  return {
    allRounds,
    completedRounds,
    canceledRounds,
  };
}
