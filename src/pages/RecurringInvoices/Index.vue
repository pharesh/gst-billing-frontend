<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Recurring Invoices</h2>
        <RouterLink to="/recurring-invoices/create" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Recurring Invoice</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-600">Customer</th>
                <th class="px-4 py-3 font-medium text-gray-600">Frequency</th>
                <th class="px-4 py-3 font-medium text-gray-600">Next Date</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">Amount</th>
                <th class="px-4 py-3 font-medium text-gray-600">Status</th>
                <th class="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="r in recurring.data" :key="r.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ r.customer?.name }}</td>
                <td class="px-4 py-3 text-gray-600 capitalize">{{ r.frequency }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ r.next_run_date }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ fmt(r.total_amount) }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium" :class="r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                    {{ r.is_active ? 'Active' : 'Paused' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button @click="toggle(r.id)" class="text-indigo-600 hover:underline text-xs">{{ r.is_active ? 'Pause' : 'Resume' }}</button>
                    <button @click="del(r.id)" class="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!recurring.data?.length">
                <td colspan="6" class="px-4 py-10 text-center text-gray-400">No recurring invoices set up.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const recurring = ref({ data: [] })
async function loadData() { const { data } = await api.get('/recurring-invoices'); recurring.value = data.recurringInvoices }
async function toggle(id) { await api.post(`/recurring-invoices/${id}/toggle`); loadData() }
async function del(id) { if (!confirm('Delete this recurring invoice?')) return; await api.delete(`/recurring-invoices/${id}`); loadData() }
function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
