<template>
  <div>
    <section class="bg-gradient-to-r from-primary/10 to-transparent border-b">
      <div class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Agenda do Profissional</h1>
          <p class="text-sm text-gray-600 mt-1">Acompanhe seus atendimentos e atue rapidamente.</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-4 py-2 rounded-xl border hover:bg-gray-50" @click="fetchItems">Atualizar</button>
          <button class="px-4 py-2 rounded-xl border hover:bg-gray-50" @click="openProfile">Editar perfil</button>
          <button class="px-4 py-2 rounded-xl border hover:bg-gray-50" @click="doLogout">Sair</button>
        </div>
      </div>
    </section>

    <div class="max-w-5xl mx-auto p-6 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center gap-3">
        <div class="relative grow">
          <input v-model="q" class="input pr-10" placeholder="Buscar por paciente, motivo, local..." />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">/</span>
        </div>
        <div class="flex gap-2">
          <button :class="filterBtn('today')" @click="setRange('today')">Hoje</button>
          <button :class="filterBtn('week')" @click="setRange('week')">Próx. 7 dias</button>
          <button :class="filterBtn('all')" @click="setRange('all')">Todos</button>
        </div>
      </div>

      <div v-if="nextAppt" class="card border-l-4 border-primary">
        <div class="text-sm text-gray-500 mb-1">Próximo atendimento</div>
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="font-semibold truncate">{{ fmtDateTime(nextAppt.date) }}</div>
            <div class="text-sm text-gray-600 truncate">
              Paciente: <span class="font-medium">{{ nextAppt.patient?.name }}</span> — {{ nextAppt.reason || 'Consulta'
              }}
            </div>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              :disabled="busyId === nextAppt.id" @click="markDone(nextAppt)">
              {{ busyId === nextAppt.id ? 'Concluindo…' : 'Concluir' }}
            </button>
            <button class="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
              :disabled="busyId === nextAppt.id" @click="cancel(nextAppt)">
              {{ busyId === nextAppt.id ? 'Cancelando…' : 'Cancelar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="grid gap-3">
        <div v-for="i in 3" :key="i" class="card animate-pulse">
          <div class="h-4 w-40 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div v-else-if="error" class="card border border-red-200 text-red-700">
        <div class="font-medium mb-1">Não foi possível carregar a agenda.</div>
        <div class="text-sm opacity-80">{{ error }}</div>
        <button class="btn mt-3" @click="fetchItems">Tentar novamente</button>
      </div>

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
                  Paciente: <span class="font-medium">{{ a.patient?.name }}</span> • {{ a.reason || 'Consulta' }}
                </div>
              </div>
              <div class="flex items-center gap-2 self-end md:self-auto">
                <button v-if="a.status === 'SCHEDULED'"
                  class="px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  :disabled="busyId === a.id" @click="markDone(a)">
                  {{ busyId === a.id ? 'Concluindo…' : 'Concluir' }}
                </button>
                <button v-if="a.status === 'SCHEDULED'"
                  class="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                  :disabled="busyId === a.id" @click="cancel(a)">
                  {{ busyId === a.id ? 'Cancelando…' : 'Cancelar' }}
                </button>
              </div>
            </article>
          </div>
        </div>

        <div v-if="groups.length === 0" class="card">
          <div class="text-gray-700">Nenhum atendimento no período selecionado.</div>
        </div>
      </div>
    </div>

    <ModalEditStaff v-model="editOpen" :initial="profile" @saved="onSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../composables/useApi';
import { logout } from '../composables/useAuth';
import ModalEditStaff from '../components/ModalEditStaff.vue';

type Appt = {
  id: string; date: string; reason?: string | null; location?: string | null;
  status: 'SCHEDULED' | 'DONE' | 'CANCELED';
  patient?: { name: string } | null;
};
type Profile = {
  name?: string | null;
  phone?: string | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  district?: string | null;
  city?: string | null;
  uf?: string | null;
};

const router = useRouter();

const items = ref<Appt[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const q = ref('');
const range = ref<'today' | 'week' | 'all'>('all');
const busyId = ref<string | null>(null);

const editOpen = ref(false);
const profile = ref<Profile | null>(null);

function doLogout() { logout(); router.push('/'); }

function filterBtn(val: typeof range.value) {
  const active = range.value === val ? 'ring-2 ring-primary' : 'border';
  return `px-3 py-2 rounded-xl ${active} hover:bg-gray-50`;
}
function setRange(v: typeof range.value) { range.value = v; }

async function fetchItems(take = 50, skip = 0) {
  loading.value = true; error.value = null;
  try {
    const { data } = await api.get('/appointments', { params: { take, skip } });
    const list = Array.isArray(data) ? data : (data.items ?? []);
    items.value = (list as Appt[]).slice().sort((a, b) => +new Date(a.date) - +new Date(b.date));
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'Erro desconhecido';
  } finally { loading.value = false; }
}

function fmtDateTime(d: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(d));
}
function labelStatus(s: Appt['status']) { return s === 'SCHEDULED' ? 'Agendada' : s === 'DONE' ? 'Concluída' : 'Cancelada'; }
function badgeClass(s: Appt['status']) {
  if (s === 'SCHEDULED') return 'text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700';
  if (s === 'DONE') return 'text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700';
  return 'text-xs px-2 py-1 rounded-full bg-red-50 text-red-600';
}

const rangeWindow = computed(() => {
  if (range.value === 'all') return null;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (range.value === 'today') {
    end.setHours(23, 59, 59, 999);
  } else {
    end.setDate(start.getDate() + 7);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
});

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase();
  const win = rangeWindow.value;
  return items.value.filter(a => {
    const d = new Date(a.date);
    const inRange = !win || (d >= win.start && d <= win.end);
    if (!inRange) return false;
    if (!term) return true;
    const hay = `${a.patient?.name || ''} ${a.reason || ''} ${fmtDateTime(a.date)}`.toLowerCase();
    return hay.includes(term);
  });
});

const nextAppt = computed(() => filtered.value.find(a => a.status === 'SCHEDULED' && new Date(a.date) > new Date()) || null);

const groups = computed(() => {
  const map = new Map<string, Appt[]>();
  for (const a of filtered.value) {
    const d = new Date(a.date);
    const label = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(d);
    (map.get(label) || map.set(label, []).get(label))!.push(a);
  }
  return Array.from(map, ([label, items]) => ({ label, items }));
});

async function markDone(a: Appt) {
  busyId.value = a.id;
  const prev = a.status; a.status = 'DONE';
  try {
    await api.patch(`/appointments/${a.id}/done`);
  } catch {
    a.status = prev; alert('Não foi possível concluir.');
  } finally { busyId.value = null; }
}

async function cancel(a: Appt) {
  if (!confirm('Deseja cancelar este atendimento?')) return;
  busyId.value = a.id;
  const prev = a.status; a.status = 'CANCELED';
  try {
    await api.patch(`/appointments/${a.id}/cancel`);
  } catch {
    a.status = prev; alert('Não foi possível cancelar.');
  } finally { busyId.value = null; }
}

async function openProfile() {
  try {
    const { data } = await api.get('/users/me');
    profile.value = data as Profile;
    editOpen.value = true;
  } catch {
    alert('Não foi possível carregar seu perfil.');
  }
}

function onSaved(p: Profile) {
  profile.value = p;
}

onMounted(fetchItems);
</script>
