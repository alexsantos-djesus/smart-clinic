<template>
  <div>
    <section class="bg-gradient-to-r from-primary/10 to-transparent border-b">
      <div class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Minhas consultas</h1>
          <p class="text-sm text-gray-600 mt-1">Veja, filtre e gerencie seus agendamentos.</p>
        </div>

        <div class="flex items-center gap-2">
          <router-link to="/schedule" class="btn">Agendar consulta</router-link>
          <button class="px-4 py-2 rounded-xl border hover:bg-gray-50" @click="openEdit = true">
            Editar perfil
          </button>
          <button class="px-4 py-2 rounded-xl border hover:bg-gray-50" @click="doLogout" aria-label="Sair" title="Sair">
            Sair
          </button>
        </div>
      </div>
    </section>

    <div class="max-w-5xl mx-auto p-6">
      <div class="mb-4 relative">
        <input v-model="q" type="text" class="input pr-10" placeholder="Filtrar por profissional, local, motivo..."
          aria-label="Filtrar consultas" @input="debouncedFilter()" />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌘K</span>
      </div>

      <div v-if="loading" class="grid gap-3">
        <div v-for="i in 3" :key="i" class="card animate-pulse">
          <div class="h-4 w-40 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div v-else-if="error" class="card border border-red-200 text-red-700">
        <div class="font-medium mb-1">Não foi possível carregar suas consultas.</div>
        <div class="text-sm opacity-80">{{ error }}</div>
        <button class="btn mt-3" @click="fetchItems">Tentar novamente</button>
      </div>

      <EmptyState v-else-if="groups.length === 0" />

      <div v-else class="space-y-6">
        <div v-for="g in groups" :key="g.label">
          <div class="text-xs font-semibold text-gray-500 tracking-wide mb-2 uppercase">{{ g.label }}</div>
          <div class="grid gap-3">
            <article v-for="a in g.items" :key="a.id"
              class="card flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-md transition-shadow">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium truncate">{{ fmtDateTime(a.date) }}</span>
                  <span :class="badgeClass(a.status)">{{ labelStatus(a.status) }}</span>
                </div>
                <div class="text-sm text-gray-600 mt-1 truncate">
                  {{ a.reason || 'Consulta' }} — {{ a.location || 'Clínica' }}
                </div>
                <div class="text-sm mt-1 truncate">
                  Profissional: <span class="font-medium">{{ a.staff?.name || '—' }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 self-end md:self-auto">
                <button v-if="canCancel(a)"
                  class="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50" @click="cancel(a)"
                  :disabled="busyId === a.id">
                  {{ busyId === a.id ? 'Cancelando…' : 'Cancelar' }}
                </button>
              </div>
            </article>
          </div>
        </div>

        <div class="flex justify-center pt-2">
          <button class="px-4 py-2 rounded-xl border hover:bg-gray-50" @click="fetchItems">Atualizar</button>
        </div>
      </div>
    </div>

    <ModalEditProfile v-model="openEdit" :initial="profile" @saved="onProfileSaved" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../composables/useApi';
import { logout } from '../composables/useAuth';
import EmptyState from '../components/EmptyState.vue';
import ModalEditProfile from '../components/ModalEditProfile.vue';

type Appt = {
  id: string; date: string; reason?: string | null; location?: string | null;
  status: 'SCHEDULED' | 'DONE' | 'CANCELED'; staff?: { name: string } | null;
};
type Profile = {
  name?: string; phone?: string | null; cep?: string | null; street?: string | null; number?: string | null;
  district?: string | null; city?: string | null; uf?: string | null;
};

const router = useRouter();

const items = ref<Appt[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const q = ref('');
const busyId = ref<string | null>(null);
let timer: any = null;

const openEdit = ref(false);
const profile = ref<Profile | null>(null);

watch(openEdit, async (v) => {
  if (v) {
    const { data } = await api.get('/users/me');
    profile.value = data;
  }
});

function onProfileSaved(p: Profile) {
  profile.value = p;
}

function doLogout() {
  logout();
  router.push('/');
}

function debouncedFilter() { clearTimeout(timer); timer = setTimeout(() => q.value = q.value, 200); }

async function fetchItems() {
  loading.value = true; error.value = null;
  try {
    const res = await api.get('/appointments', { params: { take: 100 } });
    const list = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
    items.value = (list as Appt[])
      .slice()
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'Erro desconhecido';
  } finally { loading.value = false; }
}

function fmtDateTime(d: string) {
  const dt = new Date(d);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(dt);
}
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function groupLabel(d: Date) {
  const hoje = new Date(); const amanha = new Date(); amanha.setDate(hoje.getDate() + 1);
  if (sameDay(d, hoje)) return 'Hoje'; if (sameDay(d, amanha)) return 'Amanhã';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(d);
}
function labelStatus(s: Appt['status']) { return s === 'SCHEDULED' ? 'Agendada' : s === 'DONE' ? 'Concluída' : 'Cancelada'; }
function badgeClass(s: Appt['status']) {
  if (s === 'SCHEDULED') return 'text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700';
  if (s === 'DONE') return 'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700';
  return 'text-xs px-2 py-1 rounded-full bg-red-50 text-red-600';
}
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase(); if (!term) return items.value;
  return items.value.filter(a => {
    const hay = [a.reason || '', a.location || '', a.staff?.name || '', new Date(a.date).toLocaleString('pt-BR')].join(' ').toLowerCase();
    return hay.includes(term);
  });
});
const groups = computed(() => {
  const map = new Map<string, Appt[]>(); for (const a of filtered.value) { const d = new Date(a.date); const label = groupLabel(d); (map.get(label) || map.set(label, []).get(label))!.push(a); }
  return Array.from(map, ([label, items]) => ({ label, items }));
});
function canCancel(a: Appt) { return a.status === 'SCHEDULED' && new Date(a.date) > new Date(); }
async function cancel(a: Appt) {
  if (!confirm('Deseja cancelar esta consulta?')) return;
  busyId.value = a.id; const prev = a.status; a.status = 'CANCELED';
  try { await api.patch(`/appointments/${a.id}/cancel`); } catch { a.status = prev; alert('Não foi possível cancelar.'); } finally { busyId.value = null; }
}

onMounted(fetchItems);
</script>
