<script setup>
import { ref, defineProps } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import DataView from 'primevue/dataview';
import ToggleButton from 'primevue/togglebutton';
import Fieldset from 'primevue/fieldset';

const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});

const stepsToggles = ref({});
const collapsed = ref(Object.entries(props.data).map((value, index) => {
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

defineExpose({
    collapseAll,
    expandAll
});
</script>

<template>
    <!-- <VueJsonPretty class="mt-5" style="width: 1000px;" :data="props.data" :virtual="true" :height="250" :showLineNumber="true" :showLength="true" :editable="true" /> -->
    <DataView :value="Object.entries(props.data)" dataKey="id">
        <template #list="slotProps">
            <Fieldset :legend="slotProps.data[0]" :toggleable="true" :collapsed="collapsed[slotProps.index]" class="col-12 my-2" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
                <div class="flex flex-column xl:flex-row xl:align-items-start gap-4">
                    <div class="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div class="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-file"></i>
                                    <span class="font-semibold">Element:</span>
                                    <Fieldset v-if="typeof slotProps.data[1].measure.element === 'object'" :legend="slotProps.data[1]?.measure?.element?.count?.related?.githubGQL?.custom?.title" :toggleable="true" class="ml-2">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <h5>Steps:</h5>
                                                    <ul>
                                                        <li v-for="(step, index) in slotProps.data[1].measure.element.count.related.githubGQL.custom.steps" :key="index">
                                                            <strong>{{ index }}: </strong>
                                                            <ul>
                                                                <li v-for="(value, key) in step" :key="key">
                                                                    <strong>{{ key }}:</strong>
                                                                    <ToggleButton v-if="key == 'query' || key == 'script'" v-model="stepsToggles[Object.values(Object.values(slotProps.data[1].measure.event)[0])[0].title + index]" onLabel="" offLabel="" onIcon="pi pi-chevron-down" offIcon="pi pi-chevron-right" class="ml-2" style="width: 20px; height: 20px;" />
                                                                    <pre v-if="(key == 'query' || key == 'script') && stepsToggles[Object.values(Object.values(slotProps.data[1].measure.event)[0])[0].title + index]">{{ value }}</pre>
                                                                    <span class="ml-2" v-else>{{ value }}</span>
                                                                </li>
                                                            </ul>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </Fieldset>
                                    <span class="ml-2 font-bold" v-else>{{ slotProps.data[1].measure.element }}</span>
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-megaphone"></i>
                                    <span class="font-semibold">Event:</span>
                                    <span class="text-md font-bold text-700">{{ Object.keys(slotProps.data[1].measure.event)[0] }} -> {{ Object.keys(Object.values(slotProps.data[1].measure.event)[0])[0] }} </span>
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-align-left"></i>
                                    <span class="font-semibold">Details:</span>
                                    <Fieldset v-if="slotProps.data[1].measure.event.githubGQL" :legend="Object.values(Object.values(slotProps.data[1].measure.event)[0])[0].title" :toggleable="true" class="ml-2">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <h5>Steps:</h5>
                                                    <ul>
                                                        <li v-for="(step, index) in Object.values(Object.values(slotProps.data[1].measure.event)[0])[0].steps" :key="index">
                                                            <strong>{{ index }}: </strong>
                                                            <ul>
                                                                <li v-for="(value, key) in step" :key="key">
                                                                    <strong>{{ key }}:</strong>
                                                                    <ToggleButton v-if="key == 'query' || key == 'script'" v-model="stepsToggles[Object.values(Object.values(slotProps.data[1].measure.event)[0])[0].title + index]" onLabel="" offLabel="" onIcon="pi pi-chevron-down" offIcon="pi pi-chevron-right" class="ml-2" style="width: 20px; height: 20px;" />
                                                                    <pre v-if="(key == 'query' || key == 'script') && stepsToggles[Object.values(Object.values(slotProps.data[1].measure.event)[0])[0].title + index]">{{ value }}</pre>
                                                                    <span class="ml-2" v-else>{{ value }}</span>
                                                                </li>
                                                            </ul>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </Fieldset>
                                    <div class="card" v-else>
                                        <pre class="ml-2">{{ slotProps.data[1].measure.event }}</pre>
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Fieldset>
        </template>
    </DataView>
</template>

<!-- Poner un ToggleButton para alternar entre vista "bonita" y VueJsonPretty -->
<!-- Añadir algún botón para añadir y eliminar garantías -->
<!-- Poner un if en función de si la métrica es o no de GraphQL para visualizar de una forma u otra -->