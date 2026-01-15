// Customizable HTML Template Configuration for Recruitment News Reports
// Modify this file to change the HTML output without editing the generators

module.exports = {
  // Color scheme configuration
  colors: {
    headerGradientStart: '#003366',
    headerGradientEnd: '#0066cc',
    primaryText: '#003366',
    accentColor: '#0066cc',
    backgroundColor: '#f5f7fa',
    cardBackground: '#ffffff',
    borderColor: '#e1e4e8',
    textDark: '#333333',
    textMedium: '#666666',
    textLight: '#888888'
  },

  // Typography configuration
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    headingSize: '28px',
    bodySize: '14px',
    lineHeight: '1.5'
  },

  // Header configuration
  header: {
    title: '📰 Recruitment & Staffing Market News',
    subtitle: 'Daily Intelligence Report',
    showGeneratedTime: true,
    showSubtitle: true
  },

  // Statistics cards configuration
  stats: {
    show: true,
    cards: [
      {
        label: 'Recruitment Artikelen',
        icon: '📊',
        key: 'totalArticles'
      },
      {
        label: 'Categorieën',
        icon: '📂',
        key: 'totalCategories'
      },
      {
        label: 'Bronnen Doorzocht',
        icon: '🔍',
        key: 'totalQueries'
      }
    ]
  },

  // Article display configuration
  articles: {
    maxPerCategory: 5,
    showDescriptions: true,
    showSourceUrl: true,
    showNewsIcon: true,
    truncateDescriptionLength: 150,
    emptyStateMessage: 'No articles in this category today'
  },

  // Category configuration
  categories: {
    showEmptyCategories: false,
    sortByArticleCount: false,
    customNames: {
      'RPO & Staffing': 'RPO & Staffing Services',
      'ATS & Recruitment Tech': 'Recruitment Technology',
      'Recruitment Marketing': 'Employer Branding & Marketing',
      'Uitzendbranche': 'Uitzend Sector',
      'Werkgelegenheid & Vacatures': 'Employment & Vacancies',
      'Recruitment & Werving': 'Recruitment & Hiring',
      'Arbeidsmarkt Cijfers': 'Labor Market Data',
      'Personeelstekorten': 'Staff Shortages',
      'Technische Sector': 'Technical Sector',
      'CAO & Lonen': 'Collective Agreements & Wages',
      'Wetgeving & Beleid': 'Legislation & Policy',
      'Overig': 'Other'
    }
  },

  // Layout configuration
  layout: {
    maxWidth: '1200px',
    containerPadding: '20px',
    cardBorderRadius: '8px',
    cardShadow: '0 2px 4px rgba(0,0,0,0.1)',
    gridColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
  },

  // Footer configuration
  footer: {
    showGeneratedAt: true,
    showPoweredBy: true,
    showVersion: true,
    version: '1.0',
    customText: 'Powered by Brave Search API & Recruitment Intelligence System'
  }
};
