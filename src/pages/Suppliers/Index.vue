<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">Suppliers</h2>
        <button @click="openCreate" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">+ Add Supplier</button>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

        <!-- Supplier Form -->
        <div v-if="showForm" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-base font-semibold mb-4">{{ editing ? 'Edit' : 'Add' }} Supplier</h3>
          <form @submit.prevent="handleSubmit" class="grid grid-cols-3 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Name *</label>
              <input v-model="form.name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">GSTIN</label>
              <input v-model="form.gstin" type="text" maxlength="15" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="22AAAAA0000A1Z5" />
              <p v-if="errors.gstin" class="text-red-500 text-xs mt-1">{{ errors.gstin[0] }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Type</label>
              <select v-model="form.supplier_type" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="registered">Registered</option>
                <option value="unregistered">Unregistered</option>
              </select>
            </div>
            <div class="col-span-3">
              <label class="text-sm font-medium text-gray-700 block mb-1">Address</label>
              <input v-model="form.address" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">City</label>
              <input v-model="form.city" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">State</label>
              <input v-model="form.state" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">State Code</label>
              <input v-model="form.state_code" type="text" maxlength="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="27" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Pincode</label>
              <input v-model="form.pincode" type="text" maxlength="6" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Phone</label>
              <input v-model="form.phone" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input v-model="form.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Payment Terms</label>
              <input v-model="form.payment_terms" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Net 30" />
            </div>
            <div class="flex items-center gap-2 mt-5">
              <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded" />
              <label for="is_active" class="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div class="col-span-3 flex gap-2">
              <button type="submit" :disabled="processing" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                {{ processing ? 'Saving...' : (editing ? 'Update' : 'Add Supplier') }}
              </button>
              <button type="button" @click="showForm = false" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Search -->
        <div class="flex gap-3">
          <input v-model="search" @keydown.enter="applySearch" type="text" placeholder="Search by name or GSTIN..." class="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm" />
          <button @click="applySearch" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 shadow-sm">Search</button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">GSTIN</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">State</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Payment Terms</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in suppliers.data" :key="s.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ s.name }}</td>
                <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ s.gstin || '—' }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium" :class="s.supplier_type === 'registered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'">
                    {{ s.supplier_type === 'registered' ? 'Registered' : 'Unregistered' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ s.state || '—' }}</td>
                <td class="px-4 py-3 text-gray-500">{{ s.phone || '—' }}</td>
                <td class="px-4 py-3 text-gray-500">{{ s.payment_terms || '—' }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium" :class="s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'">
                    {{ s.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button @click="openEdit(s)" class="text-indigo-600 hover:underline text-xs">Edit</button>
                    <button @click="deleteSupplier(s.id)" class="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!suppliers.data?.length">
                <td colspan="8" class="px-4 py-8 text-center text-gray-400">No suppliers yet. Add your first supplier.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'
import { useApi } from '@/composables/useApi.js'

const route   = useRoute()
const router  = useRouter()
const { errors, processing, submit } = useApi()

const suppliers = ref({ data: [] })
const search    = ref(route.query.search ?? '')
const showForm  = ref(false)
const editing   = ref(null)

const emptyForm = () => ({ name: '', gstin: '', supplier_type: 'registered', address: '', city: '', state: '', state_code: '', pincode: '', phone: '', email: '', payment_terms: '', is_active: true })
const form = reactive(emptyForm())

async function loadData() {
    const { data } = await api.get('/suppliers', { params: { search: search.value } })
    suppliers.value = data.suppliers
}

function openCreate() {
    editing.value = null
    Object.assign(form, emptyForm())
    showForm.value = true
}

function openEdit(s) {
    editing.value = s
    Object.assign(form, { name: s.name, gstin: s.gstin ?? '', supplier_type: s.supplier_type, address: s.address ?? '', city: s.city ?? '', state: s.state ?? '', state_code: s.state_code ?? '', pincode: s.pincode ?? '', phone: s.phone ?? '', email: s.email ?? '', payment_terms: s.payment_terms ?? '', is_active: s.is_active })
    showForm.value = true
}

async function handleSubmit() {
    const url    = editing.value ? `/suppliers/${editing.value.id}` : '/suppliers'
    const method = editing.value ? 'patch' : 'post'
    await submit(method, url, form, { onSuccess: () => { showForm.value = false; loadData() } })
}

async function deleteSupplier(id) {
    if (!confirm('Delete this supplier?')) return
    await api.delete(`/suppliers/${id}`)
    loadData()
}

function applySearch() {
    router.push({ query: search.value ? { search: search.value } : {} })
}

watch(() => route.query, () => {
    search.value = route.query.search ?? ''
    loadData()
})

onMounted(loadData)
</script>
