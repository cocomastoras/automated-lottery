<script setup></script>

<template>
  <section class="w-full">
    <div class="flex items-center pb-[30px]">
      <button @click="$router.go(-1)" type="button">
        <img src="@/assets/images/icon/back.svg" class="mr-4" alt="back icon" />
      </button>
      <div class="font-semibold text-dark text-lg">Connect wallet</div>
    </div>
    <div
      class="block bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px]"
    >
      <div class="flex items-start">
        <img
          class="mt-2.5 mr-2.5"
          height="18"
          width="18"
          src="@/assets/images/icon/win-wallet.svg"
          alt="win wallet icon"
        />
        <div>
          <div class="font-semibold text-dark text-base">New wallet</div>
          <div class="font-medium text-gray text-xs">
            We will create a new wallet for you. You will have full control over your new wallet.
          </div>
        </div>
      </div>
      <img class="my-5 mx-auto" src="@/assets/images/new-wallet.png" alt="new wallet image" />
      <router-link
        to="/create-wallet"
        class="flex items-center justify-center w-full h-10 font-semibold text-sm bg-dark text-white rounded-lg hover:shadow"
      >
        Create new wallet
      </router-link>
    </div>
    <router-link
      to="/import-wallet"
      class="flex items-center bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow p-[15px] mb-[15px] w-full font-semibold text-sm text-dark"
    >
      <img
        class="mr-[15px]"
        height="30"
        width="30"
        src="@/assets/images/icon/win-import.svg"
        alt="win import icon"
      />
      Import wallet
    </router-link>
  </section>
</template>
