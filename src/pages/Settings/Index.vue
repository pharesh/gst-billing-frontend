<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">Business Settings</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <form v-else @submit.prevent="save" class="space-y-6">

          <!-- Business Details -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-base font-semibold text-gray-800 mb-4">Business Details</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="text-sm font-medium text-gray-700 block mb-1">Business Name *</label>
                <input v-model="form.name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">GSTIN</label>
                <input v-model="form.gstin" type="text" maxlength="15" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase" />
                <p v-if="errors.gstin" class="text-red-500 text-xs mt-1">{{ errors.gstin[0] }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Invoice Prefix</label>
                <input v-model="form.invoice_prefix" type="text" maxlength="10" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase" />
              </div>
              <div class="col-span-2">
                <label class="text-sm font-medium text-gray-700 block mb-1">Address</label>
                <input v-model="form.address" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">City</label>
                <input v-model="form.city" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">State</label>
                <select v-model="form.state" @change="onStateChange" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select state</option>
                  <option v-for="s in STATES" :key="s.code" :value="s.name">{{ s.name }}</option>
                </select>
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
            </div>
          </div>

          <!-- Bank Details -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-base font-semibold text-gray-800 mb-4">Bank Details</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Bank Name</label>
                <input v-model="form.bank_details.bank_name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Account Name</label>
                <input v-model="form.bank_details.account_name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Account Number</label>
                <input v-model="form.bank_details.account_number" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">IFSC Code</label>
                <input v-model="form.bank_details.ifsc_code" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase" />
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button type="submit" :disabled="processing" class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {{ processing ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'
import { useApi } from '@/composables/useApi.js'

const { errors, processing, submit } = useApi()
const loading = ref(true)

const STATES = [
    { name: 'Andhra Pradesh', code: '37' }, { name: 'Arunachal Pradesh', code: '12' },
    { name: 'Assam', code: '18' }, { name: 'Bihar', code: '10' },
    { name: 'Chhattisgarh', code: '22' }, { name: 'Goa', code: '30' },
    { name: 'Gujarat', code: '24' }, { name: 'Haryana', code: '06' },
    { name: 'Himachal Pradesh', code: '02' }, { name: 'Jharkhand', code: '20' },
    { name: 'Karnataka', code: '29' }, { name: 'Kerala', code: '32' },
    { name: 'Madhya Pradesh', code: '23' }, { name: 'Maharashtra', code: '27' },
    { name: 'Delhi', code: '07' }, { name: 'Tamil Nadu', code: '33' },
    { name: 'Telangana', code: '36' }, { name: 'Uttar Pradesh', code: '09' },
    { name: 'West Bengal', code: '19' }, { name: 'Rajasthan', code: '08' },
    { name: 'Punjab', code: '03' }, { name: 'Chandigarh', code: '04' },
]

const form = reactive({
    name: '', gstin: '', address: '', city: '', state: '', state_code: '',
    pincode: '', phone: '', email: '', invoice_prefix: 'INV',
    bank_details: { bank_name: '', account_number: '', ifsc_code: '', account_name: '' },
})

function onStateChange() {
    const s = STATES.find(s => s.name === form.state)
    if (s) form.state_code = s.code
}

async function loadData() {
    const { data } = await api.get('/settings')
    const t = data.tenant
    Object.assign(form, { name: t.name ?? '', gstin: t.gstin ?? '', address: t.address ?? '', city: t.city ?? '', state: t.state ?? '', state_code: t.state_code ?? '', pincode: t.pincode ?? '', phone: t.phone ?? '', email: t.email ?? '', invoice_prefix: t.invoice_prefix ?? 'INV' })
    if (t.bank_details) Object.assign(form.bank_details, t.bank_details)
    loading.value = false
}

async function save() {
    await submit('patch', '/settings', form)
}

onMounted(loadData)
</script>
