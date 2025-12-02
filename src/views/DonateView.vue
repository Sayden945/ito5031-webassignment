<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">Make a Donation</h3>
          </div>
          <div class="card-body">
            <!-- Login prompt if not authenticated -->
            <div v-if="!userStore.user" class="alert alert-warning">
              <p class="mb-2">Please log in to make a donation.</p>
              <router-link to="/login" class="btn btn-primary">Login</router-link>
            </div>

            <!-- Donation form -->
            <form v-else @submit.prevent="handleDonation">
              <div class="mb-3">
                <label for="amount" class="form-label">Donation Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  v-model.number="amount"
                  class="form-control"
                  min="1"
                  step="0.01"
                  required
                  placeholder="Enter amount"
                />
              </div>

              <div class="mb-3">
                <label for="message" class="form-label">Message (optional)</label>
                <textarea
                  id="message"
                  v-model="message"
                  class="form-control"
                  rows="3"
                  placeholder="Leave a message with your donation"
                ></textarea>
              </div>

              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  id="anonymous"
                  v-model="isAnonymous"
                  class="form-check-input"
                />
                <label for="anonymous" class="form-check-label">Make donation anonymous</label>
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
            <div v-if="userStore.user && donationStore.userDonations.length > 0" class="mt-4">
              <h5>Your Donation History</h5>
              <ul class="list-group">
                <li
                  v-for="donation in donationStore.userDonations"
                  :key="donation.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>${{ donation.amount.toFixed(2) }}</strong>
                    <small class="text-muted ms-2">
                      {{ formatDate(donation.createdAt) }}
                    </small>
                  </div>
                  <span class="badge bg-success">{{ donation.status }}</span>
                </li>
              </ul>
              <p class="mt-2 text-muted">
                Total donated: <strong>${{ donationStore.totalDonated.toFixed(2) }}</strong>
              </p>
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
const message = ref('')
const isAnonymous = ref(false)
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
    await donationStore.addDonation(amount.value, message.value, isAnonymous.value)
    successMessage.value = `Thank you for your donation of $${amount.value.toFixed(2)}!`

    // Reset form
    amount.value = null
    message.value = ''
    isAnonymous.value = false
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
