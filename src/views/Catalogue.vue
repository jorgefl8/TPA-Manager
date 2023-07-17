<script setup>
import { useRouter } from 'vue-router';

import Button from 'primevue/button';

const router = useRouter();
</script>

<template>
  <div class="card" style="display: grid; justify-items: center; justify-content: center; grid-template-rows: auto auto; position: relative; width: fit-content; left: 50%; transform: translateX(-50%);">
    <h1>TPs Catalogue View</h1>
    <div style="display: grid; grid-auto-flow: column; gap: 1rem;">
        <Button label="🏠 Home" @click="router.push({ name: 'home' })" />
        <Button label="🔙 Back" @click="router.go(-1)" />
    </div>
  </div>
</template>