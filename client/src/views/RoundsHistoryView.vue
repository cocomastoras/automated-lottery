<script setup>
import PaginationList from '@/components/PaginationList.vue';
</script>

<template>
  <section class="w-full md:w-2/3 lg:w-1/2 mx-auto">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">Past rounds</div>
    </div>
    <PaginationList />
  </section>
</template>
