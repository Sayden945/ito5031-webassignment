<template>
  <div class="sticky-top">
    <header class="d-flex justify-content-center py-3 bg-dark">
      <ul class="nav nav-pills">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About Us</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/resources" class="nav-link" active-class="active"
            >Resources</router-link
          >
        </li>
        <li class="nav-item">
          <router-link to="/donate" class="nav-link" active-class="active">Donate</router-link>
        </li>
        <div class="col mg-1 justify-content-end">
          <li class="nav-item">
            <router-link to="/account" class="nav-link" active-class="active">Account</router-link>
          </li>
        </div>
      </ul>
    </header>
  </div>
</template>

<style scoped></style>
