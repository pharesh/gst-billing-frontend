<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">Customers</h2>
        <div class="flex gap-2">
          <a :href="`${apiBase}/customers/export${searchQuery}`" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
            ↓ Export CSV
          </a>
          <button @click="openCreate" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">+ Add Customer</button>
        </div>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

        <!-- Customer Form -->
        <div v-if="showForm" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-base font-semibold mb-4">{{ editing ? 'Edit' : 'Add' }} Customer</h3>
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
              <select v-model="form.customer_type" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="b2b">B2B (Registered)</option>
                <option value="b2c">B2C (Unregistered)</option>
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
            <div class="col-span-3 flex gap-2">
              <button type="submit" :disabled="processing" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                {{ processing ? 'Saving...' : (editing ? 'Update' : 'Add Customer') }}
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
                <th class="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="c in customers.data" :key="c.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ c.name }}</td>
                <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ c.gstin || '—' }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium" :class="c.customer_type === 'b2b' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'">
                    {{ c.customer_type?.toUpperCase() }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ c.state || '—' }}</td>
                <td class="px-4 py-3 text-gray-500">{{ c.phone || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <RouterLink :to="`/customers/${c.id}/statement`" class="text-gray-600 hover:underline text-xs">Statement</RouterLink>
                    <button @click="openEdit(c)" class="text-indigo-600 hover:underline text-xs">Edit</button>
                    <button @click="deleteCustomer(c.id)" class="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!customers.data?.length">
                <td colspan="6" class="px-4 py-8 text-center text-gray-400">No customers yet. Add your first customer.</td>
              </tr>
            </tbody>
          </table>
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
import { useApi } from '@/composables/useApi.js'

const route   = useRoute()
const router  = useRouter()
const apiBase = import.meta.env.VITE_API_URL
const { errors, processing, submit } = useApi()

const customers = ref({ data: [] })
const search    = ref(route.query.search ?? '')
const showForm  = ref(false)
const editing   = ref(null)

const searchQuery = computed(() => search.value ? `?search=${encodeURIComponent(search.value)}` : '')

const emptyForm = () => ({ name: '', gstin: '', customer_type: 'b2b', address: '', city: '', state: '', state_code: '', pincode: '', phone: '', email: '' })
const form = reactive(emptyForm())

async function loadData() {
    const { data } = await api.get('/customers', { params: { search: search.value } })
    customers.value = data.customers
}

function openCreate() {
    editing.value = null
    Object.assign(form, emptyForm())
    showForm.value = true
}

function openEdit(c) {
    editing.value = c
    Object.assign(form, { name: c.name, gstin: c.gstin ?? '', customer_type: c.customer_type, address: c.address ?? '', city: c.city ?? '', state: c.state ?? '', state_code: c.state_code ?? '', pincode: c.pincode ?? '', phone: c.phone ?? '', email: c.email ?? '' })
    showForm.value = true
}

async function handleSubmit() {
    const url    = editing.value ? `/customers/${editing.value.id}` : '/customers'
    const method = editing.value ? 'patch' : 'post'
    await submit(method, url, form, { onSuccess: () => { showForm.value = false; loadData() } })
}

async function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return
    await api.delete(`/customers/${id}`)
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
