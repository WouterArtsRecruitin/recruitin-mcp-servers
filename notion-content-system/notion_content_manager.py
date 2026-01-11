#!/usr/bin/env python3
"""
Notion Content Manager for Recruitin B.V.
=========================================
Integreert met Notion databases voor:
- Recruitment News aggregatie
- Content draft management
- LinkedIn post scheduling

Gebruik in Claude Code:
    python notion_content_manager.py --action fetch_news
    python notion_content_manager.py --action create_draft --news-id <id>
    python notion_content_manager.py --action list_drafts

Vereisten:
    pip install notion-client python-dotenv requests feedparser

Environment:
    NOTION_API_KEY=secret_xxx
"""

import os
import json
import argparse
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import requests

try:
    from notion_client import Client
    from dotenv import load_dotenv
    import feedparser
except ImportError:
    print("Installing required packages...")
    os.system("pip install notion-client python-dotenv requests feedparser --break-system-packages -q")
    from notion_client import Client
    from dotenv import load_dotenv
    import feedparser

load_dotenv()

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Configuratie voor Notion databases en RSS feeds"""
    
    # Notion Database IDs (uit de eerder aangemaakte databases)
    NEWS_DATABASE_ID = "2e52252c-bb15-8101-b097-cce88691c0d0"
    DRAFTS_DATABASE_ID = "2e52252c-bb15-81e9-8215-cee7c7812f6d"
    PARENT_HUB_ID = "27c2252c-bb15-815b-b21b-e75a8c70d8d7"
    
    # RSS Feeds voor Nederlandse recruitment nieuws
    RSS_FEEDS = [
        {
            "name": "Werf&",
            "url": "https://www.werf-en.nl/feed/",
            "category": "recruitment_nl"
        },
        {
            "name": "RecruitmentTech",
            "url": "https://recruitmenttech.nl/feed/",
            "category": "hr_tech"
        },
        {
            "name": "HR Praktijk",
            "url": "https://www.hrpraktijk.nl/feed/",
            "category": "hr_general"
        },
        {
            "name": "MT/Sprout",
            "url": "https://www.mt.nl/feed/",
            "category": "business",
            "filter_keywords": ["recruitment", "arbeidsmarkt", "talent", "hr", "personeel"]
        }
    ]
    
    # Content templates
    LINKEDIN_POST_TEMPLATE = """
{hook}

{body}

{cta}

