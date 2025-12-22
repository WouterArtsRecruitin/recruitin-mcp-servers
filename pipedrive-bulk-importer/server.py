#!/usr/bin/env python3
"""
Pipedrive Bulk Importer MCP Server
Imports Google Sheets data into Pipedrive with smart deduplication
"""

import os
import sys
import json
import time
import uuid
import asyncio
import csv
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import requests

# MCP SDK
try:
    from mcp.server import Server
    from mcp.types import Tool, TextContent
except ImportError:
    print("Installing MCP SDK...")
    os.system("pip install mcp --break-system-packages")
    from mcp.server import Server
    from mcp.types import Tool, TextContent

# =============================================================================
# CONFIGURATION
# =============================================================================

PIPEDRIVE_API_KEY = os.getenv('PIPEDRIVE_API_KEY')
PIPEDRIVE_BASE_URL = 'https://api.pipedrive.com/v1'

DEFAULT_PIPELINE_ID = 14  # Corporate Recruiter Outreach
DEFAULT_STAGE_ID = 95     # lead

# Add support for multiple pipelines
PIPELINE_CONFIGS = {
    'corporate_recruiter': {'pipeline_id': 14, 'stage_id': 95},
    'tech_recruitment': {'pipeline_id': 15, 'stage_id': 101},  # Update na duplicatie
    # Voeg meer pipelines toe indien nodig
}

CUSTOM_FIELDS = {
    'vacature_titel': '4fe89b5e450089a5dd5168e92fe69bb98463f4f6',
    'locatie': '185eed88f971fcf8d8016ae96f38704fe4328f4f',
    'contact_phone': '3e1261a7fcfdc6f32a577a7f5ff2cd6c9cabc8b8',  # Apollo: Contact Phone
    'contact_mobile': '2051080203010bc23578cdebba765896c33656a1',  # Apollo: Contact Mobile
    
    # Loop Prevention Fields
    'initial_email_sent': '4f00de2668d5f88b617be4042e27dc95bdf71571',
    'automation_sequence_status': 'a0914d605246972b59b7a91db7f5eaf8f638af11',
    'last_email_sent_date': '8a2b3d3eac5652cbb2401654d5c46053946a5ac7',
    
    # Extra JobDigger fields (zou custom field IDs nodig hebben):
    # 'vacature_url': 'custom_field_id_here',     # Kolom O
    # 'datum_gevonden': 'custom_field_id_here',   # Kolom P  
    # 'via_bemiddelaar': 'custom_field_id_here',  # Kolom Q
}

RATE_LIMIT_DELAY = 0.2

# In-memory job storage (in production: use Redis/DB)
import_jobs: Dict[str, Dict] = {}

# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class ValidationError:
    row_number: int
    field: str
    error: str
    value: Any

@dataclass
class ImportResult:
    job_id: str
    success: bool
    orgs_created: int
    persons_created: int
    deals_created: int
    errors: List[Dict]
    duration_seconds: float
    timestamp: str

# =============================================================================
# PIPEDRIVE API CLIENT
# =============================================================================

class PipedriveClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = PIPEDRIVE_BASE_URL
        self.session = requests.Session()
        self.org_cache: Dict[str, int] = {}
        self.person_cache: Dict[str, int] = {}
    
    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        url = f"{self.base_url}/{endpoint}"
        params = {'api_token': self.api_key}
        time.sleep(RATE_LIMIT_DELAY)
        
        if method == 'GET':
            response = self.session.get(url, params=params)
        elif method == 'POST':
            response = self.session.post(url, params=params, json=data)
        elif method == 'PUT':
            response = self.session.put(url, params=params, json=data)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        try:
            response.raise_for_status()
            return response.json()
        except Exception as e:
            # Only print API errors for non-search related errors
            if "querystring must have required property 'term'" not in response.text:
                print(f"API Error details: {response.text}")
            raise
    
    def find_organization(self, name: str) -> Optional[int]:
        if name in self.org_cache:
            return self.org_cache[name]
        
        try:
            result = self._request('GET', 'organizations/search', {'term': name})
            if result.get('data') and result['data'].get('items'):
                for item in result['data']['items']:
                    if item['item']['name'].lower() == name.lower():
                        org_id = item['item']['id']
                        self.org_cache[name] = org_id
                        return org_id
        except Exception:
            pass
        return None
    
    def create_organization(self, name: str, address: str) -> Optional[int]:
        existing_id = self.find_organization(name)
        if existing_id:
            return existing_id
        
        try:
            data = {'name': name, 'address': address}
            result = self._request('POST', 'organizations', data)
            org_id = result['data']['id']
            self.org_cache[name] = org_id
            return org_id
        except Exception as e:
            print(f"Error creating org '{name}': {e}")
            return None
    
    def find_person(self, email: str) -> Optional[int]:
        if email in self.person_cache:
            return self.person_cache[email]
        
        try:
            result = self._request('GET', 'persons/search', {'term': email, 'fields': 'email'})
            if result.get('data') and result['data'].get('items'):
                for item in result['data']['items']:
                    person_emails = item['item'].get('emails', [])
                    if any(e.lower() == email.lower() for e in person_emails):
                        person_id = item['item']['id']
                        self.person_cache[email] = person_id
                        return person_id
        except Exception:
            pass
        return None
    
    def create_person(self, name: str, email: str, phone: str, function: str, org_id: int) -> Optional[int]:
        existing_id = self.find_person(email)
        if existing_id:
            return existing_id
        
        try:
            data = {
                'name': name,
                'email': [email],
                'phone': [phone] if phone else [],
                'org_id': org_id,
                # Note: functie field removed as it's not valid for persons in this setup
            }
            result = self._request('POST', 'persons', data)
            person_id = result['data']['id']
            self.person_cache[email] = person_id
            return person_id
        except Exception as e:
            print(f"Error creating person '{name}': {e}")
            return None
    
    def create_deal(self, title: str, org_id: int, person_id: Optional[int] = None, 
                   value: int = 15000, pipeline_id: int = DEFAULT_PIPELINE_ID, 
                   stage_id: int = DEFAULT_STAGE_ID, custom_fields: Optional[Dict] = None,
                   skip_automation: bool = True) -> Optional[int]:
        try:
            # Start with minimal required data
            data = {
                'title': title,
                'org_id': org_id,
                'pipeline_id': pipeline_id,
                'stage_id': stage_id,
            }
            
            # Add optional fields only if they have values
            if person_id:
                data['person_id'] = person_id
            if value and value > 0:
                data['value'] = value
                
            # Add custom fields if provided - but test each one
            if custom_fields:
                for field, field_value in custom_fields.items():
                    if field in CUSTOM_FIELDS and field_value:
                        clean_value = str(field_value).strip()
                        if clean_value and len(clean_value) <= 255:  # Pipedrive field limit
                            data[CUSTOM_FIELDS[field]] = clean_value
                            # print(f"Adding custom field {field}: {clean_value}")  # Debug - commented
            
            # Add loop prevention fields tijdens import
            if skip_automation:
                # Set default values to prevent automation loops
                data[CUSTOM_FIELDS['initial_email_sent']] = 'No'
                data[CUSTOM_FIELDS['automation_sequence_status']] = 'not_started'
            # print(f"Creating deal with data: {data}")  # Debug - commented out for cleaner output
            result = self._request('POST', 'deals', data)
            return result['data']['id']
        except Exception as e:
            print(f"Error creating deal '{title}': {e}")
            print(f"Deal data was: {data}")  # Debug
            # Try to get more error details
            if hasattr(e, 'response') and e.response:
                try:
                    error_details = e.response.json()
                    print(f"API Error details: {error_details}")
                except:
                    print(f"Response text: {e.response.text}")
            return None

