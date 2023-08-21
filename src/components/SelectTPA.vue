<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppThemeStore } from '@/stores/appTheme';
import { useTpaEditionStore } from '@/stores/tpaEdition';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { storeToRefs } from 'pinia';
import axios from 'axios'

import Toast from 'primevue/toast';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import ConfirmPopup from 'primevue/confirmpopup';
import ToggleButton from 'primevue/togglebutton';

const props = defineProps({
  isDialog: {
    type: Boolean
  },
  mode: {
    type: String,
    required: true
  }
});

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();
const appThemeStore = useAppThemeStore();
const tpaEditionStore = useTpaEditionStore();
const { isProductionEnvironment } = storeToRefs(tpaEditionStore);

const MODES = {
  HOME: "🏠 Home",
  VISUALIZATION: "🔍 Visualization",
  EDITION: "✏️ Edition",
  CATALOGUE: "📖 TPs Catalogue"
};

const courses = ref([]);
const projectsWithTpas = ref([]);
const projectsWithoutTpas = ref([]);
const selectedCourse = ref();
const selectedProject = ref();
const courseId = ref(route.params.courseId);
const projectId = ref(route.params.projectId);
const agreement = ref();
const isCourseInvalid = ref(false);
const isProjectInvalid = ref(false);
const displayDialog = ref(false);
const selectedMode = ref(getSelectedModeFromUrl());
const switchToEditionAfterCreation = ref(false);
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5400';
const modes = ref([
{ label: '🏠 Home', value: MODES.HOME},
{ label: '🔍 Visualization', value: MODES.VISUALIZATION },
{ label: '✏️ Edition', value: MODES.EDITION },
{ label: '📖 Catalogue', value: MODES.CATALOGUE }
]);

defineExpose({
  displayDialog,
  courses,
  selectedCourse,
  selectedProject,
  agreement
});

const emits = defineEmits(['collapseAllClick', 'expandAllClick', 'tpaChange']);

onMounted(() => {
  getCourses();
});

watch([selectedProject], () => {
  if (selectedCourse.value && selectedProject.value && !props.isDialog) {
    const routeParams = {};
    routeParams.courseId = selectedCourse.value.classId;
    routeParams.projectId = selectedProject.value?.projectId;
    
    router.push({ name: props.mode, params: routeParams });
  } 
});

function getSelectedModeFromUrl() {
  const routeName = route.name;
  switch (routeName) {
    case "home":
      return MODES.HOME;
    case "visualization":
      return MODES.VISUALIZATION;
    case "edition":
      return MODES.EDITION;
    case "catalogue":
      return MODES.CATALOGUE;
  }
}

function getCourses() {
  axios.get(process.env.SCOPE_MANAGER_URL + "/api/v1/scopes/development/courses")
    .then(async (response) => {
      
      courses.value = response.data.scope.sort((a, b) => a.classId.localeCompare(b.classId));

      if (courseId.value) {
        selectedCourse.value = courses.value.find(course => course.classId === courseId.value);
        await getProjectsWithTpas();
      }

      if (projectId.value) {
        selectedProject.value = projectsWithTpas.value.find(project => project.projectId === projectId.value);
      }

      if (selectedCourse.value && selectedProject.value) getAgreement();
      
      if (!props.isDialog) {
        if (!selectedCourse.value) isCourseInvalid.value = true;
        if (!selectedProject.value) isProjectInvalid.value = true;
      }

    })
    .catch(error => {
      console.log("Error: ", error);
    });
}

function getAgreement() {
  if (!selectedCourse.value && !props.isDialog) isCourseInvalid.value = true;
  else if (!selectedProject.value && !props.isDialog) isProjectInvalid.value = true;
  else {
    axios.get(`${process.env.REGISTRY_URL}/api/v6/agreements/tpa-${selectedProject.value.projectId}`)
    .then(response => {
      agreement.value = response.data;
      tpaEditionStore.setInitialTpaData(agreement.value);
    })
    .catch(error => {
      console.log("Error: ", error);
      if (error.response.status === 404) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'This project does not have an existing TPA.', life: 3000 });
      }
    });
  } 
}

