<template>
  <div class="relative min-h-screen overflow-x-clip">
    <!-- soft background -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl"></div>
      <div class="absolute top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl"></div>
      <div
        class="absolute bottom-0 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-[999px] bg-emerald-100/50 blur-3xl">
      </div>
    </div>

    <Navbar />

    <!-- HERO -->
    <section class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center px-6 pt-10 lg:pt-16">
      <div class="order-2 lg:order-1">
        <div
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600 bg-white/70 backdrop-blur">
          <span class="i-lucide-sparkles"></span>
          Novo visual — mais rápido e simples ✨
        </div>

        <h1 class="mt-4 text-4xl/tight md:text-5xl/tight font-bold tracking-tight">
          Agende <span class="text-emerald-600">consultas</span> em segundos,
          sem dores de cabeça
        </h1>

        <p class="mt-4 text-lg text-gray-600">
          Uma plataforma enxuta para clínicas e consultórios. Cadastre-se como
          <span class="font-medium text-gray-800">Paciente</span> ou
          <span class="font-medium text-gray-800">Profissional</span> e gerencie
          agenda, locais e confirmações em um só lugar.
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <router-link to="/register" class="btn">
            Começar agora
          </router-link>
          <router-link to="/login" class="px-4 py-2 rounded-xl border hover:bg-gray-50">
            Entrar
          </router-link>
          <span class="text-xs text-gray-500">sem cartão • gratuito</span>
        </div>

        <!-- mini trust/stats -->
        <div class="mt-8 grid grid-cols-3 gap-4">
          <div class="rounded-2xl border bg-white/70 p-4 backdrop-blur">
            <div class="text-2xl font-semibold">2min</div>
            <div class="text-xs text-gray-500">para seu primeiro agendamento</div>
          </div>
          <div class="rounded-2xl border bg-white/70 p-4 backdrop-blur">
            <div class="text-2xl font-semibold">24/7</div>
            <div class="text-xs text-gray-500">acesso de qualquer lugar</div>
          </div>
          <div class="rounded-2xl border bg-white/70 p-4 backdrop-blur">
            <div class="text-2xl font-semibold">+99%</div>
            <div class="text-xs text-gray-500">de satisfação dos usuários</div>
          </div>
        </div>
      </div>

      <!-- right visual -->
      <div class="order-1 lg:order-2">
        <div class="relative rounded-3xl border bg-white shadow-sm p-3 md:p-4">
          <!-- mock “app” preview -->
          <div class="rounded-2xl border bg-gray-50">
            <div class="flex items-center gap-2 border-b px-4 py-3">
              <div class="size-2.5 rounded-full bg-rose-400"></div>
              <div class="size-2.5 rounded-full bg-amber-400"></div>
              <div class="size-2.5 rounded-full bg-emerald-400"></div>
              <div class="ml-2 text-sm text-gray-600">smart-clinic</div>
            </div>

            <div class="grid gap-3 p-4">
              <div class="h-10 rounded-xl bg-white border p-2 text-gray-500">
                Selecione o Profissional
              </div>
              <div class="flex gap-2">
                <div class="h-10 w-full rounded-xl bg-white border p-2 text-gray-500">
                  dd/mm/aaaa --:--
                </div>
                <div class="h-10 w-16 rounded-xl border bg-white grid place-content-center">+1h</div>
              </div>

              <div class="rounded-xl border bg-white p-3">
                <div class="text-xs text-gray-500">Endereço do paciente</div>
                <div class="mt-1 text-sm text-gray-700">
                  Rua Exemplo, 123 — Centro<br />
                  Natal / RN • CEP: 59000-000
                </div>
              </div>

              <div class="h-10 rounded-xl bg-white border p-2 text-gray-500">
                Motivo
              </div>
              <div class="h-10 rounded-xl bg-gray-100 border p-2 text-gray-600">
                Local da consulta (clínica) — preenchido automaticamente
              </div>

              <div class="h-11 rounded-xl bg-emerald-500 text-white grid place-content-center font-medium">
                Confirmar
              </div>
            </div>
          </div>

          <!-- floating badge -->
          <div class="absolute -bottom-4 -left-4 rounded-2xl bg-emerald-600 text-white px-4 py-2 shadow-lg">
            class="absolute left-0 bottom-0 -translate-x-5 translate-y-5 z-10
             rounded-2xl bg-emerald-600 text-white px-4 py-2 shadow-lg
             whitespace-nowrap select-none">
            <span class="font-semibold">Sem fila</span> • confirmação imediata
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="max-w-6xl mx-auto px-6 pb-16 mt-10">
      <div class="grid md:grid-cols-3 gap-4">
        <div class="card hover:shadow-md transition-shadow">
          <div class="text-xl font-semibold">Agendamento rápido</div>
          <p class="mt-1 text-gray-600 text-sm">
            Em poucos passos você finaliza e recebe confirmação instantânea.
          </p>
        </div>
        <div class="card hover:shadow-md transition-shadow">
          <div class="text-xl font-semibold">Endereço automático</div>
          <p class="mt-1 text-gray-600 text-sm">
            O local da consulta vem do cadastro do profissional — sem erros.
          </p>
        </div>
        <div class="card hover:shadow-md transition-shadow">
          <div class="text-xl font-semibold">Previsão do tempo</div>
          <p class="mt-1 text-gray-600 text-sm">
            Mostramos a previsão na hora do atendimento com base no seu endereço.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
</script>

<style scoped>
/* Icon placeholder if you don't use lucide plugin */
.i-lucide-sparkles::before {
  content: "✦";
  display: inline-block;
  transform: translateY(-0.5px);
}
</style>
