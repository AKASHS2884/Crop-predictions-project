#!/usr/bin/env python3
"""
Quick API Test for Smart Crop Advisor
"""

import requests
import json
import sys
import time
import subprocess
import threading

def test_api():
    """Test the backend API"""
    try:
        # Test API
        response = requests.post('http://localhost:5000/predict', json={
            'district': 'Thanjavur',
            'season': 'Kharif', 
            'crop': 'Rice',
            'soil': 'Alluvial',
            'area': 2.5,
            'rainfall': 150,
            'temperature': 28
        }, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print('✅ API Test Successful!')
            print(f'Predicted Yield: {data["predicted_yield_tph"]} tons/hectare')
            print(f'Recommended Crop: {data["recommended_crop"]}')
            print(f'Market Price: ₹{data["market_price_inr_per_quintal"]}/quintal')
            return True
        else:
            print(f'❌ API Error: {response.status_code}')
            return False
            
    except Exception as e:
        print(f'⚠️ API test failed: {e}')
        print('Make sure backend is running on http://localhost:5000')
        return False

if __name__ == "__main__":
    print("🧪 Testing Smart Crop Advisor API...")
    success = test_api()
    sys.exit(0 if success else 1)