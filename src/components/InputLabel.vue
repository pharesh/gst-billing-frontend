<template>
  <label :for="forId" class="block text-sm font-medium text-gray-700">
    <slot>{{ value }}</slot>
  </label>
</template>

<script setup>
defineProps({
  forId: String,
  value: String,
})
</script>