# =============================================================================
# GOOGLE SHEETS INTEGRATION (via Zapier MCP)
# =============================================================================

async def fetch_google_sheet_data(spreadsheet_id: str, worksheet_name: str, 
                                  max_rows: Optional[int] = None) -> List[List[str]]:
    """
    Fetch data from Google Sheets using multiple URL approaches
    """
    import requests
    import csv
    import io
    
    print(f"🔄 Fetching Google Sheet data...")
    print(f"   Spreadsheet: {spreadsheet_id}")
    print(f"   Worksheet: {worksheet_name}")
    
    # Try multiple URL formats for Google Sheets access
    urls_to_try = [
        f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv",
        f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv&gid=0",
        f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/gviz/tq?tqx=out:csv",
        f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/gviz/tq?tqx=out:csv&gid=0"
    ]
    
    for i, csv_url in enumerate(urls_to_try, 1):
        try:
            print(f"   🔄 Attempt {i}/{len(urls_to_try)}: {csv_url[:60]}...")
            
            # Use session with headers to mimic browser request
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })
            
            response = session.get(csv_url, timeout=10, allow_redirects=True)
            response.raise_for_status()
            
            # Check if response contains valid CSV data (not HTML error page)
            if response.text.strip().startswith('<HTML>') or '<TITLE>' in response.text:
                print(f"   ❌ Attempt {i}: Got HTML redirect/error page")
                continue
            
            # Parse CSV data
            csv_data = []
            reader = csv.reader(io.StringIO(response.text))
            
            for row_idx, row in enumerate(reader):
                if max_rows and row_idx >= max_rows + 1:  # +1 for header
                    break
                # Clean empty strings and strip whitespace
                clean_row = [cell.strip() for cell in row]
                csv_data.append(clean_row)
            
            if len(csv_data) > 1:  # Has header + data
                print(f"   ✅ Success! Fetched {len(csv_data)-1} data rows (+ header)")
                return csv_data
            else:
                print(f"   ❌ Attempt {i}: No data found")
                continue
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Attempt {i}: Request failed - {e}")
            continue
        except Exception as e:
            print(f"   ❌ Attempt {i}: Parse error - {e}")
            continue
    
    # All attempts failed
    print(f"❌ All attempts failed to access Google Sheet")
    print(f"📋 Troubleshooting options:")
    print(f"   1. Make sheet public: Share → Change to 'Anyone with the link'")
    print(f"   2. Download as CSV: File → Download → Comma-separated values (.csv)")
    print(f"   3. Use import_from_csv with downloaded file")
    
    # Return sample header for JobDigger data structure
    return [
        ['id', 'deal_titel', 'bedrijfsnaam', 'functietitel', 'voornaam', 'achternaam', 'email', 
         'telefoon', 'functie_contact', 'extra_info', 'stad', 'provincie', 'postcode']
    ]

# =============================================================================
# VALIDATION
# =============================================================================

def validate_row(row: List[str], row_num: int) -> List[ValidationError]:
    """Validate a single row for JobDigger Google Sheets data"""
    errors = []
    
    # CORRECTE Google Sheets data structure:
    # 0: rij_nummer, 1: deal_titel (NEGEREN), 2: bedrijfsnaam, 3: functietitel, 4: voornaam,
    # 5: achternaam, 6: email, 7: telefoon, 8: functie_contact, 9: website, 10: stad,
    # 11: provincie, 12: postcode, 13: vacature_url, 14: datum_gevonden, 15: via_bemiddelaar
    
    # Check minimum required columns (at least 7 for basic data)
    if len(row) < 7:
        errors.append(ValidationError(row_num, 'columns', 'Missing columns', len(row)))
        return errors  # Can't validate further without minimum columns
    
    # Check required fields
    if not row[2].strip():  # bedrijfsnaam (kolom C)
        errors.append(ValidationError(row_num, 'bedrijfsnaam', 'Empty', None))
    if not row[6].strip():  # email (kolom G)
        errors.append(ValidationError(row_num, 'email', 'Empty', None))
    elif '@' not in row[6]:
        errors.append(ValidationError(row_num, 'email', 'Invalid format', row[6]))
    
    return errors

