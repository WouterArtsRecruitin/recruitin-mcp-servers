---
name: figma-import
description: "Figma REST API limieten + correcte HTML-naar-Figma workflow via 'HTML to Design' plugin. KRITIEK: Figma REST API kan GEEN frames of nodes aanmaken — gebruik altijd de plugin route. Altijd lezen bij: figma, design import, HTML naar figma, frames aanmaken, figma API, push naar figma."
license: Custom - Recruitin B.V.
version: 1.0 (2026-03-08)
---

# FIGMA WORKFLOW SKILL

## ⚠️ HARDE BEPERKING — LEES DIT EERST

**Figma REST API kan GEEN design content aanmaken of wijzigen.**

| Actie | REST API | Plugin API |
|-------|----------|------------|
| Frames aanmaken | ❌ NIET MOGELIJK | ✅ |
| Nodes toevoegen | ❌ NIET MOGELIJK | ✅ |
| Text/shapes | ❌ NIET MOGELIJK | ✅ |
| Commentaar toevoegen | ✅ | ✅ |
| File metadata lezen | ✅ | ✅ |
| Variabelen (Enterprise) | ✅ | ✅ |

**De enige werkende workflow voor HTML → Figma:**
1. Deploy HTML naar live URL (Netlify)
2. Gebruik "HTML to Design" plugin in Figma

---

## WORKFLOW: HTML NAAR FIGMA

### Stap 1: Deploy naar Netlify
Zie `netlify-deploy/SKILL.md` voor instructies.
Resultaat: `https://jouw-site.netlify.app`

### Stap 2: Plugin Installeren
- Plugin: **HTML to Design** by divRIOTS
- Plugin ID: `1159123024924461424`
- Install: Figma → Resources → Plugins → "HTML to Design"

### Stap 3: Importeren
1. Open Figma file
2. Run plugin "HTML to Design"
3. Plak URL: `https://jouw-site.netlify.app`
4. Klik Import → bewerkbare frames worden aangemaakt

---

## WAT WEL KAN MET REST API

### Commentaar toevoegen
```bash
curl -X POST \
  -H "Authorization: Bearer $FIGMA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Live URL: https://daelectric.netlify.app", "client_meta": {}}' \
  "https://api.figma.com/v1/files/{FILE_KEY}/comments"
```

### File info ophalen
```bash
curl -H "Authorization: Bearer $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/{FILE_KEY}"
```

---

## TOKEN BEHEER

**KRITIEK: Tokens verlopen snel na genereren.**

| Token type | Format | Scope |
|-----------|--------|-------|
| Personal Access Token | `figd_...` | File read/write + comments |

**Aanmaken:**
1. Figma → Profiel → Settings → Security → Personal access tokens
2. Scope: File content + Comments
3. **Kopieer direct** — na vernieuwen niet meer zichtbaar

**Werkt niet?**
- Token te oud (seconden na genereren)
- Verkeerd scope
- File key verkeerd

---

## RECRUITIN FIGMA FILES

| File | Key | Gebruik |
|------|-----|---------|
| JobDigger Team Presentatie | `88bqZvlRMx9JT2HjQk3gUw` | Slides + concepten |

---

## DESIGN TOKENS EXTRAHEREN

```javascript
// Browser console — haal CSS variabelen op
const tokens = {};
const styles = getComputedStyle(document.documentElement);
['--primary', '--secondary', '--accent', '--background'].forEach(v => {
  tokens[v] = styles.getPropertyValue(v).trim();
});
console.log(JSON.stringify(tokens, null, 2));
```

---

## BEKENDE FOUTEN

| Fout | Oorzaak | Oplossing |
|------|---------|-----------|
| 403 op POST /files | REST API heeft geen write endpoint | Gebruik Plugin API |
| 401 Invalid token | Token verlopen | Genereer nieuw token, direct gebruiken |
| Plugin werkt niet op localhost | Vereist live URL | Deploy naar Netlify eerst |
| Frames niet bewerkbaar | Plugin maakt soms groepen | Ungroup in Figma na import |
