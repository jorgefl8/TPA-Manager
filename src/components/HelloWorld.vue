<script setup>
// import VueJsonPretty from 'vue-json-pretty';
// import 'vue-json-pretty/lib/styles.css';
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Button from 'primevue/button'
import Scope from './Scope.vue';
import Dashboard from './Dashboard.vue';
import Guarantees from './Guarantees.vue';
import Metrics from './Metrics.vue';
import Dropdown from 'primevue/dropdown';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import ToggleButton from 'primevue/togglebutton';
import Divider from 'primevue/divider';

const courses = ref([]);
const selectedCourse = ref("");
const projectId = ref("");
const agreement = ref();
const dashboardBlocks = ref();
const guarantees = ref();
const metrics = ref();
const expandedDashboardBlocks = ref(false);
const expandedGuarantees = ref(false);
const expandedMetrics = ref(false);

function getCourses() {
  axios.get("http://localhost:5700/api/v1/scopes/development/courses")
    .then(response => {
      courses.value = response.data.scope;
      for (const course of courses.value) {
        course.projects.sort((a, b) => {
          return a.projectId.localeCompare(b.projectId);
        });
      }
    })
    .catch(error => {
      console.log("Error: ", error);
    });
}

function getAgreement() {
  axios.get(`http://localhost:5400/api/v6/agreements/tpa-${projectId.value}`)
    .then(response => {
      agreement.value = response.data;
    })
    .catch(error => {
      console.log("Error: ", error);
    });
}

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

onMounted(() => {
  getCourses();
});
</script>

<template>

  <div class="card" v-if="!agreement">
    <h1>TPA Visualization</h1>
    <Dropdown class="mr-2" v-model="selectedCourse" :options="courses" optionLabel="classId" placeholder="Select a course" filter />
    <Dropdown v-if="selectedCourse" class="mr-2" v-model="projectId" :options="selectedCourse.projects" optionLabel="projectId" optionValue="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" />
    <Button label="Display agreement" icon="pi pi-search" @click="getAgreement" />
  </div>

  <div class="flex flex-column align-items-center" v-if="agreement">

    
    <div class="flex flex-column align-items-center" style="width: 80svw;">
      
      <div class="card align-self-start">
        
        <div id="topbar-container" class="flex">
          <div id="topbar" class="card flex align-items-start justify-content-between overflow-auto" style="width: 100%">
            <div class="mr-3 align-self-center">
              <h2 class="mb-0">Visualization Mode</h2>
            </div>
    
            <Divider layout="vertical"/>
    
            <div class="flex pt-4 align-items-baseline">
              <div class="p-float-label">
                  <Dropdown class="mr-2" v-model="selectedCourse" :options="courses" inputId="dd-classId" optionLabel="classId" placeholder="Select a course" filter />
                  <label for="dd-classId">Course</label>
              </div>
              <div class="p-float-label">
                <Dropdown  class="mr-2" v-model="projectId" v-if="selectedCourse" inputId="dd-projectId" :options="selectedCourse.projects" optionLabel="projectId" optionValue="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" />
                <label for="dd-projectId" v-if="selectedCourse">Project</label>
              </div>
              <Button label="Display agreement" icon="pi pi-search" @click="getAgreement" />
            </div>
    
            <Divider layout="vertical"/>
    
            <div class="flex justify-content-center gap-3 pt-4 align-items-baseline">
              <Button label="Collapse all" @click="collapseAll" icon="pi pi-angle-double-up" />
              <Button label="Expand all" @click="expandAll" icon="pi pi-angle-double-down" />
            </div>
          </div>
        </div>

        <ScrollPanel class="pt-0 p-2" style="width: 100%; height: 78svh;">

          <h2>Scope</h2>
          <Scope :scope="agreement.context.definitions.scopes.development" :key="agreement.context.definitions.scopes.development" />
      
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
</template>

<style scoped>

#topbar::before, #topbar::after {
  content: "";
}

::v-deep(.p-scrollpanel .p-scrollpanel-bar) {
    background-color: var(--primary-300);
    opacity: 1;
    transition: background-color 0.3s;
}

::v-deep(.p-scrollpanel .p-scrollpanel-bar:hover) {
    background-color: var(--primary-400);
}

::v-deep(.custom-scrolltop) {
    width: 3rem;
    height: 3rem;
}

::v-deep(.custom-scrolltop .p-scrolltop-icon) {
    font-size: 1.5rem;
    color: var(--primary-color-text);
}

.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid !important;
}
.p-divider-solid.p-divider-vertical:before {
  border-left-style: solid !important;
}
</style>
<!-- Añadir un marco y un título a la aplicación para que quede más bonita -->
<!-- Cambiar los títulos y organizar los apartados mejor visualmente -->
<!-- Añadir un ToggleButton para indicar si el TPA es para desarrollo o producción (básicamente, para decidir si los enlaces son con host.docker.internal:port o con URLs) -->
<!-- Permitir edición tanto en JSON como con la interfaz (ToggleButton, por ejemplo) -->
<!-- Permitir la creación de un nuevo TPA -->
<!-- Hay un bug en PrimeVue que no permite filtrar los proyectos agrupados por owner, el filtro directamente no funciona. Decidir si usar el filtro o el groupByOwner. -->
<!-- Deshabilitar el botón de "Get agreement" si no hay un proyecto seleccionado -->
<!-- Añadir un modo de depuración para comprobar las evidencias que devuelven las métricas (como Postman llamando al endpoint de /computations) -->
<!-- La creación de métricas y garantías sería a modo de wizard, preguntando paso a paso al usuario qué desea medir, en qué aplicación, en qué periodo, etc. -->
<!-- Añadir otra vista con el catálogo de métricas (¿quizá explicadas también en lenguaje natural?) -->
<!-- Llevar la topbar a otro componente e importarla aquí -->