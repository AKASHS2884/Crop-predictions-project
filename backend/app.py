from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

MODEL_PATH = "./models/yield_model.pkl"

# Crop suitability database for Tamil Nadu
CROP_SUITABILITY = {
    "Rice": {
        "soil_types": ["Alluvial", "Clay", "Loamy"],
        "rainfall_range": (100, 300),
        "temp_range": (20, 35),
        "seasons": ["Kharif", "Rabi"],
        "districts": ["Thanjavur", "Kancheepuram", "Trichy", "Madurai"]
    },
    "Maize": {
        "soil_types": ["Red", "Black", "Alluvial"],
        "rainfall_range": (50, 150),
        "temp_range": (21, 32),
        "seasons": ["Kharif", "Rabi", "Summer"],
        "districts": ["Salem", "Coimbatore", "Erode", "Vellore"]
    },
    "Sugarcane": {
        "soil_types": ["Black", "Red", "Alluvial"],
        "rainfall_range": (150, 400),
        "temp_range": (20, 40),
        "seasons": ["Kharif", "Summer"],
        "districts": ["Erode", "Coimbatore", "Salem", "Thanjavur"]
    },
    "Cotton": {
        "soil_types": ["Black", "Red"],
        "rainfall_range": (50, 120),
        "temp_range": (21, 32),
        "seasons": ["Kharif"],
        "districts": ["Coimbatore", "Erode", "Salem", "Madurai"]
    },
    "Groundnut": {
        "soil_types": ["Red", "Black", "Alluvial"],
        "rainfall_range": (50, 125),
        "temp_range": (20, 30),
        "seasons": ["Kharif", "Rabi"],
        "districts": ["Vellore", "Tirunelveli", "Madurai", "Salem"]
    },
    "Banana": {
        "soil_types": ["Alluvial", "Red", "Loamy"],
        "rainfall_range": (100, 200),
        "temp_range": (15, 35),
        "seasons": ["Kharif", "Summer"],
        "districts": ["Trichy", "Thanjavur", "Madurai", "Tirunelveli"]
    },
    "Coconut": {
        "soil_types": ["Red", "Alluvial", "Loamy"],
        "rainfall_range": (130, 250),
        "temp_range": (20, 32),
        "seasons": ["Kharif", "Summer"],
        "districts": ["Coimbatore", "Thanjavur", "Kancheepuram", "Tirunelveli"]
    },
    "Ragi": {
        "soil_types": ["Red", "Black"],
        "rainfall_range": (40, 100),
        "temp_range": (15, 28),
        "seasons": ["Kharif", "Rabi"],
        "districts": ["Salem", "Coimbatore", "Vellore", "Madurai"]
    },
    "Chilli": {
        "soil_types": ["Red", "Black", "Loamy"],
        "rainfall_range": (60, 120),
        "temp_range": (20, 35),
        "seasons": ["Kharif", "Rabi"],
        "districts": ["Madurai", "Tirunelveli", "Salem", "Erode"]
    },
    "Turmeric": {
        "soil_types": ["Red", "Black", "Loamy"],
        "rainfall_range": (150, 250),
        "temp_range": (20, 30),
        "seasons": ["Kharif"],
        "districts": ["Erode", "Salem", "Coimbatore", "Madurai"]
    },
    "Millets": {
        "soil_types": ["Red", "Black"],
        "rainfall_range": (25, 75),
        "temp_range": (26, 32),
        "seasons": ["Kharif", "Rabi"],
        "districts": ["Salem", "Vellore", "Madurai", "Tirunelveli"]
    },
    "Black Gram": {
        "soil_types": ["Red", "Black", "Alluvial"],
        "rainfall_range": (60, 100),
        "temp_range": (25, 35),
        "seasons": ["Kharif", "Rabi"],
        "districts": ["Madurai", "Tirunelveli", "Vellore", "Salem"]
    },
    "Green Gram": {
        "soil_types": ["Red", "Black", "Loamy"],
        "rainfall_range": (60, 100),
        "temp_range": (25, 35),
        "seasons": ["Kharif", "Rabi", "Summer"],
        "districts": ["Madurai", "Tirunelveli", "Vellore", "Coimbatore"]
    },
    "Sesame": {
        "soil_types": ["Red", "Black"],
        "rainfall_range": (50, 100),
        "temp_range": (25, 30),
        "seasons": ["Kharif", "Rabi"],
        "districts": ["Salem", "Vellore", "Madurai", "Tirunelveli"]
    },
    "Sunflower": {
        "soil_types": ["Red", "Black", "Alluvial"],
        "rainfall_range": (50, 100),
        "temp_range": (20, 25),
        "seasons": ["Kharif", "Rabi"],
        "districts": ["Coimbatore", "Salem", "Erode", "Vellore"]
    },
    "Soybean": {
        "soil_types": ["Black", "Red"],
        "rainfall_range": (75, 125),
        "temp_range": (20, 30),
        "seasons": ["Kharif"],
        "districts": ["Coimbatore", "Salem", "Erode", "Madurai"]
    }
}

