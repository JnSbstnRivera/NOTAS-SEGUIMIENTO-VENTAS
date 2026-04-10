/**
 * NOTAS-SEGUIMIENTO-VENTAS — Zoho CRM Integration (estructura lista)
 *
 * ─────────────────────────────────────────────────────────────────
 *  PENDIENTE DE CONFIGURAR POR EL EQUIPO DE IT / ZOHO ADMIN
 * ─────────────────────────────────────────────────────────────────
 *
 * Para activar la integración, el admin de Zoho debe:
 *
 *  1. Ir a https://api-console.zoho.com
 *  2. Crear una aplicación "Server-based Applications"
 *  3. Configurar estas variables en Vercel → Settings → Environment Variables:
 *       ZOHO_CLIENT_ID
 *       ZOHO_CLIENT_SECRET
 *       ZOHO_REFRESH_TOKEN
 *  4. Habilitar en el perfil del usuario:
 *       Setup → Users & Control → Profiles → [perfil] → Allow Data Access via API ✓
 *
 * Formatos de ID Windmar Home:
 *   Lead    → L + números            (ej: L786631)
 *   Roofing → R + núm + nombre + núm (ej: R12345JohnSmith678)
 *   Water   → W + núm + nombre + núm (ej: W12345JohnSmith678)
 *   Anker   → PPS + núm + nombre     (ej: PPS12345JohnSmith678)
 *   Placas  → solo números + nombre  (ej: 12345JohnSmith678)
 *
 * Endpoints:
 *   GET  /api/zoho?id=L786631   → Detecta módulo y busca cliente
 *                                  Retorna: nombre, teléfono, correo, dirección, ciudad, zip
 *   POST /api/zoho               → Guarda nota en Zoho Notes
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // La integración con Zoho CRM se habilitará cuando el admin configure
  // las credenciales OAuth indicadas arriba.
  return res.status(503).json({
    error: 'CRM_NOT_CONFIGURED',
    message: 'Integración con Zoho CRM pendiente de configuración. Ver comentarios en api/zoho.js.',
  });
}
