<template>
  <div class="grid grid-cols-2 gap-4">
    <button :class="cls('PATIENT')" @click="$emit('pick', 'PATIENT')">Paciente</button>
    <button :class="cls('STAFF')" @click="$emit('pick', 'STAFF')">Funcionário</button>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ modelValue?: string }>();
const cls = (r: string) => `card text-center py-6 ${props.modelValue === r ? 'ring-2 ring-primary' : ''}`;
</script>
