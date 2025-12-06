<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth'
import { onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const auth = getAuth()
const userStore = useUserStore()

const formData = ref({
  userFirstName: '',
  userLastName: '',
  userEmail: '',
  userPassword: '',
})

// Add validation state
const validationErrors = ref({
  password: '',
  email: '',
  general: '',
})

/* Handles if login or register */
const isLogin = ref(true)

// Client-side password validation (more reliable than Firebase validatePassword)
const validatePasswordClient = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasNonalphas = /\W/.test(password)

  if (password.length < minLength) {
    return { isValid: false, errorMessage: 'Password must be at least 8 characters long' }
  }
  if (!hasUpperCase) {
    return { isValid: false, errorMessage: 'Password must contain at least one uppercase letter' }
  }
  if (!hasLowerCase) {
    return { isValid: false, errorMessage: 'Password must contain at least one lowercase letter' }
  }
  if (!hasNumbers) {
    return { isValid: false, errorMessage: 'Password must contain at least one number' }
  }
  if (!hasNonalphas) {
    return { isValid: false, errorMessage: 'Password must contain at least one special character' }
  }

  return { isValid: true, errorMessage: '' }
}

// Real-time password validation
const validatePasswordRealTime = () => {
  if (!formData.value.userPassword || isLogin.value) {
    validationErrors.value.password = ''
    return
  }

  // Use client-side validation instead of Firebase validatePassword
  const validation = validatePasswordClient(formData.value.userPassword)

  if (!validation.isValid) {
    validationErrors.value.password = validation.errorMessage
  } else {
    validationErrors.value.password = ''
  }
}

// Add computed property to check if form is valid
const isFormValid = computed(() => {
  if (isLogin.value) {
    return formData.value.userEmail && formData.value.userPassword
  }

  // For registration, check all validations
  return (
    formData.value.userEmail &&
    formData.value.userPassword &&
    !validationErrors.value.password &&
    !validationErrors.value.email
  )
})

const handleSubmit = async (event) => {
  // Clear previous errors
  validationErrors.value = { password: '', email: '', general: '' }

  if (isLogin.value) {
    firebaseLoginUser(event)
  } else {
    // Validate password before registration
    const password = event.target.password.value
    const validation = validatePasswordClient(password)

    if (validation.isValid) {
      firebaseRegisterUser(event)
    } else {
      validationErrors.value.password = validation.errorMessage
    }
  }
}

/* Toggles between login and register forms*/
const toggleLoginRegister = () => {
  isLogin.value = !isLogin.value
  // Clear validation errors when switching modes
  validationErrors.value = { password: '', email: '', general: '' }
  formData.value.userPassword = ''
}

const firebaseLoginUser = (event) => {
  formData.value.userEmail = event.target.email.value
  formData.value.userPassword = event.target.password.value

  // Set browser session persistence if "Remember Me" is checked
  if (event.target.rememberMe && event.target.rememberMe.checked) {
    setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.error('Error setting persistence:', error)
    })
  }

  // Sign in user
  signInWithEmailAndPassword(auth, formData.value.userEmail, formData.value.userPassword)
    .then((userCredential) => {
      const user = userCredential.user
      console.log('Login successful:', user)
      userStore.login(user)
      router.push({ name: 'account' })
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.error('Login error:', errorCode, errorMessage)

      // Set specific error messages based on error code
      if (errorCode === 'auth/user-not-found') {
        validationErrors.value.email = 'No account found with this email'
      } else if (errorCode === 'auth/wrong-password') {
        validationErrors.value.password = 'Incorrect password'
      } else if (errorCode === 'auth/invalid-email') {
        validationErrors.value.email = 'Invalid email address'
      } else if (errorCode === 'auth/invalid-credential') {
        validationErrors.value.general = 'Invalid email or password'
      } else {
        validationErrors.value.general = errorMessage
      }
    })
}

