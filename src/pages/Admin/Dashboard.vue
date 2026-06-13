<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">Admin Dashboard</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{{ error }}</div>
        <template v-else>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg shadow p-5 text-center">
              <div class="text-3xl font-bold text-indigo-700">{{ stats.total_tenants ?? 0 }}</div>
              <div class="text-sm text-gray-500 mt-1">Total Tenants</div>
            </div>
            <div class="bg-white rounded-lg shadow p-5 text-center">
              <div class="text-3xl font-bold text-green-600">{{ stats.active_subs ?? 0 }}</div>
              <div class="text-sm text-gray-500 mt-1">Active</div>
            </div>
            <div class="bg-white rounded-lg shadow p-5 text-center">
              <div class="text-3xl font-bold text-gray-800">{{ stats.new_this_month ?? 0 }}</div>
              <div class="text-sm text-gray-500 mt-1">New This Month</div>
            </div>
            <div class="bg-white rounded-lg shadow p-5 text-center">
              <div class="text-3xl font-bold text-indigo-700">₹{{ fmt(stats.mrr ?? 0) }}</div>
              <div class="text-sm text-gray-500 mt-1">MRR</div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-base font-semibold text-gray-800 mb-4">Recent Tenants</h3>
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-left">
                <tr>
                  <th class="px-4 py-3 font-medium text-gray-600">Business</th>
                  <th class="px-4 py-3 font-medium text-gray-600">Email</th>
                  <th class="px-4 py-3 font-medium text-gray-600">Plan</th>
                  <th class="px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="t in recentTenants" :key="t.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium">{{ t.name }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ t.owner_email || t.email || '—' }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="planBadgeClass(planName(t))"
                    >{{ planName(t) }}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-500">{{ fmtDate(t.created_at) }}</td>
                  <td class="px-4 py-3 text-right"><RouterLink :to="'/admin/tenants/' + t.id" class="text-indigo-600 hover:underline text-xs">View</RouterLink></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const loading = ref(true)
const error = ref(null)
const stats = ref({})
const recentTenants = ref([])

async function loadData() {
    try {
        const { data } = await api.get('/admin/dashboard')
        stats.value = data.stats ?? {}
        recentTenants.value = data.recentTenants ?? []
    } catch (e) {
        error.value = e.response?.data?.message ?? 'Failed to load dashboard.'
    } finally {
        loading.value = false
    }
}

function fmt(n) { return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 }) }

function fmtDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    if (isNaN(d)) return iso
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Resolve plan name from nested relations or flat fallback field */
function planName(t) {
    return t.activeSubscription?.plan?.name
        ?? t.plan?.name
        ?? t.subscription_plan
        ?? 'Free'
}

const PLAN_BADGE_COLORS = {
    free:       'bg-gray-100 text-gray-600',
    starter:    'bg-blue-100 text-blue-700',
    pro:        'bg-indigo-100 text-indigo-700',
    business:   'bg-purple-100 text-purple-700',
    enterprise: 'bg-yellow-100 text-yellow-700',
}

function planBadgeClass(name) {
    const key = (name ?? '').toLowerCase()
    return PLAN_BADGE_COLORS[key] ?? 'bg-indigo-100 text-indigo-700'
}

onMounted(loadData)
</script>
