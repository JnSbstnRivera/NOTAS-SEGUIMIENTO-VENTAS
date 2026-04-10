import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import windmarLogo from "@/assets/windmar-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormData {
  // Datos del lead
  nombreCliente: string;
  emailCliente: string;
  direccionCliente: string;
  producto: string;
  numeroAlterno: string;
  ultimoTratamiento: string;
  citaCoordinada: string;
  montoLuz: string;
  rangoFactura: string;
  preocupacionLuz: string;
  apagones: string;
  estadoTecho: string;
  problemasAgua: string;
  equiposAltoConsumo: string;
  propiedadDecision: string;
  personaDecisora: string;
  rangoCredito: string[];
  otroMaterial: string;
  tipoPropiedad: string;
  preferenciaContacto: string;
  comoSeEntero: string;
  // Perfilamiento
  tenencia: string;
  tenenciaOtro: string;
  nombreDueno: string;
  telefonoDueno: string;
  tipoPropiedadPerfil: string;
  numResidentes: string;
  // Preguntas casa+dueño
  sistemaSolar: string;
  bateriaPE: string;
  ultimoTratamientoTecho: string;
  filtraciones: string;
  cortesAgua: string;
  aguaGrifoBottella: string;
  calentadorTipo: string;
  // Lead Zoho
  leadNumber: string;
  leadNombre: string;
  leadTelefono: string;
  leadEmail: string;
  leadDireccion: string;
  // Cita
  citaFecha: Date | undefined;
  citaHora: string;
  citaPeriodo: string;
}

interface LeadInfo {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
}

const initialForm: FormData = {
  nombreCliente: "",
  emailCliente: "",
  direccionCliente: "",
  producto: "",
  numeroAlterno: "",
  ultimoTratamiento: "",
  citaCoordinada: "",
  montoLuz: "",
  rangoFactura: "",
  preocupacionLuz: "",
  apagones: "",
  estadoTecho: "",
  problemasAgua: "",
  equiposAltoConsumo: "",
  propiedadDecision: "",
  personaDecisora: "",
  rangoCredito: [],
  otroMaterial: "",
  tipoPropiedad: "",
  preferenciaContacto: "",
  comoSeEntero: "",
  tenencia: "",
  tenenciaOtro: "",
  nombreDueno: "",
  telefonoDueno: "",
  tipoPropiedadPerfil: "",
  numResidentes: "",
  sistemaSolar: "",
  bateriaPE: "",
  ultimoTratamientoTecho: "",
  filtraciones: "",
  cortesAgua: "",
  aguaGrifoBottella: "",
  calentadorTipo: "",
  leadNumber: "",
  leadNombre: "",
  leadTelefono: "",
  leadEmail: "",
  leadDireccion: "",
  citaFecha: undefined,
  citaHora: "",
  citaPeriodo: "",
};

