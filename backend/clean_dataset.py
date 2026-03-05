import pandas as pd

df = pd.read_csv("./data/combine (1).csv", on_bad_lines="skip")

print("Original rows:", len(df))

df = df.dropna()

print("Clean rows:", len(df))

df.to_csv("./data/clean_crop_dataset.csv", index=False)

print("Clean dataset saved")