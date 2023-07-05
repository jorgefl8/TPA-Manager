<script setup>
import { ref, defineProps, computed } from 'vue';
import TriStateCheckbox from 'primevue/tristatecheckbox';
import DataView from 'primevue/dataview';
import Tag from 'primevue/tag';
import Fieldset from 'primevue/fieldset';

const props = defineProps({
    config: {
        type: Object,
        required: true
    }
});

const useDefaultDashboard = computed(() => {
    return !props.config?.blocks;
});

const collapsed = ref(Object.values(props.config.blocks ?? {}).map((value, index) => {
    return { [index]: false };
}) ?? []);

function collapseAll() {
    collapsed.value.map((value, index) => {
        collapsed.value[index] = true;
    });
}

function expandAll() {
    collapsed.value.map((value, index) => {
        collapsed.value[index] = false;
    });
}


// Deep search for a key that contains "title" in its name
function deepFindTitleKey(obj) {
    for (var key in obj) {
        if (key.includes("title")) {
            return obj[key];
        }
        if (typeof obj[key] === "object") {
            var result = deepFindTitleKey(obj[key]);
            if (result) {
                return result;
            }
        }
    }
}

defineExpose({
    collapseAll,
    expandAll
});
</script>

<template>
    <p class="mb-3">Use the default dashboard blocks? <TriStateCheckbox class="ml-2" v-model="useDefaultDashboard" /></p>
    
    <DataView v-if="!useDefaultDashboard" :value="Object.values(props.config.blocks)" dataKey="id" class="pr-2">
        <template #list="slotProps">
            <Fieldset class="col-12 my-2" :legend="deepFindTitleKey(slotProps.data)" :toggleable="true" :collapsed="collapsed[slotProps.index]" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
                <div class="flex flex-column xl:flex-row xl:align-items-start gap-4">
                    <div class="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div class="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-star"></i>
                                    <span class="font-semibold">Type:</span>
                                    <Tag :value="slotProps.data.type"></Tag>
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3" v-if="slotProps.data.guarantee">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-tag"></i>
                                    <span class="font-semibold">Guarantee:</span>
                                    <Tag :value="slotProps.data.guarantee"></Tag>
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3" v-if="slotProps.data.config">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-wrench"></i>
                                    <span class="font-semibold">Config:</span>
                                    <!-- <span class="text-md font-bold text-700">{{ slotProps.data.config }}</span> -->
                                    <ul class="my-0">
                                        <li class="text-md font-bold text-700" v-for="(value, key) in slotProps.data.config" :key="key">{{ key }}: {{ value }}</li>
                                    </ul>
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