export default function PrequalificationForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);
  const [leadBuscando, setLeadBuscando] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const buscarLead = async () => {
    if (!form.leadNumber.trim()) return;
    setLeadBuscando(true);
    try {
      const val = form.leadNumber.trim();
      // L123456 = Zoho Lead Number, 13+ digits = Zoho ID, 7+ digits = phone, else = name
      let param;
      if (/^L\d+$/i.test(val)) {
        param = `leadnum=${encodeURIComponent(val.toUpperCase())}`;
      } else if (/^\d{13,}$/.test(val)) {
        param = `id=${encodeURIComponent(val)}`;
      } else if (/^[\d\s\-\(\)\+]{7,}$/.test(val)) {
        param = `number=${encodeURIComponent(val)}`;
      } else {
        param = `name=${encodeURIComponent(val)}`;
      }
      const res = await fetch(`/api/lead?${param}`);
      const data = await res.json();
      if (data.found && data.lead) {
        const l = data.lead;
        setLeadInfo({
          id: l.id,
          nombre: l.nombre,
          telefono: l.telefono,
          email: l.email,
          direccion: l.direccion,
        });
        update("leadNombre", l.nombre);
        update("leadTelefono", l.telefono);
        update("leadEmail", l.email);
        update("leadDireccion", l.direccion);
        if (l.cita?.fecha) update("citaCoordinada", l.cita.fecha);
      } else {
        setLeadInfo(null);
        alert("Lead no encontrado en Zoho CRM");
      }
    } catch (err) {
      console.error("Error buscando lead:", err);
      alert("Error conectando con Zoho CRM");
    } finally {
      setLeadBuscando(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leadNumber.trim()) {
      alert("Por favor busca el lead de Zoho primero.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        zohoLeadId: leadInfo?.id || undefined,
        citaFecha: form.citaFecha ? form.citaFecha.toISOString() : undefined,
      };
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        alert(data.citaScheduled 
          ? "✅ Precualificación y cita guardadas en Zoho CRM" 
          : "✅ Precualificación guardada en Zoho CRM");
      } else {
        alert("Error guardando en Zoho: " + (data.error || "desconocido"));
      }
    } catch (err) {
      alert("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-0 pb-1 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-0 flex flex-col items-center gap-0">
          <img src={windmarLogo} alt="WindMar Home" width={230} height={146} className="h-[7.4rem] w-auto" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-accent leading-none">
              ¡Crea la precualificación
            </h1>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary leading-none">
              de un Lead!
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Lead Number de Zoho */}
          <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/70 pb-2 border-b-2 border-primary/15">
              Información del Lead
            </h3>
            <div className="flex gap-3">
              <Input
                placeholder="Lead Number de Zoho"
                value={form.leadNumber}
                onChange={(e) => update("leadNumber", e.target.value)}
                className="bg-background flex-1"
              />
              <Button type="button" variant="windmar" onClick={buscarLead} disabled={leadBuscando} className="shrink-0">
                <Search className="h-4 w-4 mr-2" />
                {leadBuscando ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {leadInfo && (
              <div className="bg-muted/40 rounded-xl p-4 space-y-2 border border-border/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Nombre</span>
                    <p className="text-sm font-medium text-foreground">{leadInfo.nombre}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Teléfono</span>
                    <p className="text-sm font-medium text-foreground">{leadInfo.telefono}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Email</span>
                    <p className="text-sm font-medium text-foreground">{leadInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Dirección</span>
                    <p className="text-sm font-medium text-foreground">{leadInfo.direccion}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sección de Perfilamiento del Hogar */}
          <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/70 pb-2 border-b-2 border-primary/15">
              Perfilamiento del hogar
            </h3>

            {/* P1 - Tenencia */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">01</span>
                <Label className="text-sm text-foreground/90 leading-relaxed block">
                  ¿Quién es el titular de la vivienda?
                </Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-8">
                {[
                  { value: "dueno", label: "DUEÑO" },
                  { value: "compartida", label: "COMPARTIDA" },
                  { value: "arriendo", label: "ARRIENDO" },
                  { value: "otro", label: "OTRO" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      update("tenencia", opt.value);
                      if (opt.value !== "otro") update("tenenciaOtro", "");
                      if (opt.value !== "arriendo") { update("nombreDueno", ""); update("telefonoDueno", ""); }
                    }}
                    className={`rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                      form.tenencia === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.tenencia === "otro" && (
                <div className="pl-8 pt-2">
                  <Label className="text-sm text-foreground/70 mb-1.5 block">Especifica:</Label>
                  <Input
                    placeholder="Tipo de tenencia"
                    value={form.tenenciaOtro}
                    onChange={(e) => update("tenenciaOtro", e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}
              {form.tenencia === "arriendo" && (
                <div className="pl-8 pt-2 space-y-3">
                  <Label className="text-sm text-foreground/70 mb-1.5 block">Información del dueño de la propiedad:</Label>
                  <Input
                    placeholder="Nombre del dueño"
                    value={form.nombreDueno}
                    onChange={(e) => update("nombreDueno", e.target.value)}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Teléfono del dueño"
                    value={form.telefonoDueno}
                    onChange={(e) => update("telefonoDueno", e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}
            </div>

            {/* P2 - Tipo de propiedad */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">02</span>
                <Label className="text-sm text-foreground/90 leading-relaxed block">
                  ¿Qué tipo de propiedad es?
                </Label>
              </div>
              <div className="grid grid-cols-3 gap-3 pl-8">
                {[
                  { value: "casa", label: "CASA UNIFAMILIAR" },
                  { value: "apartamento", label: "APARTAMENTO" },
                  { value: "comercial", label: "COMERCIAL" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("tipoPropiedadPerfil", opt.value)}
                    className={`rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                      form.tipoPropiedadPerfil === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* P3 - Material y condición del techo */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">03</span>
                <Label className="text-sm text-foreground/90 leading-relaxed block">
                  ¿De qué material es tu techo y en qué condición se encuentra?
                </Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-8">
                {[
                  { value: "cemento", label: "CEMENTO" },
                  { value: "galvalume", label: "GALVALUME" },
                  { value: "zinc", label: "ZINC" },
                  { value: "otro", label: "OTRO" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { update("estadoTecho", opt.value); if (opt.value !== "otro") update("otroMaterial", ""); }}
                    className={`rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                      form.estadoTecho === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.estadoTecho === "otro" && (
                <div className="pl-8 pt-2">
                  <Label className="text-sm text-foreground/70 mb-1.5 block">
                    Especifica el tipo de material:
                  </Label>
                  <Input
                    placeholder="Tipo de material del techo"
                    value={form.otroMaterial}
                    onChange={(e) => update("otroMaterial", e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}
            </div>

            {/* P4 - Número de residentes */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">04</span>
                <Label className="text-sm text-foreground/90 leading-relaxed block">
                  ¿Cuántas personas viven en el hogar?
                </Label>
              </div>
              <div className="pl-8">
                <Select value={form.numResidentes} onValueChange={(v) => update("numResidentes", v)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Seleccionar rango" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1 - 2 personas</SelectItem>
                    <SelectItem value="3-4">3 - 4 personas</SelectItem>
                    <SelectItem value="5-6">5 - 6 personas</SelectItem>
                    <SelectItem value="7+">7 o más personas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>


          {/* Preguntas de precualificación - Casa (dueño o compartida) */}
          {form.tipoPropiedadPerfil === "casa" && (form.tenencia === "dueno" || form.tenencia === "compartida") && (
          <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/70 pb-2 border-b-2 border-primary/15">
              Preguntas de precualificación
            </h3>

            {/* P05 - Sistema solar */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-sm mt-0.5">05</span>
                  <Label className="text-sm text-foreground/90 leading-relaxed block">
                    ¿Tiene sistema solar actualmente?
                  </Label>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" variant={form.sistemaSolar === "si" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("sistemaSolar", "si")}>Sí</Button>
                  <Button type="button" variant={form.sistemaSolar === "no" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("sistemaSolar", "no")}>No</Button>
                </div>
              </div>
            </div>

            {/* P06 - Batería o planta eléctrica */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-sm mt-0.5">06</span>
                  <Label className="text-sm text-foreground/90 leading-relaxed block">
                    ¿Tiene algún tipo de batería o planta eléctrica?
                  </Label>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" variant={form.bateriaPE === "si" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("bateriaPE", "si")}>Sí</Button>
                  <Button type="button" variant={form.bateriaPE === "no" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("bateriaPE", "no")}>No</Button>
                </div>
              </div>
            </div>

            {/* P07 - Último tratamiento de techo */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">07</span>
                <Label className="text-sm text-foreground/90 leading-relaxed block">
                  ¿Cuándo fue la última vez que hizo tratamiento de techo?
                </Label>
              </div>
              <div className="pl-8">
                <Select value={form.ultimoTratamientoTecho} onValueChange={(v) => update("ultimoTratamientoTecho", v)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Seleccionar rango" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1 - 5 años</SelectItem>
                    <SelectItem value="5-10">5 - 10 años</SelectItem>
                    <SelectItem value="10-15">10 - 15 años</SelectItem>
                    <SelectItem value="15+">+ 15 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* P08 - Filtraciones */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-sm mt-0.5">08</span>
                  <Label className="text-sm text-foreground/90 leading-relaxed block">
                    ¿Presentan algún tipo de filtración o liqueo?
                  </Label>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" variant={form.filtraciones === "si" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("filtraciones", "si")}>Sí</Button>
                  <Button type="button" variant={form.filtraciones === "no" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("filtraciones", "no")}>No</Button>
                </div>
              </div>
            </div>

            {/* P09 - Cortes de agua */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-sm mt-0.5">09</span>
                  <Label className="text-sm text-foreground/90 leading-relaxed block">
                    ¿Habitualmente hay cortes de agua o problemas de presión?
                  </Label>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" variant={form.cortesAgua === "si" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("cortesAgua", "si")}>Sí</Button>
                  <Button type="button" variant={form.cortesAgua === "no" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("cortesAgua", "no")}>No</Button>
                </div>
              </div>
            </div>

            {/* P10 - Agua grifo o botella */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">10</span>
                <Label className="text-sm text-foreground/90 leading-relaxed block">
                  ¿Actualmente tomas agua del grifo o en botella?
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-3 pl-8">
                {[
                  { value: "grifo", label: "DEL GRIFO" },
                  { value: "botella", label: "EN BOTELLA" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("aguaGrifoBottella", opt.value)}
                    className={`rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                      form.aguaGrifoBottella === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* P11 - Calentador */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">11</span>
                <Label className="text-sm text-foreground/90 leading-relaxed block">
                  ¿Usas calentador de línea o de gas?
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-3 pl-8">
                {[
                  { value: "linea", label: "DE LÍNEA" },
                  { value: "gas", label: "DE GAS" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("calentadorTipo", opt.value)}
                    className={`rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                      form.calentadorTipo === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* Preguntas de precualificación - Apartamento */}
          {form.tipoPropiedadPerfil === "apartamento" && (
          <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/70 pb-2 border-b-2 border-primary/15">
              Preguntas de precualificación
            </h3>

            {/* P05 - Batería */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-sm mt-0.5">05</span>
                  <Label className="text-sm text-foreground/90 leading-relaxed block">
                    ¿Tienes algún tipo de batería?
                  </Label>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" variant={form.bateriaPE === "si" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("bateriaPE", "si")}>Sí</Button>
                  <Button type="button" variant={form.bateriaPE === "no" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("bateriaPE", "no")}>No</Button>
                </div>
              </div>
            </div>

            {/* P06 - Cortes de agua / presión */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-sm mt-0.5">06</span>
                  <Label className="text-sm text-foreground/90 leading-relaxed block">
                    ¿Tienes problemas de corte de agua o de presión alta o baja?
                  </Label>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" variant={form.cortesAgua === "si" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("cortesAgua", "si")}>Sí</Button>
                  <Button type="button" variant={form.cortesAgua === "no" ? "windmar" : "outline"} size="sm" className="min-w-[60px]" onClick={() => update("cortesAgua", "no")}>No</Button>
                </div>
              </div>
            </div>

            {/* P07 - Agua grifo o botella */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-sm mt-0.5">07</span>
                <Label className="text-sm text-foreground/90 leading-relaxed block">
                  ¿Tomas agua del grifo o en botella?
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-3 pl-8">
                {[
                  { value: "grifo", label: "DEL GRIFO" },
                  { value: "botella", label: "EN BOTELLA" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("aguaGrifoBottella", opt.value)}
                    className={`rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                      form.aguaGrifoBottella === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* Factura de luz */}
          <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/70 pb-2 border-b-2 border-primary/15">
              Información adicional
            </h3>
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-foreground mb-2.5 block">
                ¿Cuánto pagas aproximadamente de factura de luz al mes?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "<100", label: "MENOS DE $100" },
                  { value: "100-200", label: "$100 - $200" },
                  { value: "200-300", label: "$200 - $300" },
                  { value: "300+", label: "$300+" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("rangoFactura", opt.value)}
                    className={`rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                      form.rangoFactura === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2.5 block">
                  Preferencia de contacto:
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "telefono", label: "TELÉFONO" },
                    { value: "whatsapp", label: "WHATSAPP" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("preferenciaContacto", opt.value)}
                      className={`rounded-xl border-2 py-3 px-4 text-xs font-bold uppercase tracking-wide transition-all ${
                        form.preferenciaContacto === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2.5 block">
                  ¿Cómo se enteró de nosotros?
                </Label>
                <Select value={form.comoSeEntero} onValueChange={(v) => update("comoSeEntero", v)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook / Instagram</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="referido">Referido</SelectItem>
                    <SelectItem value="tv-radio">TV / Radio</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Agendar cita */}
          <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/70 pb-2 border-b-2 border-primary/15">
              Agendar cita
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2.5 block">Fecha de la cita:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.citaFecha && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.citaFecha ? format(form.citaFecha, "PPP") : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.citaFecha}
                      onSelect={(date) => update("citaFecha", date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2.5 block">Hora:</Label>
                  <Select value={form.citaHora} onValueChange={(v) => update("citaHora", v)}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <SelectItem key={h} value={String(h)}>{h}:00</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2.5 block">AM / PM:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["AM", "PM"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update("citaPeriodo", p)}
                        className={`rounded-xl border-2 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${
                          form.citaPeriodo === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <Button type="submit" variant="windmar" size="lg" className="w-full text-base py-6 rounded-2xl">
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}