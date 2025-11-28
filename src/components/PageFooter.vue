<template>
  <footer class="bg-dark text-light">
    <div class="container">
      <div class="row">
        <!-- Sitemap Section -->
        <div class="col-md-6 mb-4">
          <h5 class="mb-3">Sitemap</h5>
          <div class="row">
            <div class="col-6">
              <ul class="list-unstyled">
                <li>
                  <router-link to="/" class="text-light text-decoration-none">Home</router-link>
                </li>
                <li>
                  <router-link to="/about" class="text-light text-decoration-none"
                    >About</router-link
                  >
                </li>
              </ul>
            </div>
            <!-- <div class="col-6">
              <ul class="list-unstyled">
                <li>
                  <router-link to="/contact" class="text-light text-decoration-none"
                    >Contact</router-link
                  >
                </li>
                <li>
                  <router-link to="/Privacy" class="text-light text-decoration-none"
                    >Privacy Policy</router-link
                  >
                </li>
              </ul>
            </div> -->
          </div>
        </div>

        <!-- Contact Information Section -->
        <div class="col-md-6 mb-4">
          <h5 class="mb-3">Contact Information</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <i class="bi bi-geo-alt-fill me-2"></i>
              42 Wallaby Way, Sydney, Australia
            </li>
            <li class="mb-2">
              <i class="bi bi-telephone-fill me-2"></i>
              +61 2 1234 5678
            </li>
            <li class="mb-2">
              <i class="bi bi-envelope-fill me-2"></i>
              <a href="mailto:info@example.com" class="text-light text-decoration-none"
                >info@example.com</a
              >
            </li>
          </ul>
        </div>
      </div>

      <hr class="bg-light" />

      <!-- Copyright Section -->
      <div class="row">
        <div class="col-12 text-center">
          <p class="mb-0">&copy; 2025 ##Company. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script></script>

<style scoped>
footer a:hover {
  opacity: 0.8;
}

footer li {
  margin-bottom: 0.5rem;
}
</style>