async def validate_sheet_data(spreadsheet_id: str, worksheet_name: str, 
                              max_rows: Optional[int]) -> Dict:
    """Validate entire sheet"""
    data = await fetch_google_sheet_data(spreadsheet_id, worksheet_name, max_rows)
    
    all_errors = []
    valid_count = 0
    
    for idx, row in enumerate(data[1:], start=2):  # Skip header
        errors = validate_row(row, idx)
        if errors:
            all_errors.extend([asdict(e) for e in errors])
        else:
            valid_count += 1
    
    return {
        'total_rows': len(data) - 1,
        'valid_rows': valid_count,
        'invalid_rows': len(all_errors),
        'errors': all_errors[:50]  # Return max 50 errors
    }

# =============================================================================
# IMPORT LOGIC
# =============================================================================

async def do_import(spreadsheet_id: str, worksheet_name: str, 
                   max_rows: Optional[int], skip_invalid: bool, 
                   test_mode: bool) -> ImportResult:
    """Perform the actual import"""
    
    job_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    # Fetch data
    data = await fetch_google_sheet_data(spreadsheet_id, worksheet_name, max_rows)
    
    # Initialize client
    client = PipedriveClient(PIPEDRIVE_API_KEY)
    
    stats = {
        'orgs_created': 0,
        'persons_created': 0,
        'deals_created': 0,
        'errors': []
    }
    
    # Process rows
    for idx, row in enumerate(data[1:], start=2):  # Skip header
        # Validate
        errors = validate_row(row, idx)
        if errors:
            if skip_invalid:
                stats['errors'].append({'row': idx, 'errors': [asdict(e) for e in errors]})
                continue
            else:
                break
        
        # Parse row - CORRECTE JobDigger data structuur
        # 0: rij_nummer, 1: deal_titel (NEGEREN), 2: bedrijfsnaam, 3: functietitel, 4: voornaam,
        # 5: achternaam, 6: email, 7: telefoon, 8: functie_contact, 9: website, 10: stad,
        # 11: provincie, 12: postcode, 13: vacature_url, 14: datum_gevonden, 15: via_bemiddelaar
        
        bedrijfsnaam = row[2].strip()  # Kolom B -> bedrijfsnaam
        functietitel = row[3].strip()  # Kolom C -> functietitel
        voornaam = row[4].strip()
        achternaam = row[5].strip()
        naam = f"{voornaam} {achternaam}".strip()
        email = row[6].strip()
        telefoon = row[7].strip() if len(row) > 7 else ''
        functie_contact = row[8].strip() if len(row) > 8 else ''
        
        stad = row[10].strip() if len(row) > 10 else ''
        provincie = row[11].strip() if len(row) > 11 else ''
        postcode = row[12].strip() if len(row) > 12 else ''
        address = f"{stad}, {provincie} {postcode}".strip()
        
        # Deal information - GECORRIGEERD (Optie C)
        if functietitel:
            deal_titel = f"{bedrijfsnaam} - {functietitel}"
        else:
            deal_titel = f"Recruitment - {bedrijfsnaam}"
        
        locatie = f"{stad}, {provincie}".strip(', ')
        
        # Create org
        org_id = client.create_organization(bedrijfsnaam, address)
        if not org_id:
            stats['errors'].append({'row': idx, 'error': 'Failed to create org'})
            continue
        stats['orgs_created'] += 1
        
        # Create person
        person_id = client.create_person(naam, email, telefoon, functie_contact, org_id)
        if not person_id:
            stats['errors'].append({'row': idx, 'error': 'Failed to create person'})
            continue
        stats['persons_created'] += 1
        
        # Create deal
        deal_id = client.create_deal(
            deal_titel, 
            org_id, 
            person_id, 
            15000, 
            DEFAULT_PIPELINE_ID, 
            DEFAULT_STAGE_ID,
            {
                'vacature_titel': functietitel,
                'locatie': locatie,
                'contact_phone': telefoon,  # Add phone to deal
            }
        )
        if not deal_id:
            stats['errors'].append({'row': idx, 'error': 'Failed to create deal'})
            continue
        stats['deals_created'] += 1
    
    duration = time.time() - start_time
    
    result = ImportResult(
        job_id=job_id,
        success=len(stats['errors']) == 0,
        orgs_created=stats['orgs_created'],
        persons_created=stats['persons_created'],
        deals_created=stats['deals_created'],
        errors=stats['errors'],
        duration_seconds=round(duration, 2),
        timestamp=datetime.now().isoformat()
    )
    
    # Store job
    import_jobs[job_id] = asdict(result)
    
    return result

