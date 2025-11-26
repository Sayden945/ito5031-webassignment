<script setup>
import NavHeader from './components/NavHeader.vue'
import PageFooter from './components/PageFooter.vue'
</script>

<template>
  <div class="main-container">
    <header>
      <NavHeader />
    </header>

    <main class="main-box">
      <router-view></router-view>
    </main>

    <footer>
      <PageFooter />
    </footer>
  </div>
</template>

<style scoped></style>
