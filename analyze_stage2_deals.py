#!/usr/bin/env python3
"""
Analyze deals stuck in Stage 2 of Pipedrive pipeline
"""

import requests
import json
from datetime import datetime, timedelta
from collections import defaultdict
import time

# API Configuration
API_TOKEN = "57720aa8b264cb9060c9dd5af8ae0c096dbbebb5"
DOMAIN = "recruitinbv"
BASE_URL = f"https://{DOMAIN}.pipedrive.com/api/v1"

def make_api_request(endpoint, params=None):
    """Make an API request to Pipedrive"""
    url = f"{BASE_URL}/{endpoint}"
    if params is None:
        params = {}
    params['api_token'] = API_TOKEN
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

def get_all_stages():
    """Get all pipeline stages"""
    result = make_api_request("stages")
    if result and result.get('success'):
        return result.get('data', [])
    return []

def find_stage_2():
    """Find Stage 2 in the pipeline"""
    stages = get_all_stages()
    for stage in stages:
        if stage.get('order_nr') == 2 or 'stage 2' in stage.get('name', '').lower():
            return stage
    # If not found by order, look for the second stage by order number
    sorted_stages = sorted(stages, key=lambda x: x.get('order_nr', 0))
    if len(sorted_stages) >= 2:
        return sorted_stages[1]  # Return the second stage
    return None

def get_deals_in_stage(stage_id, limit=500):
    """Get all deals in a specific stage"""
    all_deals = []
    start = 0
    
    while True:
        result = make_api_request("deals", {
            'stage_id': stage_id,
            'status': 'open',
            'start': start,
            'limit': limit
        })
        
        if result and result.get('success'):
            deals = result.get('data', [])
            if not deals:
                break
            all_deals.extend(deals)
            
            # Check if there are more results
            additional_data = result.get('additional_data', {})
            pagination = additional_data.get('pagination', {})
            if not pagination.get('more_items_in_collection', False):
                break
            
            start = pagination.get('next_start', start + limit)
        else:
            break
    
    return all_deals

def get_deal_activities(deal_id):
    """Get activities for a specific deal"""
    try:
        result = make_api_request(f"deals/{deal_id}/activities")
        if result and result.get('success'):
            return result.get('data', [])
    except:
        pass
    return []

def get_deal_notes(deal_id):
    """Get notes for a specific deal"""
    try:
        result = make_api_request(f"deals/{deal_id}/notes")
        if result and result.get('success'):
            return result.get('data', [])
    except:
        pass
    return []

def analyze_deal(deal):
    """Analyze a single deal for issues"""
    issues = []
    
    # Basic deal info
    deal_id = deal.get('id')
    title = deal.get('title', 'No title')
    value = deal.get('value', 0)
    currency = deal.get('currency', 'EUR')
    
    # Check for missing critical fields
    if not deal.get('person_id'):
        issues.append("Missing contact person")
    
    if not deal.get('org_id'):
        issues.append("Missing organization")
    
    if not value or value == 0:
        issues.append("No deal value set")
    
    # Calculate deal age
    add_time = deal.get('add_time')
    if add_time:
        add_date = datetime.strptime(add_time, '%Y-%m-%d %H:%M:%S')
        age_days = (datetime.now() - add_date).days
    else:
        age_days = 0
    
    # Check last activity
    last_activity_date = deal.get('last_activity_date')
    if last_activity_date:
        last_activity = datetime.strptime(last_activity_date, '%Y-%m-%d')
        days_since_activity = (datetime.now() - last_activity).days
    else:
        days_since_activity = age_days
        issues.append("No activities recorded")
    
    # Skip individual activity/note calls for now to avoid rate limiting
    activities = []
    notes = []
    
    # Analyze activity patterns
    if days_since_activity > 14:
        issues.append(f"No activity for {days_since_activity} days")
    
    # Check for email/phone fields
    if deal.get('person_id'):
        person_name = deal.get('person_name', 'Unknown')
    else:
        person_name = "No contact"
    
    return {
        'id': deal_id,
        'title': title,
        'value': value,
        'currency': currency,
        'person': person_name,
        'organization': deal.get('org_name', 'No organization'),
        'age_days': age_days,
        'days_since_activity': days_since_activity,
        'activities_count': len(activities),
        'notes_count': len(notes),
        'issues': issues,
        'stage_change_time': deal.get('stage_change_time'),
        'expected_close_date': deal.get('expected_close_date'),
        'lost_reason': deal.get('lost_reason'),
        'owner': deal.get('owner_name', 'No owner assigned')
    }

