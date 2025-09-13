<script setup>
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import PaginationListItem from '@/components/PaginationListItem.vue';
import { useStore } from 'vuex';
import { ethers } from 'ethers';
import LoadingBlock from '@/components/LoadingBlock.vue';
import {
  DEFAULT_ALL_HISTORY_BATCH_SIZE,
  DEFAULT_CANCELLED_HISTORY_BATCH_SIZE,
  DEFAULT_COMPLETED_HISTORY_BATCH_SIZE,
} from '@/config/contracts';

const store = useStore();
const startedRoundID = ref(null);
const currentRoundID = computed(() => store.state.lottery.currentRound.roundID);
const itemsPerPage = ref(50);
const activeStatus = ref('all');

const startRoundIDAll = ref(null);
const currentPageAll = ref(1);
const totalItemsAll = ref(null);
const slotIndexAll = ref(null);
const slotsAll = ref([]);
const slotParamsAll = ref([]);

const currentPageCompleted = ref(1);
const totalCompletedItems = ref(null);
const slotIndexCompleted = ref(null);
const slotsCompleted = ref([]);
const slotParamsCompleted = ref([]);

const currentPageCancelled = ref(1);
const totalCancelledItems = ref(null);
const slotIndexCancelled = ref(null);
const slotsCancelled = ref([]);
const slotParamsCancelled = ref([]);

const loading = ref(true);

const fetchPastRounds = async () => {
  try {
    loading.value = true;
    // eslint-disable-next-line default-case
    switch (activeStatus.value) {
      case 'all':
        if (slotIndexAll.value !== null) {
          if (toRaw(slotsAll.value)[slotIndexAll.value].length === 0) {
            slotsAll.value[slotIndexAll.value] = await store.dispatch('lottery/getPastRounds', {
              startRoundID: slotParamsAll.value[slotIndexAll.value].startRoundID,
              roundsToBring: slotParamsAll.value[slotIndexAll.value].size,
            });
            loading.value = false;
          }
        }
        break;
      case 'completed':
        if (slotIndexCompleted.value !== null) {
          if (toRaw(slotsCompleted.value)[slotIndexCompleted.value].length === 0) {
            slotsCompleted.value[slotIndexCompleted.value] = await store.dispatch(
              'lottery/getPastRoundsCompleted',
              {
                startIndex: slotParamsCompleted.value[slotIndexCompleted.value].startIndex,
                roundsToBring: slotParamsCompleted.value[slotIndexCompleted.value].size,
              }
            );
            loading.value = false;
          }
        }
        break;
      case 'canceled':
        if (slotIndexCancelled.value !== null) {
          if (toRaw(slotsCancelled.value)[slotIndexCancelled.value].length === 0) {
            slotsCancelled.value[slotIndexCancelled.value] = await store.dispatch(
              'lottery/getPastRoundsCancelled',
              {
                startIndex: slotParamsCancelled.value[slotIndexCancelled.value].startIndex,
                roundsToBring: slotParamsCancelled.value[slotIndexCancelled.value].size,
              }
            );
            loading.value = false;
          }
        }
        break;
    }
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const activeStatusCurrentPage = computed(() => {
  let currentPage = null;
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      currentPage = currentPageAll.value;
      break;
    case 'completed':
      currentPage = currentPageCompleted.value;
      break;
    case 'canceled':
      currentPage = currentPageCancelled.value;
      break;
  }
  return currentPage;
});

const activeStatusTotalPages = computed(() => {
  let totalPages = null;
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      totalPages = totalItemsAll.value ? Math.ceil(totalItemsAll.value / itemsPerPage.value) : null;
      break;
    case 'completed':
      totalPages = totalCompletedItems.value
        ? Math.ceil(totalCompletedItems.value / itemsPerPage.value)
        : null;
      break;
    case 'canceled':
      totalPages = totalCancelledItems.value
        ? Math.ceil(totalCancelledItems.value / itemsPerPage.value)
        : null;
      break;
  }
  return totalPages;
});

