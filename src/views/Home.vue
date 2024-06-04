<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import { useToast } from "primevue/usetoast";
import NavMenu from '@/components/NavMenu.vue';
import { bluejayInfraStore } from '@/stores/bluejayInfra';
import TreeBrowser from '@/components/TreeBrowser.vue';
import ProgressSpinner from 'primevue/progressspinner';
import { changeShowHidden } from '@/utils/showHiddenCourses.js';

const { showHiddenCourses } = changeShowHidden();
const loading = ref(true);
const courses = ref();
const toast = useToast();
const bluejayInfra = bluejayInfraStore();
const isMobile = ref(window.innerWidth <= 768);
const coursesURL = ref(bluejayInfra.SCOPE_MANAGER_URL + "/api/v1/scopes/development/courses");
const updateIsMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};
onMounted(() => {
    getCourses();
    window.addEventListener('resize', updateIsMobile);
});
onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile);
});
watch(showHiddenCourses, () => {
    getCourses();  // Recargar cursos cuando showHiddenCourses cambia
});
async function getCourses() {
    await axios.get(coursesURL.value, {
        headers: {
            'Content-Type': 'application/json', 'Authorization': `${localStorage.getItem('auth')}`
        }
    }).then(async (response) => {
        courses.value = response.data.scope.sort((a, b) => a.classId.localeCompare(b.classId));
        courses.value = [{
            "name": "Classes",
            "children": courses.value //.filter(course => course.hidden === showHiddenCourses.value)
        }];
        setTimeout(() => {
            loading.value = false;
        }, 500);
    })
        .catch(error => {
            console.log("Error: ", error);
        });
}


const showAlert = (message, severity) => {
    toast.add({ severity: severity, summary: message, life: 3000 });
};
</script>
<template>
    <div style="display: grid; justify-items: center;">
        <div class="card ">
            <NavMenu @auth-updated="getCourses" />
            <Divider layout="horizontal" />
            <div v-if="loading" class="flex flex-column m-5">
                <ProgressSpinner class="text-center" strokeWidth="4" />
                <h3 class="text-center">Loading...</h3>
            </div>
            <TreeBrowser v-else :nodes="courses"/>
            <Toast ref="toast" :position="isMobile ? 'bottom-left' : 'bottom-right'" :baseZIndex="10000" />
        </div>
    </div>
</template>

<style scoped></style>