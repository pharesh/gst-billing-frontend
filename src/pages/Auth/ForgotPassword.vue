<template>
  <GuestLayout>
    <div class="mb-4 text-sm text-gray-600">
      Forgot your password? No problem. Just let us know your email address and we will email you a password reset link.
    </div>

    <div v-if="successMessage" class="mb-4 text-sm font-medium text-green-600">
      {{ successMessage }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div>
        <InputLabel for="email" value="Email" />
        <TextInput id="email" type="email" class="mt-1 block w-full" v-model="form.email" required autofocus autocomplete="username" />
        <InputError class="mt-1" :message="errors.email?.[0]" />
      </div>

      <div class="mt-4 flex items-center justify-end">
        <PrimaryButton :disabled="processing">
          {{ processing ? 'Sending...' : 'Email Password Reset Link' }}
        </PrimaryButton>
      </div>
    </form>
  </GuestLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import InputError from '@/components/InputError.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import { useApi } from '@/composables/useApi.js'

const { errors, processing, submit } = useApi()
const successMessage = ref('')
const form = reactive({ email: '' })

async function handleSubmit() {
    successMessage.value = ''
    const result = await submit('post', '/auth/forgot-password', form)
    if (result) {
        successMessage.value = result.message ?? 'Reset link sent!'
        form.email = ''
    }
}
</script>
