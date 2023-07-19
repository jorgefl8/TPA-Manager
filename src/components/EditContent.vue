<script setup>
import { ref } from 'vue';
// import { storeToRefs } from 'pinia'
import { useTpaEditionStore } from '@/stores/tpaEdition';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

const props = defineProps({
  fieldName: {
    type: String,
    required: true
  }
});

const tpaEditionStore = useTpaEditionStore()
// const { originalTpa, modifiedTpa } = storeToRefs(tpaEditionStore);

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
  }
    
  displayDialog.value = false;
}
</script>

<template>
  <Button class="editableText" @click="showEditContent()">{{ valueBeforeEdit }}</Button>
  
  <Dialog v-model:visible="displayDialog" header="Edit value" modal :draggable="false" :closable="false" :dismissable-mask="true" :breakpoints="{ '960px': '75svw'}" style="width: 40svw">
    <template #header>
      <h1 class="mb-0">Edit value</h1>
    </template>
    
    <div class="mb-1" style="display: grid; gap: 1rem;">
      <div>
        <p class="mb-1"><b>Current value</b></p>
        <p>{{ valueBeforeEdit }}</p>
      </div>
      <div>
        <p class="mb-1"><b>New value</b></p>
        <InputText v-model="valueAfterEdit" class="w-full" autofocus="true" @keyup.enter="confirmEdit"/>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-content-end">
        <Button label="Save" icon="pi pi-check" @click="confirmEdit" />
        <Button label="Cancel" icon="pi pi-times" @click="displayDialog = false" />
      </div>
    </template>
  </Dialog>
</template>