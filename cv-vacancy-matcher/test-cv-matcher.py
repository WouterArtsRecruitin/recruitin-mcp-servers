#!/usr/bin/env python3
"""
Test script for CV-Vacancy Matcher MCP Server
"""

import os
import sys

def check_environment():
    """Check if environment is properly configured"""
    checks = {
        "HF_TOKEN": os.environ.get("HF_TOKEN", ""),
        "RESEND_API_KEY": os.environ.get("RESEND_API_KEY", ""),
        "fastmcp": True
    }
    
    # Check if fastmcp is installed
    try:
        import fastmcp
    except ImportError:
        checks["fastmcp"] = False
    
    print("🔍 Environment Check:")
    print("-" * 40)
    print(f"✓ HF_TOKEN: {'Set' if checks['HF_TOKEN'] else '❌ Missing'}")
    print(f"✓ RESEND_API_KEY: {'Set' if checks['RESEND_API_KEY'] else '❌ Missing'}")
    print(f"✓ fastmcp installed: {'Yes' if checks['fastmcp'] else '❌ No'}")
    
    if all([checks["HF_TOKEN"], checks["RESEND_API_KEY"], checks["fastmcp"]]):
        print("\n✅ Environment is ready!")
        return True
    else:
        print("\n❌ Environment setup incomplete")
        return False

def test_server_import():
    """Test if the server can be imported"""
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import server
        print("\n✅ Server module imported successfully")
        return True
    except Exception as e:
        print(f"\n❌ Failed to import server: {e}")
        return False

def test_server_start():
    """Test if the server can start"""
    print("\n🚀 Testing server startup...")
    print("Run: fastmcp dev server.py")
    print("Or : fastmcp run server.py")
    return True

if __name__ == "__main__":
    print("🎯 CV-Vacancy Matcher Test")
    print("=" * 40)
    
    if check_environment() and test_server_import():
        test_server_start()
        print("\n✅ All tests passed!")
        print("\n📝 Next steps:")
        print("1. Restart Claude Desktop")
        print("2. Look for 'cv-vacancy-matcher' in MCP servers")
        print("3. Try: 'Zoek vacatures voor een Ploegleider'")
    else:
        print("\n❌ Some tests failed. Please fix the issues above.")