<template>
    <div class="card flex items-start gap-4">
        <div class="shrink-0 rounded-xl p-3 bg-primary/15">
            <svg viewBox="0 0 24 24" class="w-7 h-7" fill="none" stroke="currentColor">
                <path stroke-width="1.5" d="M6 3v6a6 6 0 1 0 12 0V3M6 6H4M18 6h2M12 13v5a3 3 0 1 0 6 0v-2" />
            </svg>
        </div>
        <div class="min-w-0">
            <h3 class="text-lg font-semibold">Você ainda não possui consultas</h3>
            <p class="text-sm text-gray-600 mt-1">
                Agende sua primeira consulta e gerencie tudo aqui (alertamos sobre previsão de chuva ✨).
            </p>
            <router-link to="/schedule" class="btn mt-4 inline-block">Agendar primeira consulta</router-link>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
