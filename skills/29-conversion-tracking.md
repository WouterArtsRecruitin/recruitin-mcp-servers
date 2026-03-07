# 29 — Conversion Tracking (GA4 + CAPI)

## Doel
Dual tracking implementatie: GA4 server-side + Facebook Conversions API + LinkedIn CAPI via GTM voor alle Recruitin platforms.

## Wanneer activeren
Triggers: `tracking`, `pixel`, `CAPI`, `conversions API`, `GA4 events`, `GTM`, `Facebook pixel`, `LinkedIn tracking`, `server-side tracking`, `conversie meten`, `tracking setup`, `event firing`

## Repos
- **Primair:** `WouterArtsRecruitin/kandidatentekort-tracking` (GA4 + FB CAPI + Netlify)
- **Meta pixel:** `WouterArtsRecruitin/recruitmentapk-meta-pixel`
- **LinkedIn CAPI:** `WouterArtsRecruitin/linkedin-capi-tag-template` (GTM template)

## Architectuur — Dual Tracking

```
Browser (client-side)          Server (server-side)
──────────────────────         ────────────────────
Meta Pixel (browser)    +      Facebook CAPI (Netlify Function)
GA4 gtag.js             +      GA4 Measurement Protocol
LinkedIn Insight Tag    +      LinkedIn CAPI (GTM server)
         ↓                              ↓
    Deduplicatie via event_id
```

## Meta Pixel configuratie
```javascript
// Pixel ID: 1735907367288442
fbq('init', '1735907367288442');
fbq('track', 'PageView');

// Custom events per platform
fbq('track', 'Lead', {
  content_name: 'Vacature Analyse',
  content_category: 'kandidatentekort',
  value: 0,
  currency: 'EUR'
});
```

## Facebook CAPI (Netlify Function)
```javascript
// /.netlify/functions/fb-capi.js
const { EventRequest } = require('facebook-nodejs-business-sdk');

// Events: Lead, CompleteRegistration, Contact, ViewContent
// Deduplicatie: event_id = uuid per form submit
// Hashing: email + telefoon SHA256
```

## LinkedIn CAPI (GTM template)
```
Template: linkedin-capi-tag-template repo
Events: Lead, JobApplication, Purchase (rapport €59)
Insight Tag ID: [jouw LinkedIn tag ID]
GTM trigger: Form submit + pageview
```

## GA4 Events Recruitin
| Event | Trigger | Platform |
|-------|---------|---------|
| `generate_lead` | Form submit | kandidatentekort.nl |
| `begin_checkout` | Rapport stap 1 | labour-market-intelligence |
| `purchase` | Rapport betaald | €59 rapporten |
| `apk_started` | APK scan gestart | recruitmentapk.nl |
| `apk_completed` | APK scan af | recruitmentapk.nl |
| `content_view` | Blog/artikel | recruitin.nl |

## Netlify Functions setup
```toml
# netlify.toml
[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/track"
  to = "/.netlify/functions/fb-capi"
  status = 200
```

## Deduplicatie aanpak
```javascript
const eventId = crypto.randomUUID();
// Stuur eventId naar BEIDE:
// 1. fbq('track', 'Lead', {eventID: eventId})
// 2. CAPI payload: {event_id: eventId}
```

## Combinaties
- Met `08-multichannel-ads`: tracking data → campagne optimalisatie
- Met `11-supermetrics`: GA4 data → Supermetrics dashboard
- Met `28-recruitmentapk-assessment`: pixel events per assessment stap
- Met `26-nextjs-boilerplates`: tracking in alle nieuwe sites
- Met `06-website-copy`: conversie events per CTA
