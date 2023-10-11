<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import Scope from '@/components/Scope.vue';
import Dashboard from '@/components/Dashboard.vue';
import Guarantees from '@/components/Guarantees.vue';
import Metrics from '@/components/Metrics.vue';
import SelectTpa from '@/components/SelectTpa.vue';

import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import ToggleButton from 'primevue/togglebutton';

const router = useRouter();
const tpaEditionStore = useTpaEditionStore();
const { originalTpa, modifiedTpa, discardButtonClicked} = storeToRefs(tpaEditionStore);

const selectTpa = ref();
const dashboardBlocks = ref();
const guarantees = ref();
const metrics = ref();
const expandedDashboardBlocks = ref(false);
const expandedGuarantees = ref(false);
const expandedMetrics = ref(false);
const transitionInProgress = ref(false);

const currentMode = computed(() => router.currentRoute.value.name);

const agreement = computed(() => {
  if (selectTpa.value) return selectTpa.value.agreement;
  return null;
});

function handlePageUnload(event) {
  if (!discardButtonClicked.value && originalTpa.value && modifiedTpa.value && JSON.stringify(originalTpa.value) !== JSON.stringify(modifiedTpa.value)) {
    event.returnValue = 'There are unsaved changes. Are you sure you want to leave?';
    // Web apps cannot prevent the user from leaving the page.
    // All we can do is warn them to save their work if they want to.
    // Also, the browser will show a generic message, so we can't customize it.
  }
};

// Attach the event listener when the component is mounted
window.addEventListener('beforeunload', handlePageUnload);

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handlePageUnload);
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

function handleCardTransition() {
  transitionInProgress.value = true;
  setTimeout(() => {
    transitionInProgress.value = false;
  }, 300);
}
</script>

<template>
  <div class="grid">
    <SelectTpa ref="selectTpa" :isDialog="false" :mode="currentMode" @collapseAllClick="collapseAll" @expandAllClick="expandAll" @tpaChange="handleCardTransition" />

    <Transition name="slide-fade">
      <div class="col-12 flex flex-column align-items-center p-0" v-if="agreement && !transitionInProgress">
        <div class="flex flex-column align-items-center w-full">
          <div class="card w-full">
            <ScrollPanel class="px-2" style="width: 100%; height: 75svh;">
    
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
                  <h2>Metrics</h2>
                  <ToggleButton class="expandButton" v-model="expandedMetrics" @click="toggleExpandedMetrics" onLabel="" offLabel="" onIcon="pi pi-angle-down" offIcon="pi pi-angle-right" />
                </div>
                <Metrics ref="metrics" fieldName="terms.metrics" :key="agreement.terms.metrics" />
              </div>

              <div>
                <div class="flex align-items-baseline gap-2">
                  <h2>Guarantees</h2>
                  <ToggleButton class="expandButton" v-model="expandedGuarantees" @click="toggleExpandedGuarantees" onLabel="" offLabel="" onIcon="pi pi-angle-down" offIcon="pi pi-angle-right" />
                </div>
                <Guarantees ref="guarantees" fieldName="terms.guarantees" :key="agreement.terms.guarantees" />
              </div>
      
              <ScrollTop target="parent" :threshold="600" class="custom-scrolltop" icon="pi pi-angle-up" />
    
            </ScrollPanel>
          </div>
        </div>
      </div>
    </Transition>
  
  </div>
</template>

<style scoped>
:deep(.p-scrollpanel-content) {
  display: grid !important;
  gap: 1rem !important;
}
</style>