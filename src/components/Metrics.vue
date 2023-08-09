<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppThemeStore } from '@/stores/appTheme';
import { useTpaEditionStore } from '@/stores/tpaEdition';
import { parseJsonEditorContent } from '../utils/utils';

import StepDisplay from './StepDisplay.vue';

import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import JsonEditorVue from 'json-editor-vue'
import InputText from 'primevue/inputtext';
import DataView from 'primevue/dataview';
import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const props = defineProps({
    fieldName: {
        type: String,
        required: true
    }
});

const router = useRouter();
const appThemeStore = useAppThemeStore();
const tpaEditionStore = useTpaEditionStore();

const isEditionMode = computed(() => router.currentRoute.value.name === 'edition');
const metrics = ref(tpaEditionStore.getTpaField(props.fieldName) ?? {});
const collapsed = ref(new Array(Object.keys(metrics.value).length).fill(true));
const currentlyEditingDetails = ref(new Array(Object.keys(metrics.value).length).fill(false));
const metricEntries = ref(Object.entries(metrics.value));

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

function addNewMetric() {

    metrics.value["Default metric name " + Object.keys(metrics.value).length] = {
        collector: {
            infrastructurePath: "internal.collector.events",
            endpoint: "/api/v2/computations",
            type: "POST-GET-V1",
            config: {
                "scopeManager": `${tpaEditionStore.isProductionEnvironment ? "http://bluejay-scope-manager" : "http://host.docker.internal:5700"}/api/v1/scopes/development`
            }
        },
        measure: {
            computing: "actual",
            element: "number",
            event: {},
            scope: {
                project: {
                    name: "Project",
                    description: "Project",
                    type: "string",
                    default: tpaEditionStore.getTpaField('context.definitions.scopes.development.project.default')
                },
                class: {
                    name: "Class",
                    description: "Class",
                    type: "string",
                    default: tpaEditionStore.getTpaField('context.definitions.scopes.development.class.default')
                }
            }
        }
    };
    
    collapsed.value.push(false);
}

function updateMetrics() {
    tpaEditionStore.updateTpaField(props.fieldName, Object.fromEntries(metricEntries.value));
}

function deleteMetric(index) {
    delete metrics.value[Object.keys(metrics.value)[index]];
    collapsed.value.splice(index, 1);
    currentlyEditingDetails.value.splice(index, 1);
}

</script>

<template>
    <DataView :value="metricEntries" dataKey="id">
        <template #list="slotProps">
            
            <Fieldset :legend="slotProps.data[0]" :toggleable="true" :collapsed="collapsed[slotProps.index]" class="col-12" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
                <div class="flex flex-column align-items-start gap-3">

                    <span v-if="isEditionMode" class="flex align-items-center gap-2">
                        <i class="pi pi-file-edit"></i>
                        <span class="font-semibold">Id:</span>
                        <InputText type="text" v-model="slotProps.data[0]" @change="updateMetrics" />
                    </span>

                    <span class="flex flex-wrap align-items-center gap-2">
                        <i class="pi pi-file"></i>
                        <b>Element:</b>
                        <JsonEditorVue v-if="isEditionMode" :class="appThemeStore.isDarkModeOn && 'jse-theme-dark'" v-model="slotProps.data[1].measure.element" @blur="slotProps.data[1].measure.element = parseJsonEditorContent(slotProps.data[1].measure.element)" mode="text" :key="slotProps.data[0]" />
                        <template v-else>
                            <StepDisplay v-if="typeof slotProps.data[1].measure.element === 'object'" :data="slotProps.data[1].measure.element" />
                            <Tag v-else>{{ slotProps.data[1].measure.element }}</Tag>
                        </template>
                    </span>

                    <span class="flex flex-wrap align-items-center gap-2">
                        <i class="pi pi-megaphone"></i>
                        <b>Event:</b>
                        <Tag v-if="currentlyEditingDetails[slotProps.index]">Editing details...</Tag>
                        <Tag v-else-if="(typeof slotProps.data[1].measure.event) !== 'object'" severity="danger">
                            Invalid value!
                        </Tag>
                        <Tag v-else-if="Object.keys(slotProps.data[1].measure.event)?.length === 0" severity="warning">No details</Tag>
                        <Tag v-else>
                            {{ Object.keys(slotProps.data[1].measure.event)?.[0] }} 
                            <template v-if="Object.keys(Object.values(slotProps.data[1].measure.event)?.[0])?.[0]">
                                &rarr; {{ Object.keys(Object.values(slotProps.data[1].measure.event)?.[0])?.[0] }}
                            </template>
                        </Tag>
                        <small v-if="isEditionMode">(This field is computed automatically from the details)</small>
                    </span>

                    <span class="flex flex-wrap align-items-center gap-2">
                        <i class="pi pi-align-left"></i>
                        <b>Details:</b>
                        <JsonEditorVue v-if="isEditionMode" :class="appThemeStore.isDarkModeOn && 'jse-theme-dark'" v-model="slotProps.data[1].measure.event" @click="currentlyEditingDetails[slotProps.index] = true" @blur="slotProps.data[1].measure.event = parseJsonEditorContent(slotProps.data[1].measure.event); currentlyEditingDetails[slotProps.index] = false" mode="text" :key="slotProps.data[0] + slotProps.index" />
                        <template v-else>
                            <StepDisplay v-if="slotProps.data[1].measure.event.githubGQL" :data="slotProps.data[1].measure.event" />
                            <pre v-else>{{ slotProps.data[1].measure.event }}</pre>
                        </template>
                    </span>

                    <Button v-if="isEditionMode" class="mt-2" icon="pi pi-trash" severity="danger" @click="deleteMetric(slotProps.index)" />

                </div>
            </Fieldset>
        </template>

        <template #footer v-if="isEditionMode">
            <Button label="Add new metric" icon="pi pi-plus" @click="addNewMetric" />
        </template>
    </DataView>
</template>