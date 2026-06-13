<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Invoices</h2>
        <div class="flex gap-2">
          <a :href="exportUrl" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            ↓ Export CSV
          </a>
          <RouterLink to="/invoices/create" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            + New Invoice
          </RouterLink>
        </div>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">

        <!-- Summary Cards -->
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-xs text-gray-500">Total Billed</div>
            <div class="text-xl font-bold text-gray-800 mt-1">{{ fmt(summary.total) }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-xs text-green-600">Collected</div>
            <div class="text-xl font-bold text-green-700 mt-1">{{ fmt(summary.paid) }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-xs text-red-500">Outstanding</div>
            <div class="text-xl font-bold text-red-600 mt-1">{{ fmt(summary.unpaid) }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-xs text-orange-500">Overdue Invoices</div>
            <div class="text-xl font-bold text-orange-600 mt-1">{{ summary.overdue }}</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-4 space-y-3">
          <div class="grid grid-cols-5 gap-3">
            <input v-model="filters.search" @keydown.enter="applyFilters" type="text"
              placeholder="Search invoice # or customer..."
              class="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm" />

            <select v-model="filters.customer_id" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Customers</option>
              <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>

            <select v-model="filters.status" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>

            <div class="flex gap-2">
              <button @click="applyFilters" class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Filter</button>
              <button v-if="hasActiveFilters" @click="clearFilters" class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-600">✕</button>
            </div>
          </div>
          <div class="flex gap-3 items-center">
            <span class="text-xs text-gray-500">Date range:</span>
            <input v-model="filters.date_from" type="date" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <span class="text-xs text-gray-400">to</span>
            <input v-model="filters.date_to" type="date" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <button @click="applyFilters" class="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">Apply</button>
          </div>
        </div>

        <!-- Bulk Actions Bar -->
        <div v-if="selected.length > 0" class="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <span class="text-sm text-indigo-700 font-medium">{{ selected.length }} invoice{{ selected.length !== 1 ? 's' : '' }} selected</span>
          <div class="flex gap-2">
            <button @click="bulkDownloadZip" :disabled="bulkWorking"
              class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              {{ bulkWorking ? 'Preparing...' : '↓ Download ZIP' }}
            </button>
            <button @click="bulkSendReminder" :disabled="bulkWorking"
              class="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50">
              Send Reminders
            </button>
            <button @click="selected = []" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white">Clear</button>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div v-if="loading" class="py-12 text-center text-gray-400">Loading...</div>
          <table v-else class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 w-8">
                  <input type="checkbox" :checked="allSelected" @change="toggleAll" class="rounded border-gray-300 text-indigo-600" />
                </th>
                <th class="px-4 py-3 font-medium text-gray-600">Invoice #</th>
                <th class="px-4 py-3 font-medium text-gray-600">Customer</th>
                <th class="px-4 py-3 font-medium text-gray-600">Date</th>
                <th class="px-4 py-3 font-medium text-gray-600">Due Date</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">Amount</th>
                <th class="px-4 py-3 font-medium text-gray-600">Status</th>
                <th class="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="inv in invoices.data" :key="inv.id"
                class="hover:bg-gray-50"
                :class="[selected.includes(inv.id) ? 'bg-indigo-50' : '']">
                <td class="px-4 py-3" @click.stop>
                  <input type="checkbox" :checked="selected.includes(inv.id)" @change="toggleOne(inv.id)"
                    class="rounded border-gray-300 text-indigo-600" />
                </td>
                <td class="px-4 py-3 font-mono font-medium text-indigo-600">
                  <RouterLink :to="`/invoices/${inv.id}`">{{ inv.invoice_number }}</RouterLink>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ inv.customer?.name }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ fmtDate(inv.invoice_date) }}</td>
                <td class="px-4 py-3 text-xs"
                  :class="inv.payment_status !== 'paid' && inv.due_date && new Date(inv.due_date) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'">
                  {{ fmtDate(inv.due_date) }}
                </td>
                <td class="px-4 py-3 text-right font-medium">{{ fmt(inv.total_amount) }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(inv.payment_status)">
                    {{ (inv.payment_status ?? 'unpaid').toUpperCase() }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <RouterLink :to="`/invoices/${inv.id}`" class="text-indigo-600 hover:underline text-xs">View</RouterLink>
                    <a :href="`${apiBase}/invoices/${inv.id}/download`" class="text-gray-600 hover:underline text-xs">PDF</a>
                  </div>
                </td>
              </tr>
              <tr v-if="!invoices.data?.length">
                <td colspan="8" class="px-4 py-10 text-center text-gray-400">No invoices found.</td>
              </tr>
            </tbody>
          </table>

          <div class="px-4 py-3 border-t flex justify-between text-sm text-gray-500">
            <span>Showing {{ invoices.from }}–{{ invoices.to }} of {{ invoices.total }}</span>
            <div class="flex gap-2">
              <button v-if="invoices.current_page > 1" @click="goToPage(invoices.current_page - 1)" class="text-indigo-600 hover:underline">← Prev</button>
              <button v-if="invoices.current_page < invoices.last_page" @click="goToPage(invoices.current_page + 1)" class="text-indigo-600 hover:underline">Next →</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'
import { useFlashStore } from '@/stores/flash.js'

const route   = useRoute()
const router  = useRouter()
const flash   = useFlashStore()
const loading = ref(true)
const apiBase = import.meta.env.VITE_API_URL

const invoices   = ref({ data: [], total: 0, from: 0, to: 0, current_page: 1, last_page: 1 })
const summary    = ref({ total: 0, paid: 0, unpaid: 0, overdue: 0 })
const customers  = ref([])
const selected   = ref([])
const bulkWorking = ref(false)

const filters = reactive({
    search:      route.query.search      ?? '',
    status:      route.query.status      ?? '',
    customer_id: route.query.customer_id ?? '',
    date_from:   route.query.date_from   ?? '',
    date_to:     route.query.date_to     ?? '',
    page:        route.query.page        ?? 1,
})

const allSelected = computed(() =>
    invoices.value.data.length > 0 && selected.value.length === invoices.value.data.length
)
const hasActiveFilters = computed(() =>
    filters.search || filters.status || filters.customer_id || filters.date_from || filters.date_to
)
const exportUrl = computed(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v && k !== 'page') params.set(k, v) })
    const qs = params.toString()
    return `${apiBase}/invoices/export${qs ? '?' + qs : ''}`
})

