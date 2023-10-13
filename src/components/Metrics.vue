<script setup>
import { ref } from 'vue';
import { useToast } from "primevue/usetoast";
import { useAppThemeStore } from '@/stores/appTheme';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import StepDisplay from './StepDisplay.vue';

import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import ToggleButton from 'primevue/togglebutton';
// import JsonEditorVue from 'json-editor-vue'
import CodeEditor from 'simple-code-editor';
import InputText from 'primevue/inputtext';
import DataView from 'primevue/dataview';
import Fieldset from 'primevue/fieldset';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Tag from 'primevue/tag';

const props = defineProps({
    fieldName: {
        type: String,
        required: true
    }
});

const toast = useToast();
const appThemeStore = useAppThemeStore();
const tpaEditionStore = useTpaEditionStore();

const metrics = ref(tpaEditionStore.getTpaField(props.fieldName) ?? {});
const collapsed = ref(new Array(Object.keys(metrics.value).length).fill(true));
const metricEntries = ref(Object.entries(metrics.value));
const metricElements = ref(metricEntries.value.map(metric => JSON.stringify(metric[1].measure.element, null, 2)));
const metricDetails = ref(metricEntries.value.map(metric => JSON.stringify(Object.values(Object.values(metric[1].measure.event)[0])[0], null, 2)));
const showSwitchDetailsModeErrorDialog = ref(false);
const showEditEventDialog = ref(false);
const currentEditingMetricId = ref();
const currentEditingSource = ref();
const currentEditingEndpoint = ref();
const currentEditingFilter = ref({});
const detailsMode = ref(false); // true = Interactive; false = Json

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
    
    let newMetricLabel = "DEFAULT_METRIC_NAME_" + (Object.keys(metrics.value).length + 1);
    let newMetric = {
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
    metrics.value[newMetricLabel] = newMetric;
    metricEntries.value.push([newMetricLabel, newMetric]);
    metricElements.value.push(JSON.stringify(newMetric.measure.element));
    metricDetails.value.push("{}");
}

function updateMetricsFromEntries() {
    tpaEditionStore.updateTpaField(props.fieldName, Object.fromEntries(metricEntries.value));
}

function updateMetricsFromElement(elementIndex) {
    try {
        metricEntries.value[elementIndex][1].measure.element = JSON.parse(metricElements.value[elementIndex]);
        updateMetricsFromEntries();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Invalid element format',
            detail: `The "element" format at metric "${metricEntries.value[elementIndex][0]}" is invalid. Please correct it and retry.`,
            life: 10000
        });

        // Reset the value to the previous one
        metricElements.value[elementIndex] = JSON.stringify(metricEntries.value[elementIndex][1].measure.element, null, 2);
    }
}

function deleteMetric(index) {
    delete metrics.value[Object.keys(metrics.value)[index]];
    metricEntries.value.splice(index, 1);
    collapsed.value.splice(index, 1);
}

function openEditEventDialog(event, metricId) {
    showEditEventDialog.value = true;
    currentEditingMetricId.value = metricId;
    try {
        currentEditingSource.value = Object.keys(event)?.[0];

        if (event && Object.keys(event).length > 0) {
            currentEditingEndpoint.value = Object.keys(Object.values(event)[0])[0];
            currentEditingFilter.value = Object.values(Object.values(event)[0])[0];
        } else {
            currentEditingEndpoint.value = 'undefined';
            currentEditingFilter.value = {};
        }

    } catch (error) {
        // Ignoring hence the event is empty
    }
}

function confirmEventEdit() {
    // Merge the source, endpoint and filter into a single object
    let newEvent = {
        [currentEditingSource.value]: {
            [currentEditingEndpoint.value]: currentEditingFilter.value
        }
    };
    
    showEditEventDialog.value = false;
    tpaEditionStore.updateTpaField(props.fieldName + "[" + currentEditingMetricId.value + "].measure.event", newEvent);
}

function updateEditedDataOnDetailsModes(metricIndex) {
    if (detailsMode.value === true) {
        try {
            metricDetails.value[metricIndex] = JSON.parse(metricDetails.value[metricIndex]);
        } catch (error) {
            showSwitchDetailsModeErrorDialog.value = true;
            detailsMode.value = false; // Switch back to Json mode
        }
    } else {
        metricDetails.value[metricIndex] = JSON.stringify(metricDetails.value[metricIndex], null, 2);
    }
}

function updateMetricDetails(metricName, metricEvent, metricIndex) {
    const metricEventName = Object.keys(metricEvent)[0];
    const metricEventEndpoint = Object.keys(Object.values(metricEvent)[0])[0];
    const pathToUpdate = `${props.fieldName}[${metricName}].measure.event[${metricEventName}][${metricEventEndpoint}]`;

    try {
        const updatedValue = JSON.parse(metricDetails.value[metricIndex]);
        tpaEditionStore.updateTpaField(pathToUpdate, updatedValue);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Invalid details format',
            detail: `The "details" format at metric "${metricName}" is invalid. Please correct it and retry.`,
            life: 10000
        });

        // Reset the value to the previous one
        metricDetails.value[metricIndex] = JSON.stringify(tpaEditionStore.getTpaField(pathToUpdate), null, 2);
    }
}