# =============================================================================
# CSV HELPER FUNCTIONS
# =============================================================================

def parse_csv(filepath: str, delimiter: str = ';', encoding: str = 'utf-8', max_rows: Optional[int] = None) -> List[Dict]:
    """Parse CSV file into list of dictionaries"""
    rows = []
    try:
        with open(filepath, 'r', encoding=encoding) as f:
            # Handle BOM
            first_char = f.read(1)
            if first_char != '\ufeff':
                f.seek(0)
            
            reader = csv.DictReader(f, delimiter=delimiter)
            for i, row in enumerate(reader, 1):
                if max_rows and i > max_rows:
                    break
                # Clean empty strings
                cleaned_row = {k: v.strip() if v else '' for k, v in row.items()}
                rows.append(cleaned_row)
        return rows
    except FileNotFoundError:
        raise Exception(f"CSV file not found: {filepath}")
    except Exception as e:
        raise Exception(f"Failed to parse CSV: {str(e)}")

def normalize_org_name(name: str) -> str:
    """Normalize organization name for deduplication"""
    if not name:
        return ''
    name = name.lower().strip()
    suffixes = [' b.v.', ' bv', ' n.v.', ' nv', ' b.v', ' n.v']
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    return name.strip()

def validate_csv_row(row: Dict, required_fields: List[str] = None) -> Tuple[bool, Optional[str]]:
    """Validate a CSV row has required fields"""
    if required_fields is None:
        required_fields = ['bedrijfsnaam', 'deal_titel']
    
    for field in required_fields:
        if not row.get(field) or not row[field].strip():
            return False, f"Missing required field: {field}"
    return True, None

def map_csv_to_pipedrive(row: Dict) -> Dict:
    """Map CSV columns to Pipedrive format"""
    return {
        'bedrijfsnaam': row.get('bedrijfsnaam', '').strip(),
        'deal_titel': row.get('deal_titel', '').strip(),
        'locatie': row.get('stad', '').strip(),  # JobDigger uses 'stad' 
        'vacature_titel': row.get('functietitel', '').strip(),  # JobDigger uses 'functietitel'
        'functie': row.get('functie_contact', '').strip(),  # JobDigger uses 'functie_contact'
        'contactpersoon': (row.get('voornaam', '') + ' ' + row.get('achternaam', '')).strip(),
        'email': row.get('email', '').strip(),
        'telefoon': row.get('telefoon', '').strip(),
        'deal_value': row.get('deal_value', '15000'),
        'address': row.get('stad', '').strip()  # Use stad as address
    }