async function getProjectsWithTpas() {
  await axios.get(process.env.REGISTRY_URL + "/api/v6/agreements")
    .then(response => {

      // Projects from the selected course that have a TPA
      projectsWithTpas.value = response.data
        .filter(agreement => agreement.context.definitions.scopes.development.class.default === selectedCourse.value.classId)
        .map(agreement => {
          return { projectId: agreement.id.substring(4) }
        })
        .sort((a, b) => a.projectId.localeCompare(b.projectId));
      
      // Projects from the selected course that are not in the projectsWithTpas array
      projectsWithoutTpas.value = selectedCourse.value.projects.filter(project => !projectsWithTpas.value.some(projectWithTpa => projectWithTpa.projectId === project.projectId)).sort((a, b) => a.projectId.localeCompare(b.projectId));
    })
    .catch(error => {
      console.log("Error: ", error);
    });
}

function changeViewByMode() {
  switch (selectedMode.value) {
    case MODES.HOME:
      router.push({ name: 'home' });
      break;
    case MODES.VISUALIZATION:
      router.push({ name: 'visualization', params: { courseId: courseId.value, projectId: selectedProject.value?.projectId } });
      break;
    case MODES.EDITION:
      router.push({ name: 'edition', params: { courseId: courseId.value, projectId: selectedProject.value?.projectId } });
      break;
    case MODES.CATALOGUE:
      router.push({ name: 'catalogue' });
      break;
  }
}

function isSelectionInvalid() {
  let isInvalid = false;
  
  if (!selectedCourse.value) {
    isCourseInvalid.value = true;
    isInvalid = true;
  } else if (selectedCourse.value && !selectedProject.value) {
    isProjectInvalid.value = true;
    isInvalid = true;
  }
  
  return isInvalid;
}

async function createTpa() {
  if (isSelectionInvalid()) return;

  let tpaTemplate = null;

  try {
    tpaTemplate = await axios.get(`${process.env.ASSETS_MANAGER_URL}/api/v1/public/renders/tpa/${selectedCourse.value.classId}.json`)
  } catch (error) {
    if (error.response.status === 404) {
      console.log(`There is no "public/renders/tpa/${selectedCourse.value.classId}.json" file in the assets manager. Using the default template instead...`)
      tpaTemplate = await axios.get(`${process.env.ASSETS_MANAGER_URL}/api/v1/public/renders/tpa/template.json`).catch(error => {
        toast.add({ severity: 'error', summary: 'Error', detail: 'TPA could not be created.', life: 3000 });
      });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'TPA could not be created.', life: 3000 });
    }
  }

  const tpa = JSON.parse(JSON.stringify(tpaTemplate.data).replace(/1010101010/g, selectedProject.value.projectId).replace(/2020202020/g, selectedCourse.value.classId));

  await axios.post(process.env.REGISTRY_URL + "/api/v6/agreements", tpa)

  if (switchToEditionAfterCreation.value) {
    router.push({ name: 'edition', params: { courseId: selectedCourse.value.classId, projectId: selectedProject.value.projectId } });
  } else {
    projectsWithTpas.value.push({ projectId: selectedProject.value.projectId });
    projectsWithTpas.value.sort((a, b) => a.projectId.localeCompare(b.projectId));
    projectsWithoutTpas.value = projectsWithoutTpas.value.filter(project => project.projectId !== selectedProject.value.projectId);
    projectsWithoutTpas.value.sort((a, b) => a.projectId.localeCompare(b.projectId));
    toast.add({ severity: 'success', summary: 'Confirmed', detail: 'TPA created!', life: 3000 });
  }
}

