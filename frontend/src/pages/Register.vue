<template>
  <div class="max-w-xl mx-auto p-6">
    <div class="flex items-center justify-between mb-4">
      <button class="flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50" @click="goBack">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor">
          <path stroke-width="1.6" d="M15 6l-6 6 6 6" />
        </svg>
        Voltar
      </button>
      <h2 class="text-3xl font-semibold">Cadastro</h2>
      <div class="w-[92px]"></div>
    </div>

    <RolePicker v-model="form.role" @pick="onRolePick" />

    <form class="mt-6 grid gap-3" @submit.prevent="submit">
      <div>
        <label class="text-xs text-gray-600">Nome</label>
        <input v-model="form.name" placeholder="Nome completo" class="input mt-1" required />
        <p v-if="isStaff" class="text-xs text-gray-500 mt-1">
          Para funcionários, o nome pode ser exibido com prefixo (ex.: Dr. Ana Silva).
        </p>
      </div>

      <div class="grid gap-2 md:grid-cols-2">
        <div>
          <label class="text-xs text-gray-600">Email</label>
          <input v-model="form.email" type="email" placeholder="email@exemplo.com" class="input mt-1" required />
        </div>
        <div>
          <label class="text-xs text-gray-600">Telefone</label>
          <input v-model="form.phone" placeholder="(DDD) 00000-0000" class="input mt-1" />
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-2">
        <div>
          <label class="text-xs text-gray-600">CPF (opcional)</label>
          <input v-model="form.cpf" placeholder="CPF (opcional)" class="input mt-1" />
        </div>
        <div>
          <label class="text-xs text-gray-600">Senha</label>
          <input type="password" v-model="form.password" placeholder="Senha" class="input mt-1" required />
        </div>
      </div>

      <div v-if="isStaff" class="grid gap-2 md:grid-cols-3 items-end">
        <div class="md:col-span-2">
          <label class="text-xs text-gray-600">Profissão (Funcionário)</label>
          <select v-model="staff.profession" class="input mt-1">
            <option value="">Selecione a profissão</option>
            <option>Médico</option>
            <option>Dentista</option>
            <option>Psicólogo</option>
            <option>Fisioterapeuta</option>
            <option>Nutricionista</option>
            <option>Enfermeiro</option>
            <option>Fonoaudiólogo</option>
            <option>Outro</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input id="dr" type="checkbox" v-model="staff.useDoctorPrefix" class="h-4 w-4 rounded border-gray-300" />
          <label for="dr" class="text-sm text-gray-700 select-none">Usar prefixo “Dr.”</label>
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-3">
        <div>
          <label class="text-xs text-gray-600">CEP</label>
          <input v-model="form.cep" placeholder="00000000" class="input mt-1" inputmode="numeric" maxlength="9"
            @blur="fetchCep" />
          <p v-if="cepError" class="text-xs text-red-600 mt-1">{{ cepError }}</p>
        </div>
        <div>
          <label class="text-xs text-gray-600">Cidade</label>
          <input v-model="form.city" placeholder="Cidade" class="input mt-1" />
        </div>
        <div>
          <label class="text-xs text-gray-600">UF</label>
          <input v-model="form.uf" placeholder="UF" class="input mt-1" maxlength="2" />
        </div>
      </div>

      <div class="grid gap-2 md:grid-cols-3">
        <div class="md:col-span-2">
          <label class="text-xs text-gray-600">Endereço</label>
          <input v-model="form.street" placeholder="Rua, avenida..." class="input mt-1" />
        </div>
        <div>
          <label class="text-xs text-gray-600">Número</label>
          <input v-model="form.number" placeholder="nº" class="input mt-1" />
        </div>
      </div>

      <div>
        <label class="text-xs text-gray-600">Bairro</label>
        <input v-model="form.district" placeholder="Bairro" class="input mt-1" />
      </div>

      <button class="btn mt-2" :disabled="submitting">
        {{ submitting ? 'Enviando…' : (isStaff ? 'Cadastrar funcionário' : 'Cadastrar paciente') }}
      </button>

      <div v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import RolePicker from '../components/RolePicker.vue';
import { register } from '../composables/useAuth';
import api from '../composables/useApi';

type Role = 'PATIENT' | 'STAFF';

const router = useRouter();
const submitting = ref(false);
const error = ref<string | null>(null);
const cepError = ref<string | null>(null);

const form = reactive({
  role: 'PATIENT' as Role,
  name: '',
  email: '',
  password: '',
  cpf: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  district: '',
  city: '',
  uf: '',
});

const staff = reactive({
  profession: '',
  useDoctorPrefix: false,
});

const isStaff = computed(() => form.role === 'STAFF');

function goBack() {
  router.back();
}

watch(
  () => staff.profession,
  (p) => {
    if (p === 'Médico' || p === 'Dentista') {
      staff.useDoctorPrefix = true;
    } else if (!p) {
      staff.useDoctorPrefix = false;
    }
  }
);

function onRolePick(newRole: Role) {
  const keepName = form.name;
  const keepAddress = {
    cep: form.cep,
    street: form.street,
    number: form.number,
    district: form.district,
    city: form.city,
    uf: form.uf,
  };

  Object.assign(form, {
    role: newRole,
    name: keepName,
    email: '',
    password: '',
    cpf: '',
    phone: '',
    cep: keepAddress.cep,
    street: keepAddress.street,
    number: keepAddress.number,
    district: keepAddress.district,
    city: keepAddress.city,
    uf: keepAddress.uf,
  });

  if (newRole === 'STAFF') {
    staff.profession = '';
    staff.useDoctorPrefix = false;
  }
}

async function fetchCep() {
  cepError.value = null;
  const raw = (form.cep || '').replace(/\D/g, '');
  if (!raw) return;
  if (raw.length !== 8) {
    cepError.value = 'CEP inválido';
    return;
  }
  try {
    const { data } = await api.get(`/cep/${raw}`);
    if (data?.erro) {
      cepError.value = 'CEP não encontrado';
      return;
    }
    form.street = data.logradouro || form.street;
    form.district = data.bairro || form.district;
    form.city = data.localidade || form.city;
    form.uf = data.uf || form.uf;
  } catch {
    cepError.value = 'Falha ao buscar o CEP';
  }
}

const displayName = computed(() => {
  if (!isStaff.value) return form.name?.trim();
  if (staff.useDoctorPrefix && form.name?.trim()) {
    const n = form.name.trim();
    return /^dr\.?\s/i.test(n) ? n : `Dr. ${n}`;
  }
  return form.name?.trim();
});

async function submit() {
  submitting.value = true;
  error.value = null;
  try {
    const payload: any = {
      role: form.role,
      name: displayName.value, 
      email: form.email,
      password: form.password,
      cpf: form.cpf || undefined,
      phone: form.phone || undefined,
      cep: form.cep || undefined,
      street: form.street || undefined,
      number: form.number || undefined,
      district: form.district || undefined,
      city: form.city || undefined,
      uf: form.uf || undefined,
    };

    const u = await register(payload);
    router.push(u.role === 'PATIENT' ? '/dashboard/patient' : '/dashboard/staff');
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'Não foi possível cadastrar.';
  } finally {
    submitting.value = false;
  }
}
</script>
