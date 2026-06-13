<template>
  <RouterLink
    :to="to"
    class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
    :class="isActive
      ? 'text-gray-900 bg-gray-100'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
  >
    <slot />
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useLink } from 'vue-router'

const props = defineProps({
  to: { type: String, required: true },
})

const { isActive } = useLink({ to: computed(() => props.to) })
</script>
