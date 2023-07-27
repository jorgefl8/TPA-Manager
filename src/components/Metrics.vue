<script setup>
import { ref } from 'vue';
import { useAppThemeStore } from '@/stores/appTheme';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import StepDisplay from './StepDisplay.vue';

import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import JsonEditorVue from 'json-editor-vue'
import ToggleButton from 'primevue/togglebutton';
import DataView from 'primevue/dataview';
import Fieldset from 'primevue/fieldset';
import Tag from 'primevue/tag';

const props = defineProps({
    fieldName: {
        type: String,
        required: true
    }
});

const appThemeStore = useAppThemeStore();
const tpaEditionStore = useTpaEditionStore();

const metrics = ref(tpaEditionStore.getTpaField(props.fieldName) ?? {});
const stepsToggles = ref({});
const collapsed = ref(new Array(Object.keys(metrics.value).length).fill(true));

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
</script>

<template>
    <DataView :value="Object.entries(metrics)" dataKey="id" class="pr-2">
        <template #list="slotProps">
            <Fieldset :legend="slotProps.data[0]" :toggleable="true" :collapsed="collapsed[slotProps.index]" class="col-12" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
                <div class="flex flex-column align-items-start gap-3">

                    <span class="flex flex-wrap gap-2">
                        <i class="pi pi-file"></i>
                        <b>Element:</b>
                        <StepDisplay v-if="typeof slotProps.data[1].measure.element === 'object'" :data="slotProps.data[1].measure.element" />
                        <Tag class="ml-2" v-else>{{ slotProps.data[1].measure.element }}</Tag>
                    </span>

                    <span class="flex flex-wrap gap-2">
                        <i class="pi pi-megaphone"></i>
                        <b>Event:</b>
                        <Tag>{{ Object.keys(slotProps.data[1].measure.event)[0] }} -> {{ Object.keys(Object.values(slotProps.data[1].measure.event)[0])[0] }}</Tag>
                    </span>

                    <span class="flex flex-wrap gap-2">
                        <i class="pi pi-align-left"></i>
                        <b>Details:</b>
                        <StepDisplay v-if="slotProps.data[1].measure.event.githubGQL" :data="slotProps.data[1].measure.event" />
                        <pre v-else>{{ slotProps.data[1].measure.event }}</pre>
                    </span>

                </div>
            </Fieldset>
        </template>
    </DataView>
</template>

<!-- Poner la edición con JsonEditorVue -->
<!-- Poner un ToggleButton para alternar entre vista "bonita" y VueJson -->
<!-- Añadir algún botón para añadir y eliminar garantías -->
<!-- Poner un if en función de si la métrica es o no de GraphQL para visualizar de una forma u otra -->