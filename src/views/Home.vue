<script setup>
import { ref } from 'vue'

import Button from 'primevue/button'
import Divider from 'primevue/divider';

import SelectTPA from '../components/SelectTPA.vue';

const selectTpaDialog = ref();
const isSelectTpaVisualizationMode = ref(true);

function openSelectTpaDialog(mode) {
    selectTpaDialog.value.displayDialog = true;
    isSelectTpaVisualizationMode.value = mode;
}
</script>

<template>
    <div class="card flex flex-column align-items-center px-7 py-5 mt-2">
        <h1 class="mb-5">Welcome to the TPA Manager!</h1>
        
        <div>
            <p style="text-align-last: justify;">This is the TPA Manager, a tool designed to help you manage your Team Practices Agreements!</p>
            <p>A TPA is a document that describes the practices a team should follow during the development of a project and it is comprised of several elements such as the following:</p>
            <ul>
                <li><b>Guarantees:</b> The guarantees that the team will provide to the client.</li>
                <li><b>Metrics:</b> The metrics that will be used to evaluate the fulfillment of those guarantees.</li>
                <li><b>Dashboards:</b> The dashboards that will be used to visualize the fulfillment of the guarantees.</li>
                <li><b>Extra information:</b> The extra information that will be used to complement the TPA (context, scopes, infrastructure settings...).</li>
            </ul>
            
            <p>The TPA Manager allows you to create and edit TPAs in a visual way, and then export them to a JSON file that can be used by the <a href="https://www.governify.io/" target="_blank">Governify platform</a>.</p>
            <p>To get started, you can opt for one of the following options:</p>

            <div class="flex justify-content-evenly mb-3">

                <div class="flex align-items-center">
                    <Button class="mr-3 flex-1" label="Create" icon="pi pi-plus" @click="create" />
                    <p style="flex: 2">Create a new TPA</p>
                </div>
                
                <Divider layout="vertical" />
                
                <div class="flex flex-column gap-2 my-2">
                    <div class="flex align-items-center">
                        <Button class="mr-3 flex-1" label="Visualize" icon="pi pi-search" @click="openSelectTpaDialog(true)" />
                        <p style="flex: 2">View an existing TPA</p>
                    </div>
                    <div class="flex align-items-center">
                        <Button class="mr-3 flex-1" label="Edit" icon="pi pi-pencil" @click="openSelectTpaDialog(false)" />
                        <p style="flex: 2">Edit an existing TPA</p>
                    </div>
                </div>

                <SelectTPA ref="selectTpaDialog" :isDialog="true" :isVisualizationMode="isSelectTpaVisualizationMode" />

            </div>
            
            <p><a href="https://github.com/governify" target="_blank">Governify</a> also provides a <a href="https://github.com/governify/governify-examples/tree/master/metrics" target="_blank">catalogue of TPs</a>
                and <a href="https://github.com/governify/governify-examples/tree/master/TPAs" target="_blank">TPAs</a> that can be used for reference as a starting point.
                This catalogue can also be consulted inside the TPA Manager by clicking the button below.</p>
            <div class="flex justify-content-center">
                <Button class="mr-3 mb-3" label="Catalogue" icon="pi pi-book" @click="catalogue" />
            </div>
            <p>
                This tool has been developed following the guidelines of the <a href="https://www.governify.io/reference-guides/iAgree-5_2" target="_blank">iAgree Syntax (version 5.2)</a>.
                Also, you can check out the <a href="https://www.governify.io/customization/agreement_modeling" target="_blank">documentation</a> for more info on how TPAs are modeled.
            </p>
        </div>

    </div>
</template>

<style scoped>
    p, ul, li {
        font-size: 1.125rem;
        max-width: 75ch;
    }
</style>