async def import_from_csv(filepath: str, max_rows: Optional[int] = None, 
                         pipeline_id: int = DEFAULT_PIPELINE_ID,
                         stage_id: int = DEFAULT_STAGE_ID) -> ImportResult:
    """Import data from CSV file into Pipedrive"""
    
    if not PIPEDRIVE_API_KEY:
        raise Exception("PIPEDRIVE_API_KEY not configured")
    
    start_time = time.time()
    job_id = str(uuid.uuid4())
    
    try:
        # Parse CSV
        csv_data = parse_csv(filepath, max_rows=max_rows)
        if not csv_data:
            raise Exception("No data found in CSV file")
        
        # Initialize counters
        orgs_created = 0
        persons_created = 0
        deals_created = 0
        errors = []
        
        client = PipedriveClient(PIPEDRIVE_API_KEY)
        
        # Process each row
        for i, row in enumerate(csv_data, 1):
            try:
                # Validate row
                is_valid, error_msg = validate_csv_row(row)
                if not is_valid:
                    errors.append({
                        'row': i,
                        'error': error_msg,
                        'data': row
                    })
                    continue
                
                # Map to Pipedrive format
                mapped_data = map_csv_to_pipedrive(row)
                
                # Create/find organization
                org_id = client.find_organization(mapped_data['bedrijfsnaam'])
                if not org_id:
                    org_id = client.create_organization(
                        mapped_data['bedrijfsnaam'], 
                        mapped_data['address']
                    )
                    if org_id:
                        orgs_created += 1
                
                # Create/find person
                person_id = None
                if mapped_data['email']:
                    person_id = client.find_person(mapped_data['email'])
                    if not person_id and org_id:
                        person_id = client.create_person(
                            mapped_data['contactpersoon'] or 'Unknown',
                            mapped_data['email'],
                            mapped_data['telefoon'],
                            mapped_data['functie'],
                            org_id
                        )
                        if person_id:
                            persons_created += 1
                
                # Create deal
                if org_id:
                    deal_id = client.create_deal(
                        mapped_data['deal_titel'],
                        org_id,
                        person_id,
                        int(mapped_data['deal_value']),
                        pipeline_id,
                        stage_id,
                        {
                            'vacature_titel': mapped_data['vacature_titel'],
                            'locatie': mapped_data['locatie'],
                            'contact_phone': mapped_data['telefoon']  # Add phone to deal
                        }
                    )
                    if deal_id:
                        deals_created += 1
                
            except Exception as e:
                errors.append({
                    'row': i,
                    'error': str(e),
                    'data': row
                })
        
        duration = time.time() - start_time
        
        result = ImportResult(
            job_id=job_id,
            success=len(errors) == 0,
            orgs_created=orgs_created,
            persons_created=persons_created,
            deals_created=deals_created,
            errors=errors,
            duration_seconds=duration,
            timestamp=datetime.now().isoformat()
        )
        
        # Store result
        import_jobs[job_id] = asdict(result)
        
        return result
        
    except Exception as e:
        duration = time.time() - start_time
        result = ImportResult(
            job_id=job_id,
            success=False,
            orgs_created=0,
            persons_created=0,
            deals_created=0,
            errors=[{'error': str(e)}],
            duration_seconds=duration,
            timestamp=datetime.now().isoformat()
        )
        import_jobs[job_id] = asdict(result)
        return result

# =============================================================================
# MCP SERVER
# =============================================================================

app = Server("pipedrive-bulk-importer")

