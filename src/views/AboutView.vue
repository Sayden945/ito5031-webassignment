<template>
  <div class="about-view py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h1 class="display-4 fw-bold mb-3">About Us</h1>
        <p class="lead text-muted">Dedicated to supporting refugees and creating positive change</p>
      </div>

      <!-- Mission and Values Section -->
      <section class="mb-5">
        <h2 class="display-6 fw-bold mb-4 text-center">Our Mission & Values</h2>
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-center">Our Mission</h5>
                <p class="card-text">
                  We are dedicated to improving the lives of refugees by raising awareness,
                  advocating for policy changes, and providing essential support to help them
                  rebuild their lives.
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-center">Our Values</h5>
                <ul class="list-unstyled">
                  <li class="mb-2">
                    <strong>Integrity:</strong> We operate with honesty and transparency
                  </li>
                  <li class="mb-2">
                    <strong>Compassion:</strong> We act with empathy and care for those in need
                  </li>
                  <li class="mb-2">
                    <strong>Empowerment:</strong> We help refugees rebuild their lives with dignity
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="mb-5">
        <h2 class="display-6 fw-bold mb-4 text-center">Contact Us</h2>
        <div class="card border-0 shadow">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3 mb-md-0">
                <h5>Get in Touch</h5>
                <p><strong>Email:</strong> info@example.com</p>
                <p><strong>Phone:</strong> +61 2 1234 5678</p>
                <p><strong>Address:</strong> 42 Wallaby Way, Sydney, Australia</p>
              </div>
              <div class="col-md-6">
                <h5>Contact Hours</h5>
                <p><strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM</p>
                <p><strong>Saturday - Sunday:</strong> Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section>
        <h2 class="display-6 fw-bold mb-4 text-center">Frequently Asked Questions</h2>
        <div class="accordion accordion-flush" id="faqAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq1"
                aria-expanded="true"
                aria-controls="faq1"
              >
                What do you do?
              </button>
            </h2>
            <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                We offer a wide range of services tailored to inform the community, offer support,
                and empower refugees, including educational programs, legal assistance, and
                community initiatives.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq2"
                aria-expanded="false"
                aria-controls="faq2"
              >
                How can I get started?
              </button>
            </h2>
            <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Getting started is easy! Simply create an account, explore our resources, and
                utilize our tools to participate in advocacy, awareness campaigns, volunteering, or
                access essential support for refugees.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq3"
                aria-expanded="false"
                aria-controls="faq3"
              >
                Do you offer support?
              </button>
            </h2>
            <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Yes, we provide comprehensive support to all our customers. Our support team is
                available during business hours to assist you.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.about-view {
  background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
  min-height: calc(100vh - 200px);
}

.card {
  border: none;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.nav-link {
  cursor: pointer;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  color: #0d6efd;
  font-weight: 600;
}

.accordion-button:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.list-unstyled li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.list-unstyled li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .display-4 {
    font-size: 2.5rem;
  }

  .display-6 {
    font-size: 1.75rem;
  }
}
</style>
