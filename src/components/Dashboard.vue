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
import Button from 'primevue/button';
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

function parseDashboardBlockConfig(objectOrJsonString) {
    if (typeof objectOrJsonString === 'string') {
        return JSON.parse(objectOrJsonString);
    } else {
        return objectOrJsonString;
    }
}
</script>

<template>

    <p class="mb-2">Use the default dashboard blocks?
        <Checkbox class="ml-2" v-model="useDefaultDashboard" :binary="true" :disabled="!isEditionMode" :readonly="!isEditionMode" @change="refreshLocalStorageInfo" />
    </p>

    <DataView v-if="!useDefaultDashboard" :value="dashboardBlocks" dataKey="id" class="pr-2">
        <template #list="slotProps">
            <Fieldset class="col-12 my-2" :legend="deepFindKey('title', parseDashboardBlockConfig(slotProps.data.config))" :toggleable="true" :collapsed="collapsed[slotProps.index]" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
                <div style="display: grid; gap: 1rem; align-items: center; grid-template-columns: 30% auto" :class="slotProps.data.guarantee ? 'gridWithGuarantee' : 'gridWithoutGuarantee'">
                    <span class="flex align-items-center gap-2">
                        <i class="pi pi-star"></i>
                        <span class="font-semibold">Type</span>
                    </span>
                    <Tag v-if="!isEditionMode" :value="slotProps.data.type"></Tag>
                    <Dropdown v-else class="editDropdown" v-model="slotProps.data.type" :options="tpaEditionStore.BLOCK_TYPES" placeholder="Select a type" @change="refreshLocalStorageInfo" />
                    
                    <span v-if="slotProps.data.guarantee" class="flex align-items-center gap-2">
                        <i class="pi pi-tag"></i>
                        <span class="font-semibold">Guarantee</span>
                    </span>
                    <template v-if="slotProps.data.guarantee">
                        <Tag v-if="!isEditionMode" :value="slotProps.data.guarantee"></Tag>
                        <Dropdown v-else v-model="slotProps.data.guarantee" class="editDropdown" :options="tpaEditionStore.getTpaField('terms.guarantees').map(guarantee => guarantee.id)" placeholder="Select a guarantee" @change="refreshLocalStorageInfo" />
                    </template>
                    
                    <span v-if="slotProps.data.config" class="flex align-items-center gap-2" style="grid-area: configTitle;">
                        <i class="pi pi-wrench"></i>
                        <span class="font-semibold">Config</span>
                    </span>
                    <div style="grid-area: configEdit;">
                        <ul v-if="!isEditionMode" class="my-0">
                            <li class="text-md font-bold text-700" v-for="(value, key) in slotProps.data.config" :key="key">{{ key }}: {{ value }}</li>
                        </ul>
                        <JsonEditorVue v-else :class="appThemeStore.isDarkModeOn && 'jse-theme-dark'" v-model="slotProps.data.config" mode="text" />
                    </div>
                </div>
            </Fieldset>
        </template>
    </DataView>
    <Button v-if="isEditionMode && !useDefaultDashboard" class="mt-2" label="Add new block" icon="pi pi-plus" @click="addNewBlock" />
</template>

<style scoped>
.gridWithGuarantee {
    grid-template-areas: 'auto configTitle' 'auto configEdit' 'auto configEdit' 'auto configEdit';
}

.gridWithoutGuarantee {
    grid-template-areas: 'auto configTitle' 'auto configEdit' 'auto configEdit';
}
</style>

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