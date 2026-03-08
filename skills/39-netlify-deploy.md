---
name: netlify-deploy
description: "Deploy statische HTML/CSS/JS sites naar Netlify via REST API of CLI. Gebruik wanneer een landingspagina of recruitment site live moet. Covers: binary zip deploy, site discovery, custom domains, tokens, troubleshoten. Altijd gebruiken bij: netlify, deployen, live zetten, hosting, static site."
license: Custom - Recruitin B.V.
version: 1.0 (2026-03-08)
---

# NETLIFY DEPLOYMENT SKILL

## Snelle keuze

| Methode | Wanneer | Tijd |
|---------|---------|------|
| REST API (zip) | Vanuit Claude/script | 2 min |
| Netlify CLI | Vanuit terminal | 3 min |
| Drag & drop | Handmatig, eenmalig | 1 min |

---

## METHODE 1: REST API (Aanbevolen vanuit Claude)

### Stap 1: Bestaande sites ophalen
```bash
curl -H "Authorization: Bearer $NETLIFY_TOKEN" \
  https://api.netlify.com/api/v1/sites
```
Geeft site_id terug voor bestaande sites.

### Stap 2: HTML zippen en deployen
```bash
cd /path/to/dir
zip deploy.zip index.html

curl -X POST \
  -H "Authorization: Bearer $NETLIFY_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary @deploy.zip \
  "https://api.netlify.com/api/v1/sites/{SITE_ID}/deploys"
```

**KRITIEK:** `Content-Type: application/zip` — niet `multipart/form-data`.
**KRITIEK:** `--data-binary` — niet `--form` of `-d`.

### Stap 3: Deploy status checken
```bash
curl -H "Authorization: Bearer $NETLIFY_TOKEN" \
  https://api.netlify.com/api/v1/deploys/{DEPLOY_ID}
```
Wacht op `state: "ready"`.

---

## METHODE 2: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=. --site={SITE_ID}
```

---

## METHODE 3: Nieuwe Site Aanmaken via API

```bash
curl -X POST \
  -H "Authorization: Bearer $NETLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "jouw-site-naam"}' \
  https://api.netlify.com/api/v1/sites
```

---

## BEKENDE FOUTEN

| Fout | Oorzaak | Oplossing |
|------|---------|-----------|
| 401 Unauthorized | Token verlopen/ongeldig | Genereer nieuw token in Netlify dashboard |
| 422 Unprocessable | ZIP formaat fout | Controleer: `zip deploy.zip index.html` (niet map) |
| 404 Site not found | Verkeerd site_id | Gebruik `GET /api/v1/sites` om site_id op te halen |
| Deploy stuck | Timeout | Check deploy status via GET /deploys/{id} |

---

## TOKEN BEHEER

- Token aanmaken: Netlify Dashboard → User Settings → Applications → Personal Access Tokens
- Token format: `nfp_...`
- **Sla op als env var:** `NETLIFY_TOKEN=nfp_xxx`

---

## PYTHON DEPLOY SCRIPT (Herbruikbaar)

```python
import requests, zipfile

def deploy_to_netlify(html_file, site_id, token):
    zip_path = "/tmp/deploy.zip"
    with zipfile.ZipFile(zip_path, 'w') as zf:
        zf.write(html_file, "index.html")
    with open(zip_path, 'rb') as f:
        response = requests.post(
            f"https://api.netlify.com/api/v1/sites/{site_id}/deploys",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/zip"},
            data=f
        )
    if response.status_code == 200:
        print(f"✅ Live: {response.json().get('deploy_ssl_url')}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
```
