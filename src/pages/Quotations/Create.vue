<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">{{ isEdit ? 'Edit Quotation' : 'New Quotation' }}</h2>
        <RouterLink to="/quotations" class="text-sm text-indigo-600 hover:underline">← Quotations</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-4">
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
                <label class="text-sm font-medium text-gray-700 block mb-1">Valid Until</label>
                <input v-model="form.valid_until" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div class="col-span-2">
                <label class="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                <textarea v-model="form.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
              </div>
            </div>
          </div>

          <!-- Line Items -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-semibold text-gray-800 mb-3">Items</h3>
            <div v-for="(item, idx) in form.items" :key="idx" class="grid grid-cols-12 gap-2 mb-2 items-end">
              <div class="col-span-3">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Product</label>
                <select v-model="item.product_id" @change="fillProduct(idx)" class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                  <option value="">Custom</option>
                  <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="col-span-3">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Description</label>
                <input v-model="item.description" type="text" class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
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
                <input v-model="item.gst_rate" type="number" min="0" max="28" @input="calcTotals" class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div class="col-span-1">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Total</label>
                <div class="px-2 py-1.5 text-sm text-right font-medium">₹{{ fmt(item._total) }}</div>
              </div>
              <div class="col-span-1 flex justify-end">
                <button type="button" @click="removeItem(idx)" class="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
              </div>
            </div>
            <button type="button" @click="addItem" class="mt-2 text-sm text-indigo-600 hover:underline">+ Add Item</button>

            <!-- Totals -->
            <div class="mt-4 border-t pt-4 space-y-1 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Subtotal</span><span>₹{{ fmt(totals.subtotal) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">GST</span><span>₹{{ fmt(totals.gst) }}</span></div>
              <div class="flex justify-between font-bold text-base"><span>Total</span><span>₹{{ fmt(totals.total) }}</span></div>
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <RouterLink to="/quotations" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</RouterLink>
            <button type="submit" :disabled="processing" class="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{ processing ? 'Saving…' : 'Save Quotation' }}</button>
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
const loading = ref(true); const customers = ref([]); const products = ref([])
const form = reactive({ customer_id: '', valid_until: '', notes: '', items: [] })
const totals = reactive({ subtotal: 0, gst: 0, total: 0 })

function blankItem() { return { product_id: '', description: '', quantity: 1, unit_price: 0, gst_rate: 18, hsn_code: '', _total: 0 } }
function addItem() { form.items.push(blankItem()) }
function removeItem(i) { form.items.splice(i, 1); calcTotals() }

function fillProduct(idx) {
    const p = products.value.find(p => p.id == form.items[idx].product_id)
    if (!p) return
    Object.assign(form.items[idx], { description: p.name, unit_price: p.price, gst_rate: p.gst_rate, hsn_code: p.hsn_code ?? '' })
    calcTotals()
}

function calcTotals() {
    let sub = 0, gst = 0
    form.items.forEach(it => {
        const line = Number(it.quantity) * Number(it.unit_price)
        const g = line * Number(it.gst_rate) / 100
        it._total = line + g; sub += line; gst += g
    })
    totals.subtotal = sub; totals.gst = gst; totals.total = sub + gst
}

async function loadData() {
    if (isEdit) {
        const { data } = await api.get('/quotations/' + route.params.id + '/edit')
        Object.assign(form, { customer_id: data.quotation.customer_id, valid_until: data.quotation.valid_until ?? '', notes: data.quotation.notes ?? '', items: data.quotation.items.map(it => ({ ...it, _total: 0 })) })
        customers.value = data.customers; products.value = data.products
    } else {
        const { data } = await api.get('/quotations/create')
        customers.value = data.customers; products.value = data.products
        addItem()
    }
    calcTotals(); loading.value = false
}

async function save() {
    const url = isEdit ? '/quotations/' + route.params.id : '/quotations'
    const method = isEdit ? 'patch' : 'post'
    await submit(method, url, form, { onSuccess: d => router.push('/quotations/' + (d.quotation?.id ?? route.params.id)) })
}

function fmt(n) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
