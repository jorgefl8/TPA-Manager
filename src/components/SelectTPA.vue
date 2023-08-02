<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppThemeStore } from '@/stores/appTheme';
import { useTpaEditionStore } from '@/stores/tpaEdition';
import axios from 'axios'

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import ToggleButton from 'primevue/togglebutton';

const props = defineProps({
  isDialog: {
    type: Boolean
  },
  isVisualizationMode: {
    type: Boolean,
    required: true
  }
});

const router = useRouter();
const route = useRoute();
const appThemeStore = useAppThemeStore();
const tpaEditionStore = useTpaEditionStore();

const MODES = {
  HOME: "🏠 Home",
  VISUALIZATION: "🔍 Visualization",
  EDITION: "✏️ Edition",
  CATALOGUE: "📖 TPs Catalogue"
};

const courses = ref([]);
const selectedCourse = ref();
const selectedProject = ref();
const courseId = ref(route.params.courseId);
const projectId = ref(route.params.projectId);
const agreement = ref();
const isCourseInvalid = ref(false);
const isProjectInvalid = ref(false);
const displayDialog = ref(false);
const selectedMode = ref(getSelectedModeFromUrl());
const showDiscardChangesDialog = ref(false);
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

const emits = defineEmits(['collapseAllClick', 'expandAllClick']);

onMounted(() => {
  getCourses();
});

watch([selectedProject], () => {
  if (selectedCourse && selectedProject && !props.isDialog) {
    const routeParams = {};
    routeParams.courseId = selectedCourse.value.classId;
    routeParams.projectId = selectedProject.value?.projectId;
    
    router.push({ name: (props.isVisualizationMode ? 'visualization' : 'edition'), params: routeParams });
  } 
});

