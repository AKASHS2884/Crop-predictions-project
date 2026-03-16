import requests
import json

# Test the enhanced crop recommendation system
BASE_URL = "http://localhost:5000"

def test_prediction_api():
    """Test the enhanced prediction API with various scenarios"""
    
    test_cases = [
        {
            "name": "High Rainfall Rice Scenario",
            "data": {
                "district": "Thanjavur",
                "season": "Kharif",
                "crop": "Rice",
                "soil": "Alluvial",
                "area": 2.5,
                "rainfall": 200,
                "temperature": 28
            }
        },
        {
            "name": "Low Rainfall Cotton Scenario",
            "data": {
                "district": "Coimbatore",
                "season": "Kharif",
                "crop": "Cotton",
                "soil": "Black",
                "area": 1.5,
                "rainfall": 80,
                "temperature": 27
            }
        },
        {
            "name": "Dry Conditions Millets Scenario",
            "data": {
                "district": "Salem",
                "season": "Rabi",
                "crop": "Millets",
                "soil": "Red",
                "area": 1.0,
                "rainfall": 40,
                "temperature": 30
            }
        },
        {
            "name": "Unsuitable Conditions Test",
            "data": {
                "district": "Vellore",
                "season": "Summer",
                "crop": "Rice",
                "soil": "Red",
                "area": 1.0,
                "rainfall": 30,
                "temperature": 38
            }
        }
    ]
    
    print("Testing Enhanced Crop Recommendation System")
    print("=" * 50)
    
    for test_case in test_cases:
        print(f"\n🧪 Test Case: {test_case['name']}")
        print(f"Input: {test_case['data']}")
        
        try:
            response = requests.post(f"{BASE_URL}/predict", json=test_case['data'])
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"✅ Predicted Yield: {result['predicted_yield_tph']} T/Ha")
                print(f"🎯 Recommended Crop: {result['recommended_crop']}")
                print(f"💰 Market Price: ₹{result['market_price_inr_per_quintal']}")
                
                if 'top_recommendations' in result:
                    print("🏆 Top 3 Recommendations:")
                    for i, rec in enumerate(result['top_recommendations'][:3]):
                        print(f"   {i+1}. {rec['crop']} - Score: {rec['combined_score']}/100 "
                              f"(Suitability: {rec['suitability_score']}%, Yield: {rec['predicted_yield']} T/Ha)")
                
                if 'current_crop_suitability' in result:
                    current = result['current_crop_suitability']
                    print(f"📊 Current Crop Analysis: {current['suitability']}% suitable")
                
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Make sure the Flask server is running on localhost:5000")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("-" * 40)

def test_api_status():
    """Test if the API is running"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ API is running successfully")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure Flask server is running.")
        return False

if __name__ == "__main__":
    print("Enhanced Crop Prediction System Test Suite")
    print("=" * 50)
    
    # Test API status first
    if test_api_status():
        test_prediction_api()
    else:
        print("\n💡 To run the tests:")
        print("1. Navigate to the backend directory")
        print("2. Run: python app.py")
        print("3. Then run this test script again")