<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">Tenants</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">
        <div class="flex gap-3">
          <input v-model="search" @input="debouncedSearch" type="text" placeholder="Search tenants..." class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72" />
          <select v-model="plan_filter" @change="loadData" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Plans</option>
            <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-600">Business</th>
                <th class="px-4 py-3 font-medium text-gray-600">GSTIN</th>
                <th class="px-4 py-3 font-medium text-gray-600">Owner</th>
                <th class="px-4 py-3 font-medium text-gray-600">Plan</th>
                <th class="px-4 py-3 font-medium text-gray-600">Status</th>
                <th class="px-4 py-3 font-medium text-gray-600">Joined</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="t in tenants" :key="t.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ t.name }}</td>
                <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ t.gstin || '—' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ t.owner_email }}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">{{ t.plan_name }}</span></td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs" :class="t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">{{ t.is_active ? 'Active' : 'Suspended' }}</span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ t.created_at }}</td>
                <td class="px-4 py-3 text-right"><RouterLink :to="'/admin/tenants/' + t.id" class="text-indigo-600 hover:underline text-xs">View</RouterLink></td>
              </tr>
              <tr v-if="!tenants.length"><td colspan="7" class="px-4 py-10 text-center text-gray-400">No tenants found.</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="flex justify-end gap-2">
          <button v-for="p in pagination.last_page" :key="p" @click="goPage(p)" class="px-3 py-1 text-sm rounded border" :class="p === pagination.current_page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'">{{ p }}</button>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route = useRoute(); const router = useRouter()
const tenants = ref([]); const plans = ref([])
const pagination = ref({})
const search = ref(''); const plan_filter = ref('')
let debounceTimer = null

async function loadData() {
    const { data } = await api.get('/admin/tenants', { params: { search: search.value, plan_id: plan_filter.value, page: route.query.page ?? 1 } })
    tenants.value = data.data ?? data.tenants ?? []
    pagination.value = data.meta ?? { current_page: 1, last_page: 1 }
    if (!plans.value.length && data.plans) plans.value = data.plans
}
function debouncedSearch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadData, 350) }
function goPage(p) { router.push({ query: { ...route.query, page: p } }).then(loadData) }
onMounted(loadData)
</script>
