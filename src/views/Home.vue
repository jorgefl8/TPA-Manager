<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppThemeStore } from '@/stores/appTheme';

import Button from 'primevue/button'
import Divider from 'primevue/divider';
import axios from 'axios'
import TreeBrowser from '@/components/TreeBrowser.vue';

const appThemeStore = useAppThemeStore();

const courses = ref([]);
const isMobile = ref(window.innerWidth <= 768);

const updateIsMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};
async function getCourses() {
    await axios.get(process.env.SCOPE_MANAGER_URL + "/api/v1/scopes/development/courses")
        .then(async (response) => {
            courses.value = response.data.scope.sort((a, b) => a.classId.localeCompare(b.classId));
            courses.value = [{
                "name_class": "Classes",
                "children": courses.value
            }];           
        })
        .catch(error => {
            console.log("Error: ", error);
        });
}

onMounted(() => {
    getCourses();
    window.addEventListener('resize', updateIsMobile);
});
onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile);
});

</script>

<template>
    <div style="display: grid; justify-items: center;">
        <Button v-if="!isMobile" class="absolute mr-3 mt-2 right-0 top-0"
            :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')" @click="appThemeStore.toggleTheme()"
            aria-label="Switch app theme" outlined />
        <div class="card ">
            <div class="header">
                Development Scopes
                <Button v-if="isMobile" :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')"
                    @click="appThemeStore.toggleTheme()" aria-label="Switch app theme" outlined />
                <img v-if="!isMobile" src="/app-logo-250-filled.png" width="60" />
            </div>
            <div class="buttons">
                <Button label="New Class" @click="$router.push({ name: 'new-class' })" icon="pi pi-plus" outlined />
                <Button label="Templates Management" @click="$router.push({ name: 'templates-management' })"
                    icon="pi pi-wrench" outlined />
                <Button label="About TPA Manager" icon="pi pi-info-circle" @click="$router.push({ name: 'about' })" outlined />
            </div>
            <Divider layout="horizontal" />
            <TreeBrowser :nodes="courses" />
        </div>
    </div>
</template>

<style scoped>
Button:hover {
    background-color: #43A5F4 !important;
    color: white !important;
    border: 1px solid #43A5F4 !important;
}

.card {
    margin: 2% 10%;
    min-width: 75vw;
    max-width: calc(100vw - 20%);
    min-height: 75vh;
    max-height: auto;
}

.header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    font-size: min(max(30px, 4vw), 40px) !important;
    gap: 10px;
}

.buttons {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 5px;
}

@media screen and (max-width: 768px) {
    .card {
        margin: 5% 5%;
        min-width: 80vw;
        max-width: calc(100vw - 10%);
        min-height: 95vh;
    }
}</style>