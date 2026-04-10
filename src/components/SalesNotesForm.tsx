import { useState } from "react";
import { Search, RotateCcw, UserPlus } from "lucide-react";
import windmarLogo from "@/assets/windmar-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type CallType = "primera" | "seguimiento" | null;

// Datos del cliente (CRM placeholder / futuro Zoho)
interface ClienteData {
  nombre: string;
  direccion: string;
  zipCode: string;
  ciudad: string;
  telefono: string;
  correo: string;
}

// Sub-preguntas por producto
interface ProductoSubs {
  // Placas
  facturaLuma: string;
  tieneSolar: string;
  // Powerwall
  solarInstalado: string;
  frecuenciaApagones: string;
  // Water (3 sub-preguntas)
  tipoAgua: string;       // cisterna
  problemasAgua: string;  // calentador
  waterOsmosis: string;   // reverse osmosis
  // Roofing
  materialTecho: string;
  tieneFiltraciones: string;
  // Anker
  solarAnker: string;
  necesitaRespaldo: string;
}

interface PrimeraData {
  contesto: string;
  intentos: string;
  resultadoLlamada: string; // "venta" | "info_general"
  // Venta
  productoVendido: string;
  financiera: string;
  // Info general
  productos: string[];
  subs: ProductoSubs;
  esPropietario: string;
  interes: string;
  motivoNoInteres: string;
  proximoPaso: string;
  fechaProximoContacto: string;
  notas: string;
}

interface SeguimientoData {
  contesto: string;
  intentos: string;
  resultadoLlamada: string; // "venta" | "info_general"
  // Venta
  productoVendido: string;
  financiera: string;
  // Info general
  productos: string[];
  subs: ProductoSubs;
  reviso: string;
  objeciones: string[];
  otraObjecion: string;
  interes: string;
  proximoPaso: string;
  fechaProximoContacto: string;
  notas: string;
}

const initSubs: ProductoSubs = {
  facturaLuma: "", tieneSolar: "",
  solarInstalado: "", frecuenciaApagones: "",
  tipoAgua: "", problemasAgua: "", waterOsmosis: "",
  materialTecho: "", tieneFiltraciones: "",
  solarAnker: "", necesitaRespaldo: "",
};

const initPrimera: PrimeraData = {
  contesto: "", intentos: "", resultadoLlamada: "", productoVendido: "", financiera: "",
  productos: [], subs: { ...initSubs }, esPropietario: "", interes: "",
  motivoNoInteres: "", proximoPaso: "", fechaProximoContacto: "", notas: "",
};

const initSeguimiento: SeguimientoData = {
  contesto: "", intentos: "", resultadoLlamada: "", productoVendido: "", financiera: "",
  productos: [], subs: { ...initSubs }, reviso: "", objeciones: [],
  otraObjecion: "", interes: "", proximoPaso: "", fechaProximoContacto: "", notas: "",
};

const initCliente: ClienteData = { nombre: "", direccion: "", zipCode: "", ciudad: "", telefono: "", correo: "" };

const PRODUCTOS = [
  { value: "placas", label: "PLACAS SOLARES" },
  { value: "powerwall", label: "BATERÍA POWERWALL" },
  { value: "water", label: "WATER" },
  { value: "roofing", label: "ROOFING" },
  { value: "anker", label: "ANKER" },
];

const FINANCIERAS = [
  { v: "wh_financial", l: "WH FINANCIAL" },
  { v: "oriental", l: "ORIENTAL" },
  { v: "enfin", l: "ENFIN" },
  { v: "synchrony", l: "SYNCHRONY" },
  { v: "kiwi", l: "KIWI" },
  { v: "cash", l: "CASH / CONTADO" },
];

const OBJECIONES = [
  "Precio muy alto", "Consultar con familia",
  "Dudas de instalación", "Dudas de financiamiento",
  "Ya tiene otro proveedor", "Otro",
];

// ─── Helper Components ────────────────────────────────────────────────────────

function OptBtn({ active, onClick, children, danger = false }: {
  active: boolean; onClick: () => void; children: React.ReactNode; danger?: boolean;
}) {
  const base = "rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all";
  const activeClass = danger ? "border-destructive bg-destructive text-white" : "border-primary bg-primary text-white";
  const inactiveClass = "border-border text-foreground/70 bg-card hover:border-primary/50 hover:text-primary";
  return (
    <button type="button" className={`${base} ${active ? activeClass : inactiveClass}`} onClick={onClick}>
      {children}
    </button>
  );
}

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

function Question({ num, label, sub = false, children }: {
  num: string; label: string; sub?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-start gap-3">
        <span className={`font-bold text-sm mt-0.5 ${sub ? "text-accent" : "text-primary"}`}>{num}</span>
        <span className={`text-sm leading-relaxed ${sub ? "text-foreground/75" : "text-foreground/90"}`}>{label}</span>
      </div>
      <div className={sub ? "pl-10" : "pl-8"}>{children}</div>
    </div>
  );
}

