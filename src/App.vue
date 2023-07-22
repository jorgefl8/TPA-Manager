<script setup>
import { onMounted } from 'vue';
import { usePrimeVue } from 'primevue/config';

const PrimeVue = usePrimeVue();

onMounted(() => {
  const appTheme = localStorage.getItem("appTheme");
  if (appTheme === 'Dark') {
    PrimeVue.changeTheme('lara-light-blue', 'arya-blue', 'theme-link', () => {});
  } else {
    PrimeVue.changeTheme('arya-blue', 'lara-light-blue', 'theme-link', () => {});
  }
});
</script>

<template>
  <main>
    <div class="wrapper">
      <RouterView />
    </div>
  </main>
</template>

<style>
/* @import url('https://fonts.googleapis.com/css?family=Abel'); */
@import url('https://fonts.googleapis.com/css?family=Didact Gothic');

main {
  margin: 0;
  padding: 0;
  /* height: 100vh; */
  /* display:flex; */
  /* align-items:center; */
  /* justify-content:center; */
}

.wrapper {
  padding: 1rem 2rem 0rem 2rem;
}

</style>