def calculate_crop_suitability_score(crop, district, season, soil, rainfall, temperature):
    """Calculate suitability score for a crop based on environmental conditions"""
    if crop not in CROP_SUITABILITY:
        return 0
    
    crop_data = CROP_SUITABILITY[crop]
    score = 0
    
    # Soil type compatibility (25% weight)
    if soil in crop_data["soil_types"]:
        score += 25
    
    # Rainfall suitability (25% weight)
    rain_min, rain_max = crop_data["rainfall_range"]
    if rain_min <= rainfall <= rain_max:
        score += 25
    elif rainfall < rain_min:
        # Penalty for insufficient rainfall
        score += max(0, 25 - (rain_min - rainfall) * 0.5)
    else:
        # Penalty for excess rainfall
        score += max(0, 25 - (rainfall - rain_max) * 0.2)
    
    # Temperature suitability (25% weight)
    temp_min, temp_max = crop_data["temp_range"]
    if temp_min <= temperature <= temp_max:
        score += 25
    elif temperature < temp_min:
        score += max(0, 25 - (temp_min - temperature) * 2)
    else:
        score += max(0, 25 - (temperature - temp_max) * 2)
    
    # Season compatibility (15% weight)
    if season in crop_data["seasons"]:
        score += 15
    
    # District suitability (10% weight)
    if district in crop_data["districts"]:
        score += 10
    
    return min(100, score)

def get_optimal_crop_recommendation(district, season, soil, rainfall, temperature, current_crop, predicted_yield):
    """Advanced crop recommendation based on environmental conditions and yield prediction"""
    
    # Calculate suitability scores for all crops
    crop_scores = {}
    for crop in CROP_SUITABILITY.keys():
        suitability_score = calculate_crop_suitability_score(
            crop, district, season, soil, rainfall, temperature
        )
        
        # Create input for yield prediction
        X_test = pd.DataFrame([{
            "district": str(district).title(),
            "season": str(season).title(),
            "crop": str(crop).title(),
            "soil": str(soil).title(),
            "area": 1.0,  # Normalized area for comparison
            "rainfall": float(rainfall),
            "temperature": float(temperature)
        }])
        
        try:
            # Predict yield for this crop
            predicted_crop_yield = model.predict(X_test)[0]
            
            # Combined score: 60% suitability + 40% yield potential
            combined_score = (suitability_score * 0.6) + (min(predicted_crop_yield * 10, 40))
            
            crop_scores[crop] = {
                "suitability": suitability_score,
                "predicted_yield": predicted_crop_yield,
                "combined_score": combined_score
            }
        except Exception as e:
            # Fallback to suitability score only
            crop_scores[crop] = {
                "suitability": suitability_score,
                "predicted_yield": 0,
                "combined_score": suitability_score * 0.6
            }
    
    # Sort crops by combined score
    sorted_crops = sorted(crop_scores.items(), key=lambda x: x[1]["combined_score"], reverse=True)
    
    # Get the best recommendation
    best_crop = sorted_crops[0][0]
    
    # If current crop is in top 3 and has decent yield, stick with it
    current_crop_title = str(current_crop).title()
    if current_crop_title in [crop[0] for crop in sorted_crops[:3]] and predicted_yield >= 3.0:
        return current_crop_title
    
    return best_crop

app = Flask(__name__)
CORS(app)

