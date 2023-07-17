<script setup>
import { ref, computed } from 'vue';

import 'vue-json-pretty/lib/styles.css';

import TriStateCheckbox from 'primevue/tristatecheckbox';
import Button from 'primevue/button';

const props = defineProps({
    scope: {
        type: Object,
        required: true
    },
    editionMode: {
        type: Boolean,
    }
});

const isMemberNeeded = ref(props.scope?.member?.default == '*');
const isMemberNeededComputed = computed(() => {
    return props.scope?.member?.default == '*'
});

function handleEditContent(event) {
    event.preventDefault();
}

</script>

<template>
    <template v-if="props.editionMode">
        <p><span class="mr-1">Project: </span><Button class="editableText" @click="handleEditContent">{{ scope.project.default }}</Button></p>
        <p><span class="mr-1">Course: </span><Button class="editableText" @click="handleEditContent">{{ scope.class.default }}</Button></p>
        <p>Will calculations by member be required? <TriStateCheckbox class="ml-2" v-model="isMemberNeeded" /></p>
    </template>
    <template v-else>
        <p>Project: <span>{{ scope.project.default }}</span></p>
        <p>Course: <span>{{ scope.class.default }}</span></p>
        <p>Will calculations by member be required? <TriStateCheckbox class="ml-2" v-model="isMemberNeededComputed" /></p>
    </template>
</template>