{hashtags}
"""
    
    # ICP Keywords voor relevance scoring
    ICP_KEYWORDS = [
        "technisch", "monteur", "engineer", "productie", "manufacturing",
        "industrie", "oil", "gas", "constructie", "automation", "renewable",
        "mid-market", "mkb", "50-800", "oost-nederland", "gelderland",
        "overijssel", "noord-brabant", "salary", "salaris", "krapte",
        "arbeidsmarkt", "vacature", "recruitment", "talent"
    ]


# ============================================================================
# NOTION CLIENT
# ============================================================================

class NotionContentManager:
    """Beheert Notion databases voor content management"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("NOTION_API_KEY")
        if not self.api_key:
            raise ValueError("NOTION_API_KEY niet gevonden. Set via environment of .env file")
        
        self.client = Client(auth=self.api_key)
        self.config = Config()
    
    # -------------------------------------------------------------------------
    # NEWS MANAGEMENT
    # -------------------------------------------------------------------------
    
    def fetch_rss_news(self, max_per_feed: int = 5) -> List[Dict]:
        """Haalt nieuws op van alle geconfigureerde RSS feeds"""
        all_news = []
        
        for feed_config in self.config.RSS_FEEDS:
            try:
                print(f"📡 Fetching: {feed_config['name']}...")
                feed = feedparser.parse(feed_config['url'])
                
                for entry in feed.entries[:max_per_feed]:
                    # Filter op keywords indien geconfigureerd
                    if "filter_keywords" in feed_config:
                        content = f"{entry.get('title', '')} {entry.get('summary', '')}".lower()
                        if not any(kw in content for kw in feed_config['filter_keywords']):
                            continue
                    
                    news_item = {
                        "source": feed_config['name'],
                        "category": feed_config['category'],
                        "title": entry.get('title', 'Geen titel'),
                        "url": entry.get('link', ''),
                        "summary": entry.get('summary', '')[:500],
                        "published": entry.get('published', datetime.now().isoformat()),
                        "relevance_score": self._calculate_relevance(entry)
                    }
                    all_news.append(news_item)
                    
            except Exception as e:
                print(f"⚠️ Error fetching {feed_config['name']}: {e}")
        
        # Sorteer op relevance score
        all_news.sort(key=lambda x: x['relevance_score'], reverse=True)
        print(f"✅ {len(all_news)} nieuws items opgehaald")
        return all_news
    
    def _calculate_relevance(self, entry: Dict) -> int:
        """Berekent relevance score (0-100) voor een nieuws item"""
        content = f"{entry.get('title', '')} {entry.get('summary', '')}".lower()
        
        score = 50  # Base score
        
        # +5 voor elke ICP keyword match
        for keyword in self.config.ICP_KEYWORDS:
            if keyword.lower() in content:
                score += 5
        
        # Cap at 100
        return min(score, 100)
    
    def save_news_to_notion(self, news_items: List[Dict]) -> List[str]:
        """Slaat nieuws items op in Notion News Database"""
        created_ids = []
        
        for item in news_items:
            try:
                # Check of item al bestaat (op basis van URL)
                existing = self._check_existing_news(item['url'])
                if existing:
                    print(f"⏭️ Skip (exists): {item['title'][:50]}...")
                    continue
                
                # Maak page content
                content = f"""# {item['title']}

## Summary
{item['summary']}

## Analysis
**Relevance Score:** {item['relevance_score']}/100
**Source:** {item['source']}
**Category:** {item['category']}

## Content Flags
- {"✅" if item['relevance_score'] >= 70 else "⬜"} LinkedIn Worthy
- {"✅" if item['relevance_score'] >= 80 else "⬜"} Blog Worthy
- {"✅" if item['relevance_score'] >= 60 else "⬜"} Newsletter Worthy

---
**URL:** {item['url']}
**Published:** {item['published']}
"""
                
                # Creëer Notion page
                response = self.client.pages.create(
                    parent={"page_id": self.config.NEWS_DATABASE_ID},
                    icon={"type": "emoji", "emoji": self._get_category_emoji(item['category'])},
                    properties={
                        "title": {
                            "title": [{"text": {"content": item['title'][:100]}}]
                        }
                    },
                    children=self._markdown_to_blocks(content)
                )
                
                created_ids.append(response['id'])
                print(f"✅ Created: {item['title'][:50]}...")
                
            except Exception as e:
                print(f"⚠️ Error saving {item['title'][:30]}: {e}")
        
        return created_ids
    
    def _check_existing_news(self, url: str) -> bool:
        """Checkt of een news item al bestaat in Notion"""
        # Simplified check - in productie zou je een database query doen
        return False
    
    def _get_category_emoji(self, category: str) -> str:
        """Retourneert emoji voor nieuws categorie"""
        emojis = {
            "recruitment_nl": "🇳🇱",
            "hr_tech": "🤖",
            "hr_general": "👥",
            "business": "💼",
            "salary": "💰",
            "trends": "📈"
        }
        return emojis.get(category, "📰")
    
    # -------------------------------------------------------------------------
    # CONTENT DRAFT MANAGEMENT
    # -------------------------------------------------------------------------
    
    def create_linkedin_draft(
        self,
        title: str,
        content: str,
        post_type: str = "contrarian",
        channel: str = "personal",
        source_news_id: Optional[str] = None
    ) -> str:
        """Maakt een LinkedIn post draft aan in Notion"""
        
        # Bereken meta info
        char_count = len(content)
        hashtags = self._extract_hashtags(content)
        
        page_content = f"""# LinkedIn Post - {post_type.title()}

## Status: 📝 Draft

## Type: LinkedIn Post ({channel.title()})

## Channel: {"Wouter Arts LinkedIn" if channel == "personal" else "Recruitin B.V. LinkedIn"}

---

## CONTENT

{content}

---

## META

**Karakters:** {char_count}
**Best Time:** {self._get_best_posting_time(post_type)}
**Hook:** {"✅" if content.split('.')[0] else "⚠️"} 
**CTA:** {"✅" if "?" in content else "⚠️ Geen vraag"}
**Hashtags:** {len(hashtags)}

## Source
{source_news_id or "Manual creation"}
"""
        
        response = self.client.pages.create(
            parent={"page_id": self.config.DRAFTS_DATABASE_ID},
            icon={"type": "emoji", "emoji": "📱"},
            properties={
                "title": {
                    "title": [{"text": {"content": f"📱 Draft: {title[:50]}"}}]
                }
            },
            children=self._markdown_to_blocks(page_content)
        )
        
        print(f"✅ Draft created: {response['url']}")
        return response['id']
    
    def _get_best_posting_time(self, post_type: str) -> str:
        """Retourneert beste posting tijd per post type"""
        times = {
            "contrarian": "Woensdag 12:00-13:00",
            "data_story": "Dinsdag 08:00-09:00",
            "how_to": "Donderdag 08:00-09:00",
            "behind_scenes": "Vrijdag 10:00-11:00"
        }
        return times.get(post_type, "Dinsdag 08:00-09:00")
    
    def _extract_hashtags(self, content: str) -> List[str]:
        """Extraheert hashtags uit content"""
        import re
        return re.findall(r'#\w+', content)
    
    def list_drafts(self, status: str = "draft") -> List[Dict]:
        """Lijst alle content drafts"""
        try:
            # Get children of drafts database page
            response = self.client.blocks.children.list(
                block_id=self.config.DRAFTS_DATABASE_ID
            )
            
            drafts = []
            for block in response.get('results', []):
                if block['type'] == 'child_page':
                    drafts.append({
                        'id': block['id'],
                        'title': block.get('child_page', {}).get('title', 'Untitled')
                    })
            
            return drafts
            
        except Exception as e:
            print(f"⚠️ Error listing drafts: {e}")
            return []
    
    # -------------------------------------------------------------------------
    # CONTENT GENERATION (AI-powered)
    # -------------------------------------------------------------------------
    
    def generate_linkedin_post(
        self,
        news_item: Dict,
        style: str = "contrarian"
    ) -> str:
        """Genereert LinkedIn post content van een news item"""
        
        templates = {
            "contrarian": self._generate_contrarian_post,
            "data_story": self._generate_data_story_post,
            "how_to": self._generate_howto_post,
            "behind_scenes": self._generate_bts_post
        }
        
        generator = templates.get(style, self._generate_contrarian_post)
        return generator(news_item)
    
    def _generate_contrarian_post(self, news: Dict) -> str:
        """Genereert contrarian style post"""
        return f'''"{news['title']}" zeggen de headlines.

Mijn take:

[VOEG HIER JE CONTRARIAN PERSPECTIEF TOE]

[ONDERBOUW MET EIGEN DATA/ERVARING]

Wat is jouw ervaring hiermee?

#recruitment #arbeidsmarkt #techniek'''
    
    def _generate_data_story_post(self, news: Dict) -> str:
        """Genereert data story style post"""
        return f'''[SPECIFIEK GETAL + CONTEXT]

Dit is geen fictief voorbeeld.
Dit is wat ik zie in de praktijk.

Wat ik leerde:

→ [Insight 1]
→ [Insight 2]
→ [Insight 3]

De fix was pijnlijk simpel: [OPLOSSING]

Bron: {news['title']}

#recruitment #data #arbeidsmarkt'''
    
    def _generate_howto_post(self, news: Dict) -> str:
        """Genereert how-to style post"""
        return f'''[PROBLEEM DAT HERKENNING TRIGGERT]

Dit hoor ik elke week.

De oplossing is simpeler dan je denkt:

1. [STAP 1]
2. [STAP 2]
3. [STAP 3]

Resultaat: [CONCRETE UITKOMST]

Save deze post. Je gaat hem nodig hebben.

Gebaseerd op: {news['title']}

#recruitment #tips #hiring'''
    
    def _generate_bts_post(self, news: Dict) -> str:
        """Genereert behind-the-scenes style post"""
        return f'''[EERLIJKE BEKENTENIS]

[WAT GEBEURDE ER - CONTEXT]

Mijn les: [CONCRETE LEARNING]

Hoe ik het nu anders doe: [NIEUWE AANPAK]

Geïnspireerd door: {news['title']}

#recruitment #learnings #transparantie'''
    
    # -------------------------------------------------------------------------
    # UTILITIES
    # -------------------------------------------------------------------------
    
    def _markdown_to_blocks(self, markdown: str) -> List[Dict]:
        """Converteer markdown naar Notion blocks"""
        blocks = []
        lines = markdown.split('\n')
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            # Headers
            if line.startswith('# '):
                blocks.append({
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"type": "text", "text": {"content": line[2:]}}]
                    }
                })
            elif line.startswith('## '):
                blocks.append({
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"type": "text", "text": {"content": line[3:]}}]
                    }
                })
            elif line.startswith('### '):
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": line[4:]}}]
                    }
                })
            # Horizontal rule
            elif line.strip() == '---':
                blocks.append({
                    "object": "block",
                    "type": "divider",
                    "divider": {}
                })
            # Bullet points
            elif line.strip().startswith('- '):
                blocks.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [{"type": "text", "text": {"content": line.strip()[2:]}}]
                    }
                })
            # Regular paragraph
            elif line.strip():
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": line}}]
                    }
                })
            
            i += 1
        
        return blocks


