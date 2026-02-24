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

    # 🔥 FORCE CLEAN COLUMN NAMES
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace("\ufeff","")
    )

    # 🔥 FORCE RENAME (FINAL SAFETY)
    df.rename(columns={
        "soil ":"soil",
        "Soil":"soil",
        "district ":"district"
    }, inplace=True)

    required_cols = [
        "district","season","crop",
        "soil","area","rainfall",
        "temperature","yield"
    ]

    print("DEBUG Columns Found:",df.columns)

    df = df[required_cols].dropna()

    df["district"] = df["district"].astype(str).str.title()
    df["season"] = df["season"].astype(str).str.title()
    df["crop"] = df["crop"].astype(str).str.title()
    df["soil"] = df["soil"].astype(str).str.title()

    for col in ["area","rainfall","temperature","yield"]:
        df[col] = pd.to_numeric(df[col],errors="coerce")

    df = df.dropna()

    return df
