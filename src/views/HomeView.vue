<template>
  <div class="home">
    <section class="hero bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center justify-content-center">
          <div class="col-12 col-lg-10 text-center">
            <h1 class="display-3 display-md-2 fw-bold mb-4 animate-fade-in">
              Safe Haven Australia
            </h1>
            <p class="lead fs-4 fs-md-3 mb-4 px-3 px-md-5">
              Supporting refugees and raising awareness for those seeking safety and a better future
            </p>
            <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <router-link to="/donate" class="btn btn-light btn-lg px-4 py-3 shadow-sm">
                <i class="bi bi-heart-fill me-2"></i>Donate Today
              </router-link>
              <router-link to="/resources" class="btn btn-outline-light btn-lg px-4 py-3">
                <i class="bi bi-book me-2"></i>Learn More
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features py-5 bg-light">
      <div class="container py-4">
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold mb-3">Our Mission</h2>
          <p class="text-muted fs-5">Making a difference through action and compassion</p>
        </div>
        <div class="row g-4 justify-content-center">
          <div class="col-12 col-sm-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm hover-lift">
              <div class="card-body text-center p-4">
                <div class="icon-circle bg-primary bg-opacity-10 mx-auto mb-4">
                  <i class="bi bi-lightning-charge fs-1 text-primary"></i>
                </div>
                <h5 class="card-title fw-bold mb-3">Raise Awareness</h5>
                <p class="card-text text-muted">
                  Educating communities about refugee challenges and fostering understanding through
                  impactful stories and resources
                </p>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm hover-lift">
              <div class="card-body text-center p-4">
                <div class="icon-circle bg-primary bg-opacity-10 mx-auto mb-4">
                  <i class="bi bi-shield-check fs-1 text-primary"></i>
                </div>
                <h5 class="card-title fw-bold mb-3">Advocate</h5>
                <p class="card-text text-muted">
                  Championing policy changes and human rights to create a safer, more welcoming
                  environment for refugees
                </p>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm hover-lift">
              <div class="card-body text-center p-4">
                <div class="icon-circle bg-primary bg-opacity-10 mx-auto mb-4">
                  <i class="bi bi-people-fill fs-1 text-primary"></i>
                </div>
                <h5 class="card-title fw-bold mb-3">Support</h5>
                <p class="card-text text-muted">
                  Providing essential resources, volunteer opportunities, and direct assistance to
                  help refugees rebuild their lives
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta py-5">
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8 text-center">
            <h2 class="display-5 fw-bold mb-4">Want to get involved?</h2>
            <p class="lead mb-4 text-muted">
              Join our community of volunteers and make a real difference in the lives of refugees
            </p>
            <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <router-link to="/account" class="btn btn-primary btn-lg px-5 py-3 shadow">
                <i class="bi bi-person-plus me-2"></i>Sign Up Now
              </router-link>
              <router-link to="/about" class="btn btn-outline-primary btn-lg px-5 py-3">
                <i class="bi bi-info-circle me-2"></i>Learn About Us
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
}
</script>

<style scoped>
.hero {
  min-height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
}

@media (min-width: 768px) {
  .hero {
    min-height: 600px;
  }
}

.icon-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.hover-lift {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.hover-lift:hover .icon-circle {
  transform: scale(1.1);
  background-color: rgba(13, 110, 253, 0.2) !important;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn {
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.cta {
  background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
}
</style>
