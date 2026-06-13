<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Debit Notes</h2>
        <RouterLink to="/debit-notes/create" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Debit Note</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">
        <div class="flex gap-3">
          <input v-model="search" @keydown.enter="applySearch" type="text" placeholder="Search debit note # or supplier..." class="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm" />
          <button @click="applySearch" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 shadow-sm">Search</button>
        </div>
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-600">Debit Note #</th>
                <th class="px-4 py-3 font-medium text-gray-600">Supplier</th>
                <th class="px-4 py-3 font-medium text-gray-600">Against Bill</th>
                <th class="px-4 py-3 font-medium text-gray-600">Date</th>
                <th class="px-4 py-3 font-medium text-gray-600">Reason</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">Amount</th>
                <th class="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="dn in debitNotes.data" :key="dn.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono font-medium text-indigo-600">
                  <RouterLink :to="`/debit-notes/${dn.id}`">{{ dn.debit_note_number }}</RouterLink>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ dn.supplier?.name }}</td>
                <td class="px-4 py-3 text-xs text-gray-500">
                  <RouterLink v-if="dn.purchase" :to="`/purchases/${dn.purchase.id}`" class="text-indigo-600 hover:underline">{{ dn.purchase.bill_number }}</RouterLink>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ dn.debit_note_date }}</td>
                <td class="px-4 py-3 text-gray-600 max-w-[200px] truncate">{{ dn.reason }}</td>
                <td class="px-4 py-3 text-right font-medium text-orange-600">{{ fmt(dn.total_amount) }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <RouterLink :to="`/debit-notes/${dn.id}`" class="text-indigo-600 hover:underline text-xs">View</RouterLink>
                    <button @click="del(dn.id)" class="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!debitNotes.data?.length">
                <td colspan="7" class="px-4 py-10 text-center text-gray-400">No debit notes found.</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t flex justify-between text-sm text-gray-500">
            <span>Showing {{ debitNotes.from ?? 0 }}–{{ debitNotes.to ?? 0 }} of {{ debitNotes.total ?? 0 }}</span>
          </div>
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

const route  = useRoute()
const router = useRouter()
const debitNotes = ref({ data: [], total: 0 })
const search     = ref(route.query.search ?? '')

async function loadData() {
    const { data } = await api.get('/debit-notes', { params: { search: search.value } })
    debitNotes.value = data.debitNotes
}
function applySearch() { router.push({ query: search.value ? { search: search.value } : {} }) }
async function del(id) { if (!confirm('Delete this debit note?')) return; await api.delete(`/debit-notes/${id}`); loadData() }
function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
