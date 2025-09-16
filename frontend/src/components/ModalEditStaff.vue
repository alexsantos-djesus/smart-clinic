<template>
    <teleport to="body">
        <div v-if="open" class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/40" @click="close" aria-hidden="true"></div>

            <div class="absolute inset-0 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                <div class="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                    <div class="px-5 py-4 border-b flex items-center justify-between">
                        <h3 class="text-lg font-semibold">Editar perfil</h3>
                        <button class="p-2 rounded hover:bg-gray-100" @click="close" aria-label="Fechar">✕</button>
                    </div>

                    <form class="p-5 grid gap-3" @submit.prevent="save">
                        <div class="grid md:grid-cols-2 gap-3">
                            <div>
                                <label class="text-xs text-gray-600">Nome</label>
                                <input v-model="form.name" class="input mt-1" placeholder="Seu nome" />
                            </div>
                            <div>
                                <label class="text-xs text-gray-600">Telefone</label>
                                <input v-model="form.phone" class="input mt-1" placeholder="(DDD) 00000-0000" />
                            </div>
                        </div>

                        <div class="grid md:grid-cols-3 gap-3">
                            <div>
                                <label class="text-xs text-gray-600">CEP</label>
                                <input v-model="form.cep" class="input mt-1" placeholder="00000000" maxlength="9"
                                    @input="onCep" />
                                <p v-if="cepError" class="text-xs text-red-600 mt-1">{{ cepError }}</p>
                            </div>
                            <div>
                                <label class="text-xs text-gray-600">Cidade</label>
                                <input v-model="form.city" class="input mt-1" placeholder="Cidade" />
                            </div>
                            <div>
                                <label class="text-xs text-gray-600">UF</label>
                                <input v-model="form.uf" class="input mt-1" placeholder="UF" maxlength="2" />
                            </div>
                        </div>

                        <div class="grid md:grid-cols-3 gap-3">
                            <div class="md:col-span-2">
                                <label class="text-xs text-gray-600">Endereço (clínica)</label>
                                <input v-model="form.street" class="input mt-1" placeholder="Rua, avenida..." />
                            </div>
                            <div>
                                <label class="text-xs text-gray-600">Número</label>
                                <input v-model="form.number" class="input mt-1" placeholder="nº" />
                            </div>
                        </div>

                        <div>
                            <label class="text-xs text-gray-600">Bairro</label>
                            <input v-model="form.district" class="input mt-1" placeholder="Bairro" />
                        </div>

                        <div class="pt-2 flex justify-end gap-2">
                            <button type="button" class="px-4 py-2 rounded-xl border hover:bg-gray-50"
                                @click="close">Cancelar</button>
                            <button class="btn" :disabled="saving">{{ saving ? 'Salvando…' : 'Salvar' }}</button>
                        </div>

                        <div v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</div>
                    </form>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '../composables/useApi';

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

const props = defineProps<{
    modelValue: boolean;
    initial?: Profile | null;
}>();
const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void;
    (e: 'saved', p: Profile): void;
}>();

const open = ref(props.modelValue);
watch(() => props.modelValue, v => { open.value = v; if (v) hydrate(); });
watch(open, v => emit('update:modelValue', v));

watch(() => props.initial, () => { if (open.value) hydrate(); }, { deep: true });

const saving = ref(false);
const error = ref<string | null>(null);
const cepError = ref<string | null>(null);

const form = ref<Profile>({
    name: '', phone: '', cep: '', street: '', number: '', district: '', city: '', uf: '',
});

function hydrate() {
    error.value = null; cepError.value = null;
    const p = props.initial || {};
    form.value = {
        name: p.name ?? '',
        phone: p.phone ?? '',
        cep: p.cep ?? '',
        street: p.street ?? '',
        number: p.number ?? '',
        district: p.district ?? '',
        city: p.city ?? '',
        uf: p.uf ?? '',
    };
}

function close() { open.value = false; }

let cepTimer: any = null;
function onCep() {
    cepError.value = null;
    const clean = (form.value.cep || '').replace(/\D/g, '');
    form.value.cep = clean;

    clearTimeout(cepTimer);
    if (clean.length !== 8) return;

    cepTimer = setTimeout(async () => {
        try {
            const { data } = await api.get(`/cep/${clean}`);
            if (data?.erro) { cepError.value = 'CEP não encontrado.'; return; }
            form.value.street = data.logradouro || form.value.street;
            form.value.district = data.bairro || form.value.district;
            form.value.city = data.localidade || form.value.city;
            form.value.uf = data.uf || form.value.uf;
        } catch {
            cepError.value = 'Falha ao buscar o CEP.';
        }
    }, 250);
}

async function save() {
    saving.value = true; error.value = null;
    try {
        const { data } = await api.patch('/users/me', { ...form.value });
        emit('saved', data);
        close();
    } catch (e: any) {
        error.value = e?.response?.data?.error || 'Não foi possível salvar.';
    } finally {
        saving.value = false;
    }
}
</script>