const activeStatusTotalItems = computed(() => {
  let totalItems = null;
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      totalItems = totalItemsAll.value;
      break;
    case 'completed':
      totalItems = totalCompletedItems.value;
      break;
    case 'canceled':
      totalItems = totalCancelledItems.value;
      break;
  }
  return totalItems;
});

const activeStatusPaginatedData = computed(() => {
  let paginatedData = [];
  const firstOfPage = (activeStatusCurrentPage.value - 1) * itemsPerPage.value; // zero index
  const lastOfPage = Math.min(
    activeStatusCurrentPage.value * itemsPerPage.value - 1,
    activeStatusTotalItems.value - 1
  ); // zero index
  if (activeStatusCurrentPage.value) {
    // eslint-disable-next-line default-case
    switch (activeStatus.value) {
      case 'all': {
        const startRoundID =
          totalItemsAll.value - (activeStatusCurrentPage.value - 1) * itemsPerPage.value;
        const endRoundID =
          totalItemsAll.value -
          Math.min(activeStatusCurrentPage.value * itemsPerPage.value, totalItemsAll.value) +
          1;
        paginatedData = slotsAll.value.flat().filter((roundData) => {
          return (
            roundData.roundID.lte(ethers.BigNumber.from(startRoundID.toString())) &&
            roundData.roundID.gte(ethers.BigNumber.from(endRoundID.toString()))
          );
        });
        break;
      }
      case 'completed': {
        const checkSlotsIndices = slotParamsCompleted.value.map((obj, index) => {
          return (firstOfPage <= obj.endIndex0 && firstOfPage >= obj.startIndex0) ||
            (lastOfPage <= obj.endIndex0 && lastOfPage >= obj.startIndex0)
            ? index
            : -1;
        });
        const validSlotsIndices = checkSlotsIndices.filter((index) => index !== -1);
        const dataItems = validSlotsIndices
          .map((slotIndex) => slotsCompleted.value[slotIndex])
          .flat();
        if (dataItems.length !== 0) {
          const indexCorrection = validSlotsIndices[0] * DEFAULT_COMPLETED_HISTORY_BATCH_SIZE;
          const start = firstOfPage - indexCorrection;
          const end = lastOfPage - indexCorrection;
          paginatedData = dataItems.slice(start, end + 1);
        }
        break;
      }
      case 'canceled': {
        const checkSlotsIndices = slotParamsCancelled.value.map((obj, index) => {
          return (firstOfPage <= obj.endIndex0 && firstOfPage >= obj.startIndex0) ||
            (lastOfPage <= obj.endIndex0 && lastOfPage >= obj.startIndex0)
            ? index
            : -1;
        });
        const validSlotsIndices = checkSlotsIndices.filter((index) => index !== -1);
        const dataItems = validSlotsIndices
          .map((slotIndex) => slotsCancelled.value[slotIndex])
          .flat();
        if (dataItems.length !== 0) {
          const indexCorrection = validSlotsIndices[0] * DEFAULT_CANCELLED_HISTORY_BATCH_SIZE;
          const start = firstOfPage - indexCorrection;
          const end = lastOfPage - indexCorrection;
          paginatedData = dataItems.slice(start, end + 1);
        }
        break;
      }
    }
  }
  return paginatedData;
});

const increaseActiveStatusCurrentPage = () => {
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      currentPageAll.value += 1;
      break;
    case 'completed':
      currentPageCompleted.value += 1;
      break;
    case 'canceled':
      currentPageCancelled.value += 1;
      break;
  }
};

const decreaseActiveStatusCurrentPage = () => {
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      currentPageAll.value -= 1;
      break;
    case 'completed':
      currentPageCompleted.value -= 1;
      break;
    case 'canceled':
      currentPageCancelled.value -= 1;
      break;
  }
};

