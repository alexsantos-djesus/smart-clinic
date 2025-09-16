<template>
  <nav class="flex items-center justify-between p-4">
    <div class="flex items-center gap-2">
      <img src="/logo.svg" class="w-7 h-7" /><span class="font-semibold">Central da Saúde</span>
    </div>
    <div class="flex items-center gap-3 text-sm">
      <router-link to="/" class="hover:underline">Home</router-link>
      <router-link to="/login" class="hover:underline">Entrar</router-link>
    </div>
  </nav>
</template>
<script setup lang="ts"></script>
