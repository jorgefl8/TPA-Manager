<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppThemeStore } from '@/stores/appTheme';

import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const appThemeStore = useAppThemeStore();

const catalogueData = ref({metrics: [], guarantees: []})
const loading = ref(true)

onMounted(async () => {
  const data = await getCatalogueData();

  // Add a delay between each metric/guarantee to make the transition look better
  for (let i = 0; i < data.metrics.length; i++) {
    setTimeout(() => {
      catalogueData.value.metrics.push(data.metrics[i]);
    }, i * 50);
  }

  for (let i = 0; i < data.guarantees.length; i++) {
    setTimeout(() => {
      catalogueData.value.guarantees.push(data.guarantees[i]);
    }, 1000 + i * 50);
  }
});

async function getCatalogueData() {
  try {
    const response = await axios.get('https://api.github.com/repos/governify/governify-examples/contents/metrics/event-collector/metricsGuarantees.json');
    const parsedResponse = JSON.parse(atob(response.data.content));

    for (let metric of parsedResponse.metrics) {
      for (let key in metric.dsl) {
        const { scope, computing, ...data } = metric.dsl[key].metric;
        metric.dsl = data ;
      }
    }

    for (let guarantee of parsedResponse.guarantees) {
      guarantee.objective = guarantee.of[0].objective
    }

    loading.value = false

    return parsedResponse;
  } catch (error) {
    console.log("Error obtaining TPs catalogue: ", error);
  }
}
</script>

<template>
  <Button class="absolute ml-3 mt-2 left-0 top-0" icon="pi pi-home" severity="secondary" @click="router.push({ name: 'home' })" aria-label="Home" />
  <Button class="absolute ml-3 mt-2 left-0 top-0" style="margin-left: 4.55rem !important;" icon="pi pi-arrow-left" severity="secondary" @click="router.go(-1)" aria-label="Back" />
  <Button class="absolute mr-3 mt-2 right-0 top-0" :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')" severity="secondary" @click="appThemeStore.toggleTheme()" aria-label="Toggle theme" />
  
  <div class="card">
    <h1 class="text-center font-bold"><u>📖 TPs Catalogue</u></h1>
    
    <div v-if="loading" class="flex flex-column m-5">
      <ProgressSpinner class="text-center" strokeWidth="4" />
        <h3 class="text-center">Loading...</h3>
    </div>

    <div v-else>
      <h2>Metrics</h2>
      <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));">
        <TransitionGroup name="list">
          <div v-for="metric in catalogueData.metrics" :key="metric.name" class="card flex flex-column align-items-center">
            <h4 style="word-break: break-all; font-weight: bold;">{{ metric.name }}</h4>
            <p>{{ metric.description }}</p>
            <pre class="preOverflow">{{metric.dsl}}</pre>
          </div>
        </TransitionGroup> 
      </div>
  
      <h2>Guarantees</h2>
      <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));">
        <TransitionGroup name="list">
          <div v-for="guarantee in catalogueData.guarantees" :key="guarantee.id" class="card flex flex-column align-items-center">
            <h4 style="word-break: break-all; font-weight: bold;">{{ guarantee.id }}</h4>
            <p>{{ guarantee.notes }}</p>
            <p>{{ guarantee.description }}</p>
            <pre class="preOverflow" severity="info">{{ guarantee.objective }}</pre>
          </div> 
        </TransitionGroup>
      </div>
    </div>

    <div style="display: grid; grid-auto-flow: column; gap: 1rem;">
        <Button label="🏠 Home" @click="router.push({ name: 'home' })" aria-label="Home" />
        <Button label="🔙 Back" @click="router.go(-1)" aria-label="Back" />
    </div>

  </div>
</template>

<style scoped>
.list-enter-active {
  animation: enterAnimation 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

@keyframes enterAnimation {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.5);
  }
  50% {
    opacity: 0.75;
    transform: translateY(15px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>