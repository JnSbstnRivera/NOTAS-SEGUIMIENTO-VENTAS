import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Phone,
  ClipboardList,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CallType = "primera" | "seguimiento" | null;
type ProductType = "placas" | "powerwall" | "water" | "roofing" | "anker" | "";
type AnsweredType = "si" | "no_contesta" | "buzon" | "numero_incorrecto" | "";
type InteresType = "muy_interesado" | "interesado" | "poco_interesado" | "no_interesado" | "";
type NextStepType = "enviar_propuesta" | "agendar_cierre" | "volver_llamar" | "cerrar" | "";

interface PrimeraLlamadaData {
  contesto: AnsweredType;
  producto: ProductType;
  tieneSolar: "si" | "no" | "";
  facturaLuma: string;
  esPropietario: "si" | "no" | "inquilino" | "";
  conformeSistema: "si" | "no" | "problemas" | "";
  interes: InteresType;
  motivoNoInteres: string;
  proximoPaso: NextStepType;
  fechaProximoContacto: string;
  notas: string;
}

interface SeguimientoData {
  contesto: AnsweredType;
  producto: ProductType;
  reviso: "si" | "no" | "parcialmente" | "";
  objeciones: string[];
  otraObjecion: string;
  interes: InteresType;
  proximoPaso: NextStepType;
  fechaProximoContacto: string;
  notas: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRODUCTOS = [
  { value: "placas", label: "Placas Solares" },
  { value: "powerwall", label: "Batería Powerwall" },
  { value: "water", label: "Water" },
  { value: "roofing", label: "Roofing" },
  { value: "anker", label: "Anker" },
];

const OBJECIONES_OPCIONES = [
  "Precio muy alto",
  "Necesita consultar con su pareja/familia",
  "Dudas sobre el proceso de instalación",
  "Dudas sobre el financiamiento",
  "Ya tiene otro proveedor",
  "Otro",
];

const FACTURAS_LUMA = [
  { value: "menos_100", label: "Menos de $100" },
  { value: "100_200", label: "$100 – $200" },
  { value: "200_300", label: "$200 – $300" },
  { value: "300_mas", label: "$300 o más" },
];

const initialPrimera: PrimeraLlamadaData = {
  contesto: "",
  producto: "",
  tieneSolar: "",
  facturaLuma: "",
  esPropietario: "",
  conformeSistema: "",
  interes: "",
  motivoNoInteres: "",
  proximoPaso: "",
  fechaProximoContacto: "",
  notas: "",
};

const initialSeguimiento: SeguimientoData = {
  contesto: "",
  producto: "",
  reviso: "",
  objeciones: [],
  otraObjecion: "",
  interes: "",
  proximoPaso: "",
  fechaProximoContacto: "",
  notas: "",
};

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{text}</span>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
  variant = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger";
}) {
  const base =
    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none";
  const inactive = "border-border text-muted-foreground bg-background hover:border-primary/40";
  const activePrimary = "border-primary bg-primary text-primary-foreground shadow-sm";
  const activeDanger = "border-destructive bg-destructive text-destructive-foreground shadow-sm";

  return (
    <button
      type="button"
      className={`${base} ${active ? (variant === "danger" ? activeDanger : activePrimary) : inactive}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ─── Note Generator ───────────────────────────────────────────────────────────

function generateNote(
  dealNum: string,
  leadNum: string,
  callType: CallType,
  primera: PrimeraLlamadaData,
  seguimiento: SeguimientoData
): string {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-PR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const hora = now.toLocaleTimeString("es-PR", { hour: "2-digit", minute: "2-digit" });

  const productoLabel =
    PRODUCTOS.find((p) => p.value === (callType === "primera" ? primera.producto : seguimiento.producto))?.label || "—";

  const answeredLabel: Record<string, string> = {
    si: "Sí contestó",
    no_contesta: "No contesta",
    buzon: "Buzón de voz",
    numero_incorrecto: "Número incorrecto",
  };

  const interesLabel: Record<string, string> = {
    muy_interesado: "Muy interesado",
    interesado: "Interesado",
    poco_interesado: "Poco interesado",
    no_interesado: "No interesado",
  };

  const pasoLabel: Record<string, string> = {
    enviar_propuesta: "Enviar propuesta",
    agendar_cierre: "Agendar cierre",
    volver_llamar: "Volver a llamar",
    cerrar: "Cerrar oportunidad",
  };

  if (callType === "primera") {
    const d = primera;
    return [
      `=== SEGUIMIENTO VENTAS WH ===`,
      `Fecha: ${fecha} ${hora} EST`,
      `Tipo: PRIMERA LLAMADA`,
      `Deal: ${dealNum || "—"} | Lead: ${leadNum || "—"}`,
      `Producto: ${productoLabel}`,
      `---`,
      `Contestó: ${answeredLabel[d.contesto] || "—"}`,
      d.contesto === "si"
        ? [
            `Propietario: ${d.esPropietario === "si" ? "Sí" : d.esPropietario === "no" ? "No" : d.esPropietario === "inquilino" ? "Inquilino" : "—"}`,
            `Sistema solar: ${d.tieneSolar === "si" ? "Sí" : d.tieneSolar === "no" ? "No" : "—"}`,
            d.tieneSolar === "si"
              ? `Conforme con sistema: ${d.conformeSistema === "si" ? "Sí" : d.conformeSistema === "no" ? "No" : d.conformeSistema === "problemas" ? "Tiene problemas" : "—"}`
              : null,
            `Factura LUMA: ${FACTURAS_LUMA.find((f) => f.value === d.facturaLuma)?.label || "—"}`,
            `Interés: ${interesLabel[d.interes] || "—"}`,
            d.interes === "no_interesado" && d.motivoNoInteres
              ? `Motivo no interés: ${d.motivoNoInteres}`
              : null,
            `Próximo paso: ${pasoLabel[d.proximoPaso] || "—"}`,
            d.fechaProximoContacto ? `Próximo contacto: ${d.fechaProximoContacto}` : null,
          ]
            .filter(Boolean)
            .join("\n")
        : null,
      d.notas ? `---\nNotas: ${d.notas}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  } else {
    const d = seguimiento;
    const objList =
      d.objeciones.length > 0
        ? d.objeciones.map((o) => (o === "Otro" && d.otraObjecion ? `Otro: ${d.otraObjecion}` : o)).join(", ")
        : "Ninguna";
    return [
      `=== SEGUIMIENTO VENTAS WH ===`,
      `Fecha: ${fecha} ${hora} EST`,
      `Tipo: SEGUIMIENTO`,
      `Deal: ${dealNum || "—"} | Lead: ${leadNum || "—"}`,
      `Producto: ${productoLabel}`,
      `---`,
      `Contestó: ${answeredLabel[d.contesto] || "—"}`,
      d.contesto === "si"
        ? [
            `Revisó información: ${d.reviso === "si" ? "Sí" : d.reviso === "no" ? "No" : d.reviso === "parcialmente" ? "Parcialmente" : "—"}`,
            `Objeciones: ${objList}`,
            `Interés actual: ${interesLabel[d.interes] || "—"}`,
            `Próximo paso: ${pasoLabel[d.proximoPaso] || "—"}`,
            d.fechaProximoContacto ? `Próximo contacto: ${d.fechaProximoContacto}` : null,
          ]
            .filter(Boolean)
            .join("\n")
        : null,
      d.notas ? `---\nNotas: ${d.notas}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SalesNotesForm() {
  const { toast } = useToast();

  // Search fields
  const [dealNum, setDealNum] = useState("");
  const [leadNum, setLeadNum] = useState("");
  const [searchDone, setSearchDone] = useState(false);

  // Call type
  const [callType, setCallType] = useState<CallType>(null);

  // Form data
  const [primera, setPrimera] = useState<PrimeraLlamadaData>(initialPrimera);
  const [seguimiento, setSeguimiento] = useState<SeguimientoData>(initialSeguimiento);

  // Note preview
  const [showNote, setShowNote] = useState(false);

  const handleSearch = () => {
    if (!dealNum && !leadNum) {
      toast({ title: "Ingresa al menos un número", description: "Deal o Lead requerido", variant: "destructive" });
      return;
    }
    setSearchDone(true);
    setCallType(null);
    setShowNote(false);
    toast({ title: "Campos cargados", description: "CRM no conectado — ingresar datos manualmente" });
  };

  const handleReset = () => {
    setDealNum("");
    setLeadNum("");
    setSearchDone(false);
    setCallType(null);
    setPrimera(initialPrimera);
    setSeguimiento(initialSeguimiento);
    setShowNote(false);
  };

  const handleSave = () => {
    toast({
      title: "CRM no conectado aún",
      description: "La nota fue generada correctamente. La integración con Zoho se activará próximamente.",
    });
  };

  const setP = (field: keyof PrimeraLlamadaData, value: string) =>
    setPrimera((prev) => ({ ...prev, [field]: value }));

  const setS = (field: keyof SeguimientoData, value: string) =>
    setSeguimiento((prev) => ({ ...prev, [field]: value }));

  const toggleObjecion = (o: string) => {
    setSeguimiento((prev) => ({
      ...prev,
      objeciones: prev.objeciones.includes(o)
        ? prev.objeciones.filter((x) => x !== o)
        : [...prev.objeciones, o],
    }));
  };

  const note = generateNote(dealNum, leadNum, callType, primera, seguimiento);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">NOTAS SEGUIMIENTO</h1>
            <p className="text-primary-foreground/70 text-xs font-medium mt-0.5">
              Equipo de Ventas — Windmar Home
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ── SECCIÓN 1: BÚSQUEDA ─────────────────────────────────────── */}
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <SectionTitle icon={Search} text="Identificación del cliente" />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">Número de Deal</Label>
              <Input
                placeholder="Ej: 12345"
                value={dealNum}
                onChange={(e) => setDealNum(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">Número de Lead</Label>
              <Input
                placeholder="Ej: L-67890"
                value={leadNum}
                onChange={(e) => setLeadNum(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1 font-bold text-sm" variant="windmar">
              <Search className="w-4 h-4 mr-1.5" />
              Cargar Cliente
            </Button>
            {searchDone && (
              <Button onClick={handleReset} variant="outline" size="icon" title="Nueva consulta">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {searchDone && (
            <div className="mt-3 p-2.5 bg-muted rounded-lg border flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">CRM no conectado.</span> Completa los campos manualmente.
                {dealNum && <span className="ml-1">Deal <span className="font-bold text-primary">#{dealNum}</span></span>}
                {leadNum && <span className="ml-1">| Lead <span className="font-bold text-primary">{leadNum}</span></span>}
              </p>
            </div>
          )}
        </div>

        {/* ── SECCIÓN 2: TIPO DE LLAMADA ───────────────────────────────── */}
        {searchDone && (
          <div className="bg-card rounded-xl border shadow-sm p-4">
            <SectionTitle icon={Phone} text="Tipo de llamada" />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setCallType("primera"); setShowNote(false); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  callType === "primera"
                    ? "border-primary bg-secondary text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="text-lg mb-1">📞</div>
                <p className="font-black text-sm">Primera Llamada</p>
                <p className="text-xs text-muted-foreground mt-0.5">Primer contacto con el cliente</p>
              </button>
              <button
                type="button"
                onClick={() => { setCallType("seguimiento"); setShowNote(false); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  callType === "seguimiento"
                    ? "border-primary bg-secondary text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="text-lg mb-1">🔄</div>
                <p className="font-black text-sm">Seguimiento</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ya hubo contacto previo</p>
              </button>
            </div>
          </div>
        )}

        {/* ── SECCIÓN 3A: PREGUNTAS PRIMERA LLAMADA ───────────────────── */}
        {callType === "primera" && (
          <div className="bg-card rounded-xl border shadow-sm p-4 space-y-5">
            <SectionTitle icon={ClipboardList} text="Primera llamada" />

            {/* ¿Contestó? */}
            <div>
              <Label className="text-xs font-bold text-foreground block mb-2">¿El cliente contestó?</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "si", l: "✅ Sí contestó" },
                  { v: "no_contesta", l: "🔕 No contesta" },
                  { v: "buzon", l: "📬 Buzón de voz" },
                  { v: "numero_incorrecto", l: "❌ Número incorrecto" },
                ].map((o) => (
                  <OptionButton
                    key={o.v}
                    active={primera.contesto === o.v}
                    onClick={() => setP("contesto", o.v)}
                    variant={o.v === "numero_incorrecto" ? "danger" : "default"}
                  >
                    {o.l}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Solo si contestó */}
            {primera.contesto === "si" && (
              <>
                <Separator />

                {/* Producto */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">Producto ofrecido</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTOS.map((p) => (
                      <OptionButton
                        key={p.value}
                        active={primera.producto === p.value}
                        onClick={() => setP("producto", p.value)}
                      >
                        {p.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* ¿Es propietario? */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">¿Es propietario de la residencia?</Label>
                  <div className="flex flex-wrap gap-2">
                    {[{ v: "si", l: "Sí" }, { v: "no", l: "No" }, { v: "inquilino", l: "Inquilino" }].map((o) => (
                      <OptionButton key={o.v} active={primera.esPropietario === o.v} onClick={() => setP("esPropietario", o.v)}>
                        {o.l}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* ¿Tiene sistema solar? */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">¿Tiene sistema solar actualmente?</Label>
                  <div className="flex flex-wrap gap-2">
                    {[{ v: "si", l: "Sí" }, { v: "no", l: "No" }].map((o) => (
                      <OptionButton key={o.v} active={primera.tieneSolar === o.v} onClick={() => setP("tieneSolar", o.v)}>
                        {o.l}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* ¿Conforme con sistema? — solo si tiene solar */}
                {primera.tieneSolar === "si" && (
                  <div>
                    <Label className="text-xs font-bold text-foreground block mb-2">¿Está conforme con su sistema actual?</Label>
                    <div className="flex flex-wrap gap-2">
                      {[{ v: "si", l: "Sí" }, { v: "no", l: "No" }, { v: "problemas", l: "Tiene problemas" }].map((o) => (
                        <OptionButton
                          key={o.v}
                          active={primera.conformeSistema === o.v}
                          onClick={() => setP("conformeSistema", o.v)}
                          variant={o.v === "problemas" ? "danger" : "default"}
                        >
                          {o.l}
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                )}

                {/* Factura LUMA */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">¿Cuánto paga mensualmente en LUMA?</Label>
                  <div className="flex flex-wrap gap-2">
                    {FACTURAS_LUMA.map((f) => (
                      <OptionButton key={f.value} active={primera.facturaLuma === f.value} onClick={() => setP("facturaLuma", f.value)}>
                        {f.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Nivel de interés */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">Nivel de interés del cliente</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: "muy_interesado", l: "🔥 Muy interesado" },
                      { v: "interesado", l: "👍 Interesado" },
                      { v: "poco_interesado", l: "🤔 Poco interesado" },
                      { v: "no_interesado", l: "❌ No interesado" },
                    ].map((o) => (
                      <OptionButton
                        key={o.v}
                        active={primera.interes === o.v}
                        onClick={() => setP("interes", o.v)}
                        variant={o.v === "no_interesado" ? "danger" : "default"}
                      >
                        {o.l}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* Motivo si no interesado */}
                {primera.interes === "no_interesado" && (
                  <div>
                    <Label className="text-xs font-bold text-foreground block mb-2">Motivo principal</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Precio muy alto", "Ya tiene proveedor", "No aplica para el producto", "Otro"].map((m) => (
                        <OptionButton key={m} active={primera.motivoNoInteres === m} onClick={() => setP("motivoNoInteres", m)}>
                          {m}
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Próximo paso */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">Próximo paso</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: "enviar_propuesta", l: "📄 Enviar propuesta" },
                      { v: "volver_llamar", l: "📅 Volver a llamar" },
                      { v: "cerrar", l: "🚫 Cerrar oportunidad" },
                    ].map((o) => (
                      <OptionButton
                        key={o.v}
                        active={primera.proximoPaso === o.v}
                        onClick={() => setP("proximoPaso", o.v)}
                        variant={o.v === "cerrar" ? "danger" : "default"}
                      >
                        {o.l}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* Fecha próximo contacto — solo si volver a llamar */}
                {primera.proximoPaso === "volver_llamar" && (
                  <div>
                    <Label className="text-xs font-bold text-foreground block mb-2">Fecha de próximo contacto</Label>
                    <Input
                      type="date"
                      value={primera.fechaProximoContacto}
                      onChange={(e) => setP("fechaProximoContacto", e.target.value)}
                      className="max-w-xs text-sm"
                    />
                  </div>
                )}
              </>
            )}

            {/* Notas adicionales — siempre visible */}
            <div>
              <Label className="text-xs font-bold text-foreground block mb-2">Notas adicionales</Label>
              <Textarea
                placeholder="Escribe cualquier detalle relevante de la llamada..."
                value={primera.notas}
                onChange={(e) => setP("notas", e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* ── SECCIÓN 3B: PREGUNTAS SEGUIMIENTO ───────────────────────── */}
        {callType === "seguimiento" && (
          <div className="bg-card rounded-xl border shadow-sm p-4 space-y-5">
            <SectionTitle icon={ClipboardList} text="Seguimiento" />

            {/* ¿Contestó? */}
            <div>
              <Label className="text-xs font-bold text-foreground block mb-2">¿El cliente contestó?</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "si", l: "✅ Sí contestó" },
                  { v: "no_contesta", l: "🔕 No contesta" },
                  { v: "buzon", l: "📬 Buzón de voz" },
                  { v: "numero_incorrecto", l: "❌ Número incorrecto" },
                ].map((o) => (
                  <OptionButton
                    key={o.v}
                    active={seguimiento.contesto === o.v}
                    onClick={() => setS("contesto", o.v)}
                    variant={o.v === "numero_incorrecto" ? "danger" : "default"}
                  >
                    {o.l}
                  </OptionButton>
                ))}
              </div>
            </div>

            {seguimiento.contesto === "si" && (
              <>
                <Separator />

                {/* Producto en proceso */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">Producto en proceso</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTOS.map((p) => (
                      <OptionButton
                        key={p.value}
                        active={seguimiento.producto === p.value}
                        onClick={() => setS("producto", p.value)}
                      >
                        {p.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* ¿Revisó la información? */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">¿Revisó la información enviada?</Label>
                  <div className="flex flex-wrap gap-2">
                    {[{ v: "si", l: "Sí" }, { v: "no", l: "No" }, { v: "parcialmente", l: "Parcialmente" }].map((o) => (
                      <OptionButton key={o.v} active={seguimiento.reviso === o.v} onClick={() => setS("reviso", o.v)}>
                        {o.l}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* Objeciones */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">
                    Objeciones del cliente
                    <span className="text-muted-foreground font-normal ml-1">(puede seleccionar varias)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {OBJECIONES_OPCIONES.map((o) => (
                      <OptionButton
                        key={o}
                        active={seguimiento.objeciones.includes(o)}
                        onClick={() => toggleObjecion(o)}
                      >
                        {o}
                      </OptionButton>
                    ))}
                  </div>
                  {seguimiento.objeciones.includes("Otro") && (
                    <Input
                      className="mt-2 text-sm"
                      placeholder="Describir otra objeción..."
                      value={seguimiento.otraObjecion}
                      onChange={(e) => setS("otraObjecion", e.target.value)}
                    />
                  )}
                </div>

                <Separator />

                {/* Nivel de interés */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">Nivel de interés actual</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: "muy_interesado", l: "🔥 Muy interesado" },
                      { v: "interesado", l: "👍 Interesado" },
                      { v: "poco_interesado", l: "🤔 Poco interesado" },
                      { v: "no_interesado", l: "❌ No interesado" },
                    ].map((o) => (
                      <OptionButton
                        key={o.v}
                        active={seguimiento.interes === o.v}
                        onClick={() => setS("interes", o.v)}
                        variant={o.v === "no_interesado" ? "danger" : "default"}
                      >
                        {o.l}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* Próximo paso */}
                <div>
                  <Label className="text-xs font-bold text-foreground block mb-2">Próximo paso</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: "enviar_propuesta", l: "📄 Enviar propuesta" },
                      { v: "agendar_cierre", l: "🤝 Agendar cierre" },
                      { v: "volver_llamar", l: "📅 Volver a llamar" },
                      { v: "cerrar", l: "🚫 Cerrar oportunidad" },
                    ].map((o) => (
                      <OptionButton
                        key={o.v}
                        active={seguimiento.proximoPaso === o.v}
                        onClick={() => setS("proximoPaso", o.v)}
                        variant={o.v === "cerrar" ? "danger" : "default"}
                      >
                        {o.l}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* Fecha próximo contacto */}
                {(seguimiento.proximoPaso === "volver_llamar" || seguimiento.proximoPaso === "agendar_cierre") && (
                  <div>
                    <Label className="text-xs font-bold text-foreground block mb-2">Fecha de próximo contacto</Label>
                    <Input
                      type="date"
                      value={seguimiento.fechaProximoContacto}
                      onChange={(e) => setS("fechaProximoContacto", e.target.value)}
                      className="max-w-xs text-sm"
                    />
                  </div>
                )}
              </>
            )}

            {/* Notas adicionales */}
            <div>
              <Label className="text-xs font-bold text-foreground block mb-2">Notas adicionales</Label>
              <Textarea
                placeholder="Escribe cualquier detalle relevante de la llamada..."
                value={seguimiento.notas}
                onChange={(e) => setS("notas", e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* ── SECCIÓN 4: NOTA GENERADA + GUARDAR ──────────────────────── */}
        {callType && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full font-bold text-sm border-primary text-primary hover:bg-secondary"
              onClick={() => setShowNote(!showNote)}
            >
              <ChevronRight className={`w-4 h-4 mr-1.5 transition-transform ${showNote ? "rotate-90" : ""}`} />
              {showNote ? "Ocultar vista previa de nota" : "Ver vista previa de nota"}
            </Button>

            {showNote && (
              <div className="bg-muted rounded-xl border p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Vista previa — Nota Zoho CRM
                </p>
                <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-mono">
                  {note}
                </pre>
              </div>
            )}

            <Button
              onClick={handleSave}
              className="w-full font-black text-sm h-12"
              variant="windmar"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Guardar Nota en Zoho
            </Button>

            <p className="text-center text-[10px] text-muted-foreground">
              CRM no conectado — la integración con Zoho se activará próximamente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
