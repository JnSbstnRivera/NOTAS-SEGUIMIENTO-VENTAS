import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import windmarLogo from "@/assets/windmar-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type CallType = "primera" | "seguimiento" | null;

interface PrimeraData {
  contesto: string;
  producto: string;
  esPropietario: string;
  tieneSolar: string;
  conformeSistema: string;
  facturaLuma: string;
  interes: string;
  motivoNoInteres: string;
  proximoPaso: string;
  fechaProximoContacto: string;
  notas: string;
}

interface SeguimientoData {
  contesto: string;
  producto: string;
  reviso: string;
  objeciones: string[];
  otraObjecion: string;
  interes: string;
  proximoPaso: string;
  fechaProximoContacto: string;
  notas: string;
}

const initPrimera: PrimeraData = {
  contesto: "", producto: "", esPropietario: "", tieneSolar: "",
  conformeSistema: "", facturaLuma: "", interes: "", motivoNoInteres: "",
  proximoPaso: "", fechaProximoContacto: "", notas: "",
};

const initSeguimiento: SeguimientoData = {
  contesto: "", producto: "", reviso: "", objeciones: [],
  otraObjecion: "", interes: "", proximoPaso: "",
  fechaProximoContacto: "", notas: "",
};

const PRODUCTOS = [
  { value: "placas", label: "PLACAS SOLARES" },
  { value: "powerwall", label: "BATERÍA POWERWALL" },
  { value: "water", label: "WATER" },
  { value: "roofing", label: "ROOFING" },
  { value: "anker", label: "ANKER" },
];

const OBJECIONES = [
  "Precio muy alto",
  "Consultar con familia",
  "Dudas de instalación",
  "Dudas de financiamiento",
  "Ya tiene otro proveedor",
  "Otro",
];

// ─── Option Button (estilo TM original) ──────────────────────────────────────

