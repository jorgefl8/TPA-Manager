<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import { storeToRefs } from 'pinia';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import EditContent from './EditContent.vue';

import Tag from 'primevue/tag';
import Button from 'primevue/button';
import DataView from 'primevue/dataview';
import Fieldset from 'primevue/fieldset';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
  fieldName: {
    type: String,
    required: true
  }
});

const router = useRouter();
const tpaEditionStore = useTpaEditionStore();
// const { modifiedTpa } = storeToRefs(tpaEditionStore);

const WINDOW_PERIOD_OPTIONS = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Biweekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Bimonthly', value: 'bimonthly' },
  { label: 'Annually', value: 'annually'}
]

const isEditionMode = ref(router.currentRoute.value.name.includes('edition'));
const guarantees = ref(tpaEditionStore.getTpaField(props.fieldName) ?? {});
const isGuaranteeByMember = ref(guarantees.value.map((value) => value.scope?.member));
const collapsed = ref(new Array(guarantees.value.length).fill(true));

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

function addNewGuarantee() {
  
  guarantees.value.push({
    id: "Default ID",
    notes: "Write your notes here...",
    description: "Guarantee description here...",
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
      },
      // member: "*" // To indicate whether the guarantee is by member or not
    },
    of: [{
      scope: {
        project: tpaEditionStore.getTpaField('context.definitions.scopes.development.project.default')
        // member: "*" // To indicate whether the guarantee is by member or not
      },
      objective: "METRIC_1 / METRIC_2 * 100 >= 75",
      with: {},
      window: {
        type: "static",
        period: null,
        initial: new Date().getFullYear() + "-01-01T00:00:00.000Z"
      }
    }]
  });
  
  collapsed.value.push(false);
}

function deleteGuarantee(index) {
  guarantees.value.splice(index, 1);
  isGuaranteeByMember.value.splice(index, 1);
  collapsed.value.splice(index, 1);
}

function updateGuaranteeMember(index) {
  if (isGuaranteeByMember.value[index]) {
    guarantees.value[index].scope.member = "*";
    guarantees.value[index].of[0].scope.member = "*";
  } else {
    tpaEditionStore.deleteTpaField(props.fieldName + "[" + index + "].scope.member");
    tpaEditionStore.deleteTpaField(props.fieldName + "[" + index + "].of[0].scope.member");
  }
}
</script>

<template>
  
  <DataView :value="guarantees" dataKey="id" class="pr-2">
    <template #list="slotProps">
      <Fieldset :legend="slotProps.data.id" :toggleable="true" :collapsed="collapsed[slotProps.index]" class="col-12 my-2" @toggle="collapsed[slotProps.index] = !collapsed[slotProps.index]">
        
        <div class="flex flex-column align-items-start gap-3">
          <span v-if="isEditionMode" class="flex align-items-center gap-2">
            <i class="pi pi-file-edit"></i>
            <span class="font-semibold">Id:</span>
            <EditContent :fieldName="fieldName + '[' + slotProps.index + ']' + '.id'" />
          </span>

          <span class="flex align-items-center gap-2">
            <i class="pi pi-file-edit"></i>
            <span class="font-semibold">Notes:</span>
            <EditContent v-if="isEditionMode" :fieldName="fieldName + '[' + slotProps.index + ']' + '.notes'" />
            <span v-else>{{ slotProps.data.notes }}</span>
          </span>

          <span class="flex align-items-center gap-2">
            <i class="pi pi-align-left"></i>
            <span class="font-semibold">Description:</span>
            <EditContent v-if="isEditionMode" :fieldName="fieldName + '[' + slotProps.index + ']' + '.description'" />
            <span v-else>{{ slotProps.data.description }}</span>
          </span>

          <span class="flex align-items-center gap-2">
            <i class="pi pi-users"></i>
            <span class="font-semibold">Is guarantee by member?</span>
            <Checkbox v-model="isGuaranteeByMember[slotProps.index]" :disabled="!isEditionMode" :readonly="!isEditionMode" :binary="true" trueValue="*" :falseValue="undefined" @change="updateGuaranteeMember(slotProps.index)" />
          </span>

          <span class="flex align-items-center gap-2">
            <i class="pi pi-clock"></i>
            <span class="font-semibold">Calculation period:</span>
            <Dropdown v-if="isEditionMode" class="editDropdown" :options="WINDOW_PERIOD_OPTIONS" v-model="slotProps.data.of[0].window.period" optionLabel="label" optionValue="value" placeholder="Select a window period" />
            <Tag v-else :value="slotProps.data.of[0].window.period"></Tag>
          </span>

          <span class="flex align-items-center gap-2">
            <i class="pi pi-check-circle"></i>
            <span class="font-semibold">Objective:</span>
            <EditContent v-if="isEditionMode" :fieldName="fieldName + '[' + slotProps.index + ']' + '.of[0].objective'" />
            <Tag v-else :value="slotProps.data.of[0].objective"></Tag>
          </span>

        </div>
        
        <Button v-if="isEditionMode" class="mt-2" icon="pi pi-trash" severity="danger" @click="deleteGuarantee(slotProps.index)" />
        
      </Fieldset>
    </template>
    
    <template #footer v-if="isEditionMode">
      <Button class="mt-2" label="Add new guarantee" icon="pi pi-plus" @click="addNewGuarantee" />
    </template>
  </DataView>
  
</template>