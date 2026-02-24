from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

MODEL_PATH = "./models/yield_model.pkl"

app = Flask(__name__)
CORS(app)

# Load trained ML model
model = joblib.load(MODEL_PATH)


@app.route("/", methods=["GET"])
def home():
    return {"status": "✅ TN Crop Yield API Running"}


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    # ✅ Required fields check (including soil)
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

    # 🤖 Crop Recommendation Engine (2025 DSS Feature)
    best_crop = "Rice"

    if float(pred) < 3:
        best_crop = "Millets"
    elif float(pred) < 5:
        best_crop = "Groundnut"
    else:
        best_crop = "Banana"

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

    return jsonify({
        "predicted_yield_tph": round(float(pred), 2),
        "recommended_crop": best_crop,
        "market_price_inr_per_quintal": market_price
    })


if __name__ == "__main__":
    app.run(debug=True)