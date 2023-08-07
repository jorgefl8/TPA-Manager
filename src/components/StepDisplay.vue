<script setup>
import { ref } from 'vue';
import { deepFindKeyword } from '../utils/utils';

import Tag from 'primevue/tag';
import Fieldset from 'primevue/fieldset';
import ToggleButton from 'primevue/togglebutton';

const props = defineProps({
    data: {
        type: Object,
        required: true
    }
})

const stepsToggle = ref({});
const steps = ref(deepFindKeyword('steps', props.data));
const componentLegend = ref(deepFindKeyword('title', props.data));

</script>

<template>
  <Fieldset :legend="componentLegend" :toggleable="true">
    <Fieldset v-for="(stepData, stepNumber) in steps" :legend="'Step ' + (parseInt(stepNumber) + 1)" :toggleable="true" class="step-fieldset mb-3" :key="stepNumber">
      <ul>
        <li v-for="(stepValue, stepKey) in stepData" :key="stepKey" class="flex align-items-baseline gap-2">
          <strong>{{ stepKey }}:</strong>
          <!-- If the key is "query" or "script", allow the user to display the text in a more readable way -->
          <ToggleButton v-if="stepKey == 'query' || stepKey == 'script'" v-model="stepsToggle[stepNumber]" onLabel="" offLabel="" onIcon="pi pi-chevron-down" offIcon="pi pi-chevron-right" class="ml-2" style="width: 20px; height: 20px;" />
          <pre v-if="(stepKey == 'query' || stepKey == 'script') && stepsToggle[stepNumber]">{{ stepValue }}</pre>
          
          <!-- Else, simply show the value: Tag if stepKey is "type", span otherwise -->
          <Tag v-else-if="stepKey === 'type'">{{ stepValue }}</Tag>
          <span v-else>{{ stepValue }}</span>
        </li>
      </ul>
    </Fieldset>
  </Fieldset>
</template>

<style scoped>
:deep(.step-fieldset .p-fieldset-content) {
    padding: 0;
}

.p-fieldset-content ul {
    list-style-type: none;
    margin: 0.5rem;
    padding-left: 0;
    display: grid;
    gap: 0.5rem;
}
</style>