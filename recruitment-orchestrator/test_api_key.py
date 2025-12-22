#!/usr/bin/env python3
"""
Test script to validate Pipedrive API key
"""
import os
import requests
import json

# Get API token from environment
API_TOKEN = os.getenv('PIPEDRIVE_API_TOKEN', 'e0399bd15286fe59ba280309854efcf6bd18424f')
DOMAIN = 'recruitinbv'

def test_api_connection():
    print("🔍 Testing Pipedrive API connection...")
    print(f"API Token: {API_TOKEN[:10]}...{API_TOKEN[-10:]}")
    print(f"Domain: {DOMAIN}")
    print("=" * 50)
    
    # Test 1: Get user info
    try:
        url = f"https://api.pipedrive.com/v1/users/me?api_token={API_TOKEN}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            user = data['data']
            print("✅ API Connection: SUCCESS")
            print(f"   User: {user['name']}")
            print(f"   Email: {user['email']}")
            print(f"   Company: {user['company_name']}")
        else:
            print(f"❌ API Connection: FAILED ({response.status_code})")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API Connection: ERROR - {e}")
        return False
    
    # Test 2: Get pipelines
    try:
        url = f"https://api.pipedrive.com/v1/pipelines?api_token={API_TOKEN}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            pipelines = data['data']
            print(f"✅ Pipelines: {len(pipelines)} found")
            for pipeline in pipelines[:3]:  # Show first 3
                print(f"   - {pipeline['name']} (ID: {pipeline['id']})")
        else:
            print(f"❌ Pipelines: FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"❌ Pipelines: ERROR - {e}")
    
    # Test 3: Get stages
    try:
        url = f"https://api.pipedrive.com/v1/stages?api_token={API_TOKEN}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            stages = data['data']
            print(f"✅ Stages: {len(stages)} found")
            for stage in stages[:3]:  # Show first 3
                print(f"   - {stage['name']} (ID: {stage['id']})")
        else:
            print(f"❌ Stages: FAILED ({response.status_code})")
            
    except Exception as e:
        print(f"❌ Stages: ERROR - {e}")
    
    print("=" * 50)
    print("🎯 API Test Complete!")
    return True

if __name__ == "__main__":
    test_api_connection()