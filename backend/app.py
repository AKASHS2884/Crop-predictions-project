from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

MODEL_PATH = "./models/yield_model.pkl"

app = Flask(__name__)
CORS(app)

model = joblib.load(MODEL_PATH)

@app.route("/", methods=["GET"])
def home():
    return {"status": "✅ TN Crop Yield API Running"}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    required = ["district", "season", "crop", "area", "rainfall", "temperature"]
    for r in required:
        if r not in data:
            return jsonify({"error": f"Missing field: {r}"}), 400

    X_input = [[
        data["district"],
        data["season"],
        data["crop"],
        float(data["area"]),
        float(data["rainfall"]),
        float(data["temperature"]),
    ]]

    pred = model.predict(X_input)[0]

    # mock market price (you can swap with real API later)
    mock_prices = {
        "Rice": 2400, "Maize": 2100, "Sugarcane": 3100, "Cotton": 6000,
        "Groundnut": 5800, "Banana": 3200, "Coconut": 2800,
        "Ragi": 3500, "Chilli": 9000, "Turmeric": 8500
    }

    market_price = mock_prices.get(data["crop"].title(), 3000)

    return jsonify({
        "predicted_yield_tph": round(float(pred), 2),
        "market_price_inr_per_quintal": market_price
    })

if __name__ == "__main__":
    app.run(debug=True)