async function loadData() {
    loading.value = true
    selected.value = []
    try {
        const { data } = await api.get('/invoices', { params: filters })
        invoices.value  = data.invoices
        summary.value   = data.summary ?? summary.value
        customers.value = data.customers ?? customers.value
    } finally {
        loading.value = false
    }
}

function applyFilters() {
    filters.page = 1
    router.push({ query: { ...filters } })
}

function clearFilters() {
    Object.assign(filters, { search: '', status: '', customer_id: '', date_from: '', date_to: '', page: 1 })
    router.push({ query: {} })
}

function goToPage(page) {
    filters.page = page
    router.push({ query: { ...filters } })
}

function toggleAll() { selected.value = allSelected.value ? [] : invoices.value.data.map(i => i.id) }
function toggleOne(id) {
    const idx = selected.value.indexOf(id)
    if (idx === -1) selected.value.push(id)
    else selected.value.splice(idx, 1)
}

async function bulkDownloadZip() {
    if (!selected.value.length) return
    bulkWorking.value = true
    try {
        const res = await api.post('/invoices/bulk-download', { ids: selected.value }, { responseType: 'blob' })
        const url = URL.createObjectURL(res.data)
        const a   = Object.assign(document.createElement('a'), {
            href: url, download: `invoices-${new Date().toISOString().slice(0, 10)}.zip`
        })
        a.click()
        URL.revokeObjectURL(url)
    } catch {
        flash.set('error', 'Failed to download ZIP. Try selecting fewer invoices.')
    } finally {
        bulkWorking.value = false
    }
}

async function bulkSendReminder() {
    if (!selected.value.length) return
    if (!confirm(`Send payment reminders for ${selected.value.length} invoice(s)?`)) return
    bulkWorking.value = true
    try {
        await api.post('/invoices/bulk-reminder', { ids: selected.value })
        flash.set('success', 'Reminders sent!')
        selected.value = []
    } finally {
        bulkWorking.value = false
    }
}

function statusClass(s) {
    return { paid: 'bg-green-100 text-green-800', unpaid: 'bg-red-100 text-red-800', partial: 'bg-yellow-100 text-yellow-800' }[s] || ''
}
function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
function fmtDate(d) {
    if (!d) return '—'
    const [y, m, day] = d.substring(0, 10).split('-')
    return `${day}-${m}-${y}`
}

watch(() => route.query, () => {
    Object.assign(filters, {
        search:      route.query.search      ?? '',
        status:      route.query.status      ?? '',
        customer_id: route.query.customer_id ?? '',
        date_from:   route.query.date_from   ?? '',
        date_to:     route.query.date_to     ?? '',
        page:        route.query.page        ?? 1,
    })
    loadData()
})

onMounted(loadData)
</script>