# ============================================================================
# CLI INTERFACE
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Notion Content Manager voor Recruitin B.V.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Voorbeelden:
  python notion_content_manager.py --action fetch_news
  python notion_content_manager.py --action fetch_news --save
  python notion_content_manager.py --action create_draft --title "Test Post" --content "Content here"
  python notion_content_manager.py --action list_drafts
  python notion_content_manager.py --action generate --style contrarian --title "News Title"
        """
    )
    
    parser.add_argument(
        "--action",
        choices=["fetch_news", "create_draft", "list_drafts", "generate", "test"],
        required=True,
        help="Actie om uit te voeren"
    )
    
    parser.add_argument("--save", action="store_true", help="Sla resultaten op in Notion")
    parser.add_argument("--title", type=str, help="Titel voor draft")
    parser.add_argument("--content", type=str, help="Content voor draft")
    parser.add_argument("--style", choices=["contrarian", "data_story", "how_to", "behind_scenes"], 
                       default="contrarian", help="Post stijl")
    parser.add_argument("--max-items", type=int, default=5, help="Max items per RSS feed")
    
    args = parser.parse_args()
    
    # Initialize manager
    try:
        manager = NotionContentManager()
    except ValueError as e:
        print(f"❌ {e}")
        print("\nSet NOTION_API_KEY:")
        print("  export NOTION_API_KEY=secret_xxx")
        print("  # of maak .env file met NOTION_API_KEY=secret_xxx")
        return
    
    # Execute action
    if args.action == "fetch_news":
        news = manager.fetch_rss_news(max_per_feed=args.max_items)
        
        print("\n" + "="*60)
        print("📰 RECRUITMENT NEWS")
        print("="*60)
        
        for i, item in enumerate(news[:10], 1):
            print(f"\n{i}. [{item['relevance_score']}] {item['title'][:60]}...")
            print(f"   Source: {item['source']} | {item['category']}")
        
        if args.save:
            print("\n💾 Saving to Notion...")
            created = manager.save_news_to_notion(news)
            print(f"✅ {len(created)} items saved to Notion")
    
    elif args.action == "create_draft":
        if not args.title or not args.content:
            print("❌ --title en --content zijn verplicht voor create_draft")
            return
        
        draft_id = manager.create_linkedin_draft(
            title=args.title,
            content=args.content,
            post_type=args.style
        )
        print(f"✅ Draft created: {draft_id}")
    
    elif args.action == "list_drafts":
        drafts = manager.list_drafts()
        
        print("\n" + "="*60)
        print("📝 CONTENT DRAFTS")
        print("="*60)
        
        for draft in drafts:
            print(f"  • {draft['title']}")
            print(f"    ID: {draft['id']}")
    
    elif args.action == "generate":
        if not args.title:
            print("❌ --title is verplicht voor generate")
            return
        
        # Create mock news item
        news_item = {"title": args.title, "summary": args.content or ""}
        
        post = manager.generate_linkedin_post(news_item, style=args.style)
        
        print("\n" + "="*60)
        print(f"📱 GENERATED POST ({args.style.upper()})")
        print("="*60)
        print(post)
        print("="*60)
        print(f"Karakters: {len(post)}")
    
    elif args.action == "test":
        print("🧪 Testing Notion connection...")
        try:
            # Test door een simpele API call
            user = manager.client.users.me()
            print(f"✅ Connected as: {user.get('name', 'Unknown')}")
            print(f"✅ News DB: {manager.config.NEWS_DATABASE_ID}")
            print(f"✅ Drafts DB: {manager.config.DRAFTS_DATABASE_ID}")
        except Exception as e:
            print(f"❌ Connection failed: {e}")


if __name__ == "__main__":
    main()
