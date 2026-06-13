<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Top Nav -->
    <nav class="border-b border-gray-100 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">

          <!-- Left: Logo + Nav Links -->
          <div class="flex items-center">
            <RouterLink to="/dashboard" class="flex shrink-0 items-center me-8">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold">GST</div>
            </RouterLink>

            <div class="hidden space-x-1 sm:flex">
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/invoices">Invoices</NavLink>
              <NavLink to="/quotations">Quotations</NavLink>
              <NavLink to="/purchases">Purchases</NavLink>
              <NavLink to="/customers">Customers</NavLink>
              <NavLink to="/products">Products</NavLink>
              <NavLink to="/suppliers">Suppliers</NavLink>

              <!-- Reports Dropdown -->
              <div class="relative" ref="reportsMenu">
                <button
                  @click="showReports = !showReports"
                  class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md"
                  :class="{ 'text-gray-900 font-semibold': $route.path.startsWith('/reports') }"
                >
                  GST Reports
                  <svg class="ms-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
                <div v-if="showReports" class="absolute left-0 mt-1 w-44 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <RouterLink to="/reports/gstr1"  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="showReports=false">GSTR-1</RouterLink>
                  <RouterLink to="/reports/gstr3b" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="showReports=false">GSTR-3B</RouterLink>
                  <RouterLink to="/reports/aging"  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="showReports=false">Aging Report</RouterLink>
                </div>
              </div>

              <NavLink to="/credit-notes">Credit Notes</NavLink>
              <NavLink to="/debit-notes">Debit Notes</NavLink>
              <NavLink to="/billing">Billing</NavLink>
            </div>
          </div>

          <!-- Right: User Dropdown -->
          <div class="hidden sm:flex sm:items-center">
            <div class="relative ms-3" ref="userMenu">
              <button
                @click="showUserMenu = !showUserMenu"
                class="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {{ auth.user?.name }}
                <svg class="-me-0.5 ms-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
              <div v-if="showUserMenu" class="absolute right-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <RouterLink to="/profile"  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="showUserMenu=false">Profile</RouterLink>
                <RouterLink to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="showUserMenu=false">Business Settings</RouterLink>
                <RouterLink to="/recurring-invoices" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="showUserMenu=false">Recurring Invoices</RouterLink>
                <RouterLink v-if="auth.isSuperAdmin" to="/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="showUserMenu=false">Admin Panel</RouterLink>
                <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Log Out
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Hamburger -->
          <div class="-me-2 flex items-center sm:hidden">
            <button @click="showMobileMenu = !showMobileMenu" class="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
              <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                <path v-else               stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="sm:hidden">
        <div class="space-y-1 pb-3 pt-2 px-4">
          <RouterLink to="/dashboard"  class="block py-2 text-sm text-gray-600" @click="showMobileMenu=false">Dashboard</RouterLink>
          <RouterLink to="/invoices"   class="block py-2 text-sm text-gray-600" @click="showMobileMenu=false">Invoices</RouterLink>
          <RouterLink to="/customers"  class="block py-2 text-sm text-gray-600" @click="showMobileMenu=false">Customers</RouterLink>
          <RouterLink to="/products"   class="block py-2 text-sm text-gray-600" @click="showMobileMenu=false">Products</RouterLink>
          <RouterLink to="/billing"    class="block py-2 text-sm text-gray-600" @click="showMobileMenu=false">Billing</RouterLink>
        </div>
        <div class="border-t border-gray-200 pb-1 pt-4 px-4">
          <p class="text-base font-medium text-gray-800">{{ auth.user?.name }}</p>
          <p class="text-sm text-gray-500">{{ auth.user?.email }}</p>
          <button @click="handleLogout" class="mt-3 block text-sm text-gray-600">Log Out</button>
        </div>
      </div>
    </nav>

    <!-- Page Header -->
    <header v-if="$slots.header" class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot name="header" />
      </div>
    </header>

    <!-- Page Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import NavLink from '@/components/NavLink.vue'

const auth    = useAuthStore()
const router  = useRouter()

const showUserMenu    = ref(false)
const showMobileMenu  = ref(false)
const showReports     = ref(false)

async function handleLogout() {
    await auth.logout()
    router.push('/login')
}

function handleOutsideClick(e) {
    if (!e.target.closest('[data-dropdown]')) {
        showUserMenu.value  = false
        showReports.value   = false
    }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<script>
// NavLink helper component — inline so we don't need a separate file
</script>
