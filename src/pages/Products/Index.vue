<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">Products & Services</h2>
        <button @click="openCreate" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">+ Add Product</button>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

        <!-- Form -->
        <div v-if="showForm" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-base font-semibold mb-4">{{ editing ? 'Edit' : 'Add' }} Product / Service</h3>
          <form @submit.prevent="handleSubmit" class="grid grid-cols-3 gap-4">
            <div class="col-span-2">
              <label class="text-sm font-medium text-gray-700 block mb-1">Name *</label>
              <input v-model="form.name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Type</label>
              <select v-model="form.type" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="goods">Goods</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div class="col-span-3">
              <label class="text-sm font-medium text-gray-700 block mb-1">Description</label>
              <input v-model="form.description" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">HSN/SAC Code</label>
              <input v-model="form.hsn_sac_code" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Unit</label>
              <select v-model="form.unit" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Price (₹)</label>
              <input v-model.number="form.price" type="number" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              <p v-if="errors.price" class="text-red-500 text-xs mt-1">{{ errors.price[0] }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">GST Rate</label>
              <select v-model.number="form.gst_rate" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option v-for="r in GST_RATES" :key="r" :value="r">{{ r }}%</option>
              </select>
            </div>
            <div class="flex items-center gap-2 mt-5">
              <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded" />
              <label for="is_active" class="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div class="col-span-3 flex gap-2">
              <button type="submit" :disabled="processing" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                {{ processing ? 'Saving...' : (editing ? 'Update' : 'Add Product') }}
              </button>
              <button type="button" @click="showForm = false" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Search -->
        <div class="flex gap-3">
          <input v-model="search" @keydown.enter="applySearch" type="text" placeholder="Search products..." class="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm" />
          <button @click="applySearch" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 shadow-sm">Search</button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">HSN/SAC</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Unit</th>
                <th class="px-4 py-3 text-right font-medium text-gray-600">Price</th>
                <th class="px-4 py-3 text-center font-medium text-gray-600">GST%</th>
                <th class="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                <th class="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="p in products.data" :key="p.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ p.name }}</td>
                <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ p.hsn_sac_code || '—' }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-xs" :class="p.type === 'goods' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'">{{ p.type }}</span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ p.unit }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ fmt(p.price) }}</td>
                <td class="px-4 py-3 text-center text-gray-600">{{ p.gst_rate }}%</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded text-xs" :class="p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                    {{ p.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button @click="openEdit(p)" class="text-indigo-600 hover:underline text-xs">Edit</button>
                    <button @click="deleteProduct(p.id)" class="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!products.data?.length">
                <td colspan="8" class="px-4 py-8 text-center text-gray-400">No products yet.</td>
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

const products  = ref({ data: [] })
const search    = ref(route.query.search ?? '')
const showForm  = ref(false)
const editing   = ref(null)

const GST_RATES = [0, 0.25, 1, 3, 5, 12, 18, 28]
const UNITS     = ['Nos', 'Kgs', 'Ltr', 'Mtr', 'Box', 'Hrs', 'Days', 'Pcs', 'Set']

const emptyForm = () => ({ name: '', description: '', hsn_sac_code: '', type: 'goods', unit: 'Nos', price: 0, gst_rate: 18, is_active: true })
const form = reactive(emptyForm())

async function loadData() {
    const { data } = await api.get('/products', { params: { search: search.value } })
    products.value = data.products
}

function openCreate() {
    editing.value = null
    Object.assign(form, emptyForm())
    showForm.value = true
}

function openEdit(p) {
    editing.value = p
    Object.assign(form, { name: p.name, description: p.description ?? '', hsn_sac_code: p.hsn_sac_code ?? '', type: p.type, unit: p.unit, price: p.price, gst_rate: p.gst_rate, is_active: p.is_active })
    showForm.value = true
}

async function handleSubmit() {
    const url    = editing.value ? `/products/${editing.value.id}` : '/products'
    const method = editing.value ? 'patch' : 'post'
    await submit(method, url, form, { onSuccess: () => { showForm.value = false; loadData() } })
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    loadData()
}

function applySearch() {
    router.push({ query: search.value ? { search: search.value } : {} })
}

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }

watch(() => route.query, () => {
    search.value = route.query.search ?? ''
    loadData()
})

onMounted(loadData)
</script>
