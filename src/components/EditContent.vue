<script setup>
import { ref } from 'vue';
import { useTpaEditionStore } from '@/stores/tpaEdition';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

const props = defineProps({
  fieldName: {
    type: String,
    required: true
  }
});

const tpaEditionStore = useTpaEditionStore()

const valueBeforeEdit = ref(tpaEditionStore.getTpaField(props.fieldName));
const valueAfterEdit = ref(tpaEditionStore.getTpaField(props.fieldName));
const displayDialog = ref(false);

function showEditContent() {
  displayDialog.value = true;
}

function confirmEdit() {
  if (valueAfterEdit.value != valueBeforeEdit.value) {
    tpaEditionStore.updateTpaField(props.fieldName, valueAfterEdit.value);
    valueBeforeEdit.value = valueAfterEdit.value;

    if (props.fieldName.endsWith('objective')) {
      tpaEditionStore.updateGuaranteeWithNewObjective(props.fieldName.replace("objective", "with"), valueAfterEdit.value);
    }
  }
    
  displayDialog.value = false;
}
</script>

<template>
  <Button class="editableText" @click="showEditContent()">{{ valueBeforeEdit }}</Button>
  
  <Dialog v-model:visible="displayDialog" header="Edit value" modal :draggable="false" :closable="false" :breakpoints="{ '960px': '75svw'}" style="width: 30svw">
    <template #header>
      <h2 class="mb-0 font-bold">Edit value</h2>
    </template>
    
    <div class="mb-1" style="display: grid; gap: 1rem;">
      <div>
        <p class="mb-1"><b>Current value</b></p>
        <p>{{ valueBeforeEdit }}</p>
      </div>
      <div>
        <p class="mb-1"><b>New value</b></p>
        <Textarea v-if="props.fieldName.endsWith('notes')" v-model="valueAfterEdit" class="w-full" autofocus="true" />
        <InputText v-else v-model="valueAfterEdit" class="w-full" autofocus="true" @keyup.enter="confirmEdit"/>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-content-end">
        <Button icon="pi pi-check" label="Save" severity="success" @click="confirmEdit" />
        <Button icon="pi pi-times" label="Cancel" severity="danger" @click="displayDialog = false" />
      </div>
    </template>
  </Dialog>
</template>