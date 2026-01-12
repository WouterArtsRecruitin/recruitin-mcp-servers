#!/usr/bin/env node
/**
 * TOP ARTICLES SELECTOR - Voor Wouter
 * ====================================
 *
 * Selecteert top 3 artikelen uit weekly news voor thought leadership content
 *
 * Criteria:
 * - Thought leadership potential (industry insights, trends, data)
 * - Technical recruitment relevance (automation, engineering, techniek)
 * - Recruitin propositie fit (mid-market, Oost-NL, technical specialization)
 * - Content opportunity (contrarian take mogelijk? data story? how-to?)
 *
 * Usage:
 *   node select-top-articles.js
 *   node select-top-articles.js --report reports/recruitment-news-2026-01-11.html
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// SCORING CRITERIA
// ============================================================================

const SCORING_WEIGHTS = {
  thought_leadership: 0.30,      // Industry insights, trends, forward-looking
  technical_relevance: 0.30,     // Automation, engineering, technical roles
  recruitin_fit: 0.25,           // Mid-market, Oost-NL, specialization
  content_opportunity: 0.15      // Contrarian angle, data story potential
};

// Keywords voor scoring
const KEYWORDS = {

  // Thought Leadership (high-value topics)
  thought_leadership: [
    'trend', 'toekomst', 'ontwikkeling', 'innovatie', 'transformatie',
    'AI', 'automatisering', 'digitalisering', 'disruption',
    'arbeidsmarkt 2026', 'voorspelling', 'forecast', 'scenario',
    'strategie', 'visie', 'paradigma', 'shift'
  ],

  // Technical Recruitment (our niche)
  technical: [
    'automation', 'engineer', 'technisch', 'monteur', 'installateur',
    'PLC', 'SCADA', 'Siemens', 'Rockwell', 'TIA Portal',
    'elektrotechniek', 'werktuigbouw', 'mechatronica',
    'productie', 'manufacturing', 'maakindustrie',
    'oil & gas', 'offshore', 'energie', 'industrie'
  ],

  // Recruitin Propositie (what we care about)
  recruitin_fit: [
    'mkb', 'mid-market', '50-800 fte', 'midden-bedrijf',
    'gelderland', 'overijssel', 'noord-brabant', 'oost-nederland',
    'arnhem', 'enschede', 'eindhoven', 'nijmegen',
    'krapte', 'schaarste', 'personeelstekort', 'moeilijk vervulbaar',
    'salaris', 'loon', 'cao', 'arbeidsvoorwaarden',
    'time-to-fill', 'recruitment proces', 'sourcing', 'talentpool'
  ],

  // Content Angles (what makes good content)
  content_angles: [
    // Data story potential
    'cijfers', 'percentage', 'onderzoek', 'rapport', 'statistiek',
    'UWV', 'CBS', 'intelligence group', 'benchmark',

    // Contrarian potential
    'mythe', 'misverstand', 'waarheid', 'realiteit vs',
    'stop met', 'vergeet', 'waarom niet', 'probleem met',

    // Practical/how-to potential
    'tips', 'gids', 'stappenplan', 'aanpak', 'strategie',
    'praktisch', 'actie', 'implementatie', 'toepassen'
  ]
};

// ============================================================================
// ARTICLE SCORING
// ============================================================================

function scoreArticle(article) {
  const text = `${article.title} ${article.description}`.toLowerCase();

  // Score per category
  const scores = {
    thought_leadership: countKeywords(text, KEYWORDS.thought_leadership),
    technical: countKeywords(text, KEYWORDS.technical),
    recruitin_fit: countKeywords(text, KEYWORDS.recruitin_fit),
    content_angles: countKeywords(text, KEYWORDS.content_angles)
  };

  // Normalize scores (0-100)
  const max_keywords = Math.max(...Object.values(scores), 1);
  const normalized = {
    thought_leadership: (scores.thought_leadership / max_keywords) * 100,
    technical: (scores.technical / max_keywords) * 100,
    recruitin_fit: (scores.recruitin_fit / max_keywords) * 100,
    content_opportunity: (scores.content_angles / max_keywords) * 100
  };

  // Weighted total score
  const total = (
    normalized.thought_leadership * SCORING_WEIGHTS.thought_leadership +
    normalized.technical * SCORING_WEIGHTS.technical_relevance +
    normalized.recruitin_fit * SCORING_WEIGHTS.recruitin_fit +
    normalized.content_opportunity * SCORING_WEIGHTS.content_opportunity
  );

  return {
    total_score: Math.round(total),
    breakdown: normalized,
    matched_keywords: {
      thought_leadership: extractMatchedKeywords(text, KEYWORDS.thought_leadership),
      technical: extractMatchedKeywords(text, KEYWORDS.technical),
      recruitin_fit: extractMatchedKeywords(text, KEYWORDS.recruitin_fit),
      content_angles: extractMatchedKeywords(text, KEYWORDS.content_angles)
    }
  };
}

function countKeywords(text, keywords) {
  return keywords.filter(kw => text.includes(kw)).length;
}

function extractMatchedKeywords(text, keywords) {
  return keywords.filter(kw => text.includes(kw));
}

// ============================================================================
// CONTENT ANGLE DETECTION
// ============================================================================

function detectContentAngles(article, scoring) {
  const angles = [];
  const text = `${article.title} ${article.description}`.toLowerCase();

  // Data Story potential
  if (text.match(/\d+%|\d+\.\d+%|cijfers|statistiek|onderzoek|rapport/)) {
    angles.push({
      type: 'data_story',
      reason: 'Bevat cijfers/data - geschikt voor data-driven LinkedIn post',
      hook_suggestion: `"[Cijfer]% van [groep] doet [X]. Dit betekent..."`,
      fit_score: 85
    });
  }

  // Contrarian potential
  if (text.match(/mythe|misverstand|waarheid|probleem|stop met|vergeet/)) {
    angles.push({
      type: 'contrarian',
      reason: 'Bevat tegendraadse elementen - geschikt voor contrarian take',
      hook_suggestion: `"Unpopular opinion: [standpunt over artikel topic]"`,
      fit_score: 90
    });
  }

  // How-To potential
  if (text.match(/tips|gids|aanpak|stappenplan|strategie|praktisch/)) {
    angles.push({
      type: 'how_to',
      reason: 'Praktische content - geschikt voor educational post',
      hook_suggestion: `"5 dingen die [artikel topic] je leert over [relevant topic]"`,
      fit_score: 75
    });
  }

  // Behind-the-scenes potential
  if (scoring.breakdown.technical > 60 && scoring.breakdown.recruitin_fit > 50) {
    angles.push({
      type: 'behind_scenes',
      reason: 'Relevant voor jouw praktijk - geschikt voor persoonlijke ervaring post',
      hook_suggestion: `"Dit artikel over [topic] resoneert. Wat ik zie in praktijk..."`,
      fit_score: 70
    });
  }

  // Sort by fit score
  angles.sort((a, b) => b.fit_score - a.fit_score);

  return angles;
}

// ============================================================================
// PARSE HTML REPORT
// ============================================================================

function parseReport(htmlPath) {
  console.log(`📄 Parsing report: ${htmlPath}\n`);

  const html = fs.readFileSync(htmlPath, 'utf-8');
  const articles = [];

  // Extract articles (simple regex - not perfect but works)
  const articleMatches = html.matchAll(/<div class="article">([\s\S]*?)<\/div>/g);

  for (const match of articleMatches) {
    const articleHtml = match[1];

    // Extract title
    const titleMatch = articleHtml.match(/class="article-title">(.*?)<\/a>/);
    const title = titleMatch ? titleMatch[1].replace(/<.*?>/g, '').trim() : '';

    // Extract URL
    const urlMatch = articleHtml.match(/href="(.*?)"/);
    const url = urlMatch ? urlMatch[1] : '';

    // Extract description
    const descMatch = articleHtml.match(/class="article-description">(.*?)<\/div>/);
    const description = descMatch ? descMatch[1].replace(/<.*?>/g, '').trim() : '';

    // Extract source
    const sourceMatch = articleHtml.match(/class="article-source">(.*?)<\/div>/);
    const source = sourceMatch ? sourceMatch[1].trim() : '';

    if (title && url) {
      articles.push({ title, url, description, source });
    }
  }

  console.log(`✅ Found ${articles.length} articles\n`);
  return articles;
}

// ============================================================================
// SELECT TOP ARTICLES
// ============================================================================

function selectTopArticles(articles, count = 10) {
  console.log(`🎯 Scoring articles for thought leadership potential...\n`);

  // Score all articles
  const scored = articles.map(article => {
    const scoring = scoreArticle(article);
    const angles = detectContentAngles(article, scoring);

    return {
      ...article,
      scoring,
      content_angles: angles,
      best_angle: angles[0] || null
    };
  });

  // Sort by total score
  scored.sort((a, b) => b.scoring.total_score - a.scoring.total_score);

  // Return top N
  return scored.slice(0, count);
}

// ============================================================================
// DISPLAY RESULTS
// ============================================================================

function displayTop10(articles) {
  console.log('═'.repeat(80));
  console.log('📊 TOP 10 ARTIKELEN - WEEKLY SELECTION');
  console.log('═'.repeat(80));
  console.log('');

  articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   Score: ${article.scoring.total_score}/100`);
    console.log(`   URL: ${article.url}`);
    console.log(`   Breakdown:`);
    console.log(`     • Thought Leadership: ${Math.round(article.scoring.breakdown.thought_leadership)}/100`);
    console.log(`     • Technical Relevance: ${Math.round(article.scoring.breakdown.technical)}/100`);
    console.log(`     • Recruitin Fit: ${Math.round(article.scoring.breakdown.recruitin_fit)}/100`);
    console.log(`     • Content Opportunity: ${Math.round(article.scoring.breakdown.content_opportunity)}/100`);

    if (article.best_angle) {
      console.log(`   Best Content Angle: ${article.best_angle.type} (${article.best_angle.fit_score}%)`);
      console.log(`   Hook: ${article.best_angle.hook_suggestion}`);
    }

    console.log('');
  });
}

function displayTop3(articles) {
  const top3 = articles.slice(0, 3);

  console.log('═'.repeat(80));
  console.log('🏆 TOP 3 - VOOR JOUW CONTENT (Thought Leadership)');
  console.log('═'.repeat(80));
  console.log('');

  top3.forEach((article, index) => {
    console.log(`━━━ #${index + 1}: ${article.title} ━━━`);
    console.log('');
    console.log(`📊 Overall Score: ${article.scoring.total_score}/100`);
    console.log('');
    console.log(`🎯 WHY THIS ARTICLE:`);

    // Explain why it scored high
    const reasons = [];

    if (article.scoring.breakdown.thought_leadership > 60) {
      reasons.push(`✅ Thought Leadership (${Math.round(article.scoring.breakdown.thought_leadership)}/100): ${article.scoring.matched_keywords.thought_leadership.slice(0, 3).join(', ')}`);
    }

    if (article.scoring.breakdown.technical > 60) {
      reasons.push(`✅ Technical Relevance (${Math.round(article.scoring.breakdown.technical)}/100): ${article.scoring.matched_keywords.technical.slice(0, 3).join(', ')}`);
    }

    if (article.scoring.breakdown.recruitin_fit > 50) {
      reasons.push(`✅ Recruitin Fit (${Math.round(article.scoring.breakdown.recruitin_fit)}/100): ${article.scoring.matched_keywords.recruitin_fit.slice(0, 3).join(', ')}`);
    }

    reasons.forEach(r => console.log(`  ${r}`));
    console.log('');

    // Content angles
    if (article.content_angles.length > 0) {
      console.log(`💡 CONTENT ANGLES (${article.content_angles.length} detected):`);
      article.content_angles.forEach(angle => {
        console.log(`  • ${angle.type.toUpperCase()} (${angle.fit_score}%)`);
        console.log(`    ${angle.reason}`);
        console.log(`    Hook: ${angle.hook_suggestion}`);
      });
      console.log('');
    }

    console.log(`🔗 URL: ${article.url}`);
    console.log('');
    console.log(`📝 SUMMARY:`);
    console.log(`   ${article.description.substring(0, 200)}...`);
    console.log('');
    console.log('─'.repeat(80));
    console.log('');
  });

  // Action items
  console.log('🎯 RECOMMENDED ACTIONS:');
  console.log('');
  top3.forEach((article, index) => {
    const angle = article.best_angle || article.content_angles[0];
    if (angle) {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   → Create: ${angle.type} post`);
      console.log(`   → Platform: ${getBestPlatform(angle.type)}`);
      console.log(`   → Timing: ${getBestTiming(angle.type)}`);
      console.log('');
    }
  });
}

function getBestPlatform(type) {
  const platforms = {
    'data_story': 'LinkedIn Wouter (personal) + Blog',
    'contrarian': 'LinkedIn Wouter (personal)',
    'how_to': 'Blog + LinkedIn Recruitin (company)',
    'behind_scenes': 'LinkedIn Wouter (personal)'
  };
  return platforms[type] || 'LinkedIn';
}

function getBestTiming(type) {
  const timing = {
    'data_story': 'Dinsdag 8-9am',
    'contrarian': 'Woensdag 12-1pm',
    'how_to': 'Donderdag 8-9am',
    'behind_scenes': 'Vrijdag 10-11am'
  };
  return timing[type] || 'Dinsdag-Donderdag 8-10am';
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n📰 RECRUITIN TOP ARTICLES SELECTOR\n');

  // Get report file
  const args = process.argv.slice(2);
  let reportPath;

  if (args.includes('--report')) {
    const idx = args.indexOf('--report');
    reportPath = args[idx + 1];
  } else {
    // Find latest report
    const reportsDir = path.join(__dirname, 'reports');
    const reports = fs.readdirSync(reportsDir)
      .filter(f => f.startsWith('recruitment-news-') && f.endsWith('.html'))
      .sort()
      .reverse();

    if (reports.length === 0) {
      console.error('❌ No reports found. Run generate-news-report-now.js first.');
      process.exit(1);
    }

    reportPath = path.join(reportsDir, reports[0]);
  }

  // Parse report
  const articles = parseReport(reportPath);

  if (articles.length === 0) {
    console.error('❌ No articles found in report');
    process.exit(1);
  }

  // Select top articles
  const top10 = selectTopArticles(articles, 10);
  const top3 = top10.slice(0, 3);

  // Display results
  const showTop3Only = args.includes('--top3');

  if (showTop3Only) {
    displayTop3(top3);
  } else {
    displayTop10(top10);
    console.log('');
    console.log('💡 TIP: Run with --top3 flag voor detailed top 3 analysis');
    console.log('   node select-top-articles.js --top3');
  }

  // Save to file
  const outputPath = path.join(__dirname, 'reports', `top-articles-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    source_report: path.basename(reportPath),
    total_articles: articles.length,
    top_10: top10.map(a => ({
      rank: top10.indexOf(a) + 1,
      title: a.title,
      url: a.url,
      score: a.scoring.total_score,
      best_angle: a.best_angle?.type,
      recommended_platform: a.best_angle ? getBestPlatform(a.best_angle.type) : null
    })),
    top_3_detailed: top3
  }, null, 2));

  console.log('');
  console.log(`💾 Full analysis saved to: ${outputPath}`);
  console.log('');
}

// Run
main().catch(console.error);