async function deleteSelectedTpa() {
  if (isSelectionInvalid()) return;
  
  try {
    await axios.delete(`${process.env.REGISTRY_URL}/api/v6/agreements/tpa-${selectedProject.value.projectId}`)
    toast.add({ severity: 'success', summary: 'Confirmed', detail: 'TPA deleted!', life: 3000 });
    projectsWithTpas.value = projectsWithTpas.value.filter(project => project.projectId !== selectedProject.value.projectId);
    projectsWithoutTpas.value.push({ projectId: selectedProject.value.projectId })
    projectsWithoutTpas.value.sort((a, b) => a.projectId.localeCompare(b.projectId));
    selectedProject.value = null;
    agreement.value = null;
  } catch (error) {
    console.log("Error: ", error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'TPA could not be deleted.', life: 3000 });
  }
  
}

function navigateToTpaView() {
  if (isSelectionInvalid()) return;

  emits("tpaChange")
  
  const routeParams = {
    courseId: selectedCourse.value.classId,
    projectId: selectedProject.value.projectId
  };

  router.push({ name: props.mode, params: routeParams });
  // If already in the URL, update the agreement info
  getAgreement();
}

function clearErrors() {
  isCourseInvalid.value = false;
  isProjectInvalid.value = false;
}

function confirmSaveTpaChanges(event) {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you wish to save the current changes?',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      tpaEditionStore.saveTpaChanges().then(() => {
        toast.add({ severity: 'success', summary: 'Confirmed', detail: 'Changes saved!', life: 3000 });
      }).catch(error => {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Changes could not be saved.', life: 3000 });
      });
    }
  });
}

function confirmDiscardTpaChanges(event) {
  confirm.require({
    target: event.currentTarget,
    message: 'Are you sure you want to discard the current changes?',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      tpaEditionStore.discardTpaChanges().catch(error => {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Changes could not be discarded.', life: 3000 });
      });
    }
  });
}

function updateLocalStorageEnvironment() {
  localStorage.setItem('isProductionEnvironment', isProductionEnvironment.value);
}
  
</script>

