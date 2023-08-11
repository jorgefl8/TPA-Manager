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
      <!-- This key prevents the TpaDetails component from re-rendering when the user switches the mode for the same course and project -->
      <RouterView :key="`${$route.params.courseId} ${$route.params.projectId}`" />
    </div>
  </main>
</template>

<style>
/* @import url('https://fonts.googleapis.com/css?family=Abel'); */
@import url('https://fonts.googleapis.com/css?family=Didact Gothic');

main {
  margin: 0;
  padding: 0;
}

.wrapper {
  padding: 1rem 2rem 0rem 2rem;
}
</style>
