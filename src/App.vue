<template>
  <div>
    <FlashMessage />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import FlashMessage from '@/components/FlashMessage.vue'
</script>
