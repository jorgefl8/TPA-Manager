<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import EditContent from './EditContent.vue';

import Checkbox from 'primevue/checkbox';

const props = defineProps({
  fieldName: {
    type: String
  }
});

const router = useRouter();
const tpaEditionStore = useTpaEditionStore()

const isEditionMode = ref(router.currentRoute.value.name.includes('edition'));
const isMemberNeeded = ref(tpaEditionStore.getTpaField(props.fieldName)?.member?.default);

</script>

<template>

  <div class="flex flex-column gap-2">
    <div class="flex align-items-center gap-2">
      <span>Project:</span>
      <EditContent v-if="isEditionMode" :fieldName="fieldName + '.project.default'" :key="fieldName + '.project.default'" />
      <span v-else>{{ tpaEditionStore.getTpaField(fieldName + '.project.default') }}</span>
    </div>

    <div class="flex align-items-center gap-2">
      <span>Course:</span>
      <EditContent v-if="isEditionMode" :fieldName="fieldName + '.class.default'" />
      <span v-else>{{ tpaEditionStore.getTpaField(fieldName + '.class.default') }}</span>
    </div>
    
    <div class="flex gap-2">
      <span>Will calculations by member be required?</span>
      <Checkbox v-model="isMemberNeeded" :disabled="!isEditionMode" :readonly="!isEditionMode" :binary="true" trueValue="*" falseValue="null" @change="tpaEditionStore.updateTpaField(fieldName + '.member.default', isMemberNeeded)" />
    </div>
  </div>

</template>