@app.list_tools()
async def list_tools() -> List[Tool]:
    """List available tools"""
    return [
        Tool(
            name="import_from_google_sheet",
            description="Import Google Sheets data into Pipedrive with smart deduplication",
            inputSchema={
                "type": "object",
                "properties": {
                    "spreadsheet_id": {"type": "string"},
                    "worksheet_name": {"type": "string", "default": "Voor_Pipedrive"},
                    "max_rows": {"type": ["integer", "null"], "default": None},
                    "skip_invalid": {"type": "boolean", "default": True},
                    "test_mode": {"type": "boolean", "default": False}
                },
                "required": ["spreadsheet_id"]
            }
        ),
        Tool(
            name="validate_before_import",
            description="Validate sheet data before importing",
            inputSchema={
                "type": "object",
                "properties": {
                    "spreadsheet_id": {"type": "string"},
                    "worksheet_name": {"type": "string", "default": "Voor_Pipedrive"},
                    "max_rows": {"type": ["integer", "null"], "default": None}
                },
                "required": ["spreadsheet_id"]
            }
        ),
        Tool(
            name="import_from_csv",
            description="Import CSV file data into Pipedrive with smart deduplication",
            inputSchema={
                "type": "object",
                "properties": {
                    "filepath": {"type": "string"},
                    "max_rows": {"type": ["integer", "null"], "default": None},
                    "pipeline_id": {"type": "integer", "default": 14},
                    "stage_id": {"type": "integer", "default": 95}
                },
                "required": ["filepath"]
            }
        ),
        Tool(
            name="get_import_status",
            description="Get status of import job",
            inputSchema={
                "type": "object",
                "properties": {
                    "job_id": {"type": "string"}
                },
                "required": ["job_id"]
            }
        ),
        Tool(
            name="list_recent_imports",
            description="List recent import jobs",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "default": 10}
                }
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Dict) -> List[TextContent]:
    """Handle tool calls"""
    
    if name == "import_from_google_sheet":
        result = await do_import(
            arguments['spreadsheet_id'],
            arguments.get('worksheet_name', 'Voor_Pipedrive'),
            arguments.get('max_rows'),
            arguments.get('skip_invalid', True),
            arguments.get('test_mode', False)
        )
        
        response = {
            'job_id': result.job_id,
            'success': result.success,
            'statistics': {
                'organizations_created': result.orgs_created,
                'persons_created': result.persons_created,
                'deals_created': result.deals_created,
                'errors': len(result.errors)
            },
            'duration': f"{result.duration_seconds}s",
            'errors': result.errors[:10],  # Return max 10 errors
            'pipedrive_url': f"https://recruitin-b-v.pipedrive.com/pipeline/{DEFAULT_PIPELINE_ID}"
        }
        
        return [TextContent(type="text", text=json.dumps(response, indent=2))]
    
    elif name == "validate_before_import":
        result = await validate_sheet_data(
            arguments['spreadsheet_id'],
            arguments.get('worksheet_name', 'Voor_Pipedrive'),
            arguments.get('max_rows')
        )
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    elif name == "import_from_csv":
        result = await import_from_csv(
            arguments['filepath'],
            arguments.get('max_rows'),
            arguments.get('pipeline_id', DEFAULT_PIPELINE_ID),
            arguments.get('stage_id', DEFAULT_STAGE_ID)
        )
        
        response = {
            'job_id': result.job_id,
            'success': result.success,
            'orgs_created': result.orgs_created,
            'persons_created': result.persons_created,
            'deals_created': result.deals_created,
            'errors': result.errors,
            'duration_seconds': result.duration_seconds,
            'timestamp': result.timestamp
        }
        
        return [TextContent(type="text", text=json.dumps(response, indent=2))]
    
    elif name == "get_import_status":
        job = import_jobs.get(arguments['job_id'])
        if not job:
            return [TextContent(type="text", text=json.dumps({'error': 'Job not found'}))]
        return [TextContent(type="text", text=json.dumps(job, indent=2))]
    
    elif name == "list_recent_imports":
        limit = arguments.get('limit', 10)
        recent = list(import_jobs.values())[-limit:]
        return [TextContent(type="text", text=json.dumps(recent, indent=2))]
    
    else:
        return [TextContent(type="text", text=json.dumps({'error': f'Unknown tool: {name}'}))]

# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    import asyncio
    
    async def main():
        from mcp.server.stdio import stdio_server
        
        async with stdio_server() as (read_stream, write_stream):
            await app.run(
                read_stream,
                write_stream,
                app.create_initialization_options()
            )
    
    asyncio.run(main())
