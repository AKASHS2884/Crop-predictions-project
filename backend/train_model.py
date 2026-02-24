import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, r2_score
from processor import load_and_clean

DATA_PATH = "./data/tn_crop_data.csv"
MODEL_PATH = "./models/yield_model.pkl"

def train():
    df = load_and_clean(DATA_PATH)

    # X = df[["district", "season", "crop", "area", "rainfall", "temperature"]]
    X = df[["district","season","crop","soil","area","rainfall","temperature"]]

    y = df["yield"]

    # cat_cols = ["district", "season", "crop"]
    cat_cols=["district","season","crop","soil"]

    num_cols = ["area", "rainfall", "temperature"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", "passthrough", num_cols)
        ]
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        max_depth=18
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    print("MAE:", mean_absolute_error(y_test, preds))
    print("R2 :", r2_score(y_test, preds))

    joblib.dump(pipeline, MODEL_PATH)
    print("✅ Model saved to:", MODEL_PATH)

if __name__ == "__main__":
    train()
