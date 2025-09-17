import { Router } from "express";
import { env } from "../../env.js";

const r = Router();

r.get("/", async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();
    if (!city) return res.status(400).json({ error: "city_required" });

    const dateStr = req.query.date ? String(req.query.date) : null;
    const when = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(when.getTime()))
      return res.status(400).json({ error: "invalid_date" });

    const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
    url.searchParams.set("q", city);
    url.searchParams.set("appid", env.OPENWEATHER_KEY);
    url.searchParams.set("lang", "pt_br");
    url.searchParams.set("units", "metric");

    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      return res
        .status(resp.status)
        .json({ error: "weather_failed", detail: text });
    }
    const data: any = await resp.json();

    let closest = data?.list?.[0] ?? null;
    if (Array.isArray(data?.list) && data.list.length) {
      let best = Number.POSITIVE_INFINITY;
      for (const it of data.list) {
        const t = (it.dt as number) * 1000;
        const diff = Math.abs(t - when.getTime());
        if (diff < best) {
          best = diff;
          closest = it;
        }
      }
    }

    res.json({
      city: data?.city ?? null,
      closest,
    });
  } catch (e: any) {
    res
      .status(500)
      .json({ error: "internal_error", detail: e?.message || String(e) });
  }
});

export default r;
