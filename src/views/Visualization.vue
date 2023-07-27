<script setup>
import { ref, computed } from 'vue'

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
    <SelectTPA ref="selectTpa" :isDialog="false" :isVisualizationMode="true" @collapseAllClick="collapseAll" @expandAllClick="expandAll" />

    <div class="col-12 flex flex-column align-items-center" v-if="agreement">
      <div class="flex flex-column align-items-center w-full">
        <div class="card w-full">
          <ScrollPanel class="px-2" style="width: 100%; height: 70svh;">
  
            <div>
              <h2>Scope</h2>
              <Scope fieldName="context.definitions.scopes.development" :key="agreement.context.definitions.scopes.development" />
            </div>
        
            <div>
              <div class="flex align-items-center gap-2">
                <h2>Dashboard blocks</h2>
                <ToggleButton class="expandButton" v-model="expandedDashboardBlocks" @click="toggleExpandedDashboardBlocks" onLabel="" offLabel="" onIcon="pi pi-angle-down" offIcon="pi pi-angle-right" />
              </div>
              <Dashboard ref="dashboardBlocks" fieldName="context.definitions.dashboards.main.config" :key="agreement.context.definitions.dashboards.main.config" />
            </div>

            <div>
              <div class="flex align-items-baseline gap-2">
                <h2>Guarantees</h2>
                <ToggleButton class="expandButton" v-model="expandedGuarantees" @click="toggleExpandedGuarantees" onLabel="" offLabel="" onIcon="pi pi-angle-down" offIcon="pi pi-angle-right" />
              </div>
              <Guarantees ref="guarantees" fieldName="terms.guarantees" :key="agreement.terms.guarantees" />
            </div>

            <div>
              <div class="flex align-items-baseline gap-2">
                <h2>Metrics</h2>
                <ToggleButton class="expandButton" v-model="expandedMetrics" @click="toggleExpandedMetrics" onLabel="" offLabel="" onIcon="pi pi-angle-down" offIcon="pi pi-angle-right" />
              </div>
              <Metrics ref="metrics" fieldName="terms.metrics" :key="agreement.terms.metrics" />
            </div>
    
            <ScrollTop target="parent" :threshold="600" class="custom-scrolltop" icon="pi pi-angle-up" />
  
          </ScrollPanel>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-scrollpanel-content) {
  display: grid !important;
  gap: 1rem !important;
}
</style>