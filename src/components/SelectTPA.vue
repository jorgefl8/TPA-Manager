<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'

import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';

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

const courses = ref([]);
const selectedCourse = ref();
const projectId = ref('');
const isCourseInvalid = ref(false);
const isProjectInvalid = ref(false);
const displayDialog = ref(false);

defineExpose({
  displayDialog,
  courses,
  selectedCourse,
  projectId
});

onMounted(() => {
  getCourses();
});

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

function submit() {
  if (!selectedCourse.value) {
    isCourseInvalid.value = true;
  } else if (selectedCourse.value && !projectId.value) {
    isProjectInvalid.value = true;
  } else {
    const routeParams = {
        courseId: selectedCourse.value.classId,
        projectId: projectId.value
    };
  
    router.push({ name: props.isVisualizationMode ? 'visualization' : 'edition', params: routeParams });
  }
}

function clearErrors() {
  isCourseInvalid.value = false;
  isProjectInvalid.value = false;
}

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
          <Dropdown :class="(!selectedCourse && 'p-disabled ') + (isProjectInvalid && 'p-invalid')" v-model="projectId" :options="selectedCourse?.projects" optionLabel="projectId" optionValue="projectId" placeholder="Select a project" scrollHeight="300px" filter :autoFilterFocus="true" @change="clearErrors" />
          <small class="p-error" v-if="isProjectInvalid">You must select a project.</small>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-content-end">
        <Button :label="(props.isVisualizationMode ? 'Visualize' : 'Edit') + ' agreement'" :icon="'pi pi-' + (props.isVisualizationMode ? 'search' : 'pencil')" @click="submit" />
        <Button label="Cancel" icon="pi pi-times" @click="displayDialog = false" />
      </div>
    </template>
  </Dialog>
</template>