<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">{{ isEdit ? 'Edit Recurring Invoice' : 'New Recurring Invoice' }}</h2>
        <RouterLink to="/recurring-invoices" class="text-sm text-indigo-600 hover:underline">← Recurring Invoices</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-4">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <form v-else @submit.prevent="save" class="space-y-4">

          <div class="bg-white rounded-lg shadow p-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Customer *</label>
                <select v-model="form.customer_id" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select customer</option>
                  <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <p v-if="errors.customer_id" class="text-red-500 text-xs mt-1">{{ errors.customer_id[0] }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Frequency *</label>
                <select v-model="form.frequency" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Start Date *</label>
                <input v-model="form.start_date" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">End Date</label>
                <input v-model="form.end_date" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Payment Terms</label>
                <input v-model="form.payment_terms" type="number" min="0" placeholder="days" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-semibold text-gray-800 mb-3">Items (template)</h3>
            <div v-for="(item, idx) in form.items" :key="idx" class="grid grid-cols-12 gap-2 mb-2 items-end">
              <div class="col-span-4">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Description</label>
                <input v-model="item.description" type="text" required class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div class="col-span-2">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">HSN</label>
                <input v-model="item.hsn_code" type="text" class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div class="col-span-1">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Qty</label>
                <input v-model="item.quantity" type="number" min="1" @input="calcTotals" class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div class="col-span-2">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Price</label>
                <input v-model="item.unit_price" type="number" min="0" step="0.01" @input="calcTotals" class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div class="col-span-1">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">GST%</label>
                <input v-model="item.gst_rate" type="number" min="0" @input="calcTotals" class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div class="col-span-1">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Total</label>
                <div class="px-2 py-1.5 text-sm text-right">₹{{ fmt(item._total) }}</div>
              </div>
              <div class="col-span-1 flex justify-end">
                <button type="button" @click="removeItem(idx)" class="text-red-400 hover:text-red-600 text-lg">×</button>
              </div>
            </div>
            <button type="button" @click="addItem" class="mt-2 text-sm text-indigo-600 hover:underline">+ Add Item</button>
            <div class="mt-4 border-t pt-4 text-sm flex justify-end font-bold">
              <span class="text-gray-500 mr-4">Recurring Total:</span>
              <span>₹{{ fmt(grandTotal) }}</span>
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <RouterLink to="/recurring-invoices" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</RouterLink>
            <button type="submit" :disabled="processing" class="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{ processing ? 'Saving…' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useApi } from '@/composables/useApi.js'
import api from '@/api/index.js'

const route = useRoute(); const router = useRouter()
const isEdit = !!route.params.id
const { errors, processing, submit } = useApi()
const loading = ref(true); const customers = ref([])
const now = new Date().toISOString().slice(0, 10)
const form = reactive({ customer_id: '', frequency: 'monthly', start_date: now, end_date: '', payment_terms: 30, items: [] })

const grandTotal = computed(() => form.items.reduce((s, it) => s + Number(it._total || 0), 0))

function blankItem() { return { description: '', hsn_code: '', quantity: 1, unit_price: 0, gst_rate: 18, _total: 0 } }
function addItem() { form.items.push(blankItem()) }
function removeItem(i) { form.items.splice(i, 1) }

function calcTotals() {
    form.items.forEach(it => {
        const line = Number(it.quantity) * Number(it.unit_price)
        it._total = line + line * Number(it.gst_rate) / 100
    })
}

async function loadData() {
    if (isEdit) {
        const { data } = await api.get('/recurring-invoices/' + route.params.id + '/edit')
        Object.assign(form, { customer_id: data.recurring.customer_id, frequency: data.recurring.frequency, start_date: data.recurring.start_date, end_date: data.recurring.end_date ?? '', payment_terms: data.recurring.payment_terms ?? 30, items: data.recurring.items.map(it => ({ ...it, _total: 0 })) })
        customers.value = data.customers
    } else {
        const { data } = await api.get('/recurring-invoices/create')
        customers.value = data.customers; addItem()
    }
    calcTotals(); loading.value = false
}

async function save() {
    const url = isEdit ? '/recurring-invoices/' + route.params.id : '/recurring-invoices'
    const method = isEdit ? 'patch' : 'post'
    await submit(method, url, form, { onSuccess: () => router.push('/recurring-invoices') })
}
function fmt(n) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
