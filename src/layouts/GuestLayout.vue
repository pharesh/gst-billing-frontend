<template>
  <div class="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
    <div>
      <RouterLink to="/">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white text-xl font-bold">
          GST
        </div>
      </RouterLink>
    </div>
    <div class="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