// Register new user
const firebaseRegisterUser = (event) => {
  formData.value.userEmail = event.target.email.value
  formData.value.userPassword = event.target.password.value

  createUserWithEmailAndPassword(auth, formData.value.userEmail, formData.value.userPassword)
    .then(async (userCredential) => {
      const user = userCredential.user
      console.log('Registration successful:', user)

      // Pass firstName and lastName to the login function
      await userStore.login(user)

      // Update user profile with firstName and lastName
      if (formData.value.userFirstName || formData.value.userLastName) {
        await userStore.updateUserProfile({
          firstName: formData.value.userFirstName,
          lastName: formData.value.userLastName,
        })
      }

      router.push({ name: 'account' })
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.error('Registration error:', errorCode, errorMessage)

      // Set specific error messages based on code
      if (errorCode === 'auth/email-already-in-use') {
        validationErrors.value.email = 'An account with this email already exists'
      } else if (errorCode === 'auth/invalid-email') {
        validationErrors.value.email = 'Invalid email address'
      } else if (errorCode === 'auth/weak-password') {
        validationErrors.value.password = 'Password is too weak. Must be at least 6 characters.'
      } else {
        validationErrors.value.general = errorMessage
      }
    })
}

onMounted(() => {
  if (localStorage.getItem('isUserLoggedIn')) {
    userStore.login(userStore.isAuthenticated)
    router.push({ name: 'account' })
  }
})
</script>

<template>
  <div class="login-container">
    <div class="login-card text-center">
      <h2 class="mb-4" v-if="isLogin">Sign In</h2>
      <h2 class="mb-4" v-else>Register</h2>

      <!-- General error alert -->
      <div v-if="validationErrors.general" class="alert alert-danger" role="alert">
        {{ validationErrors.general }}
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Name fields for registration -->
        <div class="row mb-3" v-if="!isLogin">
          <div class="col-6">
            <label for="firstName" class="form-label">First Name</label>
            <input
              type="text"
              class="form-control"
              id="firstName"
              v-model="formData.userFirstName"
              required
            />
          </div>
          <div class="col-6">
            <label for="lastName" class="form-label">Last Name</label>
            <input
              type="text"
              class="form-control"
              id="lastName"
              v-model="formData.userLastName"
              required
            />
          </div>
        </div>

        <!-- Email field with validation -->
        <div class="mb-3">
          <label for="email" class="form-label">Email address</label>
          <input
            type="email"
            class="form-control"
            :class="{ 'is-invalid': validationErrors.email }"
            id="email"
            v-model="formData.userEmail"
            required
          />
          <div v-if="validationErrors.email" class="invalid-feedback">
            {{ validationErrors.email }}
          </div>
        </div>

        <!-- Password field with validation -->
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            :class="{ 'is-invalid': validationErrors.password }"
            id="password"
            v-model="formData.userPassword"
            @input="!isLogin && validatePasswordRealTime()"
            required
          />
          <div v-if="validationErrors.password" class="invalid-feedback">
            {{ validationErrors.password }}
          </div>

          <!-- Password requirements hint for registration -->
          <div v-if="!isLogin && !validationErrors.password" class="form-text">
            Password must be at least 8 characters with uppercase, lowercase, number, and special
            character.
          </div>
        </div>

        <!-- Remember Me checkbox for login -->
        <div class="mb-3 form-check text-start" v-if="isLogin">
          <input type="checkbox" class="form-check-input" id="rememberMe" />
          <label class="form-check-label" for="rememberMe">Remember me</label>
        </div>

        <!-- Submit buttons -->
        <button type="submit" class="btn btn-primary w-100" :disabled="!isFormValid" v-if="isLogin">
          Sign In
        </button>
        <button type="submit" class="btn btn-primary w-100" :disabled="!isFormValid" v-else>
          Register
        </button>
      </form>

      <!-- Toggle links -->
      <div class="mt-3" v-if="isLogin">
        <a href="#" class="link-secondary">Forgot my password</a> |
        <a href="#" class="link-secondary" @click="toggleLoginRegister">Create an account</a>
      </div>
      <div class="mt-3" v-else>
        <a href="#" class="link-secondary" @click="toggleLoginRegister">Back to Login</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 360px;
  margin: auto;
  padding: 15px;
  padding: 15px;
  border: 1px solid 1px solid #e3e3e3;
  border-radius: 10px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.login-container {
  min-height: calc(100vh - 150px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo {
  display: block;
  margin: 0 auto 20px;
}
</style>
