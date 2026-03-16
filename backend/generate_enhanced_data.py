import pandas as pd
import numpy as np
import random

# Enhanced data generation for comprehensive crop prediction
TN_DISTRICTS = [
    "Coimbatore", "Thanjavur", "Madurai", "Salem", "Erode",
    "Tirunelveli", "Trichy", "Tiruppur", "Vellore", "Kancheepuram"
]

TN_CROPS = [
    "Rice", "Maize", "Sugarcane", "Cotton", "Groundnut",
    "Banana", "Coconut", "Ragi", "Chilli", "Turmeric",
    "Millets", "Black Gram", "Green Gram", "Sesame", 
    "Sunflower", "Soybean"
]

SEASONS = ["Kharif", "Rabi", "Summer"]
SOIL_TYPES = ["Red", "Black", "Alluvial", "Clay", "Loamy"]

# Crop-specific yield ranges and optimal conditions
CROP_CHARACTERISTICS = {
    "Rice": {"base_yield": 4.5, "variance": 1.5, "optimal_rainfall": 200, "optimal_temp": 28},
    "Maize": {"base_yield": 3.8, "variance": 1.2, "optimal_rainfall": 100, "optimal_temp": 26},
    "Sugarcane": {"base_yield": 65, "variance": 15, "optimal_rainfall": 275, "optimal_temp": 30},
    "Cotton": {"base_yield": 1.8, "variance": 0.6, "optimal_rainfall": 85, "optimal_temp": 27},
    "Groundnut": {"base_yield": 2.2, "variance": 0.8, "optimal_rainfall": 87, "optimal_temp": 25},
    "Banana": {"base_yield": 35, "variance": 10, "optimal_rainfall": 150, "optimal_temp": 25},
    "Coconut": {"base_yield": 8, "variance": 2, "optimal_rainfall": 190, "optimal_temp": 26},
    "Ragi": {"base_yield": 2.5, "variance": 0.8, "optimal_rainfall": 70, "optimal_temp": 22},
    "Chilli": {"base_yield": 3.2, "variance": 1.0, "optimal_rainfall": 90, "optimal_temp": 27},
    "Turmeric": {"base_yield": 4.8, "variance": 1.5, "optimal_rainfall": 200, "optimal_temp": 25},
    "Millets": {"base_yield": 1.8, "variance": 0.6, "optimal_rainfall": 50, "optimal_temp": 29},
    "Black Gram": {"base_yield": 1.2, "variance": 0.4, "optimal_rainfall": 80, "optimal_temp": 30},
    "Green Gram": {"base_yield": 1.0, "variance": 0.3, "optimal_rainfall": 80, "optimal_temp": 30},
    "Sesame": {"base_yield": 0.8, "variance": 0.3, "optimal_rainfall": 75, "optimal_temp": 27},
    "Sunflower": {"base_yield": 1.5, "variance": 0.5, "optimal_rainfall": 75, "optimal_temp": 22},
    "Soybean": {"base_yield": 2.0, "variance": 0.7, "optimal_rainfall": 100, "optimal_temp": 25}
}

def calculate_realistic_yield(crop, district, season, soil, area, rainfall, temperature):
    """Calculate realistic yield based on crop characteristics and conditions"""
    
    if crop not in CROP_CHARACTERISTICS:
        return random.uniform(1, 5)
    
    char = CROP_CHARACTERISTICS[crop]
    base_yield = char["base_yield"]
    
    # Adjust for rainfall (optimal conditions give best yield)
    rainfall_factor = 1.0
    optimal_rain = char["optimal_rainfall"]
    rain_diff = abs(rainfall - optimal_rain)
    if rain_diff > 50:
        rainfall_factor = max(0.3, 1.0 - (rain_diff - 50) * 0.01)
    elif rain_diff > 25:
        rainfall_factor = max(0.7, 1.0 - (rain_diff - 25) * 0.005)
    
    # Adjust for temperature
    temp_factor = 1.0
    optimal_temp = char["optimal_temp"]
    temp_diff = abs(temperature - optimal_temp)
    if temp_diff > 8:
        temp_factor = max(0.4, 1.0 - (temp_diff - 8) * 0.02)
    elif temp_diff > 4:
        temp_factor = max(0.8, 1.0 - (temp_diff - 4) * 0.01)
    
    # Soil type factor
    soil_factor = 1.0
    if crop in ["Rice"] and soil in ["Alluvial", "Clay"]:
        soil_factor = 1.1
    elif crop in ["Cotton", "Sugarcane"] and soil == "Black":
        soil_factor = 1.1
    elif crop in ["Groundnut", "Millets"] and soil == "Red":
        soil_factor = 1.1
    elif soil in ["Loamy", "Alluvial"]:
        soil_factor = 1.05
    
    # Season factor
    season_factor = 1.0
    if crop in ["Rice", "Sugarcane"] and season == "Kharif":
        season_factor = 1.1
    elif crop in ["Maize", "Groundnut"] and season in ["Rabi", "Summer"]:
        season_factor = 1.05
    
    # Calculate final yield
    final_yield = base_yield * rainfall_factor * temp_factor * soil_factor * season_factor
    
    # Add some randomness
    variance = char["variance"]
    final_yield += random.uniform(-variance, variance)
    
    # Ensure positive yield
    return max(0.1, final_yield)

def generate_enhanced_dataset(num_samples=5000):
    """Generate enhanced dataset with realistic yield patterns"""
    
    data = []
    
    for _ in range(num_samples):
        district = random.choice(TN_DISTRICTS)
        season = random.choice(SEASONS)
        crop = random.choice(TN_CROPS)
        soil = random.choice(SOIL_TYPES)
        
        # Generate realistic area (hectares)
        area = round(random.uniform(0.5, 10.0), 2)
        
        # Generate realistic rainfall based on season
        if season == "Kharif":
            rainfall = random.uniform(80, 300)
        elif season == "Rabi":
            rainfall = random.uniform(20, 150)
        else:  # Summer
            rainfall = random.uniform(10, 100)
        
        # Generate realistic temperature
        temperature = random.uniform(18, 40)
        
        # Calculate realistic yield
        yield_value = calculate_realistic_yield(
            crop, district, season, soil, area, rainfall, temperature
        )
        
        data.append({
            "district": district,
            "season": season,
            "crop": crop,
            "soil": soil,
            "area": area,
            "rainfall": round(rainfall, 1),
            "temperature": round(temperature, 1),
            "yield": round(yield_value, 2)
        })
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating enhanced crop dataset...")
    df = generate_enhanced_dataset(5000)
    
    # Save to CSV
    df.to_csv("./data/tn_crop_data.csv", index=False)
    
    print(f"Generated {len(df)} samples")
    print("\nDataset summary:")
    print(df.describe())
    print("\nCrop distribution:")
    print(df['crop'].value_counts())
    print("\nDataset saved to ./data/tn_crop_data.csv")