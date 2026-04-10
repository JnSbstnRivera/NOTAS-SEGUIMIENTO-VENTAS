/**
 * NOTAS-SEGUIMIENTO-VENTAS — Zoho CRM Integration
 *
 * TODO: Configurar variables de entorno en Vercel:
 *   ZOHO_CLIENT_ID
 *   ZOHO_CLIENT_SECRET
 *   ZOHO_REFRESH_TOKEN
 *
 * Endpoints:
 *   GET  /api/zoho?deal=12345        → Busca Deal en Zoho CRM
 *   GET  /api/zoho?lead=L-67890      → Busca Lead en Zoho CRM
 *   POST /api/zoho                   → Guarda nota en Deal/Lead
 */

const ZOHO_CLIENT_ID     = process.env.ZOHO_CLIENT_ID     || '';
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || '';
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || '';
const ZOHO_BASE          = 'https://www.zohoapis.com/crm/v3';

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getAccessToken() {
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw new Error('CRM_NOT_CONFIGURED');
  }
  const res = await fetch(
    `https://accounts.zoho.com/oauth/v2/token?refresh_token=${ZOHO_REFRESH_TOKEN}&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`,
    { method: 'POST' }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error('ZOHO_AUTH_FAILED');
  return data.access_token;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: Buscar Deal o Lead ─────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { deal, lead } = req.query;

    if (!deal && !lead) {
      return res.status(400).json({ error: 'Falta parámetro: deal o lead' });
    }

    try {
      const token = await getAccessToken();

      if (deal) {
        // TODO: Buscar en módulo Deals de Zoho
        // const response = await fetch(`${ZOHO_BASE}/Deals/${deal}`, {
        //   headers: { Authorization: `Zoho-oauthtoken ${token}` }
        // });
        // const data = await response.json();
        // return res.status(200).json({ found: true, deal: data.data?.[0] });

        return res.status(200).json({
          found: false,
          message: 'Integración con Deals pendiente de configuración'
        });
      }

      if (lead) {
        // TODO: Buscar en módulo Leads de Zoho
        // const response = await fetch(`${ZOHO_BASE}/Leads?...`, {
        //   headers: { Authorization: `Zoho-oauthtoken ${token}` }
        // });

        return res.status(200).json({
          found: false,
          message: 'Integración con Leads pendiente de configuración'
        });
      }

    } catch (err) {
      if (err.message === 'CRM_NOT_CONFIGURED') {
        return res.status(503).json({ error: 'CRM no configurado. Contacta al administrador.' });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: Guardar Nota ──────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { dealId, leadId, noteContent, callType, product, nextStep, nextContactDate } = req.body;

    if (!noteContent) {
      return res.status(400).json({ error: 'Falta el contenido de la nota' });
    }

    try {
      const token = await getAccessToken();

      // TODO: Guardar nota en Zoho Activities/Notes
      // const notePayload = {
      //   data: [{
      //     Note_Title: `Seguimiento Ventas — ${callType === 'primera' ? 'Primera Llamada' : 'Seguimiento'}`,
      //     Note_Content: noteContent,
      //     Parent_Id: dealId || leadId,
      //     $se_module: dealId ? 'Deals' : 'Leads'
      //   }]
      // };
      // const response = await fetch(`${ZOHO_BASE}/Notes`, {
      //   method: 'POST',
      //   headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notePayload)
      // });

      return res.status(200).json({
        success: false,
        message: 'Integración con notas Zoho pendiente de configuración'
      });

    } catch (err) {
      if (err.message === 'CRM_NOT_CONFIGURED') {
        return res.status(503).json({ error: 'CRM no configurado. Contacta al administrador.' });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
