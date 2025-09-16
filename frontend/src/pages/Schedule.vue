<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="flex items-center justify-between mb-4">
      <button class="flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50" @click="goBack">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor">
          <path stroke-width="1.6" d="M15 6l-6 6 6 6" />
        </svg>
        Voltar
      </button>
      <h2 class="text-2xl font-semibold">Agendar Consulta</h2>
      <div class="w-[92px]"></div>
    </div>

    <form class="grid gap-3" @submit.prevent="save">
      <select v-model="form.staffId" class="input" required @change="hydrateClinicLocation">
        <option disabled value="">Selecione o Profissional</option>
        <option v-for="s in staff" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>

      <div class="grid gap-2">
        <div class="flex gap-2 items-center">
          <input v-model="form.date" type="datetime-local" class="input" :min="minDate" required
            @change="onDateChange" />
          <button type="button" class="px-3 py-2 rounded-xl border hover:bg-gray-50" @click="setNextHour">+1h</button>
        </div>
        <div v-if="availability" class="text-sm">
          <span v-if="availability.free" class="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">Horário
            disponível</span>
          <span v-else class="px-2 py-1 rounded-full bg-red-50 text-red-600">Horário indisponível</span>
        </div>
      </div>

      <div class="card">
        <div class="text-sm text-gray-500 mb-1">
          Endereço do paciente <span class="text-gray-400">(informativo)</span>
        </div>
        <div class="text-sm">
          <div v-if="profile">
            <div>{{ profile.street || '—' }}, {{ profile.number || 's/n' }}</div>
            <div>{{ profile.district || '—' }}</div>
            <div>
              {{ profile.city || '—' }} <span v-if="profile.uf">/ {{ profile.uf }}</span>
              • CEP: {{ profile.cep || '—' }}
            </div>
          </div>
          <div v-else class="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <div class="rounded-2xl border overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div class="flex items-center gap-2">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor">
              <path stroke-width="1.6" d="M3 12h18M12 3v18" />
            </svg>
            Previsão para {{ prettyDate(form.date) }}
            <small class="text-gray-500" v-if="cityForWeather">&nbsp;({{ cityForWeather }})</small>
          </div>
          <button type="button" class="px-3 py-1 rounded-xl border hover:bg-gray-100" @click="loadWeather"
            :disabled="weatherLoading || !cityForWeather || !form.date">
            {{ weatherLoading ? 'Buscando…' : 'Atualizar' }}
          </button>
        </div>

        <div class="p-4">
          <div v-if="!cityForWeather" class="text-sm text-amber-700">
            Complete sua cidade no perfil para ver a previsão.
          </div>

          <div v-else-if="weatherError" class="text-sm text-red-600">{{ weatherError }}</div>

          <div v-else-if="weatherLoading" class="animate-pulse grid gap-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>

          <div v-else-if="weather">
            <div class="flex items-center gap-3">
              <img v-if="iconUrl" :src="iconUrl" class="w-10 h-10" alt="Ícone do clima" />
              <div>
                <div class="font-medium">{{ weather.closest?.weather?.[0]?.description || '—' }}</div>
                <div class="text-sm text-gray-600">
                  Temp: {{ Math.round(weather.closest?.main?.temp || 0) }}°C
                  <span v-if="rainMm !== null"> • Chuva: {{ rainMm }}mm</span>
                </div>
              </div>
            </div>
            <div v-if="rainMm && rainMm >= 1"
              class="mt-3 text-xs px-2 py-1 rounded bg-amber-50 text-amber-800 inline-block">
              Possibilidade de chuva — leve guarda-chuva ☔
            </div>
          </div>

          <div v-else class="text-sm text-gray-600">Selecione data/hora para ver a previsão.</div>
        </div>
      </div>

      <input v-model="form.reason" placeholder="Motivo" class="input" />

      <div>
        <label class="block text-sm font-medium text-gray-700">Local da consulta (endereço da clínica)</label>
        <input class="input mt-1 bg-gray-50" :value="form.location" disabled aria-readonly="true"
          placeholder="Selecione o profissional para preencher automaticamente" />
      </div>

      <button class="btn" :disabled="submitting || !isValid">
        {{ submitting ? 'Enviando…' : 'Confirmar' }}
      </button>
    </form>

    <teleport to="body">
      <div v-if="toast" class="fixed inset-x-0 top-6 z-[60] flex justify-center" role="status" aria-live="polite">
        <div class="px-4 py-3 rounded-xl shadow-lg text-white"
          :class="toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'">
          {{ toast.message }}
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import api from '../composables/useApi';
import { useRouter } from 'vue-router';

