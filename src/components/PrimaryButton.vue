<template>
  <button
    v-bind="$attrs"
    class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    <slot />
  </button>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
</script>
