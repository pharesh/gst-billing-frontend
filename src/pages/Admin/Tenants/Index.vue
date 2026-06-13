<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Tenants</h2>
        <button @click="openCreate" class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          + New Tenant
        </button>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">

        <!-- Filters -->
        <div class="flex gap-3">
          <input v-model="search" @input="debouncedSearch" type="text" placeholder="Search tenants..."
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72" />
          <select v-model="plan_filter" @change="onFilterChange" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Plans</option>
            <option v-for="p in plans" :key="p.id" :value="p.slug">{{ p.name }}</option>
          </select>
        </div>

        <!-- Table -->
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
              <tr v-if="loading"><td colspan="7" class="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              <template v-else>
                <tr v-for="t in tenants" :key="t.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium">{{ t.name }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ t.gstin || '—' }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ ownerEmail(t) }}</td>
                  <td class="px-4 py-3">
                    <span v-if="t.plan" class="px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="planBadge(t.plan.slug)">{{ t.plan.name }}</span>
                    <span v-else class="text-gray-400 text-xs">—</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="!t.is_suspended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                      {{ !t.is_suspended ? 'Active' : 'Suspended' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500">{{ fmtDate(t.created_at) }}</td>
                  <td class="px-4 py-3 text-right">
                    <RouterLink :to="'/admin/tenants/' + t.id" class="text-indigo-600 hover:underline text-xs">View</RouterLink>
                  </td>
                </tr>
                <tr v-if="!tenants.length">
                  <td colspan="7" class="px-4 py-10 text-center text-gray-400">No tenants found.</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="flex justify-end gap-2">
          <button v-for="p in pagination.last_page" :key="p" @click="goPage(p)"
            class="px-3 py-1 text-sm rounded border"
            :class="p === pagination.current_page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'">
            {{ p }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Tenant Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h3 class="text-base font-semibold text-gray-800">Create New Tenant</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form @submit.prevent="saveTenant" class="px-6 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
              <input v-model="form.company_name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <p v-if="errors.company_name" class="text-red-500 text-xs mt-1">{{ errors.company_name[0] }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Owner Name *</label>
              <input v-model="form.owner_name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <p v-if="errors.owner_name" class="text-red-500 text-xs mt-1">{{ errors.owner_name[0] }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Owner Email *</label>
              <input v-model="form.email" type="email" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email[0] }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Password *</label>
              <input v-model="form.password" type="password" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password[0] }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">GSTIN</label>
              <input v-model="form.gstin" type="text" maxlength="15" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">State</label>
              <input v-model="form.state" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Invoice Prefix</label>
              <input v-model="form.invoice_prefix" type="text" placeholder="INV" maxlength="10"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Plan</label>
              <select v-model="form.plan_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">No Plan (Free)</option>
                <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>

          <p v-if="formError" class="text-red-600 text-sm">{{ formError }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {{ saving ? 'Creating...' : 'Create Tenant' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route = useRoute(); const router = useRouter()
const tenants = ref([]); const plans = ref([])
const pagination = ref({})
const search = ref(''); const plan_filter = ref('')
const loading = ref(true)
let debounceTimer = null

const showModal = ref(false)
const saving = ref(false)
const errors = ref({})
const formError = ref(null)
const form = reactive({ company_name: '', owner_name: '', email: '', password: '', gstin: '', state: '', invoice_prefix: 'INV', plan_id: '' })

function fmtDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ownerEmail(tenant) {
    if (!tenant.users?.length) return '—'
    const owner = tenant.users.find(u => u.role === 'owner')
    return owner?.email || tenant.users[0]?.email || '—'
}

const PLAN_COLORS = { free: 'bg-gray-100 text-gray-600', starter: 'bg-blue-100 text-blue-700', pro: 'bg-indigo-100 text-indigo-700', business: 'bg-purple-100 text-purple-700', enterprise: 'bg-yellow-100 text-yellow-700' }
function planBadge(slug) { return PLAN_COLORS[slug?.toLowerCase()] ?? 'bg-indigo-100 text-indigo-700' }

async function loadData(page) {
    loading.value = true
    try {
        const { data } = await api.get('/admin/tenants', {
            params: { search: search.value, plan: plan_filter.value, page: page ?? route.query.page ?? 1 },
        })
        tenants.value = data.tenants?.data ?? data.tenants ?? data.data ?? []
        pagination.value = data.tenants?.meta
            ?? { current_page: data.tenants?.current_page ?? 1, last_page: data.tenants?.last_page ?? 1 }
        if (!plans.value.length && data.plans) plans.value = data.plans
    } finally {
        loading.value = false
    }
}

function openCreate() {
    Object.assign(form, { company_name: '', owner_name: '', email: '', password: '', gstin: '', state: '', invoice_prefix: 'INV', plan_id: '' })
    errors.value = {}; formError.value = null; showModal.value = true
}

async function saveTenant() {
    saving.value = true; errors.value = {}; formError.value = null
    try {
        await api.post('/admin/tenants', form)
        showModal.value = false
        await loadData(1)
    } catch (e) {
        if (e.response?.status === 422) errors.value = e.response.data.errors ?? {}
        else formError.value = e.response?.data?.message ?? 'Failed to create tenant.'
    } finally {
        saving.value = false
    }
}

function debouncedSearch() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => { router.push({ query: { page: 1 } }).then(() => loadData(1)) }, 350)
}
function onFilterChange() { router.push({ query: { page: 1 } }).then(() => loadData(1)) }
function goPage(p) { router.push({ query: { page: p } }).then(() => loadData(p)) }
onMounted(loadData)
</script>
