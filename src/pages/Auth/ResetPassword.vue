<template>
  <GuestLayout>
    <form @submit.prevent="handleSubmit">
      <div>
        <InputLabel for="email" value="Email" />
        <TextInput id="email" type="email" class="mt-1 block w-full" v-model="form.email" required autofocus autocomplete="username" />
        <InputError class="mt-1" :message="errors.email?.[0]" />
      </div>

      <div class="mt-4">
        <InputLabel for="password" value="Password" />
        <TextInput id="password" type="password" class="mt-1 block w-full" v-model="form.password" required autocomplete="new-password" />
        <InputError class="mt-1" :message="errors.password?.[0]" />
      </div>

      <div class="mt-4">
        <InputLabel for="password_confirmation" value="Confirm Password" />
        <TextInput id="password_confirmation" type="password" class="mt-1 block w-full" v-model="form.password_confirmation" required autocomplete="new-password" />
        <InputError class="mt-1" :message="errors.password_confirmation?.[0]" />
      </div>

      <div class="mt-4 flex items-center justify-end">
        <PrimaryButton :disabled="processing">
          {{ processing ? 'Resetting...' : 'Reset Password' }}
        </PrimaryButton>
      </div>
    </form>
  </GuestLayout>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GuestLayout from '@/layouts/GuestLayout.vue'
import InputLabel from '@/components/InputLabel.vue'
import InputError from '@/components/InputError.vue'
import TextInput from '@/components/TextInput.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import { useApi } from '@/composables/useApi.js'

const route  = useRoute()
const router = useRouter()
const { errors, processing, submit } = useApi()

const form = reactive({
    token: route.query.token ?? '',
    email: route.query.email ?? '',
    password: '',
    password_confirmation: '',
})

async function handleSubmit() {
    const result = await submit('post', '/auth/reset-password', form, {
        onSuccess: () => router.push('/login'),
    })
    if (result) {
        form.password = ''
        form.password_confirmation = ''
    }
}
</script>
