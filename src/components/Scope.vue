<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import EditContent from './EditContent.vue';

import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';

const props = defineProps({
  fieldName: {
    type: String
  }
});

const router = useRouter();
const tpaEditionStore = useTpaEditionStore()

const isVisualizationMode = ref(router.currentRoute.value.name.includes('visualization'));
const isMemberNeeded = ref(tpaEditionStore.getTpaField(props.fieldName)?.member?.default);
const validityInitial = ref(new Date(tpaEditionStore.getTpaField('context.validity.initial')));

watch(validityInitial, (newValue) => {
  tpaEditionStore.updateTpaField('context.validity.initial', newValue.toISOString());
});

</script>

<template>

  <div class="flex flex-column gap-2">
    <mark v-if="!isVisualizationMode" class="py-2 mr-3" style="width: fit-content;">
      <i class="pi pi-exclamation-triangle"></i>
      If <u><em>Project</em></u> or <u><em>Course</em></u> are modified, you will need to update the <b>scopes.json</b> file accordingly and restart the <b>Scope Manager</b> service for the changes to take effect.
    </mark>

    <div class="flex align-items-center gap-2">
      <span>Project:</span>
      <EditContent v-if="!isVisualizationMode" :fieldName="fieldName + '.project.default'" :key="fieldName + '.project.default'" />
      <span v-else>{{ tpaEditionStore.getTpaField(fieldName + '.project.default') }}</span>
    </div>

    <div class="flex align-items-center gap-2">
      <span>Course:</span>
      <EditContent v-if="!isVisualizationMode" :fieldName="fieldName + '.class.default'" />
      <span v-else>{{ tpaEditionStore.getTpaField(fieldName + '.class.default') }}</span>
    </div>

    <div class="flex gap-2">
      <span>Will calculations by member be required?</span>
      <Checkbox v-model="isMemberNeeded" :disabled="isVisualizationMode" :binary="true" trueValue="*" falseValue="null" @change="tpaEditionStore.updateTpaField(fieldName + '.member.default', isMemberNeeded)" />
    </div>

    <div class="flex align-items-center gap-2">
      <span>Agreement validity start:</span>
      <Calendar v-model="validityInitial" :disabled="isVisualizationMode" showIcon showTime :manualInput="false" />
    </div>

  </div>

</template>