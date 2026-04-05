"""
Trains a GradientBoostingRegressor pipeline on the TN crop dataset.
Run: python train_model.py
"""
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
from processor import load_and_clean

DATA_PATH  = "./data/tn_crop_data.csv"
MODEL_PATH = "./models/yield_model.pkl"

def train():
    df = load_and_clean(DATA_PATH)
    print(f"Training on {len(df)} samples, {df['crop'].nunique()} crops")

    X = df[["district","season","crop","soil","area","rainfall","temperature"]]
    y = df["yield"]

    cat_cols = ["district","season","crop","soil"]
    num_cols = ["area","rainfall","temperature"]

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
        ("num", StandardScaler(), num_cols)
    ])

    model = GradientBoostingRegressor(
        n_estimators=400,
        learning_rate=0.08,
        max_depth=5,
        min_samples_leaf=4,
        subsample=0.85,
        random_state=42
    )

    pipeline = Pipeline([
        ("pre", preprocessor),
        ("model", model)
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)

    print(f"MAE : {mean_absolute_error(y_test, preds):.3f}")
    print(f"R²  : {r2_score(y_test, preds):.3f}")

    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved → {MODEL_PATH}")

    # Quick sanity check
    print("\nSanity check predictions:")
    checks = [
        {"district":"Thanjavur", "season":"Kharif", "crop":"Rice",      "soil":"Alluvial","area":2,"rainfall":200,"temperature":28},
        {"district":"Coimbatore","season":"Kharif", "crop":"Cotton",    "soil":"Black",   "area":2,"rainfall":80, "temperature":30},
        {"district":"Salem",     "season":"Rabi",   "crop":"Millets",   "soil":"Red",     "area":2,"rainfall":40, "temperature":27},
        {"district":"Erode",     "season":"Kharif", "crop":"Sugarcane", "soil":"Black",   "area":2,"rainfall":250,"temperature":32},
        {"district":"Madurai",   "season":"Summer", "crop":"Green Gram","soil":"Loamy",   "area":2,"rainfall":60, "temperature":35},
        {"district":"Trichy",    "season":"Kharif", "crop":"Banana",    "soil":"Alluvial","area":2,"rainfall":150,"temperature":27},
        {"district":"Erode",     "season":"Kharif", "crop":"Turmeric",  "soil":"Red",     "area":2,"rainfall":200,"temperature":25},
        {"district":"Vellore",   "season":"Rabi",   "crop":"Groundnut", "soil":"Red",     "area":2,"rainfall":70, "temperature":26},
    ]
    for c in checks:
        p = round(float(pipeline.predict(pd.DataFrame([c]))[0]), 2)
        print(f"  {c['crop']:12} | {c['district']:12} | {c['season']:6} → {p} T/Ha")

if __name__ == "__main__":
    train()