<template>
  
  <Toast position="bottom-right" />
  <ConfirmPopup></ConfirmPopup>
  
  <Dialog v-if="isDialog" v-model:visible="displayDialog" header="Select a TPA" modal :draggable="false" :closable="false" :dismissable-mask="true" :breakpoints="{ '960px': '75svw'}" style="width: 30svw">
    <template #header>
      <h2 class="mb-0 font-bold">Select a {{ !selectedCourse || isCourseInvalid ? 'course' : 'project' }}</h2>
    </template>

    <template #default>
      <div style="display: grid; gap: 0.5rem;">
        <Dropdown class="overflow-hidden" :class="isCourseInvalid && 'p-invalid'" v-model="selectedCourse" :options="courses" optionLabel="classId" placeholder="Select a course" filter @change="clearErrors(); getProjectsWithTpas();" />
        <small class="p-error" v-if="isCourseInvalid">You must select a course.</small>
        <Dropdown class="overflow-hidden" :class="[(!selectedCourse && 'p-disabled '), (isProjectInvalid && 'p-invalid')].join(' ')" v-model="selectedProject" :options="mode !== 'creation' ? projectsWithTpas : projectsWithoutTpas" optionLabel="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" @change="clearErrors" />
        <small class="p-error" v-if="isProjectInvalid">You must select a project.</small>
        
        <div v-if="mode === 'creation'" class="flex align-items-center gap-2 pb-1">
          <Checkbox v-model="switchToEditionAfterCreation" :binary="true" inputId="switchToEditionAfterCreation" />
          <label for="switchToEditionAfterCreation">Switch to edition mode after creation?</label> 
        </div>
      </div>
    </template>
    
    <template #footer>
      <div class="flex justify-content-end">
        <Button v-if="mode === 'creation'" icon="pi pi-wrench" label="Create agreement" severity="success" @click="createTpa" />
        <Button v-else-if="mode === 'deletion'" icon="pi pi-trash" label="Delete agreement" severity="danger" @click="deleteSelectedTpa" />
        <Button v-else-if="mode === 'visualization'" icon="pi pi-search" label="Display agreement" severity="primary" @click="navigateToTpaView" />
        <Button v-else-if="mode === 'edition'" icon="pi pi-pencil" label="Edit agreement" severity="warning" @click="navigateToTpaView" />
        <Button icon="pi pi-times" label="Cancel" severity="secondary" @click="displayDialog = false" />
      </div>
    </template>
  </Dialog>
  
  <div class="col-12 flex pt-2 p-0" v-if="!isDialog">
    <div class="card p-3 mb-2" style="width: 100%; display: grid; grid-auto-flow: column; grid-auto-columns: auto auto 1fr auto auto; align-items: end; overflow: auto;">
      
      <div class="flex flex-column gap-2">
        <Dropdown class="border-none border-bottom-3" v-model="selectedMode" :options="modes" optionLabel="label" optionValue="value" placeholder="Select a mode" scrollHeight="300px" @change="changeViewByMode">
          <template #value="slotProps">
            <h3 class="mb-0">
              {{slotProps.value}}
            </h3>
          </template>
        </Dropdown>
        
        <ToggleButton v-if="mode === 'edition'" id="selectEnvironmentButton" v-model="tpaEditionStore.isProductionEnvironment" onLabel="Production environment" offLabel="Development environment" onIcon="pi pi-cloud" offIcon="pi pi-cog" @click="updateLocalStorageEnvironment" />
      </div>
      
      <Divider layout="vertical"/>
      
      <div class="flex" style="align-items: inherit;">
        <div style="display: grid; gap: 0.25rem; flex: 1 1 auto;">
          <label for="dd-classId">Course</label>
          <Dropdown inputId="dd-classId" :class="[isCourseInvalid && 'p-invalid', 'mr-2'].join(' ')" v-model="selectedCourse" :options="courses" optionLabel="classId" placeholder="Select a course" filter @change="getProjectsWithTpas()" />
          <small class="p-error" v-if="isCourseInvalid">You must select a course.</small>
        </div>
        
        <div style="display: grid; gap: 0.25rem; flex: 1 1 auto;">
          <label for="dd-projectId">Project</label>
          <Dropdown inputId="dd-projectId" :class="[(!selectedCourse && 'p-disabled '), (isProjectInvalid && 'p-invalid'), 'mr-2'].join(' ')" v-model="selectedProject" :options="projectsWithTpas" optionLabel="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" @change="clearErrors" />
          <small class="p-error" v-if="isProjectInvalid">You must select a project.</small>
        </div>
        
        <Button v-if="mode === 'visualization'" icon="pi pi-search" label="Display agreement" severity="primary" @click="navigateToTpaView" />
        <Button v-if="mode === 'edition'" icon="pi pi-pencil" label="Edit agreement" severity="warning" @click="navigateToTpaView" />
      </div>
      
      <Divider layout="vertical"/>
      
      <div style="display: grid; gap: 0.5rem; grid-template-areas: 'saveChanges collapseAll viewTpaJson' 'discardChanges expandAll toggleTheme'; align-items: center;">
        <template v-if="mode === 'edition'">
          <Button title="Save changes" icon="pi pi-save" severity="success" @click="confirmSaveTpaChanges($event)" style="grid-area: saveChanges;" />
          <Button title="Discard changes" icon="pi pi-times" severity="danger" @click="confirmDiscardTpaChanges" style="grid-area: discardChanges;" />
        </template>

        <Button title="Collapse all" icon="pi pi-angle-double-up" severity="secondary" @click="$emit('collapseAllClick')" style="grid-area: collapseAll;" />
        <Button title="Expand all" icon="pi pi-angle-double-down" severity="secondary" @click="$emit('expandAllClick')" style="grid-area: expandAll;" />
        <a :href="REGISTRY_URL + '/api/v6/agreements/tpa-' + selectedProject?.projectId" target="_blank" style="grid-area: viewTpaJson;">
          <Button title="View TPA in JSON" icon="pi pi-eye" severity="secondary" />
        </a>
        <Button title="Toggle theme" :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')" severity="secondary" @click="appThemeStore.toggleTheme()" style="grid-area: toggleTheme;" />
      </div>
      
    </div>
  </div>
  
</template>