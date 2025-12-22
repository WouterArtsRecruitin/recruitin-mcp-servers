/**
 * Health check endpoint for Vercel deployment
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'healthy',
    service: 'pipedrive-webhook-relay',
    platform: 'vercel',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: '/api/webhook/new-deal',
      health: '/api/health'
    },
    environment: {
      node_version: process.version,
      region: process.env.VERCEL_REGION || 'unknown'
    }
  });
}