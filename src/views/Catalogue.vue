<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppThemeStore } from '@/stores/appTheme';

import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const appThemeStore = useAppThemeStore();

const catalogueData = ref({})
const loading = ref(true)

onMounted(async () => {
  catalogueData.value = await getCatalogueData();
});

async function getCatalogueData() {
  try {
    const response = await axios.get('https://api.github.com/repos/governify/governify-examples/contents/metrics/event-collector/metricsGuarantees.json');
    const parsedResponse = JSON.parse(atob(response.data.content));

    for (let metric of parsedResponse.metrics) {
      for (let key in metric.dsl) {
        const { scope, ...data } = metric.dsl[key].metric;
        metric.dsl = data ;
      }
    }

    for (let guarantee of parsedResponse.guarantees) {
      guarantee.of = [{
        objective: guarantee.of[0].objective,
        with: guarantee.of[0].with
      }]
    }

    loading.value = false

    return parsedResponse;
  } catch (error) {
    console.log("Error obtaining TPs catalogue: ", error);
  }
}
</script>

<template>
  <Button class="absolute mr-3 mt-2 right-0 top-0" :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')" severity="secondary" @click="appThemeStore.toggleTheme()" />
  
  <div class="card">
    <h1 class="text-center">TPs Catalogue View</h1>
    
    <div v-if="loading" class="flex flex-column m-5">
      <ProgressSpinner class="text-center" strokeWidth="4" />
        <h3 class="text-center">Loading...</h3>
    </div>

    <div v-else>
      <h2>Metrics</h2>
      <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));">
        <div v-for="metric in catalogueData.metrics" :key="metric.name" class="card flex flex-column align-items-center">
          <h4 style="word-break: break-all; font-weight: bold;">{{ metric.name }}</h4>
          <p>{{ metric.description }}</p>
          <pre class="preOverflow">{{metric.dsl}}</pre>
        </div> 
      </div>
  
      <h2>Guarantees</h2>
      <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));">
        <div v-for="guarantee in catalogueData.guarantees" :key="guarantee.id" class="card flex flex-column align-items-center">
          <h4 style="word-break: break-all; font-weight: bold;">{{ guarantee.id }}</h4>
          <p>{{ guarantee.notes }}</p>
          <p>{{ guarantee.description }}</p>
          <pre class="preOverflow">{{ guarantee.of[0] }}</pre>
        </div> 
      </div>
    </div>

    <div style="display: grid; grid-auto-flow: column; gap: 1rem;">
        <Button label="🏠 Home" @click="router.push({ name: 'home' })" />
        <Button label="🔙 Back" @click="router.go(-1)" />
    </div>

  </div>
</template>