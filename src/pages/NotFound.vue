<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="text-6xl font-bold text-indigo-600 mb-4">404</div>
    <h1 class="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h1>
    <p class="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
    <RouterLink to="/dashboard" class="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
      Go to Dashboard
    </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