const nextPage = async () => {
  const nextPageLastItem = Math.min(
    (activeStatusCurrentPage.value + 1) * itemsPerPage.value,
    activeStatusTotalItems.value
  );
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all': {
      slotIndexAll.value = Math.ceil(nextPageLastItem / DEFAULT_ALL_HISTORY_BATCH_SIZE) - 1;
      break;
    }
    case 'completed': {
      slotIndexCompleted.value =
        Math.ceil(nextPageLastItem / DEFAULT_COMPLETED_HISTORY_BATCH_SIZE) - 1;
      break;
    }
    case 'canceled': {
      slotIndexCancelled.value =
        Math.ceil(nextPageLastItem / DEFAULT_CANCELLED_HISTORY_BATCH_SIZE) - 1;
      break;
    }
  }
  await fetchPastRounds();
  increaseActiveStatusCurrentPage();
};

const firstPage = async () => {
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      slotIndexAll.value = 0;
      await fetchPastRounds();
      currentPageAll.value = 1;
      break;
    case 'completed':
      slotIndexCompleted.value = 0;
      await fetchPastRounds();
      currentPageCompleted.value = 1;
      break;
    case 'canceled':
      slotIndexCancelled.value = 0;
      await fetchPastRounds();
      currentPageCancelled.value = 1;
      break;
  }
};

const prevPage = async () => {
  const prevPageFirstItem = (activeStatusCurrentPage.value - 2) * itemsPerPage.value + 1;
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all': {
      slotIndexAll.value = Math.ceil(prevPageFirstItem / DEFAULT_ALL_HISTORY_BATCH_SIZE) - 1;
      break;
    }
    case 'completed': {
      slotIndexCompleted.value =
        Math.ceil(prevPageFirstItem / DEFAULT_COMPLETED_HISTORY_BATCH_SIZE) - 1;
      break;
    }
    case 'canceled': {
      slotIndexCancelled.value =
        Math.ceil(prevPageFirstItem / DEFAULT_CANCELLED_HISTORY_BATCH_SIZE) - 1;
      break;
    }
  }
  await fetchPastRounds();
  decreaseActiveStatusCurrentPage();
};

const lastPage = async () => {
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all': {
      slotIndexAll.value = toRaw(slotsAll.value).length - 1;
      await fetchPastRounds();
      currentPageAll.value = activeStatusTotalPages.value;
      break;
    }
    case 'completed': {
      slotIndexCompleted.value = toRaw(slotsCompleted.value).length - 1;
      await fetchPastRounds();
      currentPageCompleted.value = activeStatusTotalPages.value;
      break;
    }
    case 'canceled': {
      slotIndexCancelled.value = toRaw(slotsCancelled.value).length - 1;
      await fetchPastRounds();
      currentPageCancelled.value = activeStatusTotalPages.value;
      break;
    }
  }
};

watch(activeStatus, () => {
  if (startedRoundID.value.gt(ethers.constants.One)) {
    // Start fetch
    fetchPastRounds();
  }
});

