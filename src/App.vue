<script setup>
</script>

<template>
  <main>
    <div class="wrapper">
      <router-view />
    </div>
  </main>
</template>

<style>
/* @import url('https://fonts.googleapis.com/css?family=Abel'); */
@import url('https://fonts.googleapis.com/css?family=Didact Gothic');

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

.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid !important;
}
.p-divider-solid.p-divider-vertical:before {
  border-left-style: solid !important;
}
</style>
