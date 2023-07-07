<script setup>
import { computed } from 'vue';
import 'vue-json-pretty/lib/styles.css';
import TriStateCheckbox from 'primevue/tristatecheckbox';

const props = defineProps({
    scope: {
        type: Object,
        required: true
    }
});

const isMemberNeeded = computed(() => {
    return props.scope?.member?.default == '*'
});

</script>

<template>
    <p>Project: {{ scope.project.default }}</p>
    <p>Course: {{ scope.class.default }}</p>
    <p>Will calculations by member be required? <TriStateCheckbox class="ml-2" v-model="isMemberNeeded" /></p>
</template>