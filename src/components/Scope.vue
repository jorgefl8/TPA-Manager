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
  <template v-if="isEditionMode">
    <p><span class="mr-1">Project: </span><EditContent :fieldName="fieldName + '.project.default'" /></p>
    <p><span class="mr-1">Course: </span><EditContent :fieldName="fieldName + '.class.default'" /></p>
    <p>Will calculations by member be required?
      <Checkbox class="ml-2" v-model="isMemberNeeded" :binary="true" trueValue="*" falseValue="null" @change="tpaEditionStore.updateTpaField(fieldName + '.member.default', isMemberNeeded)" />
    </p>
  </template>
  <template v-else>
    <p>Project: <span>{{ tpaEditionStore.getTpaField(fieldName + '.project.default') }}</span></p>
    <p>Course: <span>{{ tpaEditionStore.getTpaField(fieldName + '.class.default') }}</span></p>
    <p>Will calculations by member be required?
      <Checkbox class="ml-2" v-model="isMemberNeeded" readonly :binary="true" trueValue="*" falseValue="null" />
    </p>
  </template>
</template>