<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios'

import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';

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

const MODES = {
  HOME: "Home",
  VISUALIZATION: "🔎 Visualization Mode",
  EDITION: "✏️ Edition Mode",
  CATALOGUE: "TPs Catalogue"
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
const modes = ref([
  { label: 'Home', value: MODES.HOME},
  { label: 'Visualization', value: MODES.VISUALIZATION },
  { label: 'Edition', value: MODES.EDITION },
  { label: 'Catalogue', value: MODES.CATALOGUE }
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

</script>

<template>
  <Dialog v-if="props.isDialog" v-model:visible="displayDialog" header="Select a TPA" modal :draggable="false" :dismissable-mask="true" :breakpoints="{ '960px': '75svw'}" style="width: 40svw">
    <template #header>
      <div class="flex">
        <h1>Select a TPA</h1>
      </div>
    </template>
    
      <div class="flex">
        <div class="flex flex-column mr-2" style="min-width: 33%;">
          <Dropdown :class="isCourseInvalid && 'p-invalid'" v-model="selectedCourse" :options="courses" optionLabel="classId" placeholder="Select a course" filter @change="clearErrors" />
          <small class="p-error" v-if="isCourseInvalid">You must select a course.</small>
        </div>
        <div class="flex flex-column" style="min-width: 66%;">
          <Dropdown :class="[(!selectedCourse && 'p-disabled '), (isProjectInvalid && 'p-invalid')].join(' ')" v-model="selectedProject" :options="selectedCourse?.projects" optionLabel="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" @change="clearErrors" />
          <small class="p-error" v-if="isProjectInvalid">You must select a project.</small>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-content-end">
        <Button :label="(props.isVisualizationMode ? 'Display' : 'Edit') + ' agreement'" :icon="'pi pi-' + (props.isVisualizationMode ? 'search' : 'pencil')" @click="submit" />
        <Button label="Cancel" icon="pi pi-times" @click="displayDialog = false" />
      </div>
    </template>
  </Dialog>

  <div id="topbar-container" class="col-12 flex" v-if="!props.isDialog">
    <div id="topbar" class="card flex align-items-end justify-content-between overflow-auto" style="width: 100%">
      <div class="mr-3 align-self-center">
        <Dropdown class="mr-2 align-self-center border-none border-bottom-3" v-model="selectedMode" :options="modes" optionLabel="label" optionValue="value" placeholder="Select a mode" scrollHeight="300px" @change="changeViewByMode">
          <template #value="slotProps">
            <h1 class="mb-0">
              {{slotProps.value}}
            </h1>
          </template>
        </Dropdown>
      </div>

      <Divider layout="vertical"/>

      <div class="flex py-2 align-items-end justify-content-around">
        <div class="flex flex-column" style="width: 20%;">
          <label for="dd-classId">Course</label>
          <Dropdown inputId="dd-classId" :class="[isCourseInvalid && 'p-invalid', 'mr-2'].join(' ')" v-model="selectedCourse" :options="courses" optionLabel="classId" placeholder="Select a course" filter @change="clearSelectedProject" />
          <small class="p-error" v-if="isCourseInvalid">You must select a course.</small>
        </div>
        <div class="flex flex-column" style="width: 50%;">
          <label for="dd-projectId">Project</label>
          <Dropdown inputId="dd-projectId" :class="[(!selectedCourse && 'p-disabled '), (isProjectInvalid && 'p-invalid'), 'mr-2'].join(' ')" v-model="selectedProject" :options="selectedCourse?.projects" optionLabel="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" @change="clearErrors" />
          <small class="p-error" v-if="isProjectInvalid">You must select a project.</small>
        </div>
        <Button :label="(props.isVisualizationMode ? 'Display' : 'Edit') + ' agreement'" :icon="'pi pi-' + (props.isVisualizationMode ? 'search' : 'pencil')" @click="getAgreement" />
      </div>

      <Divider layout="vertical"/>

      <div class="flex py-2 justify-content-center gap-3">
        <Button label="Collapse all" @click="$emit('collapseAllClick')" icon="pi pi-angle-double-up" />
        <Button label="Expand all" @click="$emit('expandAllClick')" icon="pi pi-angle-double-down" />
      </div>
      
    </div>
  </div>
</template>

<style scoped>
  h1 {
    font-size: clamp(1.5rem, 2vw, 10rem) !important;
  }
</style>