// ─── Sub-preguntas por producto ───────────────────────────────────────────────

function SubsProducto({
  productos, subs, onChange,
}: {
  productos: string[];
  subs: ProductoSubs;
  onChange: (k: keyof ProductoSubs, v: string) => void;
}) {
  if (productos.length === 0) return null;
  return (
    <div className="space-y-4 pl-2 border-l-2 border-accent/30 ml-1">
      {/* PLACAS */}
      {productos.includes("placas") && (
        <>
          <Question num="2.1" label="¿Cuánto paga mensualmente en LUMA?" sub>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[{ v: "menos_100", l: "MENOS $100" }, { v: "100_200", l: "$100 – $200" },
                { v: "200_300", l: "$200 – $300" }, { v: "300_mas", l: "$300 O MÁS" }].map((o) => (
                <OptBtn key={o.v} active={subs.facturaLuma === o.v} onClick={() => onChange("facturaLuma", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
          <Question num="2.2" label="¿Tiene sistema solar actualmente?" sub>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: "si", l: "SÍ TIENE" }, { v: "no", l: "NO TIENE" }].map((o) => (
                <OptBtn key={o.v} active={subs.tieneSolar === o.v} onClick={() => onChange("tieneSolar", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
        </>
      )}

      {/* POWERWALL */}
      {productos.includes("powerwall") && (
        <>
          <Question num="2.1" label="¿Ya tiene sistema solar instalado?" sub>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: "si", l: "SÍ TIENE SOLAR" }, { v: "no", l: "NO TIENE SOLAR" }].map((o) => (
                <OptBtn key={o.v} active={subs.solarInstalado === o.v} onClick={() => onChange("solarInstalado", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
          <Question num="2.2" label="¿Con qué frecuencia sufre apagones?" sub>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: "frecuentes", l: "FRECUENTES" }, { v: "ocasionales", l: "OCASIONALES" }, { v: "raramente", l: "RARAMENTE" }].map((o) => (
                <OptBtn key={o.v} active={subs.frecuenciaApagones === o.v} onClick={() => onChange("frecuenciaApagones", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
        </>
      )}

      {/* WATER */}
      {productos.includes("water") && (
        <>
          <Question num="2.1" label="Cisterna — ¿Tiene problemas con el agua de la llave?" sub>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { v: "cortes_frecuentes", l: "CORTES FRECUENTES" },
                { v: "baja_presion", l: "BAJA PRESIÓN" },
                { v: "necesita_almacenamiento", l: "NECESITA ALMACENAMIENTO" },
                { v: "sin_problema", l: "SIN PROBLEMA" },
              ].map((o) => (
                <OptBtn key={o.v} active={subs.tipoAgua === o.v} onClick={() => onChange("tipoAgua", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
          <Question num="2.2" label="Calentador Solar — ¿Cómo calienta el agua actualmente?" sub>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { v: "electrico", l: "CALENTADOR ELÉCTRICO" },
                { v: "gas", l: "CALENTADOR DE GAS" },
                { v: "solar_existente", l: "CALENTADOR SOLAR" },
                { v: "sin_calentador", l: "SIN CALENTADOR" },
              ].map((o) => (
                <OptBtn key={o.v} active={subs.problemasAgua === o.v} onClick={() => onChange("problemasAgua", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
          <Question num="2.3" label="Reverse Osmosis — ¿Cómo obtiene agua para tomar?" sub>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { v: "compra_botella", l: "COMPRA BOTELLONES" },
                { v: "filtro_existente", l: "TIENE FILTRO" },
                { v: "llave_directo", l: "TOMA DE LA LLAVE" },
                { v: "sin_sistema", l: "SIN SISTEMA" },
              ].map((o) => (
                <OptBtn key={o.v} active={subs.waterOsmosis === o.v} onClick={() => onChange("waterOsmosis", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
        </>
      )}

      {/* ROOFING */}
      {productos.includes("roofing") && (
        <>
          <Question num="2.1" label="¿De qué material es el techo?" sub>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[{ v: "cemento", l: "CEMENTO" }, { v: "galvalume", l: "GALVALUME" },
                { v: "zinc", l: "ZINC" }, { v: "otro", l: "OTRO" }].map((o) => (
                <OptBtn key={o.v} active={subs.materialTecho === o.v} onClick={() => onChange("materialTecho", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
          <Question num="2.2" label="¿Tiene filtraciones o daños en el techo?" sub>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: "si", l: "SÍ, FILTRACIONES" }, { v: "danado", l: "TECHO DAÑADO" }, { v: "no", l: "BUEN ESTADO" }].map((o) => (
                <OptBtn key={o.v} active={subs.tieneFiltraciones === o.v} onClick={() => onChange("tieneFiltraciones", o.v)} danger={o.v !== "no"}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
        </>
      )}

      {/* ANKER */}
      {productos.includes("anker") && (
        <>
          <Question num="2.1" label="¿Tiene sistema solar instalado actualmente?" sub>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: "si", l: "SÍ TIENE SOLAR" }, { v: "no", l: "NO TIENE SOLAR" }].map((o) => (
                <OptBtn key={o.v} active={subs.solarAnker === o.v} onClick={() => onChange("solarAnker", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
          <Question num="2.2" label="¿Necesita respaldo de energía o backup?" sub>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: "urgente", l: "SÍ, URGENTE" }, { v: "futuro", l: "SÍ, A FUTURO" }, { v: "explorando", l: "EXPLORANDO" }].map((o) => (
                <OptBtn key={o.v} active={subs.necesitaRespaldo === o.v} onClick={() => onChange("necesitaRespaldo", o.v)}>{o.l}</OptBtn>
              ))}
            </div>
          </Question>
        </>
      )}
    </div>
  );
}

// ─── Note generator ───────────────────────────────────────────────────────────

function buildNote(
  deal: string, lead: string, cliente: ClienteData,
  type: CallType, p: PrimeraData, s: SeguimientoData
) {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-PR", { year: "numeric", month: "2-digit", day: "2-digit" });
  const hora = now.toLocaleTimeString("es-PR", { hour: "2-digit", minute: "2-digit" });

  const ansMap: Record<string, string> = { si: "Sí contestó", no_contesta: "No contesta (fue a buzón)" };
  const interesMap: Record<string, string> = {
    muy_interesado: "Muy interesado", interesado: "Interesado",
    poco_interesado: "Poco interesado", no_interesado: "No interesado",
  };
  const pasoMap: Record<string, string> = {
    enviar_propuesta: "Enviar propuesta", agendar_cierre: "Agendar cierre",
    volver_llamar: "Volver a llamar", cerrar: "Cerrar oportunidad",
  };
  const finMap: Record<string, string> = {
    wh_financial: "WH Financial", oriental: "Oriental", enfin: "ENFIN",
    synchrony: "Synchrony", kiwi: "Kiwi", cash: "Cash / Contado",
  };
  const facMap: Record<string, string> = {
    menos_100: "Menos de $100", "100_200": "$100–$200", "200_300": "$200–$300", "300_mas": "$300 o más",
  };

  const clienteLines = [];
  if (cliente.nombre) clienteLines.push(`Cliente: ${cliente.nombre}`);
  if (cliente.telefono) clienteLines.push(`Teléfono: ${cliente.telefono}`);
  if (cliente.correo) clienteLines.push(`Correo: ${cliente.correo}`);
  if (cliente.direccion) clienteLines.push(`Dirección: ${cliente.direccion}${cliente.ciudad ? `, ${cliente.ciudad}` : ""}${cliente.zipCode ? ` ${cliente.zipCode}` : ""}`);

  const d = type === "primera" ? p : s;
  const prodLabel = d.productos.map((v) => PRODUCTOS.find((x) => x.value === v)?.label || v).join(", ") || "—";

  const lines = [
    "=== SEGUIMIENTO VENTAS WH ===",
    `Fecha: ${fecha} ${hora} EST`,
    `Tipo: ${type === "primera" ? "PRIMERA LLAMADA" : "SEGUIMIENTO"}`,
    `Deal: ${deal || "—"} | Lead: ${lead || "—"}`,
    ...clienteLines,
    "---",
    `Contestó: ${ansMap[d.contesto] || "—"}${d.contesto === "no_contesta" && d.intentos ? ` — Intentos: ${d.intentos}` : ""}`,
  ];

  if (d.contesto === "si") {
    lines.push(`Resultado: ${d.resultadoLlamada === "venta" ? "✅ VENTA" : "ℹ️ Información General"}`);

    if (d.resultadoLlamada === "venta") {
      const prodVenta = PRODUCTOS.find((x) => x.value === d.productoVendido)?.label || d.productoVendido || "—";
      lines.push(`Producto vendido: ${prodVenta}`);
      lines.push(`Financiera: ${finMap[d.financiera] || d.financiera || "—"}`);
    } else if (d.resultadoLlamada === "info_general") {
      lines.push(`Producto(s) discutido(s): ${prodLabel}`);

      // Subs Placas
      if (d.productos.includes("placas")) {
        if (d.subs.facturaLuma) lines.push(`  Factura LUMA: ${facMap[d.subs.facturaLuma] || d.subs.facturaLuma}`);
        if (d.subs.tieneSolar) lines.push(`  Sistema solar: ${d.subs.tieneSolar === "si" ? "Sí" : "No"}`);
      }
      // Subs Powerwall
      if (d.productos.includes("powerwall")) {
        if (d.subs.solarInstalado) lines.push(`  Solar instalado: ${d.subs.solarInstalado === "si" ? "Sí" : "No"}`);
        if (d.subs.frecuenciaApagones) lines.push(`  Apagones: ${d.subs.frecuenciaApagones}`);
      }
      // Subs Water
      if (d.productos.includes("water")) {
        if (d.subs.tipoAgua) lines.push(`  Cisterna: ${d.subs.tipoAgua.replace(/_/g, " ")}`);
        if (d.subs.problemasAgua) lines.push(`  Calentador: ${d.subs.problemasAgua.replace(/_/g, " ")}`);
        if (d.subs.waterOsmosis) lines.push(`  Agua tomar: ${d.subs.waterOsmosis.replace(/_/g, " ")}`);
      }
      // Subs Roofing
      if (d.productos.includes("roofing")) {
        if (d.subs.materialTecho) lines.push(`  Material techo: ${d.subs.materialTecho}`);
        if (d.subs.tieneFiltraciones) lines.push(`  Filtraciones: ${d.subs.tieneFiltraciones}`);
      }
      // Subs Anker
      if (d.productos.includes("anker")) {
        if (d.subs.solarAnker) lines.push(`  Solar (Anker): ${d.subs.solarAnker === "si" ? "Sí" : "No"}`);
        if (d.subs.necesitaRespaldo) lines.push(`  Respaldo energía: ${d.subs.necesitaRespaldo}`);
      }

      if (type === "primera" && "esPropietario" in d) {
        const pp = d as PrimeraData;
        if (pp.esPropietario) lines.push(`Propietario: ${pp.esPropietario === "si" ? "Sí" : pp.esPropietario === "no" ? "No" : "Inquilino"}`);
        if (pp.interes) lines.push(`Interés: ${interesMap[pp.interes] || "—"}`);
        if (pp.interes === "no_interesado" && pp.motivoNoInteres) lines.push(`Motivo: ${pp.motivoNoInteres}`);
        if (pp.proximoPaso) lines.push(`Próximo paso: ${pasoMap[pp.proximoPaso] || "—"}`);
        if (pp.fechaProximoContacto) lines.push(`Próximo contacto: ${pp.fechaProximoContacto}`);
      }

      if (type === "seguimiento" && "reviso" in d) {
        const ss = d as SeguimientoData;
        if (ss.reviso) lines.push(`Revisó información: ${ss.reviso === "si" ? "Sí" : ss.reviso === "no" ? "No" : "Parcialmente"}`);
        const objList = ss.objeciones.length
          ? ss.objeciones.map((o) => (o === "Otro" && ss.otraObjecion ? `Otro: ${ss.otraObjecion}` : o)).join(", ")
          : null;
        if (objList) lines.push(`Objeciones: ${objList}`);
        if (ss.interes) lines.push(`Interés: ${interesMap[ss.interes] || "—"}`);
        if (ss.proximoPaso) lines.push(`Próximo paso: ${pasoMap[ss.proximoPaso] || "—"}`);
        if (ss.fechaProximoContacto) lines.push(`Próximo contacto: ${ss.fechaProximoContacto}`);
      }
    }
  }

  if (d.notas) lines.push("---", `Notas: ${d.notas}`);
  return lines.join("\n");
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SalesNotesForm() {
  const { toast } = useToast();
  const [dealNum, setDealNum] = useState("");
  const [leadNum, setLeadNum] = useState("");
  const [newLeadNum, setNewLeadNum] = useState("");
  const [searchError, setSearchError] = useState("");
  const [cliente, setCliente] = useState<ClienteData>(initCliente);
  const [searchDone, setSearchDone] = useState(false);
  const [callType, setCallType] = useState<CallType>(null);
  const [primera, setPrimera] = useState<PrimeraData>(initPrimera);
  const [seguimiento, setSeguimiento] = useState<SeguimientoData>(initSeguimiento);
  const [showNote, setShowNote] = useState(false);

  const setC = (k: keyof ClienteData, v: string) => setCliente((prev) => ({ ...prev, [k]: v }));
  const setP = (k: keyof PrimeraData, v: string) => setPrimera((prev) => ({ ...prev, [k]: v }));
  const setPSub = (k: keyof ProductoSubs, v: string) => setPrimera((prev) => ({ ...prev, subs: { ...prev.subs, [k]: v } }));
  const setS = (k: keyof SeguimientoData, v: string) => setSeguimiento((prev) => ({ ...prev, [k]: v }));

  const toggleProd = (which: "primera" | "seguimiento", val: string) => {
    if (which === "primera") {
      setPrimera((prev) => ({
        ...prev,
        productos: prev.productos.includes(val)
          ? prev.productos.filter((x) => x !== val)
          : [...prev.productos, val],
      }));
    } else {
      setSeguimiento((prev) => ({
        ...prev,
        productos: prev.productos.includes(val)
          ? prev.productos.filter((x) => x !== val)
          : [...prev.productos, val],
      }));
    }
  };

  const toggleObj = (o: string) =>
    setSeguimiento((prev) => ({
      ...prev,
      objeciones: prev.objeciones.includes(o)
        ? prev.objeciones.filter((x) => x !== o)
        : [...prev.objeciones, o],
    }));

  // Busca por deal o lead y abre el formulario
  const handleSearch = (field: "deal" | "lead") => {
    const val = field === "deal" ? dealNum.trim() : leadNum.trim();
    if (!val) {
      setSearchError(field === "deal" ? "Ingresa un número de Deal" : "Ingresa un número de Lead");
      return;
    }
    setSearchError("");
    setCliente(initCliente);
    setNewLeadNum("");
    setSearchDone(true);
    setCallType(null);
    setShowNote(false);
    setPrimera(initPrimera);
    setSeguimiento(initSeguimiento);
  };

  // Genera un Lead nuevo desde el Deal (demo — cuando Zoho esté conectado creará el registro real)
  const handleCreateLead = () => {
    if (!dealNum.trim()) {
      setSearchError("Escribe el número de Deal antes de crear un Lead");
      return;
    }
    setSearchError("");
    const digits = String(Math.floor(100000 + Math.random() * 900000));
    const generated = `L${digits}`;
    setLeadNum(generated);
    setNewLeadNum(generated);
    setCliente(initCliente);
    setSearchDone(true);
    setCallType(null);
    setShowNote(false);
    setPrimera(initPrimera);
    setSeguimiento(initSeguimiento);
  };

  const handleReset = () => {
    setDealNum("");
    setLeadNum("");
    setNewLeadNum("");
    setSearchError("");
    setCliente(initCliente);
    setSearchDone(false);
    setCallType(null);
    setPrimera(initPrimera);
    setSeguimiento(initSeguimiento);
    setShowNote(false);
  };

  // Demo: muestra la nota generada pero no la envía a ningún CRM
  const handleSave = () => {
    toast({
      title: "Nota generada correctamente",
      description: "La conexión con Zoho CRM se configurará próximamente.",
    });
  };

  const note = buildNote(dealNum, leadNum, cliente, callType, primera, seguimiento);

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── HEADER ── */}
        <div className="text-center flex flex-col items-center gap-0 pt-4 mb-2">
          <img src={windmarLogo} alt="Windmar Home" className="h-[7rem] w-auto" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-accent leading-none">Notas de Seguimiento</h1>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary leading-none">Equipo de Ventas</h2>
          </div>
        </div>

        <div className="space-y-4">

          {/* ── SECCIÓN 1: IDENTIFICACIÓN ── */}
          <Section title="Identificación del cliente">

            {/* Fila única: Deal + Lead + botón Nuevo Lead + Reset */}
            <div className="flex items-end gap-2">

              {/* DEAL */}
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Número de Deal</label>
                <div className="relative">
                  <Input
                    placeholder="Ingresa Numero de Deal"
                    value={dealNum}
                    onChange={(e) => { setDealNum(e.target.value); setSearchError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch("deal")}
                    className="bg-background pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearch("deal")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    title="Buscar Deal"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* LEAD */}
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Número de Lead</label>
                <div className="relative">
                  <Input
                    placeholder="Ingresa Numero de Lead"
                    value={leadNum}
                    onChange={(e) => { setLeadNum(e.target.value); setSearchError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch("lead")}
                    className="bg-background pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearch("lead")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    title="Buscar Lead"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Botón Nuevo Lead — solo icono con tooltip */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={handleCreateLead}
                  className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center transition-all
                    ${!dealNum.trim()
                      ? "border-red-400 text-red-400 animate-pulse hover:animate-none hover:bg-red-50 dark:hover:bg-red-950"
                      : "border-accent text-accent hover:bg-accent hover:text-white"
                    }`}
                >
                  <UserPlus className="h-4 w-4" />
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20 hidden group-hover:block">
                  <div className="bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg">
                    Crear nuevo Lead
                  </div>
                  <div className="w-2 h-2 bg-foreground rotate-45 mx-auto -mt-1" />
                </div>
              </div>

              {/* Reset */}
              {searchDone && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="shrink-0 h-10 w-10 rounded-lg border-2 border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
                  title="Nueva consulta"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Error inline */}
            {searchError && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                <span className="text-destructive text-xs font-semibold">⚠ {searchError}</span>
              </div>
            )}

            {/* Badge del lead recién creado */}
            {newLeadNum && (
              <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-xl px-4 py-2.5">
                <UserPlus className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-wide">Nuevo Lead creado</p>
                  <p className="text-sm font-mono font-bold text-foreground">{newLeadNum}</p>
                </div>
              </div>
            )}

            {/* Datos del cliente */}
            {searchDone && (
              <div className="bg-muted/40 rounded-xl p-4 border border-border/40 space-y-3">
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
                  Datos del cliente
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Nombre Cliente</label>
                    <Input placeholder="Nombre completo" value={cliente.nombre} onChange={(e) => setC("nombre", e.target.value)} className="bg-background text-sm h-8" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Correo Electrónico</label>
                    <Input placeholder="correo@ejemplo.com" value={cliente.correo} onChange={(e) => setC("correo", e.target.value)} className="bg-background text-sm h-8" type="email" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Número Telefónico</label>
                    <Input placeholder="(787) 000-0000" value={cliente.telefono} onChange={(e) => setC("telefono", e.target.value)} className="bg-background text-sm h-8" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Dirección</label>
                    <Input placeholder="Dirección de residencia" value={cliente.direccion} onChange={(e) => setC("direccion", e.target.value)} className="bg-background text-sm h-8" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Ciudad</label>
                    <Input placeholder="Ciudad o municipio" value={cliente.ciudad} onChange={(e) => setC("ciudad", e.target.value)} className="bg-background text-sm h-8" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Zip Code</label>
                    <Input placeholder="00000" value={cliente.zipCode} onChange={(e) => setC("zipCode", e.target.value)} className="bg-background text-sm h-8" />
                  </div>
                </div>
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
                      callType === opt.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className={`font-extrabold text-sm uppercase tracking-wide ${callType === opt.v ? "text-primary" : "text-foreground/80"}`}>
                      {opt.emoji} {opt.title}
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
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: "si", l: "SÍ CONTESTÓ" },
                    { v: "no_contesta", l: "NO CONTESTA" },
                  ].map((o) => (
                    <OptBtn key={o.v} active={primera.contesto === o.v} onClick={() => setP("contesto", o.v)}>{o.l}</OptBtn>
                  ))}
                </div>
                {primera.contesto === "no_contesta" && (
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Intentos de llamada:</label>
                    <div className="flex gap-2">
                      {["1", "2", "3", "4", "5+"].map((n) => (
                        <OptBtn key={n} active={primera.intentos === n} onClick={() => setP("intentos", n)}>{n}</OptBtn>
                      ))}
                    </div>
                  </div>
                )}
              </Question>

              {primera.contesto === "si" && (
                <>
                  {/* 02 Resultado de la llamada */}
                  <Question num="02" label="¿Cómo terminó esta llamada?">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v: "venta", l: "✅ VENTA CERRADA" },
                        { v: "info_general", l: "ℹ️ INFORMACIÓN GENERAL" },
                      ].map((o) => (
                        <OptBtn key={o.v} active={primera.resultadoLlamada === o.v} onClick={() => setP("resultadoLlamada", o.v)}>
                          {o.l}
                        </OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* VENTA */}
                  {primera.resultadoLlamada === "venta" && (
                    <>
                      <Question num="03" label="¿Qué producto se vendió?">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {PRODUCTOS.map((p) => (
                            <OptBtn key={p.value} active={primera.productoVendido === p.value} onClick={() => setP("productoVendido", p.value)}>
                              {p.label}
                            </OptBtn>
                          ))}
                        </div>
                      </Question>
                      <Question num="04" label="¿Con qué financiera se procesó?">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {FINANCIERAS.map((f) => (
                            <OptBtn key={f.v} active={primera.financiera === f.v} onClick={() => setP("financiera", f.v)}>{f.l}</OptBtn>
                          ))}
                        </div>
                      </Question>
                    </>
                  )}

                  {/* INFORMACIÓN GENERAL */}
                  {primera.resultadoLlamada === "info_general" && (
                    <>
                      {/* 03 Productos (multi-select) */}
                      <Question num="03" label="¿Sobre qué producto(s) se habló? (puede seleccionar varios)">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {PRODUCTOS.map((p) => (
                            <OptBtn key={p.value} active={primera.productos.includes(p.value)} onClick={() => toggleProd("primera", p.value)}>
                              {p.label}
                            </OptBtn>
                          ))}
                        </div>
                      </Question>

                      {/* Sub-preguntas por producto */}
                      <SubsProducto productos={primera.productos} subs={primera.subs} onChange={setPSub} />

                      {/* 04 Propietario */}
                      <Question num="04" label="¿El cliente es propietario de la residencia?">
                        <div className="grid grid-cols-3 gap-3">
                          {[{ v: "si", l: "SÍ, PROPIETARIO" }, { v: "no", l: "NO ES DUEÑO" }, { v: "inquilino", l: "INQUILINO" }].map((o) => (
                            <OptBtn key={o.v} active={primera.esPropietario === o.v} onClick={() => setP("esPropietario", o.v)}>{o.l}</OptBtn>
                          ))}
                        </div>
                      </Question>

                      {/* 05 Nivel de interés */}
                      <Question num="05" label="Nivel de interés del cliente">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { v: "muy_interesado", l: "🔥 MUY INTERESADO" },
                            { v: "interesado", l: "✅ INTERESADO" },
                            { v: "poco_interesado", l: "🧊 POCO INTERESADO" },
                            { v: "no_interesado", l: "❄️ NO INTERESADO" },
                          ].map((o) => (
                            <OptBtn key={o.v} active={primera.interes === o.v} onClick={() => setP("interes", o.v)} danger={o.v === "no_interesado"}>{o.l}</OptBtn>
                          ))}
                        </div>
                      </Question>

                      {primera.interes === "no_interesado" && (
                        <Question num="↳" label="¿Cuál fue el motivo?">
                          <div className="grid grid-cols-2 gap-3">
                            {["PRECIO MUY ALTO", "YA TIENE PROVEEDOR", "NO APLICA", "OTRO MOTIVO"].map((m) => (
                              <OptBtn key={m} active={primera.motivoNoInteres === m} onClick={() => setP("motivoNoInteres", m)}>{m}</OptBtn>
                            ))}
                          </div>
                        </Question>
                      )}

                      {/* 06 Próximo paso */}
                      <Question num="06" label="¿Cuál es el próximo paso?">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { v: "enviar_propuesta", l: "ENVIAR PROPUESTA" },
                            { v: "volver_llamar", l: "VOLVER A LLAMAR" },
                            { v: "cerrar", l: "CERRAR OPORTUNIDAD" },
                          ].map((o) => (
                            <OptBtn key={o.v} active={primera.proximoPaso === o.v} onClick={() => setP("proximoPaso", o.v)} danger={o.v === "cerrar"}>{o.l}</OptBtn>
                          ))}
                        </div>
                      </Question>

                      {primera.proximoPaso === "volver_llamar" && (
                        <Question num="↳" label="Fecha de próximo contacto">
                          <Input type="date" value={primera.fechaProximoContacto} onChange={(e) => setP("fechaProximoContacto", e.target.value)} className="max-w-xs bg-background" />
                        </Question>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Notas adicionales */}
              <Question num="📝" label="Notas adicionales de la llamada">
                <Textarea placeholder="Escribe cualquier detalle relevante..." value={primera.notas} onChange={(e) => setP("notas", e.target.value)} rows={3} className="bg-background resize-none" />
              </Question>
            </Section>
          )}

          {/* ── SECCIÓN 3B: SEGUIMIENTO ── */}
          {callType === "seguimiento" && (
            <Section title="Seguimiento">

              {/* 01 ¿Contestó? */}
              <Question num="01" label="¿El cliente contestó la llamada?">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: "si", l: "SÍ CONTESTÓ" },
                    { v: "no_contesta", l: "NO CONTESTA" },
                  ].map((o) => (
                    <OptBtn key={o.v} active={seguimiento.contesto === o.v} onClick={() => setS("contesto", o.v)}>{o.l}</OptBtn>
                  ))}
                </div>
                {seguimiento.contesto === "no_contesta" && (
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Intentos de llamada:</label>
                    <div className="flex gap-2">
                      {["1", "2", "3", "4", "5+"].map((n) => (
                        <OptBtn key={n} active={seguimiento.intentos === n} onClick={() => setS("intentos", n)}>{n}</OptBtn>
                      ))}
                    </div>
                  </div>
                )}
              </Question>

              {seguimiento.contesto === "si" && (
                <>
                  {/* 02 Resultado */}
                  <Question num="02" label="¿Cómo terminó este seguimiento?">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v: "venta", l: "✅ VENTA CERRADA" },
                        { v: "info_general", l: "ℹ️ SEGUIMIENTO ACTIVO" },
                      ].map((o) => (
                        <OptBtn key={o.v} active={seguimiento.resultadoLlamada === o.v} onClick={() => setS("resultadoLlamada", o.v)}>{o.l}</OptBtn>
                      ))}
                    </div>
                  </Question>

                  {/* VENTA */}
                  {seguimiento.resultadoLlamada === "venta" && (
                    <>
                      <Question num="03" label="¿Qué producto se vendió?">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {PRODUCTOS.map((p) => (
                            <OptBtn key={p.value} active={seguimiento.productoVendido === p.value} onClick={() => setS("productoVendido", p.value)}>{p.label}</OptBtn>
                          ))}
                        </div>
                      </Question>
                      <Question num="04" label="¿Con qué financiera se procesó?">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {FINANCIERAS.map((f) => (
                            <OptBtn key={f.v} active={seguimiento.financiera === f.v} onClick={() => setS("financiera", f.v)}>{f.l}</OptBtn>
                          ))}
                        </div>
                      </Question>
                    </>
                  )}

                  {/* SEGUIMIENTO ACTIVO */}
                  {seguimiento.resultadoLlamada === "info_general" && (
                    <>
                      {/* 03 Productos */}
                      <Question num="03" label="¿Sobre qué producto(s) se habló? (puede seleccionar varios)">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {PRODUCTOS.map((p) => (
                            <OptBtn key={p.value} active={seguimiento.productos.includes(p.value)} onClick={() => toggleProd("seguimiento", p.value)}>{p.label}</OptBtn>
                          ))}
                        </div>
                      </Question>

                      {/* Sub-preguntas eliminadas en seguimiento — solo se registra el producto discutido */}

                      {/* 04 Revisó */}
                      <Question num="04" label="¿El cliente revisó la información enviada?">
                        <div className="grid grid-cols-3 gap-3">
                          {[{ v: "si", l: "SÍ REVISÓ" }, { v: "no", l: "NO REVISÓ" }, { v: "parcialmente", l: "PARCIALMENTE" }].map((o) => (
                            <OptBtn key={o.v} active={seguimiento.reviso === o.v} onClick={() => setS("reviso", o.v)}>{o.l}</OptBtn>
                          ))}
                        </div>
                      </Question>

                      {/* 05 Objeciones */}
                      <Question num="05" label="Objeciones del cliente (puede marcar varias)">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {OBJECIONES.map((o) => (
                            <OptBtn key={o} active={seguimiento.objeciones.includes(o)} onClick={() => toggleObj(o)}>{o.toUpperCase()}</OptBtn>
                          ))}
                        </div>
                        {seguimiento.objeciones.includes("Otro") && (
                          <Input className="mt-3 bg-background" placeholder="Describir otra objeción..." value={seguimiento.otraObjecion} onChange={(e) => setS("otraObjecion", e.target.value)} />
                        )}
                      </Question>

                      {/* 06 Interés */}
                      <Question num="06" label="Nivel de interés actual del cliente">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { v: "muy_interesado", l: "🔥 MUY INTERESADO" },
                            { v: "interesado", l: "✅ INTERESADO" },
                            { v: "poco_interesado", l: "🧊 POCO INTERESADO" },
                            { v: "no_interesado", l: "❄️ NO INTERESADO" },
                          ].map((o) => (
                            <OptBtn key={o.v} active={seguimiento.interes === o.v} onClick={() => setS("interes", o.v)} danger={o.v === "no_interesado"}>{o.l}</OptBtn>
                          ))}
                        </div>
                      </Question>

                      {/* 07 Próximo paso */}
                      <Question num="07" label="¿Cuál es el próximo paso?">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { v: "enviar_propuesta", l: "ENVIAR PROPUESTA" },
                            { v: "agendar_cierre", l: "AGENDAR CIERRE" },
                            { v: "volver_llamar", l: "VOLVER A LLAMAR" },
                            { v: "cerrar", l: "CERRAR OPORTUNIDAD" },
                          ].map((o) => (
                            <OptBtn key={o.v} active={seguimiento.proximoPaso === o.v} onClick={() => setS("proximoPaso", o.v)} danger={o.v === "cerrar"}>{o.l}</OptBtn>
                          ))}
                        </div>
                      </Question>

                      {(seguimiento.proximoPaso === "volver_llamar" || seguimiento.proximoPaso === "agendar_cierre") && (
                        <Question num="↳" label="Fecha de próximo contacto">
                          <Input type="date" value={seguimiento.fechaProximoContacto} onChange={(e) => setS("fechaProximoContacto", e.target.value)} className="max-w-xs bg-background" />
                        </Question>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Notas adicionales */}
              <Question num="📝" label="Notas adicionales de la llamada">
                <Textarea placeholder="Escribe cualquier detalle relevante..." value={seguimiento.notas} onChange={(e) => setS("notas", e.target.value)} rows={3} className="bg-background resize-none" />
              </Question>
            </Section>
          )}

          {/* ── SECCIÓN 4: NOTA + GUARDAR ── */}
          {callType && (
            <Section title="Nota generada">
              <button type="button" onClick={() => setShowNote(!showNote)} className="text-xs font-bold text-primary underline underline-offset-2">
                {showNote ? "Ocultar vista previa" : "Ver vista previa de nota para Zoho"}
              </button>
              {showNote && (
                <pre className="bg-muted rounded-xl p-4 text-xs text-foreground/80 font-mono leading-relaxed whitespace-pre-wrap border border-border/40">
                  {note}
                </pre>
              )}
              <Button type="button" variant="windmar" className="w-full h-12 text-sm font-extrabold" onClick={handleSave}>
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
