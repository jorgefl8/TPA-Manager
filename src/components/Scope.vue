<script setup>
import { ref, computed } from 'vue';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import 'vue-json-pretty/lib/styles.css';
import EditContent from './EditContent.vue';

import TriStateCheckbox from 'primevue/tristatecheckbox';
import Checkbox from 'primevue/checkbox';

const props = defineProps({
  scope: {
    type: Object,
    required: true
  },
  editionMode: {
    type: Boolean,
  },
  scopeFieldName: {
    type: String
  }
});

const tpaEditionStore = useTpaEditionStore()
const isMemberNeeded = ref(tpaEditionStore.getTpaField(props.scopeFieldName)?.member?.default);
</script>

<template>
  <template v-if="editionMode">
    <p><span class="mr-1">Project: </span><EditContent :fieldName="scopeFieldName + '.project.default'" /></p>
    <p><span class="mr-1">Course: </span><EditContent :fieldName="scopeFieldName + '.class.default'" /></p>
    <p>Will calculations by member be required?
      <Checkbox class="ml-2" v-model="isMemberNeeded" :binary="true" trueValue="*" falseValue="null" @change="tpaEditionStore.updateTpaField(scopeFieldName + '.member.default', isMemberNeeded)" />
    </p>
  </template>
  <template v-else>
    <p>Project: <span>{{ tpaEditionStore.getTpaField(scopeFieldName + '.project.default') }}</span></p>
    <p>Course: <span>{{ tpaEditionStore.getTpaField(scopeFieldName + '.class.default') }}</span></p>
    <p>Will calculations by member be required?
      <Checkbox class="ml-2" v-model="isMemberNeeded" readonly :binary="true" trueValue="*" falseValue="null" />
    </p>
  </template>
</template>