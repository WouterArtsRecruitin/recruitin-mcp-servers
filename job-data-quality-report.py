#!/usr/bin/env python3
"""
Job Data Quality Analysis & Summary Report
Analyzes the enhanced job dataset and creates a comprehensive quality report
"""

import csv
import pandas as pd
from datetime import datetime
import json
from collections import Counter, defaultdict
import re

def analyze_job_data(csv_file):
    """Analyze the job dataset for completeness and quality"""

    print("📊 Job Data Quality Analysis")
    print("=" * 60)

    # Read the data
    jobs = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        jobs = list(reader)

    total_jobs = len(jobs)
    print(f"📋 Total Jobs Analyzed: {total_jobs}")

    # Field completeness analysis
    field_completeness = {}
    required_fields = ['Vacature', 'Werkgever', 'Email', 'Telefoon', 'Contactpersoon', 'Website', 'Publicatiedatum', 'Deadline']

    for field in required_fields:
        complete_count = sum(1 for job in jobs if job.get(field, '').strip())
        field_completeness[field] = {
            'complete': complete_count,
            'percentage': (complete_count / total_jobs * 100) if total_jobs > 0 else 0
        }

    print(f"\n📈 Field Completeness:")
    for field, stats in field_completeness.items():
        status = "✅" if stats['percentage'] == 100 else "⚠️" if stats['percentage'] > 90 else "❌"
        print(f"   {status} {field}: {stats['complete']}/{total_jobs} ({stats['percentage']:.1f}%)")

    # Email analysis
    email_domains = Counter()
    email_types = Counter()

    for job in jobs:
        email = job.get('Email', '')
        if email:
            domain = email.split('@')[-1] if '@' in email else ''
            email_domains[domain] += 1

            # Categorize email types
            prefix = email.split('@')[0] if '@' in email else ''
            if 'vacature' in prefix.lower():
                email_types['vacatures'] += 1
            elif 'hr' in prefix.lower():
                email_types['hr'] += 1
            elif 'recruitment' in prefix.lower():
                email_types['recruitment'] += 1
            elif 'info' in prefix.lower():
                email_types['info'] += 1
            else:
                email_types['other'] += 1

    print(f"\n📧 Email Analysis:")
    print(f"   Total unique domains: {len(email_domains)}")
    print(f"   Most common email types:")
    for email_type, count in email_types.most_common(5):
        print(f"      • {email_type}: {count} ({count/total_jobs*100:.1f}%)")

    # Phone analysis
    phone_patterns = {
        'landline': 0,
        'mobile': 0,
        'toll_free': 0,
        'invalid': 0
    }

    for job in jobs:
        phone = job.get('Telefoon', '').replace(' ', '').replace('-', '')
        if phone:
            if phone.startswith('06'):
                phone_patterns['mobile'] += 1
            elif phone.startswith('088') or phone.startswith('0800'):
                phone_patterns['toll_free'] += 1
            elif phone.startswith('0') and len(phone) >= 9:
                phone_patterns['landline'] += 1
            else:
                phone_patterns['invalid'] += 1

    print(f"\n📱 Phone Number Analysis:")
    for pattern, count in phone_patterns.items():
        if count > 0:
            print(f"   • {pattern.replace('_', ' ').title()}: {count} ({count/total_jobs*100:.1f}%)")

    # Geographic analysis
    regions = Counter(job.get('Regio', 'Unknown') for job in jobs)
    locations = Counter(job.get('Standplaats', 'Unknown') for job in jobs)

    print(f"\n🗺️ Geographic Distribution:")
    print(f"   Regions: {dict(regions)}")
    print(f"   Top locations: {dict(locations.most_common(10))}")

    # Employer analysis
    employers = Counter(job.get('Werkgever', 'Unknown') for job in jobs)
    print(f"\n🏢 Employer Analysis:")
    print(f"   Total unique employers: {len(employers)}")
    print(f"   Employers with multiple listings:")
    for employer, count in employers.most_common(10):
        if count > 1:
            print(f"      • {employer}: {count} vacatures")

    # Keyword analysis
    keywords = Counter()
    for job in jobs:
        keyword = job.get('Keyword', '').lower()
        if keyword:
            keywords[keyword] += 1

    print(f"\n🔍 Keyword Analysis:")
    print(f"   Top job categories:")
    for keyword, count in keywords.most_common(10):
        print(f"      • {keyword}: {count} ({count/total_jobs*100:.1f}%)")

    # Contact source analysis
    contact_sources = Counter(job.get('Contact_Source', 'unknown') for job in jobs)
    print(f"\n🌐 Contact Information Sources:")
    for source, count in contact_sources.items():
        print(f"   • {source.title()}: {count} ({count/total_jobs*100:.1f}%)")

    # Date analysis
    pub_dates = [job.get('Publicatiedatum', '') for job in jobs if job.get('Publicatiedatum')]
    if pub_dates:
        pub_dates_dt = [datetime.strptime(date, '%Y-%m-%d') for date in pub_dates if date]
        if pub_dates_dt:
            oldest = min(pub_dates_dt)
            newest = max(pub_dates_dt)
            print(f"\n📅 Publication Date Range:")
            print(f"   Oldest: {oldest.strftime('%Y-%m-%d')}")
            print(f"   Newest: {newest.strftime('%Y-%m-%d')}")
            print(f"   Date span: {(newest - oldest).days} days")

    # Generate quality score
    quality_metrics = {
        'completeness': sum(stats['percentage'] for stats in field_completeness.values()) / len(field_completeness),
        'email_validity': (total_jobs - email_types.get('other', 0)) / total_jobs * 100,
        'phone_validity': (total_jobs - phone_patterns['invalid']) / total_jobs * 100,
        'unique_employers': len(employers) / total_jobs * 100,
        'date_consistency': len(pub_dates) / total_jobs * 100
    }

    overall_quality = sum(quality_metrics.values()) / len(quality_metrics)

    print(f"\n⭐ Overall Data Quality Score: {overall_quality:.1f}/100")
    print(f"   📊 Field Completeness: {quality_metrics['completeness']:.1f}%")
    print(f"   📧 Email Validity: {quality_metrics['email_validity']:.1f}%")
    print(f"   📱 Phone Validity: {quality_metrics['phone_validity']:.1f}%")
    print(f"   🏢 Employer Diversity: {quality_metrics['unique_employers']:.1f}%")
    print(f"   📅 Date Consistency: {quality_metrics['date_consistency']:.1f}%")

    # Recommendations
    print(f"\n💡 Recommendations:")

    if quality_metrics['completeness'] < 95:
        print("   • Some required fields have missing data - review data collection process")

    if phone_patterns['invalid'] > 0:
        print(f"   • {phone_patterns['invalid']} phone numbers may need validation")

    if quality_metrics['unique_employers'] < 80:
        print("   • Consider diversifying employer sources for better coverage")

    if overall_quality >= 90:
        print("   ✅ Excellent data quality! Dataset is production-ready.")
    elif overall_quality >= 80:
        print("   ⚠️ Good data quality with minor improvements needed.")
    else:
        print("   ❌ Data quality needs significant improvement before production use.")

    return {
        'total_jobs': total_jobs,
        'quality_score': overall_quality,
        'field_completeness': field_completeness,
        'quality_metrics': quality_metrics,
        'summary_stats': {
            'employers': len(employers),
            'regions': len(regions),
            'email_domains': len(email_domains),
            'keywords': len(keywords)
        }
    }

