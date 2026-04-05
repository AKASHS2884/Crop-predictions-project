"""
Smart Crop Advisor — Flask API v2.2
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
from external_apis import (
    get_coords, fetch_nasa_power, fetch_openmeteo_forecast, fetch_agmarknet_price
)

MODEL_PATH = "./models/yield_model.pkl"

CROP_SUITABILITY = {
    "Rice":       {"soil_types":["Alluvial","Clay","Loamy"],    "rainfall_range":(100,300), "temp_range":(20,35), "seasons":["Kharif","Rabi"],          "districts":["Thanjavur","Kancheepuram","Trichy","Madurai"]},
    "Maize":      {"soil_types":["Red","Black","Alluvial"],     "rainfall_range":(50,150),  "temp_range":(21,32), "seasons":["Kharif","Rabi","Summer"],  "districts":["Salem","Coimbatore","Erode","Vellore"]},
    "Sugarcane":  {"soil_types":["Black","Red","Alluvial"],     "rainfall_range":(150,400), "temp_range":(20,40), "seasons":["Kharif","Summer"],         "districts":["Erode","Coimbatore","Salem","Thanjavur"]},
    "Cotton":     {"soil_types":["Black","Red"],                "rainfall_range":(50,120),  "temp_range":(21,32), "seasons":["Kharif"],                  "districts":["Coimbatore","Erode","Salem","Madurai"]},
    "Groundnut":  {"soil_types":["Red","Black","Alluvial"],     "rainfall_range":(50,125),  "temp_range":(20,30), "seasons":["Kharif","Rabi"],           "districts":["Vellore","Tirunelveli","Madurai","Salem"]},
    "Banana":     {"soil_types":["Alluvial","Red","Loamy"],     "rainfall_range":(100,200), "temp_range":(15,35), "seasons":["Kharif","Summer"],         "districts":["Trichy","Thanjavur","Madurai","Tirunelveli"]},
    "Coconut":    {"soil_types":["Red","Alluvial","Loamy"],     "rainfall_range":(130,250), "temp_range":(20,32), "seasons":["Kharif","Summer"],         "districts":["Coimbatore","Thanjavur","Kancheepuram","Tirunelveli"]},
    "Ragi":       {"soil_types":["Red","Black"],                "rainfall_range":(40,100),  "temp_range":(15,28), "seasons":["Kharif","Rabi"],           "districts":["Salem","Coimbatore","Vellore","Madurai"]},
    "Chilli":     {"soil_types":["Red","Black","Loamy"],        "rainfall_range":(60,120),  "temp_range":(20,35), "seasons":["Kharif","Rabi"],           "districts":["Madurai","Tirunelveli","Salem","Erode"]},
    "Turmeric":   {"soil_types":["Red","Black","Loamy"],        "rainfall_range":(150,250), "temp_range":(20,30), "seasons":["Kharif"],                  "districts":["Erode","Salem","Coimbatore","Madurai"]},
    "Millets":    {"soil_types":["Red","Black"],                "rainfall_range":(25,75),   "temp_range":(26,32), "seasons":["Kharif","Rabi"],           "districts":["Salem","Vellore","Madurai","Tirunelveli"]},
    "Black Gram": {"soil_types":["Red","Black","Alluvial"],     "rainfall_range":(60,100),  "temp_range":(25,35), "seasons":["Kharif","Rabi"],           "districts":["Madurai","Tirunelveli","Vellore","Salem"]},
    "Green Gram": {"soil_types":["Red","Black","Loamy"],        "rainfall_range":(60,100),  "temp_range":(25,35), "seasons":["Kharif","Rabi","Summer"],  "districts":["Madurai","Tirunelveli","Vellore","Coimbatore"]},
    "Sesame":     {"soil_types":["Red","Black"],                "rainfall_range":(50,100),  "temp_range":(25,30), "seasons":["Kharif","Rabi"],           "districts":["Salem","Vellore","Madurai","Tirunelveli"]},
    "Sunflower":  {"soil_types":["Red","Black","Alluvial"],     "rainfall_range":(50,100),  "temp_range":(20,25), "seasons":["Kharif","Rabi"],           "districts":["Coimbatore","Salem","Erode","Vellore"]},
    "Soybean":    {"soil_types":["Black","Red"],                "rainfall_range":(75,125),  "temp_range":(20,30), "seasons":["Kharif"],                  "districts":["Coimbatore","Salem","Erode","Madurai"]},
}

MOCK_PRICES = {
    "Rice":2400,"Maize":2100,"Sugarcane":3100,"Cotton":6000,"Groundnut":5800,
    "Banana":3200,"Coconut":2800,"Ragi":3500,"Chilli":9000,"Turmeric":8500,
    "Millets":2800,"Black Gram":6500,"Green Gram":7200,"Sesame":7500,
    "Sunflower":4200,"Soybean":4100
}

TYPICAL_YIELD = {
    "Rice":3.5,"Maize":3.0,"Sugarcane":6.0,"Cotton":1.8,"Groundnut":2.0,
    "Banana":4.5,"Coconut":3.5,"Ragi":2.0,"Chilli":3.0,"Turmeric":4.5,
    "Millets":1.5,"Black Gram":1.1,"Green Gram":0.9,"Sesame":0.7,
    "Sunflower":1.4,"Soybean":1.8
}


def calculate_suitability(crop, district, season, soil, rainfall, temperature):
    if crop not in CROP_SUITABILITY:
        return 0.0
    d = CROP_SUITABILITY[crop]
    score = 0.0
    if soil in d["soil_types"]:
        score += 30
    else:
        score += 5
    rmin, rmax = d["rainfall_range"]
    if rmin <= rainfall <= rmax:
        score += 30
    elif rainfall < rmin:
        score += max(0, 30 - (rmin - rainfall) * 0.25)
    else:
        score += max(0, 30 - (rainfall - rmax) * 0.15)
    tmin, tmax = d["temp_range"]
    if tmin <= temperature <= tmax:
        score += 20
    elif temperature < tmin:
        score += max(0, 20 - (tmin - temperature) * 2.0)
    else:
        score += max(0, 20 - (temperature - tmax) * 2.0)
    score += 15 if season in d["seasons"] else 0
    score += 5  if district in d["districts"] else 0
    return round(min(100.0, score), 1)


def combined_score(suitability, predicted_yield, market_price, crop):
    typical     = TYPICAL_YIELD.get(crop, 2.0)
    price_index = market_price / 9000.0
    yield_perf  = min(1.5, predicted_yield / typical)
    revenue     = yield_perf * price_index * 30
    return round(min(100.0, suitability * 0.70 + revenue), 1)


app = Flask(__name__)
CORS(app)
model = joblib.load(MODEL_PATH)
AGMARKNET_KEY = os.environ.get("AGMARKNET_KEY", "")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "TN Crop Yield API Running", "version": "2.2"})


@app.route("/environment", methods=["GET"])
def environment():
    district = request.args.get("district", "Coimbatore").title()
    lat, lon = get_coords(district)
    nasa  = fetch_nasa_power(lat, lon)
    meteo = fetch_openmeteo_forecast(lat, lon)
    return jsonify({
        "district":      district,
        "coordinates":   {"lat": lat, "lon": lon},
        "ndvi":          nasa.get("ndvi")           if nasa  else None,
        "soil_moisture": nasa.get("soil_moisture")  if nasa  else None,
        "rainfall_7d":   nasa.get("rainfall_7d_mm") if nasa  else None,
        "forecast":      meteo.get("forecast")      if meteo else [],
        "total_rain_7d": meteo.get("total_rain_7d") if meteo else None,
        "avg_temp_7d":   meteo.get("avg_temp_7d")   if meteo else None,
        "sources": {
            "ndvi_soil": nasa.get("source")  if nasa  else "unavailable",
            "forecast":  meteo.get("source") if meteo else "unavailable",
        }
    })


@app.route("/market-price", methods=["GET"])
def market_price_route():
    crop = request.args.get("crop", "Rice").title()
    data = fetch_agmarknet_price(crop, api_key=AGMARKNET_KEY)
    return jsonify({"crop": crop, **data})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json or {}
    required = ["district","season","crop","soil","area","rainfall","temperature"]
    for r in required:
        if r not in data:
            return jsonify({"error": f"Missing field: {r}"}), 400

    district    = str(data["district"]).title()
    season      = str(data["season"]).title()
    crop        = str(data["crop"]).title()
    soil        = str(data["soil"]).title()
    area        = float(data.get("area") or 1)
    rainfall    = float(data.get("rainfall") or 0)
    temperature = float(data.get("temperature") or 30)

    X_input = pd.DataFrame([{
        "district": district, "season": season, "crop": crop,
        "soil": soil, "area": area, "rainfall": rainfall, "temperature": temperature
    }])
    pred = round(max(0.1, float(model.predict(X_input)[0])), 2)

    # Live market price for selected crop
    price_data = fetch_agmarknet_price(crop, api_key=AGMARKNET_KEY)
    live_price = price_data["modal_price"]

    # Score all crops
    crop_scores = {}
    for c in CROP_SUITABILITY:
        suit = calculate_suitability(c, district, season, soil, rainfall, temperature)
        X_c  = pd.DataFrame([{
            "district": district, "season": season, "crop": c,
            "soil": soil, "area": area, "rainfall": rainfall, "temperature": temperature
        }])
        try:
            cy = round(max(0.1, float(model.predict(X_c)[0])), 2)
        except Exception:
            cy = 0.1
        mp = (fetch_agmarknet_price(c, api_key=AGMARKNET_KEY)["modal_price"]
              if AGMARKNET_KEY else MOCK_PRICES.get(c, 3000))
        cs = combined_score(suit, cy, mp, c)
        crop_scores[c] = {"suitability": suit, "predicted_yield": cy,
                          "combined_score": cs, "market_price": mp}

    # Suitability-gated top 3
    eligible = [(c, v) for c, v in crop_scores.items() if v["suitability"] >= 50]
    if len(eligible) < 3:
        eligible = [(c, v) for c, v in crop_scores.items() if v["suitability"] >= 35]
    if len(eligible) < 3:
        eligible = list(crop_scores.items())

    sorted_crops = sorted(eligible,
        key=lambda x: (x[1]["combined_score"], x[1]["suitability"]), reverse=True)

    top3 = [{"crop": c, "suitability_score": v["suitability"],
              "predicted_yield": v["predicted_yield"],
              "combined_score": v["combined_score"],
              "market_price": v["market_price"]}
            for c, v in sorted_crops[:3]]

    best_crop  = sorted_crops[0][0]
    best_yield = sorted_crops[0][1]["predicted_yield"]
    current    = crop_scores.get(crop, {
        "suitability": 0, "predicted_yield": pred,
        "combined_score": 0, "market_price": live_price
    })

    return jsonify({
        "predicted_yield_tph":          pred,
        "recommended_crop":             best_crop,
        "market_price_inr_per_quintal": live_price,
        "market_price_details":         price_data,
        "top_recommendations":          top3,
        "current_crop_suitability":     current,
        "yield_improvement_possible":   round(best_yield - pred, 2),
        "input_summary": {
            "district": district, "season": season, "crop": crop,
            "soil": soil, "area": area, "rainfall": rainfall, "temperature": temperature
        }
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=False)