const initializeSlots = async () => {
  if (!startedRoundID.value.isZero()) {
    // Slots for all
    startRoundIDAll.value = startedRoundID.value;
    totalItemsAll.value = startedRoundID.value.toNumber();

    const paginationSlotsAll = Math.ceil(totalItemsAll.value / DEFAULT_ALL_HISTORY_BATCH_SIZE);
    slotsAll.value = Array(paginationSlotsAll).fill([]);
    const initRoundID = startedRoundID.value;
    for (let i = 0; i < paginationSlotsAll; i += 1) {
      let startRoundID = ethers.constants.Zero;
      let endRoundID = ethers.constants.Zero;
      let size = 0;
      if (i === 0) {
        startRoundID = initRoundID;
      } else {
        startRoundID = slotParamsAll.value[i - 1].endRoundID.sub(1).gt(ethers.constants.Zero)
          ? slotParamsAll.value[i - 1].endRoundID.sub(1)
          : ethers.constants.One;
      }
      endRoundID = startRoundID.sub(DEFAULT_ALL_HISTORY_BATCH_SIZE - 1).gt(ethers.constants.Zero)
        ? startRoundID.sub(DEFAULT_ALL_HISTORY_BATCH_SIZE - 1)
        : ethers.constants.One;

      size = startRoundID.sub(endRoundID).toNumber() + 1;
      slotParamsAll.value.push({
        startRoundID,
        endRoundID,
        size,
      });
    }
    slotIndexAll.value = 0;

    const { completedItems, cancelledItems } = await store.dispatch('lottery/getTotalRoundInfo');
    if (completedItems > 0) {
      // Slots for completed
      totalCompletedItems.value = completedItems;
      const paginationSlotsCompleted = Math.ceil(
        completedItems / DEFAULT_COMPLETED_HISTORY_BATCH_SIZE
      );
      slotsCompleted.value = Array(paginationSlotsCompleted).fill([]);
      for (let ii = 0; ii < paginationSlotsCompleted; ii += 1) {
        let startIndex;
        let endIndex;
        let size = 0;
        let startIndex0;
        let endIndex0;
        if (ii === 0) {
          startIndex = Math.max(0, completedItems - DEFAULT_COMPLETED_HISTORY_BATCH_SIZE);
          endIndex = completedItems - 1;
          startIndex0 = 0;
          endIndex0 = endIndex - startIndex;
        } else {
          startIndex = Math.max(
            0,
            slotParamsCompleted.value[ii - 1].startIndex - DEFAULT_COMPLETED_HISTORY_BATCH_SIZE
          );
          endIndex = slotParamsCompleted.value[ii - 1].startIndex - 1;
          startIndex0 = slotParamsCompleted.value[ii - 1].endIndex0 + 1;
          endIndex0 = startIndex0 + endIndex - startIndex;
        }
        size = endIndex - startIndex + 1;
        slotParamsCompleted.value.push({
          startIndex,
          endIndex,
          size,
          startIndex0,
          endIndex0,
        });
      }
      slotIndexCompleted.value = 0;
    }
    if (cancelledItems > 0) {
      // Slots for cancelled
      totalCancelledItems.value = cancelledItems;
      const paginationSlotsCancelled = Math.ceil(
        cancelledItems / DEFAULT_CANCELLED_HISTORY_BATCH_SIZE
      );
      slotsCancelled.value = Array(paginationSlotsCancelled).fill([]);
      for (let j = 0; j < paginationSlotsCancelled; j += 1) {
        let startIndex;
        let endIndex;
        let size = 0;
        let startIndex0;
        let endIndex0;
        if (j === 0) {
          startIndex = Math.max(0, cancelledItems - DEFAULT_CANCELLED_HISTORY_BATCH_SIZE);
          endIndex = cancelledItems - 1;
          startIndex0 = 0;
          endIndex0 = endIndex - startIndex;
        } else {
          startIndex = Math.max(
            0,
            slotParamsCancelled.value[j - 1].startIndex - DEFAULT_CANCELLED_HISTORY_BATCH_SIZE
          );
          endIndex = slotParamsCancelled.value[j - 1].startIndex - 1;
          startIndex0 = slotParamsCancelled.value[j - 1].endIndex0 + 1;
          endIndex0 = startIndex0 + endIndex - startIndex;
        }
        size = endIndex - startIndex + 1;
        slotParamsCancelled.value.push({
          startIndex,
          endIndex,
          size,
          startIndex0,
          endIndex0,
        });
      }
      slotIndexCancelled.value = 0;
    }

    // Start fetch
    await fetchPastRounds();
  }
};

watch(currentRoundID, (newRoundID) => {
  if (
    !ethers.BigNumber.isBigNumber(startedRoundID.value) &&
    ethers.BigNumber.isBigNumber(newRoundID)
  ) {
    startedRoundID.value = newRoundID.sub(1);
    initializeSlots();
  }
});

onMounted(() => {
  if (currentRoundID.value) {
    startedRoundID.value = currentRoundID.value.sub(1);
    initializeSlots();
  }
});
</script>

