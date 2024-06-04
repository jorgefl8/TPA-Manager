<script setup>
import { onMounted } from 'vue';
import { usePrimeVue } from 'primevue/config';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';


const PrimeVue = usePrimeVue();

onMounted(() => {
  const appTheme = localStorage.getItem("appTheme");
  if (appTheme === 'Dark') {
    PrimeVue.changeTheme('lara-light-blue', 'arya-blue', 'theme-link', () => { });
  } else {
    PrimeVue.changeTheme('arya-blue', 'lara-light-blue', 'theme-link', () => { });
  }
});
</script>

<template>
  <main>
    <div class="wrapper">
      <ScrollPanel style="width: 100%; height: 100vh;" :pt="{ bary: 'hover:bg-green-400 bg-green-400 opacity-50' }">
        <RouterView />
        <ScrollTop target="parent" :threshold="200" style="margin-right: 15px;"
          icon="pi pi-angle-up" />
      </ScrollPanel>
    </div>
  </main>
</template>

<style>
main {
  margin: 0;
  padding: 0;
}
.wrapper {
  padding: 0;
}
</style>