function getSelectedModeFromUrl() {
  const routeName = route.name;
  switch(routeName) {
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
  axios.get("http://localhost:5700/api/v1/scopes/development/courses")
    .then(response => {
      courses.value = response.data.scope;
      if (courseId.value) selectedCourse.value = courses.value.find(course => course.classId === courseId.value);
      if (projectId.value) selectedProject.value = selectedCourse.value.projects.find(project => project.projectId === projectId.value);
      if (selectedCourse.value && selectedProject.value) getAgreement();
      if (!selectedCourse.value && !props.isDialog) isCourseInvalid.value = true;
      if (!selectedProject.value && !props.isDialog) isProjectInvalid.value = true;
      
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
  if (!selectedCourse.value && !props.isDialog) isCourseInvalid.value = true;
  else if (!selectedProject.value && !props.isDialog) isProjectInvalid.value = true;
  else {
    axios.get(`http://localhost:5400/api/v6/agreements/tpa-${selectedProject.value.projectId}`)
    .then(response => {
      agreement.value = response.data;
      tpaEditionStore.setInitialTpaData(agreement.value);
    })
    .catch(error => {
      console.log("Error: ", error);
    });
  } 
}

function changeViewByMode() {
  switch(selectedMode.value) {
    case MODES.HOME:
      router.push({ name: 'home' });
      break;
    case MODES.VISUALIZATION:
      router.push({ name: 'visualization', params: { courseId: courseId.value, projectId: selectedProject.value.projectId } });
      break;
    case MODES.EDITION:
      router.push({ name: 'edition', params: { courseId: courseId.value, projectId: selectedProject.value.projectId } });
      break;
    case MODES.CATALOGUE:
      router.push({ name: 'catalogue' });
      break;
  }
}

function submit() {
  if (!selectedCourse.value) {
    isCourseInvalid.value = true;
  } else if (selectedCourse.value && !selectedProject.value) {
    isProjectInvalid.value = true;
  } else {
    const routeParams = {
        courseId: selectedCourse.value.classId,
        projectId: selectedProject.value.projectId
    };

    router.push({ name: props.isVisualizationMode ? 'visualization' : 'edition', params: routeParams });
  }
}

function clearErrors() {
  isCourseInvalid.value = false;
  isProjectInvalid.value = false;
}

function clearSelectedProject() {
  if (selectedCourse) {
    selectedProject.value = null;
    agreement.value = null;
  }
};

function showDiscardTpaChangesDialog() {
  showDiscardChangesDialog.value = true;
}

</script>

<template>
  <Dialog v-if="isDialog" v-model:visible="displayDialog" header="Select a TPA" modal :draggable="false" :closable="false" :dismissable-mask="true" :breakpoints="{ '960px': '75svw'}" style="width: 30svw">
    <template #header>
        <h2 class="mb-0 font-bold">Select a TPA</h2>
    </template>
    
      <div style="display: grid; gap: 0.5rem;">
          <Dropdown class="overflow-hidden" :class="isCourseInvalid && 'p-invalid'" v-model="selectedCourse" :options="courses" optionLabel="classId" placeholder="Select a course" filter @change="clearErrors" />
          <small class="p-error" v-if="isCourseInvalid">You must select a course.</small>
          <Dropdown class="overflow-hidden" :class="[(!selectedCourse && 'p-disabled '), (isProjectInvalid && 'p-invalid')].join(' ')" v-model="selectedProject" :options="selectedCourse?.projects" optionLabel="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" @change="clearErrors" />
          <small class="p-error" v-if="isProjectInvalid">You must select a project.</small>
      </div>
      
      <template #footer>
        <div class="flex justify-content-end">
        <Button :icon="'pi pi-' + (isVisualizationMode ? 'search' : 'pencil')" :label="(isVisualizationMode ? 'Display' : 'Edit') + ' agreement'" :severity="isVisualizationMode ? 'primary' : 'warning'" @click="submit" />
        <Button icon="pi pi-times" label="Cancel" severity="danger" @click="displayDialog = false" />
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

        <ToggleButton v-if="!isVisualizationMode" id="selectEnvironmentButton" v-model="tpaEditionStore.isProductionEnvironment" onLabel="Production environment" offLabel="Development environment" onIcon="pi pi-cloud" offIcon="pi pi-cog" />
      </div>

      <Divider layout="vertical"/>

      <div class="flex" style="align-items: inherit;">
        <div style="display: grid; gap: 0.25rem; flex: 1 1 auto;">
          <label for="dd-classId">Course</label>
          <Dropdown inputId="dd-classId" :class="[isCourseInvalid && 'p-invalid', 'mr-2'].join(' ')" v-model="selectedCourse" :options="courses" optionLabel="classId" placeholder="Select a course" filter @change="clearSelectedProject" />
          <small class="p-error" v-if="isCourseInvalid">You must select a course.</small>
        </div>
        <div style="display: grid; gap: 0.25rem; flex: 1 1 auto;">
          <label for="dd-projectId">Project</label>
          <Dropdown inputId="dd-projectId" :class="[(!selectedCourse && 'p-disabled '), (isProjectInvalid && 'p-invalid'), 'mr-2'].join(' ')" v-model="selectedProject" :options="selectedCourse?.projects" optionLabel="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" @change="clearErrors" />
          <small class="p-error" v-if="isProjectInvalid">You must select a project.</small>
        </div>
        <Button :icon="'pi pi-' + (isVisualizationMode ? 'search' : 'pencil')" :severity="isVisualizationMode ? 'primary' : 'warning'" @click="getAgreement" />
      </div>

      <Divider layout="vertical"/>

      <div style="display: grid; gap: 0.5rem; grid-template-areas: 'saveChanges collapseAll viewTpaJson' 'discardChanges expandAll toggleTheme'; align-items: center;">
        <Button v-if="!isVisualizationMode" title="Save changes" icon="pi pi-save" severity="success" @click="tpaEditionStore.saveTpaChanges" style="grid-area: saveChanges;" />
        <Button v-if="!isVisualizationMode" title="Discard changes" icon="pi pi-times" severity="danger" @click="showDiscardTpaChangesDialog" style="grid-area: discardChanges;" />
        <Button title="Collapse all" icon="pi pi-angle-double-up" severity="secondary" @click="$emit('collapseAllClick')" style="grid-area: collapseAll;" />
        <Button title="Expand all" icon="pi pi-angle-double-down" severity="secondary" @click="$emit('expandAllClick')" style="grid-area: expandAll;" />
        <a :href="'http://localhost:5400/api/v6/agreements/tpa-' + selectedProject?.projectId" target="_blank" style="grid-area: viewTpaJson;">
          <Button title="View TPA in JSON" icon="pi pi-eye" severity="secondary" />
        </a>
        <Button title="Toggle theme" :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')" severity="secondary" @click="appThemeStore.toggleTheme()" style="grid-area: toggleTheme;" />
      </div>
      
    </div>
  </div>

  <Dialog v-if="showDiscardChangesDialog" v-model:visible="showDiscardChangesDialog" header="Discard changes" modal :draggable="false" :closable="false" :dismissable-mask="true" :breakpoints="{ '960px': '75svw'}" style="width: 30svw">
    <template #header>
      <h2 class="mb-0 font-bold">Discard changes</h2>
    </template>
    
    <div class="mb-1" style="display: grid; gap: 1rem;">
      <div>
        <p class="mb-1"><b>Are you sure you want to discard the changes?</b></p>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-content-end">
        <Button icon="pi pi-check" label="Yes" severity="success" @click="tpaEditionStore.discardTpaChanges" />
        <Button icon="pi pi-times" label="No" severity="danger" @click="showDiscardChangesDialog = false" />
      </div>
    </template>
  </Dialog>

</template>