<template>
  <div class="donate-view py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8 col-xl-6">
          <div class="text-center mb-4">
            <h1 class="display-5 fw-bold mb-3">Make a Donation</h1>
            <p class="lead text-muted">Every contribution helps us support refugees in need</p>
          </div>
          <div class="card border-0 shadow-lg">
            <div class="card-header bg-gradient-primary text-white py-4">
              <h3 class="mb-0 text-center">
                <i class="bi bi-heart-fill me-2"></i>Your Contribution
              </h3>
            </div>
            <div class="card-body p-4 p-md-5">
              <!-- Login prompt if not authenticated -->
              <div v-if="!userStore.user" class="alert alert-warning border-0 shadow-sm">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
                  <div>
                    <h5 class="mb-1">Authentication Required</h5>
                    <p class="mb-0">
                      Please log in to make a donation and track your contributions.
                    </p>
                  </div>
                </div>
                <router-link to="/login" class="btn btn-primary w-100">
                  <i class="bi bi-box-arrow-in-right me-2"></i>Login Now
                </router-link>
              </div>

              <!-- Donation form -->
              <form v-else @submit.prevent="handleDonation">
                <div class="mb-4">
                  <label for="amount" class="form-label fw-semibold fs-5 mb-3"
                    >Donation Amount ($)</label
                  >
                  <div class="input-group input-group-lg">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-currency-dollar"></i>
                    </span>
                    <input
                      type="number"
                      id="amount"
                      v-model.number="amount"
                      class="form-control border-start-0 ps-0"
                      min="1"
                      step="0.01"
                      required
                      placeholder="Enter amount"
                    />
                  </div>
                  <div class="d-flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm"
                      @click="amount = 10"
                    >
                      $10
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm"
                      @click="amount = 25"
                    >
                      $25
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm"
                      @click="amount = 50"
                    >
                      $50
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm"
                      @click="amount = 100"
                    >
                      $100
                    </button>
                  </div>
                </div>

                <!-- Error message -->
                <div v-if="donationStore.error" class="alert alert-danger">
                  {{ donationStore.error }}
                </div>

                <!-- Success message -->
                <div v-if="successMessage" class="alert alert-success">
                  {{ successMessage }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="donationStore.loading || !amount"
                >
                  <span v-if="donationStore.loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </span>
                  <span v-else>Donate ${{ amount || '0' }}</span>
                </button>
              </form>

              <!-- Donation history -->
              <div
                v-if="userStore.user && donationStore.userDonations.length > 0"
                class="mt-5 pt-4 border-top"
              >
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="mb-0 fw-bold">Your Donation History</h5>
                  <span class="badge bg-primary rounded-pill"
                    >{{ donationStore.userDonations.length }} donations</span
                  >
                </div>
                <div class="alert alert-success border-0 shadow-sm mb-3">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-trophy-fill fs-3 me-3"></i>
                    <div>
                      <small class="text-muted d-block">Total Contributed</small>
                      <h4 class="mb-0 fw-bold">${{ donationStore.totalDonated.toFixed(2) }}</h4>
                    </div>
                  </div>
                </div>
                <div class="donation-list">
                  <div
                    v-for="donation in donationStore.userDonations.slice(0, 5)"
                    :key="donation.id"
                    class="donation-item p-3 mb-2 bg-light rounded d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div class="fw-bold text-primary fs-5">${{ donation.amount.toFixed(2) }}</div>
                      <small class="text-muted">
                        <i class="bi bi-calendar3 me-1"></i>{{ formatDate(donation.createdAt) }}
                      </small>
                    </div>
                    <span class="badge bg-success rounded-pill"
                      ><i class="bi bi-check-circle me-1"></i>{{ donation.status }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useDonationStore } from '@/stores/donationStore'

const userStore = useUserStore()
const donationStore = useDonationStore()

const amount = ref(null)
const successMessage = ref('')

onMounted(async () => {
  if (userStore.user) {
    await donationStore.fetchUserDonations()
  }
})

async function handleDonation() {
  successMessage.value = ''
  donationStore.clearError()

  try {
    await donationStore.addDonation(amount.value)
    successMessage.value = `Thank you for your donation of $${amount.value.toFixed(2)}!`

    // Reset form
    amount.value = null
  } catch (err) {
    console.error('Donation failed:', err)
  }
}

function formatDate(date) {
  if (!date) return 'Just now'
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.donate-view {
  min-height: calc(100vh - 200px);
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.donation-item {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.donation-item:hover {
  background-color: #e9ecef !important;
  border-left-color: #0d6efd;
  transform: translateX(4px);
}

.input-group-text {
  font-weight: 600;
}

.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

@media (max-width: 576px) {
  .card-body {
    padding: 1.5rem !important;
  }
}
</style>
