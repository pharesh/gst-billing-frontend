<template>
  <input
    v-bind="$attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
    :class="$attrs.class"
  />
</template>

<script setup>
defineProps({ modelValue: [String, Number] })
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })
</script>
