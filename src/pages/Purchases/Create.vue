<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">{{ isEdit ? 'Edit Purchase' : 'New Purchase' }}</h2>
        <RouterLink to="/purchases" class="text-sm text-indigo-600 hover:underline">← Purchases</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-4">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <form v-else @submit.prevent="save" class="space-y-4">

          <div class="bg-white rounded-lg shadow p-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Supplier *</label>
                <select v-model="form.supplier_id" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select supplier</option>
                  <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
                <p v-if="errors.supplier_id" class="text-red-500 text-xs mt-1">{{ errors.supplier_id[0] }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Bill Number *</label>
                <input v-model="form.bill_number" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <p v-if="errors.bill_number" class="text-red-500 text-xs mt-1">{{ errors.bill_number[0] }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Bill Date *</label>
                <input v-model="form.bill_date" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Due Date</label>
                <input v-model="form.due_date" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div class="col-span-2">
                <label class="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                <textarea v-model="form.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-sm font-semibold text-gray-800 mb-3">Items</h3>
            <div v-for="(item, idx) in form.items" :key="idx" class="grid grid-cols-12 gap-2 mb-2 items-end">
              <div class="col-span-4">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Description</label>
                <input v-model="item.description" type="text" required class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div class="col-span-1">
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
                <input v-model="item.gst_rate" type="number" min="0" max="28" @input="calcTotals" class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div class="col-span-2">
                <label v-if="idx===0" class="text-xs text-gray-500 block mb-1">Total</label>
                <div class="px-2 py-1.5 text-sm text-right font-medium">₹{{ fmt(item._total) }}</div>
              </div>
              <div class="col-span-1 flex justify-end">
                <button type="button" @click="removeItem(idx)" class="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
              </div>
            </div>
            <button type="button" @click="addItem" class="mt-2 text-sm text-indigo-600 hover:underline">+ Add Item</button>

            <div class="mt-4 border-t pt-4 space-y-1 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Subtotal</span><span>₹{{ fmt(totals.subtotal) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">GST (ITC)</span><span class="text-green-700">₹{{ fmt(totals.gst) }}</span></div>
              <div class="flex justify-between font-bold text-base"><span>Total</span><span>₹{{ fmt(totals.total) }}</span></div>
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <RouterLink to="/purchases" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</RouterLink>
            <button type="submit" :disabled="processing" class="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{ processing ? 'Saving…' : 'Save Purchase' }}</button>
          </div>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useApi } from '@/composables/useApi.js'
import api from '@/api/index.js'

const route = useRoute(); const router = useRouter()
const isEdit = !!route.params.id
const { errors, processing, submit } = useApi()
const loading = ref(true); const suppliers = ref([])
const now = new Date().toISOString().slice(0, 10)
const form = reactive({ supplier_id: '', bill_number: '', bill_date: now, due_date: '', notes: '', items: [] })
const totals = reactive({ subtotal: 0, gst: 0, total: 0 })

function blankItem() { return { description: '', hsn_code: '', quantity: 1, unit_price: 0, gst_rate: 18, _total: 0 } }
function addItem() { form.items.push(blankItem()) }
function removeItem(i) { form.items.splice(i, 1); calcTotals() }

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
        const { data } = await api.get('/purchases/' + route.params.id + '/edit')
        Object.assign(form, { supplier_id: data.purchase.supplier_id, bill_number: data.purchase.bill_number, bill_date: data.purchase.bill_date, due_date: data.purchase.due_date ?? '', notes: data.purchase.notes ?? '', items: data.purchase.items.map(it => ({ ...it, _total: 0 })) })
        suppliers.value = data.suppliers
    } else {
        const { data } = await api.get('/purchases/create')
        suppliers.value = data.suppliers; addItem()
    }
    calcTotals(); loading.value = false
}

async function save() {
    const url = isEdit ? '/purchases/' + route.params.id : '/purchases'
    const method = isEdit ? 'patch' : 'post'
    await submit(method, url, form, { onSuccess: d => router.push('/purchases/' + (d.purchase?.id ?? route.params.id)) })
}
function fmt(n) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
