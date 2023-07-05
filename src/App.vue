<script setup>
import { ref } from "vue";
import HelloWorld from './components/HelloWorld.vue'

const items = ref([
    {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        to: '/'
    },
    {
        label: 'Calendar',
        icon: 'pi pi-fw pi-calendar',
        to: '/calendar'
    },
    {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        to: '/edit'
    },
    {
        label: 'Documentation',
        icon: 'pi pi-fw pi-file',
        to: '/documentation'
    },
    {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        to: '/settings'
    }
]);
</script>

<template>
  <main>
    <div class="wrapper">
      <!-- <TabMenu :model="items" /> -->
      <!-- <router-view /> -->
      <HelloWorld />
    </div>
  </main>
</template>

<style scoped>
main {
  margin: 0;
  padding: 0;
  /* height: 100vh; */
  display:flex;
  align-items:center;
  justify-content:center;
}

.wrapper{
  padding: 1rem 2rem 0rem 2rem;
}
</style>
