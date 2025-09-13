<script setup>
import { useStore } from 'vuex';
import { computed, onMounted, ref } from 'vue';
import LoadingBlock from '@/components/LoadingBlock.vue';
import PaginationListItem from '@/components/PaginationListItem.vue';

const store = useStore();
const account = computed(() => store.getters['account/account']);
const itemsPerPage = ref(50);
const activeStatus = ref('all');
const loading = ref(true);
const pastRoundsAll = ref([]);
const currentPageAll = ref(1);
const pastRoundsCompleted = ref([]);
const currentPageCompleted = ref(1);
const pastRoundsCancelled = ref([]);
const currentPageCancelled = ref(1);

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

const activeStatusData = computed(() => {
  let data = [];
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      data = pastRoundsAll.value;
      break;
    case 'completed':
      data = pastRoundsCompleted.value;
      break;
    case 'canceled':
      data = pastRoundsCancelled.value;
      break;
  }
  return data;
});

const activeStatusTotalPages = computed(() => {
  let totalPages = null;
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      totalPages = Math.ceil(pastRoundsAll.value.length / itemsPerPage.value);
      break;
    case 'completed':
      totalPages = Math.ceil(pastRoundsCompleted.value.length / itemsPerPage.value);
      break;
    case 'canceled':
      totalPages = Math.ceil(pastRoundsCancelled.value.length / itemsPerPage.value);
      break;
  }
  return totalPages;
});

const activeStatusPaginatedData = computed(() => {
  let paginatedData = [];
  if (activeStatusCurrentPage.value && activeStatusData.value.length !== 0) {
    const start = (activeStatusCurrentPage.value - 1) * itemsPerPage.value;
    const end = Math.min(
      activeStatusCurrentPage.value * itemsPerPage.value,
      activeStatusData.value.length + 1
    );
    paginatedData = activeStatusData.value.slice(start, end);
  }
  return paginatedData;
});

const nextPage = () => {
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
const firstPage = () => {
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      currentPageAll.value = 1;
      break;
    case 'completed':
      currentPageCompleted.value = 1;
      break;
    case 'canceled':
      currentPageCancelled.value = 1;
      break;
  }
};
const prevPage = () => {
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
const lastPage = () => {
  // eslint-disable-next-line default-case
  switch (activeStatus.value) {
    case 'all':
      currentPageAll.value = activeStatusTotalPages.value;
      break;
    case 'completed':
      currentPageCompleted.value = activeStatusTotalPages.value;
      break;
    case 'canceled':
      currentPageCancelled.value = activeStatusTotalPages.value;
      break;
  }
};

onMounted(async () => {
  if (account.value) {
    loading.value = true;
    const { allRounds, completedRounds, canceledRounds } = await store.dispatch(
      'lottery/getUsersLatestPastRoundsEntered'
    );
    loading.value = false;
    pastRoundsAll.value = allRounds;
    pastRoundsCompleted.value = completedRounds;
    pastRoundsCancelled.value = canceledRounds;
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
    <ul v-if="activeStatusData.length !== 0 && !loading" class="pt-[30px] space-y-2.5">
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
      v-else-if="activeStatusData.length === 0 && !loading"
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