<template>
  <ul class="inline-flex items-center space-x-0.5 mb-[15px]">
    <li>
      <input
        id="status-0"
        type="radio"
        name="status"
        class="hidden peer"
        value="all"
        v-model="activeStatus"
        :disabled="loading"
      />
      <label
        class="block font-semibold p-2.5 text-sm text-center text-dark rounded-lg cursor-pointer peer-checked:bg-dark peer-checked:text-white ease-in-out duration-200"
        for="status-0"
      >
        All
      </label>
    </li>
    <li>
      <input
        id="status-1"
        type="radio"
        name="status"
        class="hidden peer"
        value="completed"
        v-model="activeStatus"
        :disabled="loading"
      />
      <label
        class="block font-semibold p-2.5 text-sm text-center text-dark rounded-lg cursor-pointer peer-checked:bg-dark peer-checked:text-white ease-in-out duration-200"
        for="status-1"
      >
        Completed
      </label>
    </li>
    <li>
      <input
        id="status-2"
        type="radio"
        name="status"
        class="hidden peer"
        value="canceled"
        v-model="activeStatus"
        :disabled="loading"
      />
      <label
        class="block font-semibold p-2.5 text-sm text-center text-dark rounded-lg cursor-pointer peer-checked:bg-dark peer-checked:text-white ease-in-out duration-200"
        for="status-2"
      >
        Canceled
      </label>
    </li>
  </ul>
  <div class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]">
    <div class="flex items-start">
      <img
        class="mt-2.5 mr-2.5"
        height="18"
        width="18"
        src="@/assets/images/icon/win-past-rounds.svg"
        alt="win past rounds icon"
      />
      <div>
        <div class="font-semibold text-dark text-base">History</div>
        <div class="font-medium text-gray text-xs">
          View details of past rounds, including prize pools, winners, and more.
        </div>
      </div>
    </div>
    <ul v-if="activeStatusTotalPages && !loading" class="pt-[30px] space-y-2.5">
      <PaginationListItem
        v-for="(item, index) in activeStatusPaginatedData"
        :key="index"
        :data-obj="item"
        :class="{
          'h-[63px] border-b border-lightgray pb-2.5':
            index !== activeStatusPaginatedData.length - 1,
          'h-[52px]': index === activeStatusPaginatedData.length - 1,
        }"
      />
    </ul>
    <div
      v-else-if="!activeStatusTotalPages && !loading"
      class="flex items-center justify-center font-medium text-xs text-gray leading-[18px] py-20"
    >
      No past rounds found
    </div>
    <LoadingBlock v-else />
  </div>
  <ul v-if="activeStatusTotalPages" class="flex items-center justify-center">
    <li class="inline-flex">
      <button
        class="text-dark disabled:text-gray"
        @click="firstPage"
        :disabled="activeStatusCurrentPage === 1 || loading"
        type="button"
      >
        <svg
          width="30px"
          height="30px"
          style="transform: rotate(180deg)"
          viewBox="0 0 30 30"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <title>Icon/table-arrow-last</title>
          <g
            id="Icon/table-arrow-last"
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd"
          >
            <rect
              id="Line"
              fill="currentColor"
              x="19"
              y="9.5"
              width="1.6"
              height="12"
              rx="0.8"
            ></rect>
            <path
              d="M7.04776368,13.2297532 L12.3337274,18.6401357 C12.3337274,18.6401357 13.0005125,19.506055 13.8150976,18.5514561 L18.7246574,13.4488839 C18.9319123,13.233272 19.0414804,12.9281215 18.9854221,12.6307719 C18.948047,12.431679 18.8393225,12.2325772 18.5777055,12.1221617 C17.9245109,11.8474249 17.532081,12.2864785 17.532081,12.2864785 L13.0243667,16.9160957 L8.48512223,12.2864785 C8.48512223,12.2864785 7.9474365,11.7717922 7.42505916,12.1221617 C6.90268182,12.4716587 6.98165924,13.1628407 7.0479159,13.2297889"
              id="Fill-1"
              fill="currentColor"
              transform="translate(13, 15.5) rotate(-90) translate(-13, -15.5)"
            ></path>
          </g>
        </svg>
      </button>
    </li>
    <li class="inline-flex">
      <button
        class="text-dark disabled:text-gray"
        @click="prevPage"
        :disabled="activeStatusCurrentPage === 1 || loading"
        type="button"
      >
        <svg
          width="30px"
          height="30px"
          style="transform: rotate(180deg)"
          viewBox="0 0 30 30"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <title>Icon/table-arrow</title>
          <g id="Icon/table-arrow" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <path
              d="M9.04776368,13.2297532 L14.3337274,18.6401357 C14.3337274,18.6401357 15.0005125,19.506055 15.8150976,18.5514561 L20.7246574,13.4488839 C20.9319123,13.233272 21.0414804,12.9281215 20.9854221,12.6307719 C20.948047,12.431679 20.8393225,12.2325772 20.5777055,12.1221617 C19.9245109,11.8474249 19.532081,12.2864785 19.532081,12.2864785 L15.0243667,16.9160957 L10.4851222,12.2864785 C10.4851222,12.2864785 9.9474365,11.7717922 9.42505916,12.1221617 C8.90268182,12.4716587 8.98165924,13.1628407 9.0479159,13.2297889"
              id="Fill-1"
              fill="currentColor"
              transform="translate(15, 15.5) rotate(-90) translate(-15, -15.5)"
            ></path>
          </g>
        </svg>
      </button>
    </li>
    <li class="inline-flex font-semibold text-xs leading-[18px] text-dark px-2.5">
      Page {{ activeStatusCurrentPage }} of {{ activeStatusTotalPages }}
    </li>
    <li class="inline-flex">
      <button
        class="text-dark disabled:text-gray"
        @click="nextPage"
        :disabled="activeStatusCurrentPage === activeStatusTotalPages || loading"
        type="button"
      >
        <svg
          width="30px"
          height="30px"
          viewBox="0 0 30 30"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <title>Icon/table-arrow</title>
          <g id="Icon/table-arrow" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <path
              d="M9.04776368,13.2297532 L14.3337274,18.6401357 C14.3337274,18.6401357 15.0005125,19.506055 15.8150976,18.5514561 L20.7246574,13.4488839 C20.9319123,13.233272 21.0414804,12.9281215 20.9854221,12.6307719 C20.948047,12.431679 20.8393225,12.2325772 20.5777055,12.1221617 C19.9245109,11.8474249 19.532081,12.2864785 19.532081,12.2864785 L15.0243667,16.9160957 L10.4851222,12.2864785 C10.4851222,12.2864785 9.9474365,11.7717922 9.42505916,12.1221617 C8.90268182,12.4716587 8.98165924,13.1628407 9.0479159,13.2297889"
              id="Fill-1"
              fill="currentColor"
              transform="translate(15, 15.5) rotate(-90) translate(-15, -15.5)"
            ></path>
          </g>
        </svg>
      </button>
    </li>
    <li class="inline-flex">
      <button
        class="text-dark disabled:text-gray"
        @click="lastPage"
        :disabled="activeStatusCurrentPage === activeStatusTotalPages || loading"
        type="button"
      >
        <svg
          width="30px"
          height="30px"
          viewBox="0 0 30 30"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <title>Icon/table-arrow-last</title>
          <g
            id="Icon/table-arrow-last"
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd"
          >
            <rect
              id="Line"
              fill="currentColor"
              x="19"
              y="9.5"
              width="1.6"
              height="12"
              rx="0.8"
            ></rect>
            <path
              d="M7.04776368,13.2297532 L12.3337274,18.6401357 C12.3337274,18.6401357 13.0005125,19.506055 13.8150976,18.5514561 L18.7246574,13.4488839 C18.9319123,13.233272 19.0414804,12.9281215 18.9854221,12.6307719 C18.948047,12.431679 18.8393225,12.2325772 18.5777055,12.1221617 C17.9245109,11.8474249 17.532081,12.2864785 17.532081,12.2864785 L13.0243667,16.9160957 L8.48512223,12.2864785 C8.48512223,12.2864785 7.9474365,11.7717922 7.42505916,12.1221617 C6.90268182,12.4716587 6.98165924,13.1628407 7.0479159,13.2297889"
              id="Fill-1"
              fill="currentColor"
              transform="translate(13, 15.5) rotate(-90) translate(-13, -15.5)"
            ></path>
          </g>
        </svg>
      </button>
    </li>
  </ul>
</template>
