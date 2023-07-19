<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import Scope from '../components/Scope.vue';
import Dashboard from '../components/Dashboard.vue';
import Guarantees from '../components/Guarantees.vue';
import Metrics from '../components/Metrics.vue';
import SelectTPA from '../components/SelectTPA.vue';

import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import ToggleButton from 'primevue/togglebutton';

const selectTpa = ref();
const dashboardBlocks = ref();
const guarantees = ref();
const metrics = ref();
const expandedDashboardBlocks = ref(false);
const expandedGuarantees = ref(false);
const expandedMetrics = ref(false);

const agreement = computed(() => {
  if (selectTpa.value) return selectTpa.value.agreement;
  return null;
});

const tpaEditionStore = useTpaEditionStore();
const { originalTpa, modifiedTpa} = storeToRefs(tpaEditionStore);

const handlePageReload = (event) => {
  if (originalTpa && modifiedTpa && JSON.stringify(originalTpa.value) !== JSON.stringify(modifiedTpa.value)) {
    event.preventDefault();
    event.returnValue = 'There are unsaved changes. Are you sure you want to leave?';
  }
};

const handlePageLeave = () => {
  if (originalTpa && modifiedTpa && JSON.stringify(originalTpa.value) !== JSON.stringify(modifiedTpa.value)) {
    if (confirm("There are unsaved changes. Do you want to save them before you leave?")) {
      // Web apps can't prevent the user from leaving the page, so all we can do is save the changes if the user wants to
      console.log("TODO: save changes")
    }
  }
};

// Attach the event listener when the component is mounted
window.addEventListener('beforeunload', handlePageReload);

onBeforeUnmount(() => {
  handlePageLeave();
  window.removeEventListener('beforeunload', handlePageReload);
});

function toggleExpandedDashboardBlocks() {
  expandedDashboardBlocks.value ? dashboardBlocks.value.expandAll() : dashboardBlocks.value.collapseAll();
}

function toggleExpandedGuarantees() {
  expandedGuarantees.value ? guarantees.value.expandAll() : guarantees.value.collapseAll();
}

function toggleExpandedMetrics() {
  expandedMetrics.value ? metrics.value.expandAll() : metrics.value.collapseAll();
}

function expandAll() {
  expandedDashboardBlocks.value = true;
  expandedGuarantees.value = true;
  expandedMetrics.value = true;
  dashboardBlocks.value.expandAll();
  guarantees.value.expandAll();
  metrics.value.expandAll();
}

function collapseAll() {
  expandedDashboardBlocks.value = false;
  expandedGuarantees.value = false;
  expandedMetrics.value = false;
  dashboardBlocks.value.collapseAll();
  guarantees.value.collapseAll();
  metrics.value.collapseAll();
}
</script>

<template>
  <div class="grid">
    <SelectTPA ref="selectTpa" :isDialog="false" :isVisualizationMode="false" @collapseAllClick="collapseAll" @expandAllClick="expandAll" />
  
    <div class="col-12 flex flex-column align-items-center" v-if="agreement">
      <div class="flex flex-column align-items-center w-full">
        <div class="card w-full">
          <ScrollPanel class="pt-0 p-2" style="width: 100%; height: 70svh;">
  
            <h2>Scope</h2>
            <Scope :editionMode="true" :scope="agreement.context.definitions.scopes.development" scopeFieldName="context.definitions.scopes.development" :key="agreement.context.definitions.scopes.development" />
        
            <div class="flex align-items-baseline mt-4">
              <h2>Dashboard blocks</h2>
              <ToggleButton v-model="expandedDashboardBlocks" @click="toggleExpandedDashboardBlocks" style="width: 40px; height: 15px;" onLabel="" offLabel="" onIcon="pi pi-angle-down" offIcon="pi pi-angle-right" class="ml-2" />
            </div>
            <Dashboard ref="dashboardBlocks" :config="agreement.context.definitions.dashboards.main.config" :key="agreement.context.definitions.dashboards.main.config" />
        
            <div class="flex align-items-baseline mt-4">
              <h2>Guarantees</h2>
              <ToggleButton v-model="expandedGuarantees" @click="toggleExpandedGuarantees" style="width: 40px; height: 15px;" onLabel="" offLabel="" onIcon="pi pi-angle-down" offIcon="pi pi-angle-right" class="ml-2" />
            </div>
            <Guarantees ref="guarantees" :data="agreement.terms.guarantees" :key="agreement.terms.guarantees" />
        
            <div class="flex align-items-baseline mt-4">
              <h2>Metrics</h2>
              <ToggleButton v-model="expandedMetrics" @click="toggleExpandedMetrics" style="width: 40px; height: 15px;" onLabel="" offLabel="" onIcon="pi pi-angle-down" offIcon="pi pi-angle-right" class="ml-2" />
            </div>
            <Metrics ref="metrics" :data="agreement.terms.metrics" :key="agreement.terms.metrics" />
    
            <ScrollTop target="parent" :threshold="600" class="custom-scrolltop" icon="pi pi-angle-up" />
  
          </ScrollPanel>
        </div>
      </div>
    </div>
  </div>
</template>