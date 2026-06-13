<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">{{ tenant?.name ?? 'Tenant' }}</h2>
        <RouterLink to="/admin/tenants" class="text-sm text-indigo-600 hover:underline">← Back to Tenants</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-6">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <template v-else>

          <!-- Details card -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-gray-500">GSTIN</span><div class="font-mono mt-0.5">{{ tenant.gstin || '—' }}</div></div>
              <div><span class="text-gray-500">Owner Email</span><div class="mt-0.5">{{ tenant.owner_email }}</div></div>
              <div><span class="text-gray-500">Current Plan</span><div class="mt-0.5"><span class="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">{{ tenant.plan_name }}</span></div></div>
              <div><span class="text-gray-500">Status</span><div class="mt-0.5"><span class="px-2 py-0.5 rounded-full text-xs" :class="tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">{{ tenant.is_active ? 'Active' : 'Suspended' }}</span></div></div>
              <div><span class="text-gray-500">Joined</span><div class="mt-0.5">{{ tenant.created_at }}</div></div>
            </div>
            <div class="flex gap-3 mt-6">
              <button v-if="tenant.is_active" @click="toggleStatus(false)" class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Suspend</button>
              <button v-else @click="toggleStatus(true)" class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Activate</button>
              <select v-model="newPlan" @change="changePlan" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Change Plan…</option>
                <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>

          <!-- Usage -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-base font-semibold text-gray-800 mb-3">Usage Statistics</h3>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div v-for="(v, k) in tenant.usage" :key="k" class="text-center">
                <div class="text-2xl font-bold text-gray-800">{{ v }}</div>
                <div class="text-gray-500 capitalize">{{ k.replace('_', ' ') }}</div>
              </div>
            </div>
          </div>

        </template>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route = useRoute()
const loading = ref(true); const tenant = ref(null); const plans = ref([]); const newPlan = ref('')

async function loadData() {
    const { data } = await api.get('/admin/tenants/' + route.params.id)
    tenant.value = data.tenant; plans.value = data.plans ?? []; loading.value = false
}
async function toggleStatus(val) {
    await api.patch('/admin/tenants/' + route.params.id + '/status', { is_active: val })
    await loadData()
}
async function changePlan() {
    if (!newPlan.value) return
    await api.patch('/admin/tenants/' + route.params.id + '/plan', { plan_id: newPlan.value })
    newPlan.value = ''; await loadData()
}
onMounted(loadData)
</script>
