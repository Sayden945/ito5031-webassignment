<template>
  <div class="home">
    <section class="hero bg-primary text-white py-5">
      <div class="container">
        <div class="align-items-center text-align-center">
          <div class="text-center mb-4">
            <h1 class="display-4 text-align-center fw-bold">Safe Haven Australia</h1>
            <p class="lead">Placeholder</p>
            <button class="btn btn-light btn-lg">Donate Today</button>
          </div>
        </div>
      </div>
    </section>

    <section class="features py-5">
      <div class="container">
        <h2 class="text-center mb-5">Our Mission</h2>
        <div class="row g-4">
          <div class="col-12 col-sm-6 col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <i class="bi bi-lightning-charge fs-1 text-primary"></i>
                <h5 class="card-title mt-3">Raise Awareness</h5>
                <p class="card-text">Blah blahr raise awareness</p>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <i class="bi bi-shield-check fs-1 text-primary"></i>
                <h5 class="card-title mt-3">Advocate</h5>
                <p class="card-text">Advocate blah blah</p>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <i class="bi bi-graph-up fs-1 text-primary"></i>
                <h5 class="card-title mt-3">Support</h5>
                <p class="card-text">Blah blah support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta bg-light py-5">
      <div class="container text-center">
        <h2 class="mb-4">Want to get involved?</h2>
        <button class="btn btn-primary btn-lg">Sign Up Now</button>
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
  min-height: 400px;
}
</style>
