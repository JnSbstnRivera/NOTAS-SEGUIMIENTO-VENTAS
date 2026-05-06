# NOTAS SEGUIMIENTO VENTAS

Herramienta de notas y seguimiento de clientes para el equipo de ventas de **Windmar Home Puerto Rico**.

---

## ¿Qué hace?

Permite a los asesores registrar notas estructuradas sobre cada cliente, programar seguimientos y consultar el historial de interacciones. Los datos se guardan en Supabase con políticas de acceso por rol (RLS).

---

## Características

- Registro de notas por cliente con plantillas estructuradas
- Seguimiento de estado: pendiente, en progreso, cerrado
- Historial de interacciones por asesor
- Recordatorios automáticos de seguimiento
- Sidebar de navegación con React Router
- Splash screen animado con cortina
- Validación de formularios con React Hook Form + Zod
- Dark / Light mode

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS 3.4 |
| UI Components | Radix UI + shadcn/ui |
| Routing | React Router |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Data fetching | TanStack Query |
| Formularios | React Hook Form + Zod |
| Gráficas | Recharts |
| Notificaciones | Sonner (toast) |

---

## Variables de entorno

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Instalación local

```bash
npm install
npm run dev
# http://localhost:5173
```

---

## Despliegue

**Producción:** https://notas-seguimiento-ventas.vercel.app

---

*Desarrollado para Windmar Home Puerto Rico — Call Center Operations*
