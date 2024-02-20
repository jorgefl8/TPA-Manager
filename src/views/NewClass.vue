<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppThemeStore } from '@/stores/appTheme';

import Button from 'primevue/button'
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import axios from 'axios';
import InputSwitch from 'primevue/inputswitch';
const appThemeStore = useAppThemeStore();

const isMobile = ref(window.innerWidth <= 768);

const class_name = ref(null);

const templates = ref([]);
const auto_run = ref(false);
const tpa_hidden = ref(false);
const selected_template = ref(null);
const updateIsMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
    getTemplates();
    window.addEventListener('resize', updateIsMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile);
});

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
            "coursesInUse": ["Curso de Literatura", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte", "Curso de Historia", "Curso de Arte"]
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
                Create a new class
                <Button v-if="isMobile" :icon="'pi pi-' + (appThemeStore.isDarkModeOn ? 'moon' : 'sun')"
                    @click="appThemeStore.toggleTheme()" aria-label="Switch app theme" outlined />
                <i v-if="!isMobile" class="pi pi-plus-circle" style="font-size: 2.5rem"></i>
            </div>
            <Divider layout="horizontal" />
            <div class="content">
                <div class="flex flex-column gap-2">
                    <label for="class-name">Class name</label>
                    <InputText id="class-name" v-model="class_name" />
                </div>
                <div class="flex flex-column gap-2">
                    <label for="selected_template">Select a template</label>
                    <Dropdown v-model="selected_template" :options="templates" showClear filter optionLabel="templateId">
                    </Dropdown>
                </div>
                <div class="flex flex-row gap-2">
                    <label for="auto_run">Auto-run:</label>
                    <InputSwitch v-model="auto_run" :pt="{
                        slider: ({ props }) => ({
                            class: props.modelValue ? 'bg-green-400' : 'bg-gray-300'
                        })
                    }" />
                </div>
                <div class="flex flex-row gap-2">
                    <label for="tpa_hidden">TPA Hidden:</label>
                    <InputSwitch v-model="tpa_hidden" :pt="{
                        slider: ({ props }) => ({
                            class: props.modelValue ? 'bg-green-400' : 'bg-gray-300'
                        })
                    }" />
                </div>
                <div class="buttons">
                    <Button class="no-hover" label="Create" @click="editTemplate(template)" icon="pi pi-check" :pt="{
                        root: { class: 'bg-green-400 border-green-400 hover:bg-green-500' }
                    }" />
                    <Button class="no-hover" icon="pi pi-times" severity="danger" />
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

.buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.card {
    margin: 2% 10%;
    min-width: 75vw;
    max-width: calc(100vw - 20%);
    min-height: 75vh;
    max-height: auto;
}

.content {
    display: grid;
    justify-content: center;
    gap: 20px;
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

@media screen and (max-width: 768px) {
    .card {
        margin: 5% 5%;
        min-width: 80vw;
        max-width: calc(100vw - 10%);
        min-height: 95vh;
    }
}
</style>