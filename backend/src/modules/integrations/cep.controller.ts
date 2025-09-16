import { Router } from "express";

const r = Router();

function sanitizeCep(v: string) {
  return (v || "").replace(/\D/g, "");
}

async function fetchViaCep(cep: string) {
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`viacep_http_${resp.status}`);
  const data = await resp.json();
  return data;
}

r.get("/", async (req, res) => {
  try {
    const cep = sanitizeCep(String(req.query.cep || ""));
    if (!cep) return res.status(400).json({ error: "cep_required" });
    if (cep.length !== 8) return res.status(400).json({ error: "invalid_cep" });

    const data = await fetchViaCep(cep);
    if (data?.erro) return res.status(404).json({ error: "cep_not_found" });
    res.json(data);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: "cep_failed", detail: e?.message || String(e) });
  }
});

r.get("/:cep", async (req, res) => {
  try {
    const cep = sanitizeCep(String(req.params.cep || ""));
    if (!cep) return res.status(400).json({ error: "cep_required" });
    if (cep.length !== 8) return res.status(400).json({ error: "invalid_cep" });

    const data = await fetchViaCep(cep);
    if (data?.erro) return res.status(404).json({ error: "cep_not_found" });
    res.json(data);
  } catch (e: any) {
    res
      .status(500)
      .json({ error: "cep_failed", detail: e?.message || String(e) });
  }
});

export default r;