function OptBtn({
  active, onClick, children, danger = false,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; danger?: boolean;
}) {
  const base = "rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all";
  const activeClass = danger
    ? "border-destructive bg-destructive text-white"
    : "border-primary bg-primary text-white";
  const inactiveClass = "border-border text-foreground/70 bg-card hover:border-primary/50 hover:text-primary";
  return (
    <button type="button" className={`${base} ${active ? activeClass : inactiveClass}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-primary/70 pb-2 border-b-2 border-primary/15">
        {title}
      </h3>
      {children}
    </section>
  );
}

// ─── Question Row ─────────────────────────────────────────────────────────────

function Question({ num, label, children }: { num: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-start gap-3">
        <span className="text-primary font-bold text-sm mt-0.5">{num}</span>
        <span className="text-sm text-foreground/90 leading-relaxed">{label}</span>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
}

// ─── Note generator ───────────────────────────────────────────────────────────

function buildNote(deal: string, lead: string, type: CallType, p: PrimeraData, s: SeguimientoData) {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-PR", { year: "numeric", month: "2-digit", day: "2-digit" });
  const hora = now.toLocaleTimeString("es-PR", { hour: "2-digit", minute: "2-digit" });

  const prodLabel = PRODUCTOS.find((x) => x.value === (type === "primera" ? p.producto : s.producto))?.label || "—";

  const ansMap: Record<string, string> = {
    si: "Sí contestó", no_contesta: "No contesta",
    buzon: "Buzón de voz", numero_incorrecto: "Número incorrecto",
  };
  const interesMap: Record<string, string> = {
    muy_interesado: "Muy interesado", interesado: "Interesado",
    poco_interesado: "Poco interesado", no_interesado: "No interesado",
  };
  const pasoMap: Record<string, string> = {
    enviar_propuesta: "Enviar propuesta", agendar_cierre: "Agendar cierre",
    volver_llamar: "Volver a llamar", cerrar: "Cerrar oportunidad",
  };
  const facMap: Record<string, string> = {
    menos_100: "Menos de $100", "100_200": "$100–$200",
    "200_300": "$200–$300", "300_mas": "$300 o más",
  };

  if (type === "primera") {
    const lines = [
      "=== SEGUIMIENTO VENTAS WH ===",
      `Fecha: ${fecha} ${hora} EST`,
      "Tipo: PRIMERA LLAMADA",
      `Deal: ${deal || "—"} | Lead: ${lead || "—"}`,
      `Producto: ${prodLabel}`,
      "---",
      `Contestó: ${ansMap[p.contesto] || "—"}`,
    ];
    if (p.contesto === "si") {
      lines.push(`Propietario: ${p.esPropietario === "si" ? "Sí" : p.esPropietario === "no" ? "No" : p.esPropietario === "inquilino" ? "Inquilino" : "—"}`);
      lines.push(`Sistema solar: ${p.tieneSolar === "si" ? "Sí" : p.tieneSolar === "no" ? "No" : "—"}`);
      if (p.tieneSolar === "si") lines.push(`Conforme con sistema: ${p.conformeSistema === "si" ? "Sí" : p.conformeSistema === "no" ? "No" : p.conformeSistema === "problemas" ? "Tiene problemas" : "—"}`);
      lines.push(`Factura LUMA: ${facMap[p.facturaLuma] || "—"}`);
      lines.push(`Interés: ${interesMap[p.interes] || "—"}`);
      if (p.interes === "no_interesado" && p.motivoNoInteres) lines.push(`Motivo: ${p.motivoNoInteres}`);
      lines.push(`Próximo paso: ${pasoMap[p.proximoPaso] || "—"}`);
      if (p.fechaProximoContacto) lines.push(`Próximo contacto: ${p.fechaProximoContacto}`);
    }
    if (p.notas) lines.push("---", `Notas: ${p.notas}`);
    return lines.join("\n");
  } else {
    const objList = s.objeciones.length
      ? s.objeciones.map((o) => (o === "Otro" && s.otraObjecion ? `Otro: ${s.otraObjecion}` : o)).join(", ")
      : "Ninguna";
    const lines = [
      "=== SEGUIMIENTO VENTAS WH ===",
      `Fecha: ${fecha} ${hora} EST`,
      "Tipo: SEGUIMIENTO",
      `Deal: ${deal || "—"} | Lead: ${lead || "—"}`,
      `Producto: ${prodLabel}`,
      "---",
      `Contestó: ${ansMap[s.contesto] || "—"}`,
    ];
    if (s.contesto === "si") {
      lines.push(`Revisó información: ${s.reviso === "si" ? "Sí" : s.reviso === "no" ? "No" : s.reviso === "parcialmente" ? "Parcialmente" : "—"}`);
      lines.push(`Objeciones: ${objList}`);
      lines.push(`Interés actual: ${interesMap[s.interes] || "—"}`);
      lines.push(`Próximo paso: ${pasoMap[s.proximoPaso] || "—"}`);
      if (s.fechaProximoContacto) lines.push(`Próximo contacto: ${s.fechaProximoContacto}`);
    }
    if (s.notas) lines.push("---", `Notas: ${s.notas}`);
    return lines.join("\n");
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SalesNotesForm() {
  const { toast } = useToast();
  const [dealNum, setDealNum] = useState("");
  const [leadNum, setLeadNum] = useState("");
  const [searchDone, setSearchDone] = useState(false);
  const [callType, setCallType] = useState<CallType>(null);
  const [primera, setPrimera] = useState<PrimeraData>(initPrimera);
  const [seguimiento, setSeguimiento] = useState<SeguimientoData>(initSeguimiento);
  const [showNote, setShowNote] = useState(false);

  const setP = (k: keyof PrimeraData, v: string) => setPrimera((prev) => ({ ...prev, [k]: v }));
  const setS = (k: keyof SeguimientoData, v: string) => setSeguimiento((prev) => ({ ...prev, [k]: v }));

  const toggleObj = (o: string) =>
    setSeguimiento((prev) => ({
      ...prev,
      objeciones: prev.objeciones.includes(o)
        ? prev.objeciones.filter((x) => x !== o)
        : [...prev.objeciones, o],
    }));

  const handleSearch = () => {
    if (!dealNum && !leadNum) {
      toast({ title: "Ingresa al menos un número", variant: "destructive" });
      return;
    }
    setSearchDone(true);
    setCallType(null);
    setShowNote(false);
    setPrimera(initPrimera);
    setSeguimiento(initSeguimiento);
  };

  const handleReset = () => {
    setDealNum(""); setLeadNum("");
    setSearchDone(false); setCallType(null);
    setPrimera(initPrimera); setSeguimiento(initSeguimiento);
    setShowNote(false);
  };

  const handleSave = () => {
    toast({
      title: "CRM no conectado aún",
      description: "La nota fue generada. La integración con Zoho se activará próximamente.",
    });
  };

  const note = buildNote(dealNum, leadNum, callType, primera, seguimiento);

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── HEADER ── */}
        <div className="text-center flex flex-col items-center gap-0 pt-4 mb-2">
          <img src={windmarLogo} alt="Windmar Home" className="h-[7rem] w-auto" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-accent leading-none">
              Notas de Seguimiento
            </h1>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary leading-none">
              Equipo de Ventas
            </h2>
          </div>
        </div>

        <div className="space-y-4">

          {/* ── SECCIÓN 1: IDENTIFICACIÓN ── */}
          <Section title="Identificación del cliente">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Número de Deal</label>
                <Input placeholder="Ej: 12345" value={dealNum} onChange={(e) => setDealNum(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Número de Lead</label>
                <Input placeholder="Ej: L-67890" value={leadNum} onChange={(e) => setLeadNum(e.target.value)} className="bg-background" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="windmar" onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Cargar Cliente
              </Button>
              {searchDone && (
                <Button type="button" variant="outline" onClick={handleReset} size="icon" title="Nueva consulta">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {searchDone && (
              <div className="bg-muted/40 rounded-xl p-4 border border-border/40 text-sm">
                <p className="text-xs font-bold text-primary uppercase mb-1">CRM no conectado</p>
                <p className="text-muted-foreground text-xs">
                  Completa los campos manualmente.
                  {dealNum && <span className="ml-1 font-semibold text-foreground">Deal #{dealNum}</span>}
                  {leadNum && <span className="ml-1 font-semibold text-foreground">| Lead {leadNum}</span>}
                </p>
              </div>
            )}
          </Section>

          {/* ── SECCIÓN 2: TIPO DE LLAMADA ── */}
          {searchDone && (
            <Section title="Tipo de llamada">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: "primera", emoji: "📞", title: "PRIMERA LLAMADA", sub: "Primer contacto con el cliente" },
                  { v: "seguimiento", emoji: "🔄", title: "SEGUIMIENTO", sub: "Ya hubo contacto previo" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => { setCallType(opt.v as CallType); setShowNote(false); }}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      callType === opt.v
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.emoji}</div>
                    <p className={`font-extrabold text-sm uppercase tracking-wide ${callType === opt.v ? "text-primary" : "text-foreground/80"}`}>
                      {opt.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* ── SECCIÓN 3A: PRIMERA LLAMADA ── */}
          {callType === "primera" && (
            <Section title="Primera llamada">

              {/* 01 ¿Contestó? */}
              <Question num="01" label="¿El cliente contestó la llamada?">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { v: "si", l: "SÍ CONTESTÓ" },
                    { v: "no_contesta", l: "NO CONTESTA" },
                    { v: "buzon", l: "BUZÓN DE VOZ" },
                    { v: "numero_incorrecto", l: "NÚM. INCORRECTO" },
                  ].map((o) => (
                    <OptBtn key={o.v} active={primera.contesto === o.v} onClick={() => setP("contesto", o.v)} danger={o.v === "numero_incorrecto"}>
                      {o.l}
                    </OptBtn>
                  ))}
                </div>
              </Question>

              {primera.contesto === "si" && (
                <>
                  {/* 02 Producto */}
                  <Question num="02" label="¿Qué producto se está ofreciendo?">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PRODUCTOS.map((p) => (
                        <OptBtn key={p.value} active={primera.producto === p.value} onClick={() => setP("producto", p.value)}>
                          {p.label}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* 03 Propietario */}
                  <Question num="03" label="¿El cliente es propietario de la residencia?">
                    <div className="grid grid-cols-3 gap-3">
                      {[{ v: "si", l: "SÍ, PROPIETARIO" }, { v: "no", l: "NO ES DUEÑO" }, { v: "inquilino", l: "INQUILINO" }].map((o) => (
                        <OptBtn key={o.v} active={primera.esPropietario === o.v} onClick={() => setP("esPropietario", o.v)}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* 04 Sistema solar */}
                  <Question num="04" label="¿Tiene sistema solar actualmente?">
                    <div className="grid grid-cols-2 gap-3">
                      {[{ v: "si", l: "SÍ TIENE" }, { v: "no", l: "NO TIENE" }].map((o) => (
                        <OptBtn key={o.v} active={primera.tieneSolar === o.v} onClick={() => setP("tieneSolar", o.v)}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* 05 Conforme (condicional: solo si tiene solar) */}
                  {primera.tieneSolar === "si" && (
                    <Question num="05" label="¿Está conforme con su sistema solar actual?">
                      <div className="grid grid-cols-3 gap-3">
                        {[{ v: "si", l: "SÍ, CONFORME" }, { v: "no", l: "NO CONFORME" }, { v: "problemas", l: "TIENE PROBLEMAS" }].map((o) => (
                          <OptBtn key={o.v} active={primera.conformeSistema === o.v} onClick={() => setP("conformeSistema", o.v)} danger={o.v === "problemas"}>
                            {o.l}
                          </OptBtn>
                        ))}
                      </div>
                    </Question>
                  )}

                  {/* 06 Factura LUMA */}
                  <Question num={primera.tieneSolar === "si" ? "06" : "05"} label="¿Cuánto paga mensualmente en LUMA?">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { v: "menos_100", l: "MENOS $100" },
                        { v: "100_200", l: "$100 – $200" },
                        { v: "200_300", l: "$200 – $300" },
                        { v: "300_mas", l: "$300 O MÁS" },
                      ].map((o) => (
                        <OptBtn key={o.v} active={primera.facturaLuma === o.v} onClick={() => setP("facturaLuma", o.v)}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* 07 Nivel de interés */}
                  <Question num={primera.tieneSolar === "si" ? "07" : "06"} label="Nivel de interés del cliente">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { v: "muy_interesado", l: "🔥 MUY INTERESADO" },
                        { v: "interesado", l: "👍 INTERESADO" },
                        { v: "poco_interesado", l: "🤔 POCO INTERESADO" },
                        { v: "no_interesado", l: "❌ NO INTERESADO" },
                      ].map((o) => (
                        <OptBtn key={o.v} active={primera.interes === o.v} onClick={() => setP("interes", o.v)} danger={o.v === "no_interesado"}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* Motivo si no interesado (condicional) */}
                  {primera.interes === "no_interesado" && (
                    <Question num="↳" label="¿Cuál fue el motivo principal?">
                      <div className="grid grid-cols-2 gap-3">
                        {["PRECIO MUY ALTO", "YA TIENE PROVEEDOR", "NO APLICA AL PRODUCTO", "OTRO MOTIVO"].map((m) => (
                          <OptBtn key={m} active={primera.motivoNoInteres === m} onClick={() => setP("motivoNoInteres", m)}>
                            {m}
                          </OptBtn>
                        ))}
                      </div>
                    </Question>
                  )}

                  {/* Próximo paso */}
                  <Question num={primera.tieneSolar === "si" ? "08" : "07"} label="¿Cuál es el próximo paso?">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { v: "enviar_propuesta", l: "📄 ENVIAR PROPUESTA" },
                        { v: "volver_llamar", l: "📅 VOLVER A LLAMAR" },
                        { v: "cerrar", l: "🚫 CERRAR OPORTUNIDAD" },
                      ].map((o) => (
                        <OptBtn key={o.v} active={primera.proximoPaso === o.v} onClick={() => setP("proximoPaso", o.v)} danger={o.v === "cerrar"}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* Fecha próximo contacto (condicional) */}
                  {primera.proximoPaso === "volver_llamar" && (
                    <Question num="↳" label="Fecha de próximo contacto">
                      <Input
                        type="date"
                        value={primera.fechaProximoContacto}
                        onChange={(e) => setP("fechaProximoContacto", e.target.value)}
                        className="max-w-xs bg-background"
                      />
                    </Question>
                  )}
                </>
              )}

              {/* Notas adicionales */}
              <Question num="📝" label="Notas adicionales de la llamada">
                <Textarea
                  placeholder="Escribe cualquier detalle relevante..."
                  value={primera.notas}
                  onChange={(e) => setP("notas", e.target.value)}
                  rows={3}
                  className="bg-background resize-none"
                />
              </Question>
            </Section>
          )}

          {/* ── SECCIÓN 3B: SEGUIMIENTO ── */}
          {callType === "seguimiento" && (
            <Section title="Seguimiento">

              {/* 01 ¿Contestó? */}
              <Question num="01" label="¿El cliente contestó la llamada?">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { v: "si", l: "SÍ CONTESTÓ" },
                    { v: "no_contesta", l: "NO CONTESTA" },
                    { v: "buzon", l: "BUZÓN DE VOZ" },
                    { v: "numero_incorrecto", l: "NÚM. INCORRECTO" },
                  ].map((o) => (
                    <OptBtn key={o.v} active={seguimiento.contesto === o.v} onClick={() => setS("contesto", o.v)} danger={o.v === "numero_incorrecto"}>
                      {o.l}
                    </OptBtn>
                  ))}
                </div>
              </Question>

              {seguimiento.contesto === "si" && (
                <>
                  {/* 02 Producto */}
                  <Question num="02" label="¿Qué producto se está trabajando?">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PRODUCTOS.map((p) => (
                        <OptBtn key={p.value} active={seguimiento.producto === p.value} onClick={() => setS("producto", p.value)}>
                          {p.label}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* 03 Revisó información */}
                  <Question num="03" label="¿El cliente revisó la información enviada?">
                    <div className="grid grid-cols-3 gap-3">
                      {[{ v: "si", l: "SÍ REVISÓ" }, { v: "no", l: "NO REVISÓ" }, { v: "parcialmente", l: "PARCIALMENTE" }].map((o) => (
                        <OptBtn key={o.v} active={seguimiento.reviso === o.v} onClick={() => setS("reviso", o.v)}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* 04 Objeciones */}
                  <Question num="04" label="Objeciones del cliente (puede marcar varias)">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {OBJECIONES.map((o) => (
                        <OptBtn key={o} active={seguimiento.objeciones.includes(o)} onClick={() => toggleObj(o)}>
                          {o.toUpperCase()}
                        </OptBtn>
                      ))}
                    </div>
                    {seguimiento.objeciones.includes("Otro") && (
                      <Input
                        className="mt-3 bg-background"
                        placeholder="Describir otra objeción..."
                        value={seguimiento.otraObjecion}
                        onChange={(e) => setS("otraObjecion", e.target.value)}
                      />
                    )}
                  </Question>

                  {/* 05 Nivel de interés */}
                  <Question num="05" label="Nivel de interés actual del cliente">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { v: "muy_interesado", l: "🔥 MUY INTERESADO" },
                        { v: "interesado", l: "👍 INTERESADO" },
                        { v: "poco_interesado", l: "🤔 POCO INTERESADO" },
                        { v: "no_interesado", l: "❌ NO INTERESADO" },
                      ].map((o) => (
                        <OptBtn key={o.v} active={seguimiento.interes === o.v} onClick={() => setS("interes", o.v)} danger={o.v === "no_interesado"}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* 06 Próximo paso */}
                  <Question num="06" label="¿Cuál es el próximo paso?">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v: "enviar_propuesta", l: "📄 ENVIAR PROPUESTA" },
                        { v: "agendar_cierre", l: "🤝 AGENDAR CIERRE" },
                        { v: "volver_llamar", l: "📅 VOLVER A LLAMAR" },
                        { v: "cerrar", l: "🚫 CERRAR OPORTUNIDAD" },
                      ].map((o) => (
                        <OptBtn key={o.v} active={seguimiento.proximoPaso === o.v} onClick={() => setS("proximoPaso", o.v)} danger={o.v === "cerrar"}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* Fecha próximo contacto (condicional) */}
                  {(seguimiento.proximoPaso === "volver_llamar" || seguimiento.proximoPaso === "agendar_cierre") && (
                    <Question num="↳" label="Fecha de próximo contacto">
                      <Input
                        type="date"
                        value={seguimiento.fechaProximoContacto}
                        onChange={(e) => setS("fechaProximoContacto", e.target.value)}
                        className="max-w-xs bg-background"
                      />
                    </Question>
                  )}
                </>
              )}

              {/* Notas adicionales */}
              <Question num="📝" label="Notas adicionales de la llamada">
                <Textarea
                  placeholder="Escribe cualquier detalle relevante..."
                  value={seguimiento.notas}
                  onChange={(e) => setS("notas", e.target.value)}
                  rows={3}
                  className="bg-background resize-none"
                />
              </Question>
            </Section>
          )}

          {/* ── SECCIÓN 4: NOTA + GUARDAR ── */}
          {callType && (
            <Section title="Nota generada">
              <button
                type="button"
                onClick={() => setShowNote(!showNote)}
                className="text-xs font-bold text-primary underline underline-offset-2"
              >
                {showNote ? "Ocultar vista previa" : "Ver vista previa de nota para Zoho"}
              </button>

              {showNote && (
                <pre className="bg-muted rounded-xl p-4 text-xs text-foreground/80 font-mono leading-relaxed whitespace-pre-wrap border border-border/40">
                  {note}
                </pre>
              )}

              <Button
                type="button"
                variant="windmar"
                className="w-full h-12 text-sm font-extrabold"
                onClick={handleSave}
              >
                Guardar Nota en Zoho CRM
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                CRM no conectado — integración con Zoho se activará próximamente
              </p>
            </Section>
          )}

        </div>
      </div>
    </div>
  );
}
