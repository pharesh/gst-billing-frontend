<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Credit Notes</h2>
        <RouterLink to="/credit-notes/create" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Credit Note</RouterLink>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">
        <div class="flex gap-3">
          <input v-model="search" @keydown.enter="applySearch" type="text" placeholder="Search credit note # or customer..." class="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm" />
          <button @click="applySearch" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 shadow-sm">Search</button>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-600">Credit Note #</th>
                <th class="px-4 py-3 font-medium text-gray-600">Customer</th>
                <th class="px-4 py-3 font-medium text-gray-600">Against Invoice</th>
                <th class="px-4 py-3 font-medium text-gray-600">Date</th>
                <th class="px-4 py-3 font-medium text-gray-600">Reason</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">Amount</th>
                <th class="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="cn in creditNotes.data" :key="cn.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono font-medium text-indigo-600">
                  <RouterLink :to="`/credit-notes/${cn.id}`">{{ cn.credit_note_number }}</RouterLink>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ cn.customer?.name }}</td>
                <td class="px-4 py-3 text-xs text-gray-500">
                  <RouterLink v-if="cn.invoice" :to="`/invoices/${cn.invoice.id}`" class="text-indigo-600 hover:underline">{{ cn.invoice.invoice_number }}</RouterLink>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ cn.credit_note_date }}</td>
                <td class="px-4 py-3 text-gray-600 max-w-[200px] truncate">{{ cn.reason }}</td>
                <td class="px-4 py-3 text-right font-medium text-red-600">{{ fmt(cn.total_amount) }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <RouterLink :to="`/credit-notes/${cn.id}`" class="text-indigo-600 hover:underline text-xs">View</RouterLink>
                    <button @click="del(cn.id)" class="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!creditNotes.data?.length">
                <td colspan="7" class="px-4 py-10 text-center text-gray-400">No credit notes found.</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t flex justify-between text-sm text-gray-500">
            <span>Showing {{ creditNotes.from ?? 0 }}–{{ creditNotes.to ?? 0 }} of {{ creditNotes.total ?? 0 }}</span>
            <div class="flex gap-2">
              <button v-if="creditNotes.current_page > 1" @click="goToPage(creditNotes.current_page - 1)" class="text-indigo-600 hover:underline">← Prev</button>
              <button v-if="creditNotes.current_page < creditNotes.last_page" @click="goToPage(creditNotes.current_page + 1)" class="text-indigo-600 hover:underline">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route   = useRoute()
const router  = useRouter()
const creditNotes = ref({ data: [], total: 0, current_page: 1, last_page: 1 })
const search      = ref(route.query.search ?? '')
const page        = ref(Number(route.query.page ?? 1))

async function loadData() {
    const { data } = await api.get('/credit-notes', { params: { search: search.value, page: page.value } })
    creditNotes.value = data.creditNotes
}

function applySearch() { page.value = 1; router.push({ query: search.value ? { search: search.value } : {} }) }
function goToPage(p) { page.value = p; router.push({ query: { search: search.value, page: p } }) }

async function del(id) {
    if (!confirm('Delete this credit note?')) return
    await api.delete(`/credit-notes/${id}`)
    loadData()
}

function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }

watch(() => route.query, () => { search.value = route.query.search ?? ''; page.value = Number(route.query.page ?? 1); loadData() })
onMounted(loadData)
</script>
