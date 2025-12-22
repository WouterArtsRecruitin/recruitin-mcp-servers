#!/usr/bin/env python3
"""
CV Parser MCP Server
Recruitin B.V. | December 2024

Parse Dolly Gas CVs en match tegen JobDigger vacatures
"""

import json
import re
import os
import base64
from typing import Optional, List, Dict, Any
from enum import Enum

from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, ConfigDict
import httpx

# =============================================================================
# SERVER INITIALIZATION
# =============================================================================

mcp = FastMCP("cv_parser_mcp")

# HuggingFace API config
HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
HF_TOKEN = os.environ.get('HF_TOKEN', '')

# =============================================================================
# TAXONOMIES & CONFIG
# =============================================================================

TITLE_TAXONOMY = {
    'elektromonteur': ['elektromonteur', 'e-monteur', 'elektrisch monteur', 'elektricien', 'e&i monteur', 'electrical'],
    'servicemonteur': ['servicemonteur', 'service engineer', 'field service', 'buitendienstmonteur', 'storingsmonteur'],
    'werkvoorbereider': ['werkvoorbereider', 'werkvoorbereiding', 'work planner', 'technisch planner'],
    'projectleider': ['projectleider', 'project manager', 'projectmanager', 'uitvoerder', 'project lead'],
    'monteur': ['monteur', 'technicus', 'mechanic', 'fitter', 'mechanisch monteur'],
    'engineer': ['engineer', 'ingenieur', 'technisch specialist', 'design engineer'],
    'operator': ['operator', 'machinist', 'procesoperator', 'productiemedewerker'],
    'lasser': ['lasser', 'welder', 'constructiebankwerker', 'pijpfitter'],
    'cnc': ['cnc', 'draaier', 'frezer', 'verspaner', 'cnc operator'],
    'plc': ['plc', 'programmeur', 'automatisering', 'software engineer', 'controls']
}

SKILL_KEYWORDS = {
    'elektro': ['elektro', 'elektrisch', 'e&i', 'laagspanning', 'hoogspanning', 'schakelaar', 'kabel', 'installatie'],
    'mechanisch': ['mechanisch', 'montage', 'onderhoud', 'hydrauliek', 'pneumatiek', 'lagers', 'aandrijving'],
    'lassen': ['lassen', 'tig', 'mig', 'mag', 'elektrode', 'constructie', 'staal', 'rvs'],
    'plc': ['plc', 'siemens', 'allen bradley', 'tia portal', 'step 7', 'scada', 'hmi', 'programmeren'],
    'service': ['storing', 'service', 'onderhoud', 'reparatie', 'diagnose', 'troubleshoot'],
    'projecten': ['project', 'planning', 'coordinatie', 'aansturing', 'oplevering', 'budget'],
    'proces': ['proces', 'productie', 'operator', 'batch', 'continu', 'kwaliteit'],
    'technisch_tekenen': ['autocad', 'solidworks', 'inventor', 'tekening', 'cad', '3d', 'engineering']
}

GELDERLAND_CITIES = [
    'arnhem', 'nijmegen', 'apeldoorn', 'ede', 'doetinchem', 'harderwijk',
    'ermelo', 'tiel', 'wageningen', 'barneveld', 'zutphen', 'nijkerk',
    'velp', 'zevenaar', 'winterswijk', 'culemborg', 'elburg', 'putten',
    'nunspeet', 'hattem', 'elst', 'bemmel', 'duiven', 'westervoort'
]

ADJACENT_CITIES = [
    'almere', 'amersfoort', 'utrecht', 'hilversum', 'deventer', 'zwolle',
    'bunschoten', 'leusden', 'veenendaal', 'rhenen', 'houten', 'nieuwegein'
]

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class ResponseFormat(str, Enum):
    MARKDOWN = "markdown"
    JSON = "json"

class ParseCVInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    cv_text: str = Field(..., description="Plain text content van het CV", min_length=50)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

class MatchCVInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    cv_text: str = Field(..., description="Plain text content van het CV", min_length=50)
    vacatures: List[Dict[str, Any]] = Field(..., description="Lijst van vacatures", min_length=1)
    limit: int = Field(default=10, ge=1, le=50)
    response_format: ResponseFormat = Field(default=ResponseFormat.MARKDOWN)

class SemanticMatchInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    text1: str = Field(..., description="Eerste tekst", min_length=10)
    text2: str = Field(..., description="Tweede tekst", min_length=10)

class ExtractSkillsInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    cv_text: str = Field(..., description="CV tekst", min_length=50)
    response_format: ResponseFormat = Field(default=ResponseFormat.JSON)

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def extract_name(text: str) -> str:
    lines = text.strip().split('\n')
    for line in lines[:8]:
        line = line.strip()
        if not line or len(line) < 4:
            continue
        if any(skip in line.lower() for skip in ['curriculum', 'cv', 'resume', 'profiel', 'pagina']):
            continue
        words = line.split()
        if 2 <= len(words) <= 4:
            alpha_words = [w for w in words if w.replace('-', '').replace("'", '').replace('.', '').isalpha()]
            if len(alpha_words) >= 2:
                return ' '.join(alpha_words)
    return "Onbekend"

def extract_email(text: str) -> str:
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else ""

def extract_phone(text: str) -> str:
    patterns = [r'06[-\s]?\d{2}[-\s]?\d{2}[-\s]?\d{2}[-\s]?\d{2}', r'06[-\s]?\d{8}', r'\+31[-\s]?6[-\s]?\d{8}']
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return re.sub(r'[-\s]', '', match.group(0))
    return ""

def extract_location(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    for city in GELDERLAND_CITIES:
        if city in text_lower:
            return {'city': city.title(), 'region': 'Gelderland', 'score': 95}
    for city in ADJACENT_CITIES:
        if city in text_lower:
            return {'city': city.title(), 'region': 'Adjacent', 'score': 80}
    other = ['amsterdam', 'rotterdam', 'den haag', 'eindhoven', 'tilburg']
    for city in other:
        if city in text_lower:
            return {'city': city.title(), 'region': 'Randstad', 'score': 60}
    return {'city': 'Onbekend', 'region': 'Unknown', 'score': 50}

def extract_function(text: str) -> str:
    text_lower = text.lower()
    for category, keywords in TITLE_TAXONOMY.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category.replace('_', ' ').title()
    return "Technisch"

def extract_skills(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    scores = {}
    for skill, keywords in SKILL_KEYWORDS.items():
        count = sum(1 for kw in keywords if kw in text_lower)
        scores[skill] = min(count * 15, 100)
    sorted_skills = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_skills = [s[0] for s in sorted_skills if s[1] > 0][:3]
    return {
        'primary': sorted_skills[0][0] if sorted_skills[0][1] > 0 else None,
        'primary_score': sorted_skills[0][1],
        'secondary': sorted_skills[1][0] if len(sorted_skills) > 1 and sorted_skills[1][1] > 0 else None,
        'secondary_score': sorted_skills[1][1] if len(sorted_skills) > 1 else 0,
        'top_skills': top_skills,
        'all_scores': dict(sorted_skills)
    }

def extract_years(text: str) -> int:
    patterns = [r'(\d+)\+?\s*jaar\s*ervaring', r'(\d+)\+?\s*years?\s*experience']
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return min(int(match.group(1)), 40)
    years = re.findall(r'(19[89]\d|20[0-2]\d)', text)
    if len(years) >= 2:
        years_int = [int(y) for y in years]
        return min(max(years_int) - min(years_int), 40)
    return 5

def match_title(cv_function: str, vacancy_title: str) -> int:
    cv_lower = cv_function.lower()
    vac_lower = vacancy_title.lower()
    if cv_lower in vac_lower or vac_lower in cv_lower:
        return 100
    cv_cat = None
    vac_cat = None
    for category, keywords in TITLE_TAXONOMY.items():
        if any(kw in cv_lower for kw in keywords):
            cv_cat = category
        if any(kw in vac_lower for kw in keywords):
            vac_cat = category
    if cv_cat and vac_cat:
        if cv_cat == vac_cat:
            return 90
        related = {
            ('elektromonteur', 'servicemonteur'): 75,
            ('monteur', 'servicemonteur'): 80,
            ('monteur', 'elektromonteur'): 70,
        }
        pair = tuple(sorted([cv_cat, vac_cat]))
        if pair in related:
            return related[pair]
    return 40

def match_location(cv_loc: Dict, vac_loc: str) -> int:
    if not vac_loc:
        return 70
    vac_lower = vac_loc.lower()
    cv_city = cv_loc.get('city', '').lower()
    cv_region = cv_loc.get('region', '')
    if cv_city and cv_city in vac_lower:
        return 100
    if cv_region == 'Gelderland':
        if any(city in vac_lower for city in GELDERLAND_CITIES):
            return 90
        if any(city in vac_lower for city in ADJACENT_CITIES):
            return 75
    return 50

async def hf_semantic_match(text1: str, text2: str) -> float:
    headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                HF_API_URL,
                headers=headers,
                json={"inputs": {"source_sentence": text1[:1000], "sentences": [text2[:1000]]}}
            )
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return float(result[0])
            return 0.5
        except Exception:
            return 0.5

# =============================================================================
# MCP TOOLS
# =============================================================================

@mcp.tool(name="parse_cv")
async def parse_cv(params: ParseCVInput) -> str:
    """Parse CV tekst en extract kandidaat informatie."""
    text = params.cv_text
    kandidaat = {
        'naam': extract_name(text),
        'email': extract_email(text),
        'telefoon': extract_phone(text),
        'locatie': extract_location(text),
        'functie': extract_function(text),
        'ervaring_jaren': extract_years(text),
        'skills': extract_skills(text)
    }
    if params.response_format == ResponseFormat.JSON:
        return json.dumps(kandidaat, indent=2, ensure_ascii=False)
    skills = kandidaat['skills']
    return f"""## Kandidaat Profiel

| Veld | Waarde |
|------|--------|
| **Naam** | {kandidaat['naam']} |
| **Email** | {kandidaat['email'] or '-'} |
| **Telefoon** | {kandidaat['telefoon'] or '-'} |
| **Locatie** | {kandidaat['locatie']['city']} ({kandidaat['locatie']['region']}) |
| **Functie** | {kandidaat['functie']} |
| **Ervaring** | {kandidaat['ervaring_jaren']} jaar |

### Top Skills
- **{skills['primary']}**: {skills['primary_score']}%
- **{skills['secondary']}**: {skills['secondary_score']}%
"""

@mcp.tool(name="match_cv_to_vacancies")
async def match_cv_to_vacancies(params: MatchCVInput) -> str:
    """Match CV tegen vacatures en geef ranked resultaten."""
    text = params.cv_text
    cv_function = extract_function(text)
    cv_location = extract_location(text)
    results = []
    for vac in params.vacatures:
        vac_title = str(vac.get('vacature', vac.get('Vacature', '')))
        vac_company = str(vac.get('bedrijf', vac.get('Bedrijfsnaam', '')))
        vac_plaats = str(vac.get('plaats', vac.get('Plaats', '')))
        if not vac_title:
            continue
        title_score = match_title(cv_function, vac_title)
        location_score = match_location(cv_location, vac_plaats)
        total = int(title_score * 0.6 + location_score * 0.4)
        tier = 'TIER1' if total >= 80 else ('TIER2' if total >= 60 else 'TIER3')
        results.append({
            'bedrijf': vac_company, 'vacature': vac_title, 'plaats': vac_plaats,
            'title_match': title_score, 'location_match': location_score,
            'total_score': total, 'tier': tier
        })
    results = sorted(results, key=lambda x: x['total_score'], reverse=True)[:params.limit]
    if params.response_format == ResponseFormat.JSON:
        return json.dumps({
            'kandidaat_functie': cv_function, 'kandidaat_locatie': cv_location,
            'matches': results,
            'tier1_count': len([r for r in results if r['tier'] == 'TIER1']),
            'tier2_count': len([r for r in results if r['tier'] == 'TIER2'])
        }, indent=2, ensure_ascii=False)
    lines = [f"## CV Matches\n\n**Kandidaat:** {cv_function} | {cv_location['city']}\n"]
    lines.append("| # | Bedrijf | Vacature | Score | Tier |")
    lines.append("|---|---------|----------|-------|------|")
    for i, m in enumerate(results, 1):
        lines.append(f"| {i} | {m['bedrijf'][:25]} | {m['vacature'][:25]} | {m['total_score']} | {m['tier']} |")
    return '\n'.join(lines)

@mcp.tool(name="semantic_match")
async def semantic_match(params: SemanticMatchInput) -> str:
    """Bereken semantic similarity via HuggingFace API."""
    score = await hf_semantic_match(params.text1, params.text2)
    interpretation = "Zeer sterk" if score >= 0.8 else "Sterk" if score >= 0.6 else "Matig" if score >= 0.4 else "Zwak"
    return json.dumps({'similarity_score': round(score, 4), 'interpretation': interpretation}, indent=2)

@mcp.tool(name="extract_skills")
async def extract_skills_tool(params: ExtractSkillsInput) -> str:
    """Extract en score skills uit CV tekst."""
    skills = extract_skills(params.cv_text)
    if params.response_format == ResponseFormat.JSON:
        return json.dumps(skills, indent=2, ensure_ascii=False)
    lines = ["## Skill Analyse\n"]
    for skill, score in skills['all_scores'].items():
        bar = '█' * (score // 10) + '░' * (10 - score // 10)
        lines.append(f"- **{skill}**: {bar} {score}%")
    return '\n'.join(lines)

if __name__ == "__main__":
    mcp.run()
