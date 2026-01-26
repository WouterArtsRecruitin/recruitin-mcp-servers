# 🚀 Recruitin - Recruitment News Application

**Modern recruitment news app met 156 artikelen, Notion integratie en real-time zoekfunctionaliteit**

![React](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06B6D4)

---

## 📋 **Overzicht**

Dit is een **moderne recruitment nieuws applicatie** gebouwd met React en TypeScript, met Notion API integratie en real-time zoekfunctionaliteit. De app bevat 156 artikelen over technical recruitment, engineering, automation, en personeelskrapte in Nederland.

### **✨ Features**

- 📰 **156 Recruitment Artikelen** - Gefilterd op relevantie
- 🔍 **Real-time Search** - Instant zoeken door alle artikelen
- 📂 **5 Categorieën** - Personeelskrapte, AI & Automation, Engineering, Salaries, Remote Work
- 🎯 **Top 3 van de Week** - Featured artikelen met push naar Notion
- 📌 **Notion Integratie** - Directe API koppeling met Notion databases
- 🎨 **Modern Design** - Grijze/gele gradient achtergrond met orange accents
- 📱 **Fully Responsive** - Optimaal op desktop, tablet en mobile
- ⚡ **Article Modals** - Klikbare artikelen met uitgebreide content
- 🔗 **Source Links** - Directe links naar bron artikelen

---

## 🗂️ **Project Structuur**

```
/src/app/
├── App.tsx                          # Main entry point
├── pages/
│   ├── RecruitmentNewsPage.tsx      # Main news page
│   ├── ExecutivePage.tsx            # S&PS Executive Recruitment (bewaard)
│   └── AboutPage.tsx                # Over Frank pagina (bewaard)
├── data/
│   └── newsData.ts                  # 156 artikelen data
└── styles/
    ├── fonts.css                    # Font imports
    ├── index.css                    # Base styles
    └── theme.css                    # Design tokens

/supabase/functions/server/
└── index.tsx                        # Notion API proxy (Edge Function)
```

---

## 🚀 **Tech Stack**

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.1.12
- **Backend**: Supabase Edge Functions (Deno)
- **Build Tool**: Vite 6.3.5
- **API Integration**: Notion API 2022-06-28

---

## 🎨 **Design System**

### **Kleurenpalet**
```css
Background:       linear-gradient(to bottom right, #f9fafb, #f1f5f9, #fef3c7)
Header:           linear-gradient(to right, #1f2937, #374151, #1f2937)
Accent Orange:    #f59e0b (#f97316 for buttons)
Text primair:     #1f2937
Text secundair:   #6b7280
```

### **Typography**
- **Font**: System fonts (optimale performance)
- **Headers**: 24px - 32px, font-bold
- **Body**: 15px - 18px, regular/medium
- **Labels**: 13px - 14px

---

## 📌 **Notion Integratie Setup**

### **Stap 1: Maak een Notion Integration**
1. Ga naar [Notion Integrations](https://www.notion.so/my-integrations)
2. Klik op **"+ New integration"**
3. Geef je integratie een naam (bijv. "Recruitin News")
4. Kopieer de **Internal Integration Token** (`secret_...`)

### **Stap 2: Maak een Database**
1. Open Notion en maak een nieuwe database
2. Voeg deze properties toe:
   - **title** (Title) - Required
   - **URL** (URL) - Required for article links

### **Stap 3: Deel Database met Integration**
1. Open je database in Notion
2. Klik op **"..."** (rechtsboven)
3. Klik op **"Add connections"**
4. Selecteer je integratie

### **Stap 4: Vind Database ID**
Open je database en kopieer het ID uit de URL:
```
https://notion.so/myworkspace/abc123def456?v=...
                            ↑↑↑↑↑↑↑↑↑↑↑↑
                            Dit is je Database ID
```

### **Stap 5: Configureer in App**
1. Klik op **"⚙️ Notion Setup"** knop in de header
2. Plak je **API Key** (`secret_...`)
3. Plak je **Database ID**
4. Klik **"Opslaan"**

✅ **Klaar!** Je kunt nu artikelen naar Notion pushen!

---

## 🎯 **Features**

### **🔍 Zoeken**
- Type in de zoekbalk
- Zoekt in: titel, beschrijving
- Real-time filtering
- Filter tags met verwijder optie

### **📂 Categorieën**
- Personeelskrapte & Recruitment
- AI & Automation in HR
- Engineering Trends
- Salary & Compensation
- Remote Work

### **🎯 Top 3 van de Week**
- Featured artikelen met rank badges
- Push alle 3 naar Notion in één keer
- Klikbaar voor modal view
- Directe source links

### **📰 Article Modals**
- Klik op artikel voor uitgebreide view
- Belangrijkste inzichten
- Impact op recruitment
- Recruitin tips
- "Lees volledig artikel" knop
- Deel functionaliteit

### **📊 Bronnen Tabel**
- 7 top bronnen
- Artikel counts
- Relevantie scores
- Toggle visibility

---

## 🔧 **Development**

### **Install Dependencies**
```bash
pnpm install
```

### **Run Development Server**
```bash
pnpm run dev
```

### **Build for Production**
```bash
pnpm run build
```

---

## 🐛 **Troubleshooting**

### **Notion API Error: "Invalid API Key"**
→ Controleer of je API key begint met `secret_`

### **Notion API Error: "Object not found"**
→ Check of de database gedeeld is met je integration

### **Notion API Error: "Body failed validation"**
→ Zorg dat je Notion database een **URL** property heeft (type: URL)

### **Server Error**
→ Check Supabase Edge Function logs in dashboard

---

## 📝 **Licentie**

© 2026 Recruitin / S&PS BV. Alle rechten voorbehouden.

---

## 👨‍💼 **Contact**

**Recruitin**  
Tagline: *the right people, right now*

**S&PS BV**  
Frank Lenting  
Email: frank@snps.nl  
Tel: +31 6 13072174

---

## 🔄 **Updates**

### **v2.0** - 16 jan 2026
- ✨ Article modals met klikbare content
- 🔗 "Lees volledig artikel" links naar bronnen
- 🎯 Fixed server-side Notion integration (Title + URL only)
- 📌 Top 3 push functionaliteit
- 🎨 Modern gradient design
- 📱 Fully responsive

### **v1.0** - 14 jan 2026
- Initial release met 156 artikelen
- Real-time search en filtering
- Notion API integratie

---

**Happy Recruiting! 🚀**