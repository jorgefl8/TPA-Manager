<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppThemeStore } from '@/stores/appTheme';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import JsonEditorVue from 'json-editor-vue'
import Checkbox from 'primevue/checkbox';
import DataView from 'primevue/dataview';
import Fieldset from 'primevue/fieldset';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

const props = defineProps({
    config: {
        type: Object,
        required: true
    },
    fieldName: {
        type: String,
        required: true
    }
});

const router = useRouter();
const appThemeStore = useAppThemeStore();
const tpaEditionStore = useTpaEditionStore();
// const { originalTpa, modifiedTpa } = storeToRefs(tpaEditionStore);

const projectId = tpaEditionStore.getTpaField('context.definitions.scopes.development.project.default');
const isEditionMode = ref(router.currentRoute.value.name.includes('edition'));
const dashboardBlocks = ref(Object.values(tpaEditionStore.getTpaField(props.fieldName)?.blocks ?? {}))
const useDefaultDashboard = ref(!dashboardBlocks.value);
const dashboardBlocksCache = ref(JSON.parse(localStorage.getItem("dashboardBlocks") ?? "{}")?.[projectId] || dashboardBlocks.value);
const isDarkModeOn = ref(localStorage.getItem("appTheme") === 'Dark');

const collapsed = ref(new Array(dashboardBlocks.value.length).fill(true));

defineExpose({
    collapseAll,
    expandAll
});

function collapseAll() {
    collapsed.value.map((value, index) => collapsed.value[index] = true);
}

function expandAll() {
    collapsed.value.map((value, index) => collapsed.value[index] = false);
}

function refreshLocalStorageInfo() {
    if (useDefaultDashboard.value) {
        let currentCache = JSON.parse(localStorage.getItem("dashboardBlocks") ?? "{}");
        currentCache[projectId] = dashboardBlocks.value;

        localStorage.setItem("dashboardBlocks", JSON.stringify(currentCache));
        tpaEditionStore.updateTpaField(props.fieldName, {});
    } else {
        localStorage.getItem("dashboardBlocks") ?? {};
        dashboardBlocksCache.value = JSON.parse(localStorage.getItem("dashboardBlocks") ?? "{}")?.[projectId] || dashboardBlocks.value;

        const blocks = dashboardBlocks.value.reduce((acc, value, index) => ({ ...acc, [index]: value }), {});
        tpaEditionStore.updateTpaField(props.fieldName, {configDashboard: true, blocks});
    }
}

// Deep search in an object for a key that includes the given keyword in its name
function deepFindKey(keyword, obj) {
    for (var key in obj) {
        if (key.includes(keyword)) {
            return obj[key];
        }
        if (typeof obj[key] === "object") {
            var result = deepFindKey(keyword, obj[key]);
            if (result) {
                return result;
            }
        }
    }
}
</script>

<template>

    <p class="mb-2">Use the default dashboard blocks?
        <Checkbox class="ml-2" v-model="useDefaultDashboard" :binary="true" :readonly="!isEditionMode" @change="refreshLocalStorageInfo" />
    </p>

    <DataView v-if="!useDefaultDashboard" :value="dashboardBlocks" dataKey="id" class="pr-2">
        <template #list="slotProps">
            <Fieldset class="col-12 my-2" :legend="deepFindKey('title', slotProps.data)" :toggleable="true" :collapsed="collapsed[slotProps.index]" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
                <div class="flex flex-column xl:flex-row xl:align-items-start gap-4">
                    <div class="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div class="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-star"></i>
                                    <span class="font-semibold">Type:</span>
                                    <Tag v-if="!isEditionMode" :value="slotProps.data.type"></Tag>
                                    <Dropdown class="editDropdown" v-else v-model="slotProps.data.type" :options="tpaEditionStore.BLOCK_TYPES" placeholder="Select a type" @change="refreshLocalStorageInfo" />
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3" v-if="slotProps.data.guarantee">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-tag"></i>
                                    <span class="font-semibold">Guarantee:</span>
                                    <Tag v-if="!isEditionMode" :value="slotProps.data.guarantee"></Tag>
                                    <Dropdown class="editDropdown" v-else v-model="slotProps.data.guarantee" :options="tpaEditionStore.getTpaField('terms.guarantees').map(guarantee => guarantee.id)" placeholder="Select a guarantee" @change="refreshLocalStorageInfo" />
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3" v-if="slotProps.data.config">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-wrench"></i>
                                    <span class="font-semibold">Config:</span>
                                    <ul v-if="!isEditionMode" class="my-0">
                                        <li class="text-md font-bold text-700" v-for="(value, key) in slotProps.data.config" :key="key">{{ key }}: {{ value }}</li>
                                    </ul>
                                    <JsonEditorVue :class="appThemeStore.isDarkModeOn && 'jse-theme-dark'" v-model="slotProps.data.config" mode="text" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Fieldset>
        </template>
    </DataView>
</template>

<!-- Convertir el tipo y la garantía en un Dropdown para poder mostrar el valor actual y editarlo si lo desea el usuario -->
<!-- Establecer una serie de convenios, como el identificador del título del block, ayudaría a generalizar todo -->
<!-- Establecer el valor de la "scope-class" de las "config" de cada block con el curso al que pertenece el proyecto del acuerdo -->
<!-- Hacer un estudio de cada uno de los blocks actuales para ver qué tipo de parámetros de configuración aceptan, para poder así facilitar al usuario 
     la interacción con los mismos. Ejemplo: "x-axis-metric", "y-axis-metric" y "not-zero-metric" podrían tener un Dropdown con las métricas que se 
     encuentran definidas actualmente en la garantía para poder elegir entre las mismas. -->
<!-- Añadir un botón para añadir un nuevo bloque -->
<!-- Añadir un botón para eliminar un bloque -->
<!-- Añadir un botón para editar un bloque -->
<!-- Añadir un botón para guardar los cambios -->
<!-- Añadir un botón para cancelar los cambios -->