function updateMetricFilters(metricName, metricEvent, metricIndex) {
    const metricEventName = Object.keys(metricEvent)[0];
    const metricEventEndpoint = Object.keys(Object.values(metricEvent)[0])[0];
    const pathToUpdate = `${props.fieldName}[${metricName}].measure.event[${metricEventName}][${metricEventEndpoint}]`;

    try {
        const updatedValue = JSON.parse(metricDetails.value[metricIndex]);
        tpaEditionStore.updateTpaField(pathToUpdate, updatedValue);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Invalid filters format',
            detail: `The "filters" format at metric "${metricName}" is invalid. Please correct it and retry.`,
            life: 10000
        });

        // Reset the value to the previous one
        metricDetails.value[metricIndex] = JSON.stringify(tpaEditionStore.getTpaField(pathToUpdate), null, 2);
    }
}

</script>

<template>
    <DataView :value="metricEntries" dataKey="id">
        <template #list="slotProps">
            
            <Fieldset :legend="slotProps.data[0]" :toggleable="true" :collapsed="collapsed[slotProps.index]" class="col-12" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
                
                <template #legend>
                    <div class="flex align-items-center gap-2 metric-legend">
                        {{  slotProps.data[0] }}
                        <Button v-if="tpaEditionStore.isEditionMode" class="p-button-text" icon="pi pi-trash" severity="danger" @click="deleteMetric(slotProps.index)" />
                    </div>
                </template>

                <div class="flex flex-column align-items-start gap-3">

                    <div v-if="tpaEditionStore.isEditionMode" class="flex align-items-center gap-2 w-full">
                        <i class="pi pi-file-edit"></i>
                        <span class="font-semibold">Id:</span>
                        <InputText type="text" v-model="slotProps.data[0]" @change="updateMetricsFromEntries" class="w-full" />
                    </div>
                    
                    <span class="flex flex-column gap-2 w-full">
                        <span class="flex align-items-center gap-2">
                            <i class="pi pi-file"></i>
                            <b>Element:</b>
                        </span>
                        <div>
                            <div v-if="tpaEditionStore.isEditionMode" @focusout="updateMetricsFromElement(slotProps.index)">
                                <CodeEditor width="100%" :wrap="true" v-model="metricElements[slotProps.index]" :languages="[['json', 'JSON']]" :theme="appThemeStore.isDarkModeOn ? 'github-dark' : 'github'" :key="slotProps.data[0]" />
                            </div>
                            <template v-else>
                                <CodeEditor width="100%" :wrap="true" v-model="metricElements[slotProps.index]" :readOnly="true" :languages="[['json', 'JSON']]" :theme="appThemeStore.isDarkModeOn ? 'github-dark' : 'github'" :key="slotProps.data[0] + slotProps.index" />
                            </template>
                        </div>
                    </span>

                    <span class="flex flex-wrap align-items-center gap-2">
                        <i class="pi pi-megaphone"></i>
                        <b>Event:</b>
                        <div @click="openEditEventDialog(slotProps.data[1].measure.event, slotProps.data[0])" class="flex align-items-center gap-2">
                            <Tag v-if="Object.keys(slotProps.data[1].measure.event)?.length === 0" severity="warning">No details</Tag>
                            <div v-else style="cursor: pointer;">
                                <Tag :class="tpaEditionStore.isEditionMode && 'cursor-pointer'"
                                    :severity="tpaEditionStore.COLLECTOR_EVENT_SOURCES.includes(Object.keys(slotProps.data[1].measure.event)?.[0]) ? 'success' : 'warning'">
                                    {{ Object.keys(slotProps.data[1].measure.event)?.[0] }} 
                                </Tag>
                                {{  Object.keys(Object.values(slotProps.data[1].measure.event)?.[0])?.[0] ? '&rarr;' : '' }}
                                <Tag v-if="Object.keys(Object.values(slotProps.data[1].measure.event)?.[0])?.[0]" :class="tpaEditionStore.isEditionMode && 'cursor-pointer'"
                                    :severity="tpaEditionStore.COLLECTOR_EVENT_ENDPOINTS?.[Object.keys(slotProps.data[1].measure.event)?.[0]]?.includes(Object.keys(Object.values(slotProps.data[1].measure.event)?.[0])?.[0]) ? 'success' : 'warning'">
                                    {{ Object.keys(Object.values(slotProps.data[1].measure.event)?.[0])?.[0] }}
                                </Tag>
                            </div>
                            <Button v-if="tpaEditionStore.isEditionMode" icon="pi pi-pencil" class="p-button-warning p-button-text" />
                        </div>
                    </span>
                    
                    <span class="flex flex-column gap-2 w-full">
                        <span class="flex align-items-center gap-2">
                            <i class="pi pi-align-left"></i>
                            <template v-if="slotProps.data[1].measure.event.githubGQL">
                                <b>Details mode:</b>
                                <ToggleButton v-model="detailsMode" onLabel="Interactive" offLabel="Json" onIcon="pi pi-desktop" offIcon="pi pi-file-edit" @change="updateEditedDataOnDetailsModes(slotProps.index)" />
                            </template>
                            <template v-else>
                                <b>Filters:</b>
                            </template>
                        </span>

                        <div>
                            <template v-if="tpaEditionStore.isEditionMode">
                                <template v-if="slotProps.data[1].measure.event.githubGQL">
                                    <StepDisplay v-if="detailsMode" :data="metricDetails[slotProps.index]" :fieldName="props.fieldName + '[' + slotProps.data[0] + ']' + '.measure.event'" />
                                    <div v-else @focusout="updateMetricDetails(slotProps.data[0], slotProps.data[1].measure.event, slotProps.index)" >
                                        <CodeEditor width="100%" :wrap="true" v-model="metricDetails[slotProps.index]" :languages="[['json', 'JSON']]" :theme="appThemeStore.isDarkModeOn ? 'github-dark' : 'github'" :key="slotProps.data[0] + slotProps.index" />
                                    </div>
                                </template>
                                <div v-else @focusout="updateMetricFilters(slotProps.data[0], slotProps.data[1].measure.event, slotProps.index)" >
                                    <CodeEditor width="100%" :wrap="true" v-model="metricDetails[slotProps.index]" :languages="[['json', 'JSON']]" :theme="appThemeStore.isDarkModeOn ? 'github-dark' : 'github'" :key="slotProps.data[0] + slotProps.index" />
                                </div>
                            </template>
                            <template v-else>
                                <StepDisplay v-if="detailsMode" :data="metricDetails[slotProps.index]" />
                                <CodeEditor v-else width="100%" :wrap="true" v-model="metricDetails[slotProps.index]" :readOnly="true" :languages="[['json', 'JSON']]" :theme="appThemeStore.isDarkModeOn ? 'github-dark' : 'github'" :key="slotProps.data[0] + slotProps.index" />
                                <!-- <pre v-else>{{ slotProps.data[1].measure.event }}</pre> -->
                            </template>
                        </div>
                    </span>
                    
                </div>
            </Fieldset>
        </template>
        
        <template #footer v-if="tpaEditionStore.isEditionMode">
            <Button label="Add new metric" icon="pi pi-plus" @click="addNewMetric" />
        </template>
    </DataView>

    <Dialog v-model:visible="showEditEventDialog" header="Edit event" modal :draggable="false" :closable="false" :dismissableMask="true" :breakpoints="{ '960px': '75svw'}" style="width: 40svw">
        <template #header>
            <h2 class="mb-0 font-bold">Edit event</h2>
        </template>
        
        <div class="flex justify-content-between gap-5 mb-1">
            <div class="flex-1">
                <p class="mb-1"><b>Source</b></p>
                <Dropdown v-if="tpaEditionStore.isEditionMode" class="editDropdown w-full" :options="tpaEditionStore.COLLECTOR_EVENT_SOURCES" v-model="currentEditingSource" placeholder="Select a source" />
            </div>
            <div class="flex-1">
                <p class="mb-1"><b>Endpoint</b></p>
                <Dropdown v-if="tpaEditionStore.isEditionMode" class="editDropdown w-full" :options="tpaEditionStore.COLLECTOR_EVENT_ENDPOINTS?.[currentEditingSource]" v-model="currentEditingEndpoint" placeholder="Enter an endpoint" />
            </div>
        </div>
        
        <template #footer>
            <div class="flex justify-content-end">
                <Button icon="pi pi-check" label="Save" severity="success" @click="confirmEventEdit" :disabled="!(currentEditingSource && currentEditingEndpoint && tpaEditionStore.COLLECTOR_EVENT_ENDPOINTS?.[currentEditingSource] && tpaEditionStore.COLLECTOR_EVENT_ENDPOINTS?.[currentEditingSource].includes(currentEditingEndpoint))" />
                <Button icon="pi pi-times" label="Cancel" severity="danger" @click="showEditEventDialog = false" />
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="showSwitchDetailsModeErrorDialog" header="Error" modal :draggable="false" :closable="false" :breakpoints="{ '960px': '75svw'}" style="width: 30svw">
        <template #header>
            <h2 class="mb-0 font-bold">Error</h2>
        </template>

        <p class="mb-3">Switching to JSON mode is not possible due to invalid JSON content.</p>
        <p>Please correct the error and retry.</p>

        <template #footer>
            <div class="flex justify-content-end">
                <Button label="Ok" severity="success" @click="showSwitchDetailsModeErrorDialog = false" />
            </div>
        </template> 
    </Dialog>

    <Toast ref="toast" position="bottom-right" :baseZIndex="10000" />

</template>

<style>
    .p-fieldset.p-fieldset-toggleable .p-fieldset-legend a:has(.metric-legend) {
        padding: 0.75rem;
    }
</style>