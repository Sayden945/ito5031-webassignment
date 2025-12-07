<template>
  <footer class="bg-dark text-light pt-5 pb-3 mt-5">
    <div class="container">
      <div class="row g-4">
        <!-- Quick Links Section -->
        <div class="col-md-3 col-sm-6">
          <h5 class="mb-3 fw-bold">Quick Links</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/" class="footer-link">
                <i class="bi bi-house-door me-2"></i>Home
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/about" class="footer-link">
                <i class="bi bi-info-circle me-2"></i>About Us
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/resources" class="footer-link">
                <i class="bi bi-book me-2"></i>Resources
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/locations" class="footer-link">
                <i class="bi bi-geo-alt me-2"></i>Our Locations
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Services Section -->
        <div class="col-md-3 col-sm-6">
          <h5 class="mb-3 fw-bold">Get Involved</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/donate" class="footer-link">
                <i class="bi bi-heart me-2"></i>Donate
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/account" class="footer-link">
                <i class="bi bi-calendar-check me-2"></i>Book Event
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact Information Section -->
        <div class="col-md-3 col-sm-6">
          <h5 class="mb-3 fw-bold">Contact Us</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <i class="bi bi-geo-alt-fill me-2 text-primary"></i>
              <span class="small">123 Main Street<br />Melbourne VIC 3000</span>
            </li>
            <li class="mb-2">
              <i class="bi bi-telephone-fill me-2 text-primary"></i>
              <a href="tel:+61212345678" class="footer-link">+61 2 1234 5678</a>
            </li>
            <li class="mb-2">
              <i class="bi bi-envelope-fill me-2 text-primary"></i>
              <a href="mailto:info@example.com" class="footer-link">info@example.com</a>
            </li>
          </ul>
        </div>

        <!-- Office Hours & Social Section -->
        <div class="col-md-3 col-sm-6">
          <h5 class="mb-3 fw-bold">Office Hours</h5>
          <p class="small mb-3">
            Monday - Friday: 9:00 AM - 5:00 PM<br />
            Saturday: 10:00 AM - 2:00 PM<br />
            Sunday: Closed
          </p>
          <h6 class="mb-2 fw-bold">Emergency Support</h6>
          <p class="small">
            <i class="bi bi-telephone-fill me-2 text-danger"></i>
            <a href="tel:1800123456" class="footer-link text-danger">1800 123 456</a>
            <br />
            <span class="text-muted">Available 24/7</span>
          </p>
        </div>
      </div>

      <hr class="bg-secondary mt-4 mb-3" />

      <!-- Copyright Section -->
      <div class="row">
        <div class="col-12 text-center">
          <p class="mb-2 small text-muted">
            Supporting refugees and asylum seekers with dignity and compassion
          </p>
          <p class="mb-0 small">&copy; 2025 Safe Haven Australia. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script></script>

<style scoped>
.footer-link {
  color: #adb5bd;
  text-decoration: none;
}

.footer-link:hover {
  color: #fff;
}
</style>