type Staff = {
  id: string; name: string; email: string;
  cep?: string | null; street?: string | null; number?: string | null;
  district?: string | null; city?: string | null; uf?: string | null;
};
type Profile = {
  cep?: string | null; street?: string | null; number?: string | null;
  district?: string | null; city?: string | null; uf?: string | null;
};

const router = useRouter();

const staff = ref<Staff[]>([]);
const profile = ref<Profile | null>(null);

const submitting = ref(false);
const availability = ref<{ free: boolean } | null>(null);

const form = ref({
  staffId: '',
  date: '',
  reason: '',
  location: ''
});

const minDate = computed(() => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
});

const isValid = computed(() => !!form.value.staffId && !!form.value.date);

function goBack() { router.back(); }

onMounted(async () => {
  const s = await api.get('/users/staff'); staff.value = s.data as Staff[];
  const me = await api.get('/users/me'); profile.value = me.data as Profile;
  if (form.value.date) onDateChange();
});

function clinicAddressString(s: Staff | undefined) {
  if (!s) return '';
  const parts = [
    s.street && `${s.street}, ${s.number || 's/n'}`,
    s.district,
    s.city && s.uf ? `${s.city} / ${s.uf}` : (s.city || s.uf),
    s.cep ? `CEP: ${s.cep}` : null
  ].filter(Boolean);
  return parts.join(' - ');
}
function hydrateClinicLocation() {
  const sel = staff.value.find(x => x.id === form.value.staffId);
  form.value.location = clinicAddressString(sel);
}

async function onDateChange() {
  availability.value = null;
  if (form.value.staffId && form.value.date) {
    try {
      const { data } = await api.get('/appointments/availability', {
        params: { staffId: form.value.staffId, date: form.value.date }
      });
      availability.value = data;
    } catch { availability.value = null; }
  }
  if (cityForWeather.value) await loadWeather();
}

const cityForWeather = computed(() => (profile.value?.city || '').trim());

const weather: any = ref(null);
const weatherLoading = ref(false);
const weatherError = ref<string | null>(null);

const iconUrl = computed(() => {
  const code = weather.value?.closest?.weather?.[0]?.icon;
  return code ? `https://openweathermap.org/img/wn/${code}@2x.png` : '';
});
const rainMm = computed(() => {
  const mm = weather.value?.closest?.rain?.['3h'];
  return typeof mm === 'number' ? Math.round(mm) : null;
});
function prettyDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(d);
}

let weatherTimer: any = null;
async function loadWeather() {
  if (!cityForWeather.value || !form.value.date) return;
  clearTimeout(weatherTimer);
  weatherTimer = setTimeout(async () => {
    weatherLoading.value = true; weatherError.value = null; weather.value = null;
    try {
      const { data } = await api.get('/weather', {
        params: { city: cityForWeather.value, date: form.value.date }
      });
      weather.value = data;
    } catch (e: any) {
      weatherError.value = e?.response?.data?.error || 'Não foi possível obter a previsão.';
    } finally {
      weatherLoading.value = false;
    }
  }, 200);
}

const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null);
let toastTimer: any = null;
function showToast(message: string, type: 'success' | 'error' = 'success') {
  clearTimeout(toastTimer);
  toast.value = { message, type };
  toastTimer = setTimeout(() => (toast.value = null), 6000);
}

function setNextHour() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  form.value.date = d.toISOString().slice(0, 16);
  onDateChange();
}

async function save() {
  if (!isValid.value) {
    showToast('Selecione o profissional e a data/hora.', 'error');
    return;
  }
  hydrateClinicLocation();
  submitting.value = true;
  try {
    await api.post('/appointments', {
      staffId: form.value.staffId,
      date: form.value.date,
      reason: form.value.reason,
      location: form.value.location
    });
    showToast('Consulta confirmada com sucesso!', 'success');
    setTimeout(() => router.back(), 800);
  } catch (e: any) {
    showToast(e?.response?.data?.error || 'Não foi possível agendar.', 'error');
  } finally {
    submitting.value = false;
  }
}
</script>
