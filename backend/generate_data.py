"""
Generates a realistic 8000-sample Tamil Nadu crop dataset.
Each crop has its own yield range, optimal conditions, and
responds dynamically to rainfall, temperature, soil, season, district.
"""
import pandas as pd
import numpy as np
import random

random.seed(42)
np.random.seed(42)

TN_DISTRICTS = [
    "Coimbatore","Thanjavur","Madurai","Salem","Erode",
    "Tirunelveli","Trichy","Tiruppur","Vellore","Kancheepuram",
    "Dindigul","Namakkal","Cuddalore","Villupuram","Thoothukudi"
]

SEASONS = ["Kharif", "Rabi", "Summer"]
SOIL_TYPES = ["Red", "Black", "Alluvial", "Clay", "Loamy"]

# Each crop: base_yield (T/Ha), yield_std, optimal_rainfall(mm),
#            optimal_temp(C), best_soils, best_seasons, best_districts
CROP_PROFILES = {
    "Rice":       {"base":4.8, "std":1.2, "rain":200,"temp":28,"soils":["Alluvial","Clay"],      "seasons":["Kharif","Rabi"],         "districts":["Thanjavur","Trichy","Kancheepuram"]},
    "Maize":      {"base":3.9, "std":1.0, "rain":100,"temp":26,"soils":["Red","Alluvial"],        "seasons":["Kharif","Rabi","Summer"], "districts":["Salem","Coimbatore","Erode"]},
    "Sugarcane":  {"base":7.2, "std":1.8, "rain":260,"temp":30,"soils":["Black","Alluvial"],      "seasons":["Kharif","Summer"],        "districts":["Erode","Coimbatore","Thanjavur"]},
    "Cotton":     {"base":2.1, "std":0.7, "rain":85, "temp":27,"soils":["Black","Red"],           "seasons":["Kharif"],                 "districts":["Coimbatore","Erode","Madurai"]},
    "Groundnut":  {"base":2.4, "std":0.8, "rain":87, "temp":25,"soils":["Red","Loamy"],           "seasons":["Kharif","Rabi"],          "districts":["Vellore","Tirunelveli","Salem"]},
    "Banana":     {"base":5.5, "std":1.4, "rain":150,"temp":26,"soils":["Alluvial","Loamy"],      "seasons":["Kharif","Summer"],        "districts":["Trichy","Thanjavur","Madurai"]},
    "Coconut":    {"base":4.2, "std":1.0, "rain":190,"temp":27,"soils":["Red","Alluvial","Loamy"],"seasons":["Kharif","Summer"],        "districts":["Coimbatore","Kancheepuram","Tirunelveli"]},
    "Ragi":       {"base":2.6, "std":0.7, "rain":70, "temp":22,"soils":["Red","Black"],           "seasons":["Kharif","Rabi"],          "districts":["Salem","Vellore","Coimbatore"]},
    "Chilli":     {"base":3.5, "std":1.1, "rain":90, "temp":27,"soils":["Red","Loamy"],           "seasons":["Kharif","Rabi"],          "districts":["Madurai","Tirunelveli","Erode"]},
    "Turmeric":   {"base":5.2, "std":1.3, "rain":200,"temp":25,"soils":["Red","Loamy"],           "seasons":["Kharif"],                 "districts":["Erode","Salem","Coimbatore"]},
    "Millets":    {"base":1.9, "std":0.6, "rain":50, "temp":29,"soils":["Red","Black"],           "seasons":["Kharif","Rabi"],          "districts":["Salem","Vellore","Tirunelveli"]},
    "Black Gram": {"base":1.3, "std":0.4, "rain":80, "temp":30,"soils":["Red","Black","Alluvial"],"seasons":["Kharif","Rabi"],          "districts":["Madurai","Tirunelveli","Vellore"]},
    "Green Gram": {"base":1.1, "std":0.35,"rain":80, "temp":30,"soils":["Red","Loamy"],           "seasons":["Kharif","Rabi","Summer"], "districts":["Madurai","Coimbatore","Vellore"]},
    "Sesame":     {"base":0.85,"std":0.3, "rain":75, "temp":27,"soils":["Red","Black"],           "seasons":["Kharif","Rabi"],          "districts":["Salem","Tirunelveli","Madurai"]},
    "Sunflower":  {"base":1.6, "std":0.5, "rain":75, "temp":22,"soils":["Red","Black","Alluvial"],"seasons":["Kharif","Rabi"],          "districts":["Coimbatore","Salem","Erode"]},
    "Soybean":    {"base":2.1, "std":0.65,"rain":100,"temp":25,"soils":["Black","Red"],           "seasons":["Kharif"],                 "districts":["Coimbatore","Salem","Madurai"]},
}

def yield_for(crop, district, season, soil, rainfall, temperature):
    p = CROP_PROFILES[crop]

    # Rainfall factor: smooth penalty, not multiplicative collapse
    r_diff = abs(rainfall - p["rain"])
    r_factor = max(0.55, 1.0 - (r_diff / (p["rain"] * 2.5)) * 0.6)

    # Temperature factor
    t_diff = abs(temperature - p["temp"])
    t_factor = max(0.55, 1.0 - (t_diff / 20) * 0.7)

    # Soil bonus/penalty (additive offset, not multiplier)
    s_bonus = 0.15 if soil in p["soils"] else -0.10

    # Season bonus
    se_bonus = 0.12 if season in p["seasons"] else -0.15

    # District bonus
    d_bonus = 0.10 if district in p["districts"] else 0.0

    y = p["base"] * r_factor * t_factor + s_bonus + se_bonus + d_bonus
    # Add realistic noise
    y += np.random.normal(0, p["std"] * 0.35)
    return round(max(0.15, y), 2)


def generate(n=8000):
    rows = []
    crops = list(CROP_PROFILES.keys())

    # Ensure every crop gets at least 300 samples for good model coverage
    per_crop = max(300, n // len(crops))
    for crop in crops:
        for _ in range(per_crop):
            p = CROP_PROFILES[crop]
            district = random.choice(TN_DISTRICTS)
            season   = random.choice(SEASONS)
            soil     = random.choice(SOIL_TYPES)
            area     = round(random.uniform(0.5, 12.0), 2)

            # Rainfall: season-aware
            if season == "Kharif":
                rainfall = round(random.uniform(60, 320), 1)
            elif season == "Rabi":
                rainfall = round(random.uniform(20, 160), 1)
            else:
                rainfall = round(random.uniform(10, 110), 1)

            temperature = round(random.uniform(18, 42), 1)
            y = yield_for(crop, district, season, soil, rainfall, temperature)

            rows.append({
                "district": district, "season": season, "crop": crop,
                "soil": soil, "area": area,
                "rainfall": rainfall, "temperature": temperature,
                "yield": y
            })

    df = pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)
    return df


if __name__ == "__main__":
    print("Generating dataset...")
    df = generate(8000)
    df.to_csv("./data/tn_crop_data.csv", index=False)
    print(f"Saved {len(df)} rows")
    print()
    print(df.groupby("crop")["yield"].agg(["mean","min","max","std"]).round(2).to_string())
