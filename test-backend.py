#!/usr/bin/env python3
"""
Test script for the CRAFT backend API
"""

import requests
import json
import sys
import os

def test_backend():
    """Test the CRAFT backend API"""
    
    backend_url = "http://localhost:8000"
    
    print("🧪 Testing CRAFT Backend API")
    print("=" * 40)
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{backend_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health check passed: {data}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Cannot connect to backend: {e}")
        print("   💡 Make sure the backend is running: cd backend && python craft_api.py")
        return False
    
    # Test 2: Root endpoint
    print("2. Testing root endpoint...")
    try:
        response = requests.get(f"{backend_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Root endpoint: {data['message']}")
        else:
            print(f"   ❌ Root endpoint failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Root endpoint error: {e}")
    
    # Test 3: API documentation
    print("3. Testing API docs...")
    try:
        response = requests.get(f"{backend_url}/docs", timeout=5)
        if response.status_code == 200:
            print("   ✅ API documentation available at http://localhost:8000/docs")
        else:
            print(f"   ❌ API docs not available: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ API docs error: {e}")
    
    print("\n🎉 Backend tests completed!")
    print("📝 Next steps:")
    print("   1. Start the frontend: npm run dev")
    print("   2. Open http://localhost:3000")
    print("   3. Upload a receipt image to test the full system")
    
    return True

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)
