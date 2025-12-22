#!/usr/bin/env python3
"""
Filter technical jobs to show only direct employers (no recruitment agencies)
and organize by region with complete details
"""

import csv
import re
from datetime import datetime

# Recruitment agencies and job boards to exclude
RECRUITMENT_AGENCIES = [
    'randstad', 'adecco', 'manpower', 'tempo-team', 'youngcapital',
    'yacht', 'brunel', 'usg people', 'olympia', 'start people',
    'indeed', 'jobbird', 'nationalevacaturebank', 'monsterboard',
    'technicum', 'continu professionals', 'intro personeel',
    'techniekwerkt', 'werkzoeken', 'uitzendbureau', 'detachering',
    'werving', 'selectie', 'interim', 'zzp', 'freelance',
    'linkedin', 'glassdoor', 'jooble', 'stepstone', 'jobrapido',
    'lumina', 'maatt', 'profmatch', 'euro planit', 'dosign',
    'aditech', 'technicus', 'intropersoneel', 'werkenbij',
    'vacaturebank', 'vacatures.nl', 'jobs.nl', 'werk.nl'
]

# Dutch regions
REGIONS = {
    'Randstad': ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Almere', 'Haarlem', 'Leiden', 'Delft', 'Zoetermeer'],
    'Noord-Holland': ['Amsterdam', 'Haarlem', 'Zaandam', 'Alkmaar', 'Hoofddorp', 'Purmerend', 'Hilversum'],
    'Zuid-Holland': ['Rotterdam', 'Den Haag', 'Delft', 'Dordrecht', 'Leiden', 'Zoetermeer', 'Gouda'],
    'Utrecht': ['Utrecht', 'Amersfoort', 'Nieuwegein', 'Veenendaal', 'Zeist'],
    'Noord-Brabant': ['Eindhoven', 'Tilburg', 'Breda', 'Den Bosch', 'Helmond', 'Oss', 'Roosendaal'],
    'Gelderland': ['Arnhem', 'Nijmegen', 'Apeldoorn', 'Ede', 'Wageningen', 'Velp', 'Oosterbeek', 'Zevenaar'],
    'Limburg': ['Maastricht', 'Venlo', 'Heerlen', 'Sittard', 'Roermond', 'Weert'],
    'Overijssel': ['Enschede', 'Zwolle', 'Deventer', 'Almelo', 'Hengelo'],
    'Groningen': ['Groningen', 'Assen', 'Emmen', 'Hoogezand'],
    'Friesland': ['Leeuwarden', 'Sneek', 'Drachten', 'Heerenveen'],
    'Zeeland': ['Middelburg', 'Vlissingen', 'Goes', 'Terneuzen'],
    'Flevoland': ['Almere', 'Lelystad', 'Dronten']
}

def is_recruitment_agency(company_name):
    """Check if company is a recruitment agency"""
    company_lower = company_name.lower()
    for agency in RECRUITMENT_AGENCIES:
        if agency in company_lower:
            return True
    return False

def get_region(location):
    """Determine region from location"""
    for region, cities in REGIONS.items():
        for city in cities:
            if city.lower() in location.lower():
                return region
    return 'Nederland'  # Default if no specific region found

def clean_company_name(company):
    """Clean up company name"""
    # Remove common suffixes
    company = re.sub(r'\s*\|.*$', '', company)
    company = re.sub(r'\s*-\s*(vacatures?|jobs?).*$', '', company, flags=re.IGNORECASE)
    company = re.sub(r'\s*(B\.V\.|BV|N\.V\.|NV)\.?$', '', company, flags=re.IGNORECASE)
    return company.strip()

def extract_direct_employers(input_file, output_file):
    """Extract only direct employer jobs from CSV"""

    direct_jobs = []

    # Read the CSV file
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                company = clean_company_name(row.get('Company', ''))

                # Skip recruitment agencies
                if is_recruitment_agency(company):
                    continue

                # Skip generic company names
                if company.lower() in ['nl', 'nederland', '...', 'indeed.com', 'glassdoor']:
                    continue

                # Get region
                location = row.get('Location', 'Nederland')
                region = get_region(location)

                # Create enhanced job entry
                job = {
                    'Vacature': row.get('Title', ''),
                    'Werkgever': company,
                    'Standplaats': location,
                    'Regio': region,
                    'Email': row.get('Email', ''),
                    'Telefoon': row.get('Phone', ''),
                    'Website': row.get('URL', ''),
                    'Keyword': row.get('Keyword', ''),
                    'Datum': row.get('Date Found', datetime.now().strftime('%Y-%m-%d'))
                }

                direct_jobs.append(job)

    except FileNotFoundError:
        print(f"Error: File {input_file} not found")
        return []

    # Remove duplicates based on URL
    seen_urls = set()
    unique_jobs = []
    for job in direct_jobs:
        if job['Website'] not in seen_urls:
            seen_urls.add(job['Website'])
            unique_jobs.append(job)

    # Sort by region and company
    unique_jobs.sort(key=lambda x: (x['Regio'], x['Werkgever']))

    # Write filtered results
    if unique_jobs:
        with open(output_file, 'w', encoding='utf-8', newline='') as file:
            fieldnames = ['Vacature', 'Werkgever', 'Standplaats', 'Regio', 'Email', 'Telefoon', 'Website', 'Keyword', 'Datum']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(unique_jobs)

        print(f"\n✅ Filtered Results:")
        print(f"- Total direct employer jobs: {len(unique_jobs)}")

        # Count by region
        regions_count = {}
        for job in unique_jobs:
            regions_count[job['Regio']] = regions_count.get(job['Regio'], 0) + 1

        print("\n📍 Jobs by Region:")
        for region in sorted(regions_count.keys()):
            print(f"  - {region}: {regions_count[region]} jobs")

        # Count unique companies
        companies = set(job['Werkgever'] for job in unique_jobs)
        print(f"\n🏢 Unique direct employers: {len(companies)}")

        # Show Gelderland (Arnhem region) jobs specifically
        arnhem_jobs = [job for job in unique_jobs if job['Regio'] == 'Gelderland']
        if arnhem_jobs:
            print(f"\n🎯 Gelderland/Arnhem Region Jobs ({len(arnhem_jobs)}):")
            for job in arnhem_jobs[:10]:  # Show first 10
                print(f"  - {job['Werkgever']}: {job['Vacature'][:50]}...")
                if job['Email']:
                    print(f"    📧 {job['Email']}")
                if job['Telefoon']:
                    print(f"    📞 {job['Telefoon']}")

        return unique_jobs
    else:
        print("No direct employer jobs found after filtering")
        return []

def main():
    input_file = '/Users/wouterarts/mcp-servers/reports/technical-jobs-2025-09-25.csv'
    output_file = '/Users/wouterarts/mcp-servers/reports/direct-employers-filtered-2025-09-25.csv'

    print("🔍 Filtering technical jobs for direct employers only...")
    print("🚫 Excluding all recruitment agencies and job boards...")

    jobs = extract_direct_employers(input_file, output_file)

    if jobs:
        # Also save to OneDrive
        onedrive_path = '/Users/wouterarts/Library/CloudStorage/OneDrive-Recruitin/Daily Recruitment trends report/direct-employers-filtered-2025-09-25.csv'
        import shutil
        shutil.copy(output_file, onedrive_path)
        print(f"\n📁 File saved to OneDrive: {onedrive_path}")

if __name__ == "__main__":
    main()