# Load trained ML model
model = joblib.load(MODEL_PATH)


@app.route("/", methods=["GET"])
def home():
    return {"status": " TN Crop Yield API Running"}


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    #  Required fields check (including soil)
    required = [
        "district",
        "season",
        "crop",
        "soil",
        "area",
        "rainfall",
        "temperature"
    ]

    for r in required:
        if r not in data:
            return jsonify({"error": f"Missing field: {r}"}), 400

    # ✅ Convert input to DataFrame (ColumnTransformer needs column names)
    X_input = pd.DataFrame([{
        "district": str(data["district"]).title(),
        "season": str(data["season"]).title(),
        "crop": str(data["crop"]).title(),
        "soil": str(data["soil"]).title(),
        "area": float(data["area"]),
        "rainfall": float(data["rainfall"]),
        "temperature": float(data["temperature"])
    }])

    # 🔮 Predict Yield
    pred = model.predict(X_input)[0]

    # 🤖 Advanced Crop Recommendation Engine (2025 DSS Feature)
    best_crop = get_optimal_crop_recommendation(
        district=data["district"],
        season=data["season"],
        soil=data["soil"],
        rainfall=data["rainfall"],
        temperature=data["temperature"],
        current_crop=data["crop"],
        predicted_yield=float(pred)
    )

    # 💰 Market Price (Mock - Replace with API later)
    mock_prices = {
        "Rice": 2400,
        "Maize": 2100,
        "Sugarcane": 3100,
        "Cotton": 6000,
        "Groundnut": 5800,
        "Banana": 3200,
        "Coconut": 2800,
        "Ragi": 3500,
        "Chilli": 9000,
        "Turmeric": 8500,
        "Millets": 2800,
        "Black Gram": 6500,
        "Green Gram": 7200,
        "Sesame": 7500,
        "Sunflower": 4200,
        "Soybean": 4100,
        "Cashew": 9800,
        "Mango": 3000
    }

    market_price = mock_prices.get(data["crop"].title(), 3000)

    # Get top 3 crop recommendations with details
    crop_scores = {}
    for crop in CROP_SUITABILITY.keys():
        suitability_score = calculate_crop_suitability_score(
            crop, data["district"], data["season"], data["soil"], 
            data["rainfall"], data["temperature"]
        )
        
        X_test = pd.DataFrame([{
            "district": str(data["district"]).title(),
            "season": str(data["season"]).title(),
            "crop": str(crop).title(),
            "soil": str(data["soil"]).title(),
            "area": 1.0,
            "rainfall": float(data["rainfall"]),
            "temperature": float(data["temperature"])
        }])
        
        try:
            predicted_crop_yield = model.predict(X_test)[0]
            combined_score = (suitability_score * 0.6) + (min(predicted_crop_yield * 10, 40))
            
            crop_scores[crop] = {
                "suitability": round(suitability_score, 1),
                "predicted_yield": round(predicted_crop_yield, 2),
                "combined_score": round(combined_score, 1),
                "market_price": mock_prices.get(crop, 3000)
            }
        except:
            crop_scores[crop] = {
                "suitability": round(suitability_score, 1),
                "predicted_yield": 0,
                "combined_score": round(suitability_score * 0.6, 1),
                "market_price": mock_prices.get(crop, 3000)
            }
    
    # Sort and get top 3 recommendations
    sorted_crops = sorted(crop_scores.items(), key=lambda x: x[1]["combined_score"], reverse=True)
    top_recommendations = [
        {
            "crop": crop,
            "suitability_score": details["suitability"],
            "predicted_yield": details["predicted_yield"],
            "combined_score": details["combined_score"],
            "market_price": details["market_price"]
        }
        for crop, details in sorted_crops[:3]
    ]

    return jsonify({
        "predicted_yield_tph": round(float(pred), 2),
        "recommended_crop": best_crop,
        "market_price_inr_per_quintal": market_price,
        "top_recommendations": top_recommendations,
        "current_crop_suitability": crop_scores.get(data["crop"].title(), {
            "suitability": 0,
            "predicted_yield": round(float(pred), 2),
            "combined_score": 0,
            "market_price": market_price
        })
    })


if __name__ == "__main__":
    app.run(debug=True)