<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppThemeStore } from '@/stores/appTheme';

import Button from 'primevue/button'
import Divider from 'primevue/divider';
import axios from 'axios'
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';

const appThemeStore = useAppThemeStore();

const templates = ref([]);

const isMobile = ref(window.innerWidth <= 768);

const updateIsMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

async function getTemplates() {
    await axios.get(process.env.REGISTRY_URL + "/api/v6/agreements")
        .then(async (response) => {
            templates.value = response.data.sort((a, b) => a.id.localeCompare(b.id));
        })
        .catch(error => {
            console.log("Error: ", error);
        });
    templates.value = [
        {
            "templateId": "template_1",
            "coursesInUse": ["Curso de Matemáticas", "Curso de Física"]
        },
        {
            "templateId": "template_2",
            "coursesInUse": ["Curso de Literatura", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "cardio", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "cardio", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "cardio"]
        },
        {
            "templateId": "template_3",
            "coursesInUse": []
        },
        {
            "templateId": "template_4",
            "coursesInUse": ["Curso de Programación", "Curso de Diseño Gráfico"]
        },
        {
            "templateId": "template_5",
            "coursesInUse": ["Curso de Biología", "Curso de Medicina"]
        }
    ]

}

onMounted(() => {
    getTemplates();
    window.addEventListener('resize', updateIsMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile);
});


</script>

<template>
    <div style="display: grid; justify-items: center;">
        <Button v-if="!isMobile" class="absolute ml-3 mt-2 left-0 top-0" icon="pi pi-home"
            @click="$router.push({ name: 'home' })" outlined />
        <Button v-if="!isMobile" class="absolute mr-3 mt-2 right-0 top-0"
            :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')" @click="appThemeStore.toggleTheme()"
            aria-label="Switch app theme" outlined />
        <div class="card">
            <div class="header">
                <Button v-if="isMobile" icon="pi pi-home" @click="$router.push({ name: 'home' })" outlined />
                Templates Management
                <Button v-if="isMobile" :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')"
                    @click="appThemeStore.toggleTheme()" aria-label="Switch app theme" outlined />
                <img v-if="!isMobile" src="/templates-logo.png" width="60" />
            </div>
            <div class="buttons">
                <Button label="New Template" icon="pi pi-plus" outlined />
                <Button class="mr-3 ml-3" label="Scope Management" icon="pi pi-wrench" outlined />
            </div>
            <Divider layout="horizontal" />
            <div class="content">
                <div v-for="template in templates" :key="template.templateId" class="template-card">
                    <div class="card-header">
                        {{ template.templateId }}
                    </div>
                    <div v-if="template.coursesInUse.length > 0">
                        <span style="margin-left: 15px;">In use in these classes:</span>
                        <ScrollPanel style="width: 100%; height: 150px"
                            :pt="{ bary: 'hover:bg-green-400 bg-green-400 opacity-70' }">
                            <ul>
                                <li v-for="course in template.coursesInUse" :key="course">
                                    <span @click="$router.push({ name: 'home' })">{{ course }}</span>
                                </li>
                            </ul>
                            <ScrollTop target="parent" :threshold="200" class="no-hover" style="margin-right: 15px;"
                                icon="pi pi-angle-up" />
                        </ScrollPanel>
                    </div>
                    <div v-else style="display: grid; justify-items: center; align-items: center;">
                        <span>Not in use</span>
                        <div class="buttons">
                            <Button class="no-hover" label="Edit" @click="editTemplate(template)" icon="pi pi-pencil"
                                severity="warning" />
                            <Button class="no-hover" label="Delete" @click="deleteTemplate(template)" icon="pi pi-trash"
                                severity="danger" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
Button:not(.no-hover):hover {
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

ul {
    margin: 0 !important;
    padding: 5px 40px;
}

li {
    padding: 2px 0;
}

li span {
    cursor: pointer;
    color: #10B981;
    text-decoration: underline;
}

.content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
}

.card-header {
    font-size: min(max(20px, 4vw), 25px) !important;
}

.template-card {
    flex: 0 1 calc(50% - 20px);
    border: 1px solid #10B981;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 15px;

}

.template-card span {
    font-size: min(max(15px, 4vw), 18px) !important;
}


.header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: min(max(30px, 4vw), 40px) !important;
    gap: 10px;
}

.buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 7px;
}


@media screen and (max-width: 768px) {
    .template-card {
        flex: 0 1 100%;
    }

    .card {
        margin: 5% 5%;
        min-width: 80vw;
        max-width: calc(100vw - 10%);
        min-height: 95vh;
    }
}
</style>