<template>
  <GuestLayout>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Log in to your account</h2>

      <div>
        <InputLabel for="email" value="Email" />
        <TextInput id="email" type="email" class="mt-1 block w-full" v-model="form.email" required autofocus autocomplete="username" />
        <InputError class="mt-1" :message="errors.email?.[0]" />
      </div>

      <div>
        <InputLabel for="password" value="Password" />
        <TextInput id="password" type="password" class="mt-1 block w-full" v-model="form.password" required autocomplete="current-password" />
        <InputError class="mt-1" :message="errors.password?.[0]" />
      </div>

      <div class="flex items-center justify-between mt-4">
        <RouterLink to="/forgot-password" class="text-sm text-gray-600 underline hover:text-gray-900">
          Forgot your password?
        </RouterLink>
        <PrimaryButton :disabled="processing">
          {{ processing ? 'Logging in...' : 'Log in' }}
        </PrimaryButton>
      </div>

      <p class="text-center text-sm text-gray-500 mt-2">
        Don't have an account?
        <RouterLink to="/register" class="text-indigo-600 font-medium hover:underline">Register</RouterLink>
      </p>
    </form>
  </GuestLayout>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import InputError from '@/components/InputError.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import { useAuthStore } from '@/stores/auth.js'
import { useApi } from '@/composables/useApi.js'

const router = useRouter()
const auth   = useAuthStore()
const { errors, processing } = useApi()

const form = reactive({ email: '', password: '' })

async function handleSubmit() {
    errors.value = {}
    processing.value = true
    try {
        const result = await auth.login(form)
        if (result?.requires_otp) {
            router.push({ path: '/verify-otp', query: { user_id: result.user_id, email: result.email } })
        } else {
            router.push('/dashboard')
        }
    } catch (err) {
        const status = err.response?.status
        if (status === 422) {
            errors.value = err.response.data.errors ?? {}
        } else if (status >= 500) {
            errors.value = { email: ['Server error. Please try again later.'] }
        } else {
            errors.value = { email: [err.response?.data?.message ?? 'Invalid credentials.'] }
        }
    } finally {
        processing.value = false
    }
}
</script>
