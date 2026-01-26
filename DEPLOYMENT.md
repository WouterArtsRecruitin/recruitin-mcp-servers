# 🚀 Deployment Guide - Recruitment News App

Deze guide helpt je om de Recruitment News App te deployen naar productie.

---

## 📋 **Prerequisites**

- Node.js 18+ en pnpm geïnstalleerd
- Supabase account (voor Edge Functions)
- Notion Integration Setup (optioneel, voor push functionaliteit)

---

## 🛠️ **Lokale Development**

### **1. Clone Repository**
```bash
git clone https://github.com/WouterArtsRecruitin/recruitin-mcp-servers.git
cd recruitin-mcp-servers
git checkout recruitment-news-app-design
```

### **2. Install Dependencies**
```bash
pnpm install
```

### **3. Run Development Server**
```bash
pnpm run dev
```

Open http://localhost:5173

---

## 📦 **Build voor Productie**

### **1. Build Project**
```bash
pnpm run build
```

Dit genereert een `dist/` folder met geoptimaliseerde production build.

### **2. Preview Build**
```bash
pnpm run preview
```

---

## ☁️ **Deployment Opties**

### **Optie 1: Vercel (Recommended)**

1. Installeer Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Production deploy:
```bash
vercel --prod
```

**Vercel Dashboard Configuratie:**
- Framework Preset: `Vite`
- Build Command: `pnpm run build`
- Output Directory: `dist`
- Install Command: `pnpm install`

---

### **Optie 2: Netlify**

1. Drag & drop `dist/` folder naar Netlify dashboard

**OF**

2. Via CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Netlify Dashboard Configuratie:**
- Build Command: `pnpm run build`
- Publish Directory: `dist`

---

### **Optie 3: GitHub Pages**

1. Edit `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/recruitin-mcp-servers/', // Je repo naam
  // ... rest van config
})
```

2. Build en deploy:
```bash
pnpm run build
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/WouterArtsRecruitin/recruitin-mcp-servers.git
git push -u origin gh-pages --force
```

3. Enable GitHub Pages in repo Settings → Pages → Source: gh-pages branch

---

## 📡 **Supabase Edge Function Deployment**

De Notion API proxy draait als Supabase Edge Function.

### **1. Install Supabase CLI**
```bash
npm i -g supabase
```

### **2. Login**
```bash
supabase login
```

### **3. Link Project**
```bash
supabase link --project-ref mptjawhxczufukbhgzmm
```

### **4. Deploy Edge Function**
```bash
supabase functions deploy make-server-ca13d8c1
```

### **5. Set Environment Variables (Optioneel)**
Als je een fallback Notion API key wilt instellen:

```bash
supabase secrets set NOTION_API_KEY=secret_your_key_here
```

**Let op:** Gebruikers kunnen hun eigen Notion API key configureren via de app UI.

---

## 🔐 **Environment Variables**

### **Frontend (React App)**

De Supabase config staat in `/utils/supabase/info.tsx`:
```typescript
export const projectId = "mptjawhxczufukbhgzmm"
export const publicAnonKey = "eyJhbGci..."
```

**Voor andere Supabase projects:**
1. Update deze file met je eigen project credentials
2. Verkrijg deze via: Supabase Dashboard → Project Settings → API

### **Backend (Supabase Edge Function)**

Optionele env var:
- `NOTION_API_KEY` - Fallback API key (gebruikers kunnen ook via UI configureren)

---

## ✅ **Deployment Checklist**

- [ ] `pnpm run build` succesvol
- [ ] Preview build lokaal getest
- [ ] Supabase Edge Function deployed
- [ ] Notion integration getest (indien gebruikt)
- [ ] Real-time search werkt
- [ ] Categorie filtering werkt
- [ ] Article modals open correct
- [ ] "Lees volledig artikel" links werken
- [ ] Responsive design getest op mobile
- [ ] CORS headers correct ingesteld
- [ ] Error handling getest

---

## 📊 **Performance Optimalisatie**

### **Vite Build Optimalisatie**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
```

### **Lazy Loading Routes**
Als je meer pagina's toevoegt:
```typescript
const RecruitmentNews = lazy(() => import('./pages/RecruitmentNewsPage'));
```

---

## 🐛 **Troubleshooting**

### **Build Errors**
```bash
# Clear cache en rebuild
rm -rf node_modules dist
pnpm install
pnpm run build
```

### **Supabase Edge Function Errors**
```bash
# View logs
supabase functions logs make-server-ca13d8c1

# Test locally
supabase functions serve make-server-ca13d8c1
```

### **CORS Issues**
- Check Edge Function CORS headers (zie `supabase/functions/server/index.tsx`)
- Verify Supabase project URL correct is

### **Notion API 400 Errors**
- Zorg dat je Notion database een **URL** property heeft (type: URL)
- Verify integration toegang tot database
- Check API key format: moet starten met `secret_`

---

## 🔄 **Updates Deployen**

### **Frontend Update**
```bash
git pull origin recruitment-news-app-design
pnpm install
pnpm run build
vercel --prod  # of andere deployment method
```

### **Edge Function Update**
```bash
supabase functions deploy make-server-ca13d8c1
```

---

## 📝 **Custom Domain (Optioneel)**

### **Vercel**
1. Dashboard → Settings → Domains
2. Add domain: `recruitin.nl` of `news.recruitin.nl`
3. Update DNS records volgens instructies

### **Netlify**
1. Dashboard → Domain Settings
2. Add custom domain
3. Configure DNS

---

## 📊 **Monitoring**

### **Vercel Analytics**
Enable in dashboard voor:
- Page views
- Performance metrics
- Error tracking

### **Supabase Logs**
```bash
supabase functions logs make-server-ca13d8c1 --follow
```

---

## 🎓 **Support**

**Technical Issues:**
- Check GitHub Issues
- Review Supabase logs
- Test Notion integration setup

**Contact:**
- Frank Lenting: frank@snps.nl
- Tel: +31 6 13072174

---

**Happy Deploying! 🚀**