def main():
    """Main analysis function"""
    print("Pipedrive Stage 2 Deal Analysis")
    print("=" * 50)
    
    # Find Stage 2
    stage_2 = find_stage_2()
    if not stage_2:
        print("Error: Could not find Stage 2 in the pipeline")
        return
    
    stage_id = stage_2.get('id')
    stage_name = stage_2.get('name')
    print(f"\nAnalyzing deals in: {stage_name} (ID: {stage_id})")
    print("-" * 50)
    
    # Get all deals in Stage 2
    print("\nFetching deals...")
    deals = get_deals_in_stage(stage_id)
    
    print(f"\nFound {len(deals)} deals in Stage 2")
    
    if not deals:
        print("No deals found in Stage 2")
        return
    
    # Analyze each deal
    print("\nAnalyzing each deal...")
    analyzed_deals = []
    total_value = 0
    
    for i, deal in enumerate(deals):
        if i % 10 == 0:
            print(f"Processing deal {i+1}/{len(deals)}...")
        
        analysis = analyze_deal(deal)
        analyzed_deals.append(analysis)
        total_value += analysis['value']
        
        # Rate limiting - be nice to the API
        time.sleep(0.1)
    
    # Generate summary statistics
    print("\n" + "=" * 50)
    print("SUMMARY STATISTICS")
    print("=" * 50)
    print(f"Total deals in Stage 2: {len(analyzed_deals)}")
    print(f"Total value: {total_value:,.2f} {deals[0].get('currency', 'EUR') if deals else 'EUR'}")
    print(f"Average deal value: {total_value/len(analyzed_deals):,.2f}" if analyzed_deals else "N/A")
    
    # Age analysis
    ages = [d['age_days'] for d in analyzed_deals]
    print(f"\nDeal age:")
    print(f"  - Average: {sum(ages)/len(ages):.1f} days" if ages else "N/A")
    print(f"  - Oldest: {max(ages)} days" if ages else "N/A")
    print(f"  - Newest: {min(ages)} days" if ages else "N/A")
    
    # Activity analysis
    inactive_days = [d['days_since_activity'] for d in analyzed_deals]
    print(f"\nDays since last activity:")
    print(f"  - Average: {sum(inactive_days)/len(inactive_days):.1f} days" if inactive_days else "N/A")
    print(f"  - Longest inactive: {max(inactive_days)} days" if inactive_days else "N/A")
    
    # Issue analysis
    issue_counts = defaultdict(int)
    for deal in analyzed_deals:
        for issue in deal['issues']:
            issue_counts[issue] += 1
    
    print(f"\nMost common issues:")
    for issue, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        percentage = (count / len(analyzed_deals)) * 100
        print(f"  - {issue}: {count} deals ({percentage:.1f}%)")
    
    # Deals requiring immediate attention
    print("\n" + "=" * 50)
    print("DEALS REQUIRING IMMEDIATE ATTENTION")
    print("=" * 50)
    
    # Sort by days since activity (longest first)
    urgent_deals = sorted(analyzed_deals, key=lambda x: x['days_since_activity'], reverse=True)[:10]
    
    for deal in urgent_deals:
        print(f"\n{deal['title']}")
        print(f"  - Company: {deal['organization']}")
        print(f"  - Contact: {deal['person']}")
        print(f"  - Value: {deal['value']:,.2f} {deal['currency']}")
        print(f"  - Owner: {deal['owner']}")
        print(f"  - Age: {deal['age_days']} days")
        print(f"  - Last activity: {deal['days_since_activity']} days ago")
        print(f"  - Issues: {', '.join(deal['issues']) if deal['issues'] else 'None identified'}")
    
    # Pattern analysis
    print("\n" + "=" * 50)
    print("PATTERNS IDENTIFIED")
    print("=" * 50)
    
    # Group by owner
    owner_stats = defaultdict(list)
    for deal in analyzed_deals:
        owner_stats[deal['owner']].append(deal)
    
    print("\nDeals by owner:")
    for owner, owner_deals in sorted(owner_stats.items(), key=lambda x: len(x[1]), reverse=True):
        avg_inactive = sum(d['days_since_activity'] for d in owner_deals) / len(owner_deals)
        print(f"  - {owner}: {len(owner_deals)} deals (avg {avg_inactive:.1f} days inactive)")
    
    # Recommendations
    print("\n" + "=" * 50)
    print("RECOMMENDATIONS")
    print("=" * 50)
    print("\n1. IMMEDIATE ACTIONS:")
    print("   - Contact all deals with no activity for 14+ days")
    print("   - Add missing contact/organization information")
    print("   - Set deal values where missing")
    
    print("\n2. PROCESS IMPROVEMENTS:")
    print("   - Implement automated reminders for inactive deals")
    print("   - Create stage-specific checklists")
    print("   - Set up mandatory fields for Stage 2 progression")
    
    print("\n3. TEAM ACTIONS:")
    for owner, owner_deals in sorted(owner_stats.items(), key=lambda x: len(x[1]), reverse=True)[:3]:
        inactive_deals = [d for d in owner_deals if d['days_since_activity'] > 7]
        if inactive_deals:
            print(f"   - {owner}: Follow up on {len(inactive_deals)} inactive deals")
    
    # Export detailed report
    report_data = {
        'summary': {
            'total_deals': len(analyzed_deals),
            'total_value': total_value,
            'average_age': sum(ages)/len(ages) if ages else 0,
            'average_days_inactive': sum(inactive_days)/len(inactive_days) if inactive_days else 0
        },
        'deals': analyzed_deals,
        'issues': dict(issue_counts),
        'generated_at': datetime.now().isoformat()
    }
    
    with open('stage2_analysis_report.json', 'w') as f:
        json.dump(report_data, f, indent=2)
    
    print(f"\nDetailed report saved to: stage2_analysis_report.json")

if __name__ == "__main__":
    main()