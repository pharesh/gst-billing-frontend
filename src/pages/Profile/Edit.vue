<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">Profile</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-3xl sm:px-6 lg:px-8 space-y-6" v-if="!loading">

        <!-- Update Profile -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">Profile Information</h3>
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Name *</label>
              <input v-model="profileForm.name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              <p v-if="profileErrors.name" class="text-red-500 text-xs mt-1">{{ profileErrors.name[0] }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Email *</label>
              <input v-model="profileForm.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              <p v-if="profileErrors.email" class="text-red-500 text-xs mt-1">{{ profileErrors.email[0] }}</p>
            </div>
            <button type="submit" :disabled="profileProcessing" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              {{ profileProcessing ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- Update Password -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">Update Password</h3>
          <form @submit.prevent="updatePassword" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Current Password</label>
              <input v-model="passwordForm.current_password" type="password" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <p v-if="passwordErrors.current_password" class="text-red-500 text-xs mt-1">{{ passwordErrors.current_password[0] }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">New Password</label>
              <input v-model="passwordForm.password" type="password" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <p v-if="passwordErrors.password" class="text-red-500 text-xs mt-1">{{ passwordErrors.password[0] }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
              <input v-model="passwordForm.password_confirmation" type="password" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit" :disabled="passwordProcessing" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              {{ passwordProcessing ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </div>

      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'
import { useApi } from '@/composables/useApi.js'
import { useAuthStore } from '@/stores/auth.js'

const auth    = useAuthStore()
const loading = ref(true)
const { errors: profileErrors, processing: profileProcessing, submit: submitProfile } = useApi()
const { errors: passwordErrors, processing: passwordProcessing, submit: submitPassword } = useApi()

const profileForm  = reactive({ name: '', email: '' })
const passwordForm = reactive({ current_password: '', password: '', password_confirmation: '' })

async function loadData() {
    profileForm.name  = auth.user?.name ?? ''
    profileForm.email = auth.user?.email ?? ''
    loading.value = false
}

async function updateProfile() {
    await submitProfile('patch', '/profile', profileForm, {
        onSuccess: async () => { await auth.fetchUser() },
    })
}

async function updatePassword() {
    await submitPassword('put', '/password', passwordForm, {
        onSuccess: () => { passwordForm.current_password = ''; passwordForm.password = ''; passwordForm.password_confirmation = '' },
    })
}

onMounted(loadData)
</script>
