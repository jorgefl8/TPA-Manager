<script setup>
import { ref, defineProps, computed } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import DataView from 'primevue/dataview';
import Tag from 'primevue/tag';
import Fieldset from 'primevue/fieldset';
import TriStateCheckbox from 'primevue/tristatecheckbox';

const props = defineProps({
    data: {
        type: Array,
        required: true
    }
});

const isGuaranteeByMember = computed(() => {
    const result = [];
    for (const guarantee of props.data) {
        result[guarantee.id] = guarantee.scope?.member == "*";
    }
    return result;
});

const collapsed = ref(props.data.map((value, index) => {
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
    <DataView :value="props.data" dataKey="id" class="pr-2">
        <template #list="slotProps">
            <Fieldset :legend="slotProps.data.id" :toggleable="true" :collapsed="collapsed[slotProps.index]" class="col-12 my-2" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
                <div class="flex flex-column xl:flex-row xl:align-items-start gap-4">
                    <div class="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div class="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-file-edit"></i>
                                    <span class="font-semibold">Notes:</span>
                                    <span class="text-md font-bold text-700">{{ slotProps.data.notes }}</span>
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-align-left"></i>
                                    <span class="font-semibold">Description:</span>
                                    <span class="text-md font-bold text-700">{{ slotProps.data.description }}</span>
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-users"></i>
                                    <span class="font-semibold">Is guarantee by member?</span>
                                    <TriStateCheckbox v-model="isGuaranteeByMember[slotProps.data.id]" />
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-clock"></i>
                                    <span class="font-semibold">Calculation period:</span>
                                    <Tag :value="slotProps.data.of[0].window.period"></Tag>
                                </span>
                            </div>
                            <div class="flex align-items-center gap-3">
                                <span class="flex align-items-center gap-2">
                                    <i class="pi pi-check-circle"></i>
                                    <span class="font-semibold">Objective:</span>
                                    <Tag :value="slotProps.data.of[0].objective"></Tag>
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