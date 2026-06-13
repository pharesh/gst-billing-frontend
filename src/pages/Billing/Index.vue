<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">Billing & Subscription</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-6">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <template v-else>

          <!-- Current Plan -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-base font-semibold text-gray-800 mb-3">Current Plan</h3>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xl font-bold text-indigo-700">{{ currentPlan?.name ?? 'Free' }}</div>
                <div v-if="activeSubscription" class="text-sm text-gray-500 mt-1">
                  Expires: {{ activeSubscription.end_date }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">₹{{ currentPlan?.price_monthly ?? 0 }}/mo</div>
              </div>
            </div>
          </div>

          <!-- Usage -->
          <div v-if="usage" class="bg-white rounded-lg shadow p-6">
            <h3 class="text-base font-semibold text-gray-800 mb-4">Usage This Month</h3>
            <div class="space-y-3">
              <div v-for="(item, key) in usage" :key="key">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600 capitalize">{{ key.replace('_', ' ') }}</span>
                  <span class="font-medium">{{ item.used }} / {{ item.limit === -1 ? '∞' : item.limit }}</span>
                </div>
                <div v-if="item.limit !== -1" class="w-full bg-gray-100 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all" :class="usagePct(item.used, item.limit) > 80 ? 'bg-red-500' : 'bg-indigo-500'" :style="`width:${usagePct(item.used, item.limit)}%`"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Plans -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-base font-semibold text-gray-800 mb-4">Available Plans</h3>
            <div class="grid grid-cols-3 gap-4">
              <div v-for="plan in plans" :key="plan.id" class="border rounded-lg p-5" :class="currentPlan?.id === plan.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'">
                <div class="text-lg font-bold text-gray-900">{{ plan.name }}</div>
                <div class="text-2xl font-bold text-indigo-700 mt-1">₹{{ plan.price_monthly }}<span class="text-sm font-normal text-gray-500">/mo</span></div>
                <div class="mt-3 text-sm text-gray-600 space-y-1">
                  <div v-for="(val, feat) in plan.features" :key="feat">{{ feat }}: {{ val === -1 ? 'Unlimited' : val }}</div>
                </div>
                <button
                  v-if="currentPlan?.id !== plan.id && plan.price_monthly > 0"
                  @click="upgrade(plan)"
                  :disabled="payingPlanId === plan.id"
                  class="mt-4 w-full py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {{ payingPlanId === plan.id ? 'Processing...' : 'Upgrade' }}
                </button>
                <div v-if="currentPlan?.id === plan.id" class="mt-4 text-center text-sm text-indigo-600 font-medium">Current Plan</div>
              </div>
            </div>
            <p v-if="payError" class="mt-3 text-sm text-red-600">{{ payError }}</p>
          </div>

        </template>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'
import { useAuthStore } from '@/stores/auth.js'

const auth = useAuthStore()
const loading            = ref(true)
const plans              = ref([])
const currentPlan        = ref(null)
const activeSubscription = ref(null)
const usage              = ref(null)
const razorpayKey        = ref('')
const payingPlanId       = ref(null)
const payError           = ref('')

async function loadData() {
    const { data } = await api.get('/billing')
    plans.value              = data.plans
    currentPlan.value        = data.currentPlan
    activeSubscription.value = data.activeSubscription
    usage.value              = data.usage
    razorpayKey.value        = data.razorpayKey
    loading.value = false
}

function usagePct(used, limit) {
    if (limit === -1) return 0
    return Math.min(100, Math.round((used / limit) * 100))
}

async function upgrade(plan) {
    if (payingPlanId.value) return
    payingPlanId.value = plan.id
    payError.value = ''
    try {
        const { data } = await api.post('/billing/order', { plan_id: plan.id })
        if (data.error) { payError.value = data.error; payingPlanId.value = null; return }

        if (!window.Razorpay) { payError.value = 'Razorpay not loaded. Please refresh.'; payingPlanId.value = null; return }

        const rzp = new window.Razorpay({
            key: razorpayKey.value,
            amount: data.amount, currency: data.currency,
            name: 'GST Billing', description: plan.name + ' Plan',
            order_id: data.order_id,
            async handler(response) {
                await api.post('/billing/verify', { ...response, subscription_id: data.subscription_id })
                await loadData()
            },
            prefill: { name: auth.user?.name, email: auth.user?.email },
            theme: { color: '#4f46e5' },
            modal: { ondismiss: () => { payingPlanId.value = null } },
        })
        rzp.open()
    } catch { payingPlanId.value = null; payError.value = 'Failed to initiate payment.' }
}

onMounted(() => {
    if (!document.getElementById('razorpay-script')) {
        const s = Object.assign(document.createElement('script'), { id: 'razorpay-script', src: 'https://checkout.razorpay.com/v1/checkout.js' })
        document.head.appendChild(s)
    }
    loadData()
})
</script>
