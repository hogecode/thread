<script setup lang="ts">
import { N } from 'vue-router/dist/index-BN0B0y8a.js';

// Redirect handled by routeRules in nuxt.config.ts
// This page exists as a fallback
definePageMeta({
  layout: 'default',
})

</script>

<template>
  <div>Hello world!</div>
  <NuxtLink to="/login">Login</NuxtLink>
  <NuxtLink to="/register">Register</NuxtLink>
  <NuxtLink to="/profile">Profile</NuxtLink>
</template>