<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <div
      v-if="flash.success"
      class="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 shadow-md max-w-sm"
    >
      <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      <span>{{ flash.success }}</span>
    </div>
    <div
      v-if="flash.error"
      class="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 shadow-md max-w-sm"
    >
      <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <span>{{ flash.error }}</span>
    </div>
    <div
      v-if="flash.info"
      class="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 shadow-md max-w-sm"
    >
      <span>{{ flash.info }}</span>
    </div>
  </div>
</template>

<script setup>
import { useFlashStore } from '@/stores/flash.js'
const flash = useFlashStore()
</script>
