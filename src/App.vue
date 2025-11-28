<script setup>
import NavHeader from './components/NavHeader.vue'
import PageFooter from './components/PageFooter.vue'
</script>

<template>
  <div class="main-container">
    <NavHeader />

    <main class="main-box">
      <router-view></router-view>
    </main>

    <PageFooter />
  </div>
</template>

<style scoped></style>
