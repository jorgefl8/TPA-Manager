<script setup>
import { ref, defineProps } from 'vue';
import 'vue-json-pretty/lib/styles.css';
import Checkbox from 'primevue/checkbox';

const props = defineProps({
    scope: {
        type: Object,
        required: true
    }
});

const isMemberNeeded = ref(props.scope?.member?.default == '*');

</script>

<template>
    <p>Project: {{ scope.project.default }}</p>
    <p>Course: {{ scope.class.default }}</p>
    <p>Will calculations by member be required? <Checkbox class="ml-2" v-model="isMemberNeeded" :binary="true" /></p>
</template>