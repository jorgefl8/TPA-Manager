<script setup>
import { ref, defineProps } from 'vue';
import Checkbox from 'primevue/checkbox';

const props = defineProps({
    config: {
        type: Object,
        required: true
    }
});

const useDefaultDashboard = ref(!props.config?.blocks);

</script>

<template>
    Use the default dashboard blocks? <Checkbox class="ml-2" v-model="useDefaultDashboard" :binary="true" />
    
    <ul v-if="!useDefaultDashboard">
        <li v-for="(block, index) in props.config.blocks" :key="index">
            <h4>Block {{ parseInt(index) + 1 }}</h4>
            <ul>
                <li>Type: {{ block.type }}</li>
                <li>Guarantee: {{ block.guarantee }}</li>
                <li>Config:</li>
                <ul>
                    <li v-for="(value, key) in block.config" :key="key">{{ key }}: {{ value }}</li>
                </ul>
            </ul>
        </li>
    </ul>
</template>

<!-- Convertir el tipo y la garantía en un Dropdown para poder mostrar el valor actual y editarlo si lo desea el usuario -->
<!-- Establecer una serie de convenios, como el identificador del título del block, ayudaría a generalizar todo -->
<!-- Establecer el valor de la "scope-class" de las "config" de cada block con el curso al que pertenece el proyecto del acuerdo -->
<!-- Hacer un estudio de cada uno de los blocks actuales para ver qué tipo de parámetros de configuración aceptan, para poder así facilitar al usuario 
     la interacción con los mismos. Ejemplo: "x-axis-metric", "y-axis-metric" y "not-zero-metric" podrían tener un Dropdown con las métricas que se 
     encuentran definidas actualmente en la garantía para poder elegir entre las mismas. -->
<!-- Añadir un botón para añadir un nuevo bloque -->
<!-- Añadir un botón para eliminar un bloque -->
<!-- Añadir un botón para editar un bloque -->
<!-- Añadir un botón para guardar los cambios -->
<!-- Añadir un botón para cancelar los cambios -->