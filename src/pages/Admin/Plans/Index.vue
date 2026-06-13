<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">Subscription Plans</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-4">
        <div class="flex justify-end">
          <button @click="openCreate" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add Plan</button>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div v-for="plan in plans" :key="plan.id" class="bg-white rounded-lg shadow p-5">
            <div class="flex justify-between items-start mb-2">
              <div class="text-lg font-bold text-gray-900">{{ plan.name }}</div>
              <div class="flex gap-2">
                <button @click="openEdit(plan)" class="text-xs text-indigo-600 hover:underline">Edit</button>
                <button @click="deletePlan(plan.id)" class="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
            <div class="text-2xl font-bold text-indigo-700">₹{{ plan.price_monthly }}<span class="text-sm font-normal text-gray-500">/mo</span></div>
            <div class="mt-2 text-sm text-gray-600 space-y-1">
              <div v-for="(v, k) in plan.features" :key="k">{{ k }}: {{ v === -1 ? 'Unlimited' : v }}</div>
            </div>
          </div>
        </div>

        <!-- Create / Edit Form -->
        <div v-if="showForm" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">{{ editingId ? 'Edit Plan' : 'New Plan' }}</h3>
          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-sm font-medium text-gray-700 block mb-1">Name</label><input v-model="form.name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label class="text-sm font-medium text-gray-700 block mb-1">Price/Month</label><input v-model="form.price_monthly" type="number" min="0" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label class="text-sm font-medium text-gray-700 block mb-1">Max Invoices (-1=unlimited)</label><input v-model="form.features.max_invoices" type="number" min="-1" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label class="text-sm font-medium text-gray-700 block mb-1">Max Customers</label><input v-model="form.features.max_customers" type="number" min="-1" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div class="flex gap-3">
              <button type="submit" :disabled="processing" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{ processing ? 'Saving…' : 'Save' }}</button>
              <button type="button" @click="showForm = false" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useApi } from '@/composables/useApi.js'
import api from '@/api/index.js'

const { processing, submit } = useApi()
const plans = ref([]); const showForm = ref(false); const editingId = ref(null)
const form = reactive({ name: '', price_monthly: 0, features: { max_invoices: -1, max_customers: -1 } })

async function loadData() {
    const { data } = await api.get('/admin/plans')
    plans.value = data.plans ?? data
}
function openCreate() { editingId.value = null; Object.assign(form, { name: '', price_monthly: 0, features: { max_invoices: -1, max_customers: -1 } }); showForm.value = true }
function openEdit(p) { editingId.value = p.id; Object.assign(form, { name: p.name, price_monthly: p.price_monthly, features: { ...p.features } }); showForm.value = true }
async function save() {
    const url = editingId.value ? '/admin/plans/' + editingId.value : '/admin/plans'
    const method = editingId.value ? 'patch' : 'post'
    await submit(method, url, form, { onSuccess: () => { showForm.value = false; loadData() } })
}
async function deletePlan(id) {
    if (!confirm('Delete this plan?')) return
    await api.delete('/admin/plans/' + id); loadData()
}
onMounted(loadData)
</script>
