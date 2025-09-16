<template>
  <div>
    <div class="fixed top-3 inset-x-0 z-[60] px-3 pointer-events-none">
      <div class="max-w-xl mx-auto space-y-2" aria-live="polite" aria-atomic="true">
        <div v-for="t in toasts" :key="t.id"
          class="pointer-events-auto rounded-xl shadow-lg border px-4 py-3 flex items-start gap-3"
          :class="toastClass(t.type)">
          <span class="mt-0.5">
            <svg v-if="t.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-width="1.8" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="t.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-width="1.8" d="M13 16h-1v-4h-1m1-4h.01" />
            </svg>
          </span>
          <div class="min-w-0">
            <p class="font-medium">{{ t.title }}</p>
            <p v-if="t.desc" class="text-sm opacity-90">{{ t.desc }}</p>
          </div>
          <button class="ml-auto shrink-0 rounded p-1 hover:bg-black/5" @click="dismiss(t.id)"
            aria-label="Fechar">✕</button>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto p-6">
      <h2 class="text-3xl font-semibold mb-4">Login</h2>
      <form class="grid gap-3" @submit.prevent="submit">
        <input v-model="email" placeholder="Email" class="input" autocomplete="username email" />
        <input type="password" v-model="password" placeholder="Senha" class="input" autocomplete="current-password" />
        <button class="btn" :disabled="loading">{{ loading ? 'Entrando…' : 'Entrar' }}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { login } from '../composables/useAuth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; type: ToastType; title: string; desc?: string; timeout?: any };
const toasts = ref<Toast[]>([]);
let idc = 1;
const DEFAULT_MS = 4500;

function pushToast(type: ToastType, title: string, desc?: string, ms = DEFAULT_MS) {
  const id = idc++;
  const t: Toast = { id, type, title, desc };
  toasts.value.push(t);
  t.timeout = setTimeout(() => dismiss(id), ms);
  return id;
}
function dismiss(id: number) {
  const idx = toasts.value.findIndex(t => t.id === id);
  if (idx >= 0) {
    const [t] = toasts.value.splice(idx, 1);
    if (t?.timeout) clearTimeout(t.timeout);
  }
}
function toastClass(type: ToastType) {
  if (type === 'success') return 'bg-emerald-50 border-emerald-200 text-emerald-900';
  if (type === 'error') return 'bg-red-50 border-red-200 text-red-900';
  return 'bg-sky-50 border-sky-200 text-sky-900';
}

async function submit() {
  if (!email.value || !password.value) {
    pushToast('info', 'Preencha email e senha.');
    return;
  }

  loading.value = true;
  const validatingId = pushToast('info', 'Validando credenciais…');

  try {
    const u = await login(email.value, password.value);
    dismiss(validatingId);
    pushToast('success', 'Login realizado!', `Bem-vindo(a), ${u.name || 'usuário'}.`);
    router.push(u.role === 'PATIENT' ? '/dashboard/patient' : '/dashboard/staff');
  } catch (e: any) {
    dismiss(validatingId);
    const msg = e?.response?.data?.error || e?.message || '';
    if (/invalid|senha|password/i.test(msg)) {
      pushToast('error', 'Senha incorreta.', 'Verifique suas credenciais e tente novamente.');
    } else if (/user_not_found|email/i.test(msg)) {
      pushToast('error', 'Usuário não encontrado.', 'Confirme o email informado.');
    } else if (/network|fetch|Failed to fetch/i.test(msg)) {
      pushToast('error', 'Falha de rede.', 'Verifique sua conexão com a internet.');
    } else {
      pushToast('error', 'Não foi possível entrar.', msg || 'Tente novamente em instantes.');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.input {
  @apply w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40;
}

.btn {
  @apply w-full rounded-xl bg-teal-500 text-white px-4 py-2 hover:bg-teal-600 disabled:opacity-60;
}
</style>