def create_summary_json(analysis_result, output_file):
    """Create a JSON summary for API consumption"""

    summary = {
        'generated_at': datetime.now().isoformat(),
        'dataset_info': {
            'total_jobs': analysis_result['total_jobs'],
            'quality_score': round(analysis_result['quality_score'], 1),
            'status': 'production_ready' if analysis_result['quality_score'] >= 90 else 'needs_review'
        },
        'completeness_metrics': analysis_result['field_completeness'],
        'quality_breakdown': analysis_result['quality_metrics'],
        'summary_statistics': analysis_result['summary_stats']
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"📄 JSON summary saved: {output_file}")

def main():
    csv_file = '/Users/wouterarts/mcp-servers/reports/enhanced-jobs-dataset.csv'
    json_output = '/Users/wouterarts/mcp-servers/reports/job-data-quality-summary.json'

    # Run analysis
    analysis_result = analyze_job_data(csv_file)

    # Create JSON summary
    create_summary_json(analysis_result, json_output)

    print(f"\n🎯 Analysis Complete!")
    print(f"   Dataset contains {analysis_result['total_jobs']} jobs")
    print(f"   Quality Score: {analysis_result['quality_score']:.1f}/100")
    print(f"   Status: {'✅ Production Ready' if analysis_result['quality_score'] >= 90 else '⚠️ Needs Review'}")

if __name__ == "__main__":
    main()