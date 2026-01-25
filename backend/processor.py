import pandas as pd

TN_DISTRICTS = [
    "Coimbatore", "Thanjavur", "Madurai", "Salem", "Erode",
    "Tirunelveli", "Trichy", "Tiruppur", "Vellore", "Kancheepuram"
]

TN_CROPS = [
    "Rice", "Maize", "Sugarcane", "Cotton", "Groundnut",
    "Banana", "Coconut", "Ragi", "Chilli", "Turmeric"
]

SEASONS = ["Kharif", "Rabi", "Summer"]

def load_and_clean(csv_path: str):
    df = pd.read_csv(csv_path)

    # standardize column names
    df.columns = [c.strip().lower() for c in df.columns]

    # keep only required columns (rename based on your dataset)
    # expected columns: district, season, crop, area, rainfall, temperature, yield
    required_cols = ["district", "season", "crop", "area", "rainfall", "temperature", "yield"]
    df = df[required_cols].dropna()

    # basic cleanup
    df["district"] = df["district"].astype(str).str.strip().str.title()
    df["season"] = df["season"].astype(str).str.strip().str.title()
    df["crop"] = df["crop"].astype(str).str.strip().str.title()

    # numeric conversion
    for col in ["area", "rainfall", "temperature", "yield"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna()

    return df
