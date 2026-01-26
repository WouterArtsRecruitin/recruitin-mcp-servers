import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function RecruitmentNewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle onderwerpen');
  const [showSources, setShowSources] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notionToken, setNotionToken] = useState('');
  const [notionDbId, setNotionDbId] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('notion_token') || '';
    const savedDbId = localStorage.getItem('notion_db_id') || '';
    setNotionToken(savedToken);
    setNotionDbId(savedDbId);
  }, []);

  const saveNotionConfig = () => {
    localStorage.setItem('notion_token', notionToken);
    localStorage.setItem('notion_db_id', notionDbId);
    setShowModal(false);
    showMessage('Configuratie opgeslagen!', 'success');
  };

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    const toast = document.createElement('div');
    toast.textContent = text;
    toast.style.cssText = `
      position: fixed; top: 2rem; right: 2rem; z-index: 2000;
      padding: 1rem 1.5rem; border-radius: 6px; font-weight: 600;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const pushToNotion = async () => {
    if (!notionToken || !notionDbId) {
      showMessage('Configureer eerst Notion API instellingen', 'error');
      return;
    }

    const articles = [
      {
        rank: 1,
        title: 'Personeelskrapte in Nederland bereikt kritiek punt',
        description: 'Twee miljoen posten blijven onvervuld terwijl werkloosheid laag blijft. Technische rollen het hardst geraakt.',
        source: 'FT.com',
        date: '11 jan 2026',
        url: 'https://ft.com/recruitment-crisis-netherlands'
      },
      {
        rank: 2,
        title: 'AI-gestuurde recruitment automation groeit 300% YoY',
        description: 'Nederlandse startups investeren zwaar in intelligent matching. Recruitin leidt markt in Europa.',
        source: 'TechCrunch',
        date: '10 jan 2026',
        url: 'https://techcrunch.com/ai-recruitment-automation'
      },
      {
        rank: 3,
        title: 'Engineering salaries stijgen gemiddeld 12% in 2025',
        description: 'Tekort aan talent drijft lonen omhoog, vooral in automation & cloud engineering.',
        source: 'Glassdoor',
        date: '9 jan 2026',
        url: 'https://glassdoor.com/engineering-salaries-2025'
      }
    ];

    try {
      showMessage('Bezig met pushen naar Notion...', 'info');

      let successCount = 0;
      let errorCount = 0;

      for (const article of articles) {
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ca13d8c1/notion/push`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              databaseId: notionDbId,
              apiKey: notionToken,
              article: {
                title: article.title,
                description: article.description,
                url: article.url,
                date: article.date
              },
              category: 'Top 3'
            })
          });

          const data = await response.json();

          if (data.success) {
            successCount++;
          } else {
            console.error(`Failed to push article "${article.title}":`, data.message);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error pushing article "${article.title}":`, error);
          errorCount++;
        }
      }

      if (successCount === articles.length) {
        showMessage(`Alle ${successCount} artikelen succesvol naar Notion gepusht!`, 'success');
      } else if (successCount > 0) {
        showMessage(`${successCount} van ${articles.length} artikelen gepusht. ${errorCount} fout(en).`, 'info');
      } else {
        showMessage('Fout bij pushen naar Notion. Check console voor details.', 'error');
      }
    } catch (error) {
      console.error('Notion push error:', error);
      showMessage('Fout bij pushen naar Notion. Check configuratie.', 'error');
    }
  };

  const categories = [
    'Alle onderwerpen',
    'Personeelskrapte & Recruitment',
    'AI & Automation in HR',
    'Engineering Trends',
    'Salary & Compensation',
    'Remote Work'
  ];

  const articles = [
    {
      category: 'Personeelskrapte & Recruitment',
      title: 'Werkgevers worstelen met recruitment in hoog-technische rollen',
      description: 'Aanbod van engineers en automation specialists blijft ver achter bij vraag. Bedrijven kijken naar upskilling programma\'s.',
      source: 'VNO-NCW',
      date: '11 jan',
      url: 'https://vno-ncw.nl/recruitment-technische-rollen'
    },
    {
      category: 'Personeelskrapte & Recruitment',
      title: 'Remote recruitment strategies 2026: Global talent pools',
      description: 'Nederlandse bedrijven breiden zoekgebied uit naar Europa en Amerika. Salarissen normaliseren tussen regio\'s.',
      source: 'LinkedIn News',
      date: '10 jan',
      url: 'https://linkedin.com/news/remote-recruitment-2026'
    },
    {
      category: 'AI & Automation in HR',
      title: 'Recruitment AI tools transformeren hiring processes',
      description: 'Applicant tracking, bias detection en candidate scoring nu automatisch. Recruiters richten zich op relationship-building.',
      source: 'ERE Recruiting Intelligence',
      date: '8 jan',
      url: 'https://ere.net/ai-recruitment-tools'
    },
    {
      category: 'Engineering Trends',
      title: 'Edge Computing & IoT engineering: Skills shortage',
      description: 'Next-gen technologieën vereisen niche expertise. Bedrijven bieden premium salaries voor specialisten.',
      source: 'IEEE Spectrum',
      date: '7 jan',
      url: 'https://spectrum.ieee.org/edge-computing-skills'
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'Alle onderwerpen' || article.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const removeFilter = (type: 'category' | 'search') => {
    if (type === 'category') {
      setSelectedCategory('Alle onderwerpen');
    } else {
      setSearchTerm('');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f9fafb, #f1f5f9, #fef3c7)' }}>
      <header style={{ background: 'linear-gradient(to right, #1f2937, #374151, #1f2937)' }} className="text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <strong className="text-xl">Recruitin</strong>
              <div className="w-px h-12 bg-amber-500"></div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">📈 Technical Recruitment & Engineering Nieuws</h1>
                <p className="text-gray-300 text-sm italic">the right people, right now</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all">⚙️ Notion Setup</button>
          </div>
          <p className="text-gray-200 text-lg mb-1">Focus: Automation, Engineering, Technisch Personeel & Personeelskrapte</p>
          <p className="text-gray-300 text-sm flex items-center gap-2">📅 16 januari 2026, 01:14</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center border border-white/10"><div className="text-4xl font-bold">156</div><div className="text-sm text-gray-300 mt-2">Recruitment Artikelen</div></div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center border border-white/10"><div className="text-4xl font-bold">24</div><div className="text-sm text-gray-300 mt-2">Bronnen Doorzocht</div></div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center border border-white/10"><div className="text-4xl font-bold">18</div><div className="text-sm text-gray-300 mt-2">Relevante Bronnen</div></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            <button onClick={() => setShowSources(!showSources)} className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-amber-50 hover:border-amber-500 transition-all font-medium">{showSources ? '🔍 Verberg Bronnen' : '🔍 Toon Bronnen'}</button>
          </div>
          <input type="text" placeholder="Zoek in categorieën en artikelen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'Alle onderwerpen' && (<div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm"><span><strong>Onderwerp:</strong> {selectedCategory}</span><button onClick={() => removeFilter('category')} className="text-amber-800 font-bold">×</button></div>)}
            {searchTerm && (<div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm"><span><strong>Zoekterm:</strong> "{searchTerm}"</span><button onClick={() => removeFilter('search')} className="text-amber-800 font-bold">×</button></div>)}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2"><div className="w-12 h-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div><h2 className="text-2xl font-bold text-gray-900">Top 3 van deze Week</h2></div>
            <button onClick={pushToNotion} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg">⚡ Push Top 3 naar Notion</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{rank:1,category:'Personeelskrapte & Recruitment',title:'Personeelskrapte in Nederland bereikt kritiek punt',description:'Twee miljoen posten blijven onvervuld terwijl werkloosheid laag blijft. Technische rollen het hardst geraakt.',source:'FT.com',date:'11 jan 2026',url:'https://ft.com/recruitment-crisis-netherlands'},{rank:2,category:'AI & Automation in HR',title:'AI-gestuurde recruitment automation groeit 300% YoY',description:'Nederlandse startups investeren zwaar in intelligent matching. Recruitin leidt markt in Europa.',source:'TechCrunch',date:'10 jan 2026',url:'https://techcrunch.com/ai-recruitment-automation'},{rank:3,category:'Salary & Compensation',title:'Engineering salaries stijgen gemiddeld 12% in 2025',description:'Tekort aan talent drijft lonen omhoog, vooral in automation & cloud engineering.',source:'Glassdoor',date:'9 jan 2026',url:'https://glassdoor.com/engineering-salaries-2025'}].map(article => (<div key={article.rank} onClick={() => setSelectedArticle(article)} className="bg-white border-2 border-amber-500 rounded-lg p-6 relative hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"><div className="absolute -top-4 left-4 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg">{article.rank}</div><h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3><p className="text-gray-600 text-sm mb-4">{article.description}</p><div className="flex gap-4 text-sm text-gray-400"><span className="text-amber-500 font-semibold">{article.source}</span><span>{article.date}</span></div></div>))}
          </div>
        </div>

        <div><div className="flex items-center gap-2 mb-6"><div className="w-12 h-1 rounded-full bg-gradient-to-r from-gray-600 to-gray-800"></div><h2 className="text-2xl font-bold text-gray-900">Belangrijkste Onderwerpen</h2></div><div className="space-y-6">{['Personeelskrapte & Recruitment','AI & Automation in HR','Engineering Trends'].map(category=>{const categoryArticles=filteredArticles.filter(a=>a.category===category);if(categoryArticles.length===0)return null;const emoji=category.includes('Personeelskrapte')?'📊':category.includes('AI')?'🤖':'⚙️';return(<div key={category}><h3 className="text-lg font-semibold mb-4">{emoji} {category}</h3><div className="space-y-4">{categoryArticles.map((article,idx)=>(<div key={idx} onClick={()=>setSelectedArticle(article)} className="bg-white p-6 border border-gray-200 rounded-lg hover:shadow-xl hover:border-amber-500 transition-all cursor-pointer"><h4 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h4><p className="text-gray-600 mb-4">{article.description}</p><div className="flex gap-4 text-sm text-gray-400"><span className="text-amber-500 font-semibold">{article.source}</span><span>{article.date}</span></div></div>))}</div></div>);})}</div></div>

        {showSources && (<div className="mt-8"><h3 className="text-xl font-semibold mb-4">Bronnen Overzicht</h3><div className="bg-white rounded-lg shadow overflow-hidden"><table className="w-full"><thead className="bg-gray-800 text-white"><tr><th className="px-6 py-4 text-left font-semibold">Bron</th><th className="px-6 py-4 text-left font-semibold">Artikelen</th><th className="px-6 py-4 text-left font-semibold">Relevantie</th></tr></thead><tbody>{[{name:'LinkedIn Pulse',count:28,rating:'⭐⭐⭐⭐⭐'},{name:'TechCrunch',count:24,rating:'⭐⭐⭐⭐⭐'},{name:'FT.com',count:18,rating:'⭐⭐⭐⭐'},{name:'Glassdoor Blog',count:15,rating:'⭐⭐⭐⭐'},{name:'VNO-NCW',count:12,rating:'⭐⭐⭐⭐⭐'},{name:'ERE Recruiting',count:10,rating:'⭐⭐⭐⭐'},{name:'IEEE Spectrum',count:9,rating:'⭐⭐⭐⭐'}].map(source=>(<tr key={source.name} className="border-b border-gray-200 hover:bg-gray-50"><td className="px-6 py-4"><strong>{source.name}</strong></td><td className="px-6 py-4">{source.count}</td><td className="px-6 py-4">{source.rating}</td></tr>))}</tbody></table></div></div>)}

        <footer className="text-center mt-12 pt-8 border-t border-gray-300 text-gray-500 text-sm"><p className="mb-2">Report gegenereerd op: 16 januari 2026, 01:04:41</p><p>Powered by Brave Search API</p></footer>
      </main>

      {showModal && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}><div className="bg-white rounded-lg max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}><h3 className="text-2xl font-bold text-gray-900 mb-6">Notion API Configuratie</h3><div className="space-y-4 mb-6"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Notion Integration Token</label><input type="password" placeholder="secret_..." value={notionToken} onChange={(e) => setNotionToken(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Database ID</label><input type="text" placeholder="abc123..." value={notionDbId} onChange={(e) => setNotionDbId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" /></div></div><div className="flex gap-4"><button onClick={saveNotionConfig} className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all">Opslaan</button><button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all">Annuleren</button></div></div></div>)}

      {selectedArticle && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedArticle(null)}><div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}><div className="flex justify-between items-start mb-6"><div className="flex-1"><div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-3">{selectedArticle.category}</div><h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h2></div><button onClick={() => setSelectedArticle(null)} className="text-gray-400 hover:text-gray-600 text-3xl font-bold ml-4">×</button></div><div className="flex gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200"><span className="flex items-center gap-2"><span className="text-amber-500 font-semibold">📰 {selectedArticle.source}</span></span><span className="flex items-center gap-2"><span>📅 {selectedArticle.date}</span></span></div><div className="prose max-w-none"><p className="text-lg text-gray-700 leading-relaxed mb-6">{selectedArticle.description}</p><h3 className="text-xl font-semibold text-gray-900 mb-3">Belangrijkste Inzichten</h3><ul className="space-y-2 mb-6"><li className="text-gray-700">Recruitment markt blijft uitdagend voor technische rollen</li><li className="text-gray-700">Bedrijven investeren in upskilling en interne ontwikkeling</li><li className="text-gray-700">Remote work opent nieuwe mogelijkheden voor talent acquisition</li></ul><h3 className="text-xl font-semibold text-gray-900 mb-3">Impact op Recruitment</h3><p className="text-gray-700 mb-6">Deze ontwikkelingen hebben directe gevolgen voor recruitment strategieën. Organisaties moeten hun aanpak aanpassen aan de veranderende arbeidsmarkt en nieuwe technologieën omarmen om effectief talent te kunnen aantrekken en behouden.</p><div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg"><p className="text-sm font-semibold text-amber-900 mb-2">💡 Recruitin Tip</p><p className="text-sm text-amber-800">Focus op employer branding en candidate experience om je te onderscheiden in de competitieve markt voor technisch talent.</p></div></div><div className="mt-8 pt-6 border-t border-gray-200 flex gap-4"><button onClick={() => setSelectedArticle(null)} className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all">Sluiten</button>{selectedArticle.url && (<a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-center">🔗 Lees volledig artikel</a>)}<button onClick={() => { showMessage('Deze functie komt binnenkort beschikbaar', 'info'); }} className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all">📤 Deel</button></div></div></div>)}
    </div>
  );
}