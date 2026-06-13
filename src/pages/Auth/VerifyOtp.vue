<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">

      <div class="text-center mb-8">
        <div class="text-2xl font-bold text-indigo-600">GST Billing</div>
        <div class="text-gray-500 text-sm mt-1">Secure Login Verification</div>
      </div>

      <div class="bg-white shadow rounded-2xl p-8">
        <h1 class="text-xl font-semibold text-gray-800 text-center">Enter OTP</h1>

        <p class="text-sm text-gray-500 text-center mt-2 mb-6">
          A 6-digit OTP has been sent to<br>
          <span class="font-medium text-gray-700">{{ email }}</span>
        </p>

        <div v-if="flash.success" class="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
          {{ flash.success }}
        </div>

        <div v-if="otpError" class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
          {{ otpError }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="flex justify-center gap-3 mb-6" @paste="onPaste">
            <input
              v-for="(_, i) in otpBoxes"
              :id="`otp-${i}`"
              :key="i"
              v-model="otpBoxes[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              autocomplete="one-time-code"
              class="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              :class="otpBoxes[i] ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'"
              @input="onInput(i, $event)"
              @keydown="onKeydown(i, $event)"
            />
          </div>

          <button
            type="submit"
            :disabled="processing || fullOtp.length < 6"
            class="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ processing ? 'Verifying...' : 'Verify OTP' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-500">
          Didn't receive the OTP?
          <button @click="resendOtp" class="text-indigo-600 font-medium hover:underline ml-1" :disabled="processing">
            Resend OTP
          </button>
        </div>

        <div class="mt-4 text-center">
          <RouterLink to="/login" class="text-xs text-gray-400 hover:text-gray-600">Back to Login</RouterLink>
        </div>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">OTP is valid for 10 minutes. Do not share it with anyone.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useFlashStore } from '@/stores/flash.js'
import api from '@/api/index.js'

const route     = useRoute()
const router    = useRouter()
const auth      = useAuthStore()
const flash     = useFlashStore()
const processing = ref(false)
const otpError   = ref('')

const userId = route.query.user_id
const email  = route.query.email ?? ''

const otpBoxes = ref(['', '', '', '', '', ''])
const fullOtp  = computed(() => otpBoxes.value.join(''))

function onInput(index, event) {
    const val = event.target.value.replace(/\D/g, '').slice(0, 1)
    otpBoxes.value[index] = val
    if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
}

function onKeydown(index, event) {
    if (event.key === 'Backspace' && !otpBoxes.value[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus()
    }
}

function onPaste(event) {
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    text.split('').forEach((char, i) => { if (i < 6) otpBoxes.value[i] = char })
    document.getElementById(`otp-${Math.min(text.length, 5)}`)?.focus()
    event.preventDefault()
}

async function handleSubmit() {
    otpError.value = ''
    processing.value = true
    try {
        await auth.verifyOtp({ user_id: userId, otp: fullOtp.value })
        router.push('/dashboard')
    } catch (err) {
        otpError.value = err.response?.data?.errors?.otp?.[0]
            ?? err.response?.data?.message
            ?? 'Invalid OTP. Please try again.'
        otpBoxes.value = ['', '', '', '', '', '']
        document.getElementById('otp-0')?.focus()
    } finally {
        processing.value = false
    }
}

async function resendOtp() {
    processing.value = true
    try {
        await api.post('/auth/resend-otp', { user_id: userId })
        flash.set('success', 'OTP resent successfully!')
    } catch {
        otpError.value = 'Failed to resend OTP. Please try again.'
    } finally {
        processing.value = false
    }
}
</script>
