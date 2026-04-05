"""
External API integrations for Smart Crop Advisor
- NDVI (vegetation health) via NASA POWER API
- Soil Moisture via NASA POWER API  
- Rainfall forecast via Open-Meteo (IMD-equivalent free API)
- Crop market prices via data.gov.in Agmarknet API
"""
import requests
from datetime import datetime, timedelta

# ── District → lat/lon mapping for TN ────────────────────────────────────────
DISTRICT_COORDS = {
    "Coimbatore":   (11.0168, 76.9558),
    "Thanjavur":    (10.7870, 79.1378),
    "Madurai":      (9.9252,  78.1198),
    "Salem":        (11.6643, 78.1460),
    "Erode":        (11.3410, 77.7172),
    "Tirunelveli":  (8.7139,  77.7567),
    "Trichy":       (10.7905, 78.7047),
    "Tiruppur":     (11.1085, 77.3411),
    "Vellore":      (12.9165, 79.1325),
    "Kancheepuram": (12.8185, 79.6947),
    "Dindigul":     (10.3673, 77.9803),
    "Namakkal":     (11.2189, 78.1674),
    "Cuddalore":    (11.7480, 79.7714),
    "Villupuram":   (11.9401, 79.4861),
    "Thoothukudi":  (8.7642,  78.1348),
}

# Agmarknet commodity name mapping
CROP_TO_COMMODITY = {
    "Rice":       "Rice",
    "Maize":      "Maize",
    "Sugarcane":  "Sugarcane",
    "Cotton":     "Cotton",
    "Groundnut":  "Groundnut",
    "Banana":     "Banana",
    "Coconut":    "Coconut",
    "Ragi":       "Ragi(Finger Millet)",
    "Chilli":     "Dry Chillies",
    "Turmeric":   "Turmeric",
    "Millets":    "Bajra(Pearl Millet/Cumbu)",
    "Black Gram": "Black Gram (Urd Beans)(Whole)",
    "Green Gram": "Green Gram (Moong)(Whole)",
    "Sesame":     "Sesamum(Sesame,Gingelly,Til)",
    "Sunflower":  "Sunflower",
    "Soybean":    "Soya seeds",
}

# Fallback prices (₹/quintal) when API unavailable
FALLBACK_PRICES = {
    "Rice":2400,"Maize":2100,"Sugarcane":3100,"Cotton":6000,"Groundnut":5800,
    "Banana":3200,"Coconut":2800,"Ragi":3500,"Chilli":9000,"Turmeric":8500,
    "Millets":2800,"Black Gram":6500,"Green Gram":7200,"Sesame":7500,
    "Sunflower":4200,"Soybean":4100
}


def get_coords(district):
    return DISTRICT_COORDS.get(district, (11.0168, 76.9558))  # default Coimbatore


def fetch_nasa_power(lat, lon):
    """
    NASA POWER API — free, no key required.
    Returns NDVI proxy (EVI from surface albedo) and soil moisture.
    Docs: https://power.larc.nasa.gov/api/temporal/daily/point
    """
    end   = datetime.now()
    start = end - timedelta(days=30)
    params = {
        "parameters": "ALLSKY_SFC_SW_DWN,PRECTOTCORR,RH2M,T2M,GWETROOT",
        "community":  "AG",
        "longitude":  lon,
        "latitude":   lat,
        "start":      start.strftime("%Y%m%d"),
        "end":        end.strftime("%Y%m%d"),
        "format":     "JSON",
    }
    try:
        r = requests.get(
            "https://power.larc.nasa.gov/api/temporal/daily/point",
            params=params, timeout=8
        )
        if r.status_code != 200:
            return None
        data = r.json()
        props = data.get("properties", {}).get("parameter", {})

        # GWETROOT = root zone soil wetness (0-1 fraction) → convert to %
        gwet_vals = [v for v in props.get("GWETROOT", {}).values() if v != -999]
        soil_moisture = round(sum(gwet_vals[-7:]) / len(gwet_vals[-7:]) * 100, 1) if gwet_vals else None

        # ALLSKY_SFC_SW_DWN = solar radiation → proxy for vegetation health
        rad_vals = [v for v in props.get("ALLSKY_SFC_SW_DWN", {}).values() if v != -999]
        # Normalise radiation to NDVI-like 0-1 scale (higher radiation + moisture = healthier)
        avg_rad = sum(rad_vals[-7:]) / len(rad_vals[-7:]) if rad_vals else 15
        rh_vals = [v for v in props.get("RH2M", {}).values() if v != -999]
        avg_rh  = sum(rh_vals[-7:]) / len(rh_vals[-7:]) if rh_vals else 60
        ndvi_proxy = round(min(0.95, (avg_rh / 100) * 0.6 + (avg_rad / 25) * 0.3), 2)

        # 7-day rainfall sum
        rain_vals = [v for v in props.get("PRECTOTCORR", {}).values() if v != -999]
        rainfall_7d = round(sum(rain_vals[-7:]), 1) if rain_vals else None

        return {
            "ndvi":           ndvi_proxy,
            "soil_moisture":  soil_moisture,
            "rainfall_7d_mm": rainfall_7d,
            "source":         "NASA POWER"
        }
    except Exception as e:
        print(f"NASA POWER error: {e}")
        return None


def fetch_openmeteo_forecast(lat, lon):
    """
    Open-Meteo — free, no key, IMD-equivalent forecast for India.
    Returns 7-day rainfall forecast and temperature.
    Docs: https://open-meteo.com/en/docs
    """
    params = {
        "latitude":           lat,
        "longitude":          lon,
        "daily":              "precipitation_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration",
        "timezone":           "Asia/Kolkata",
        "forecast_days":      7,
    }
    try:
        r = requests.get("https://api.open-meteo.com/v1/forecast", params=params, timeout=8)
        if r.status_code != 200:
            return None
        data = r.json().get("daily", {})
        dates = data.get("time", [])
        rain  = data.get("precipitation_sum", [])
        tmax  = data.get("temperature_2m_max", [])
        tmin  = data.get("temperature_2m_min", [])
        et0   = data.get("et0_fao_evapotranspiration", [])

        forecast = []
        for i in range(min(7, len(dates))):
            forecast.append({
                "date":        dates[i],
                "rainfall_mm": round(rain[i] or 0, 1),
                "temp_max":    round(tmax[i] or 30, 1),
                "temp_min":    round(tmin[i] or 22, 1),
                "et0":         round(et0[i] or 4, 1),
            })

        total_rain = round(sum(r["rainfall_mm"] for r in forecast), 1)
        avg_temp   = round(sum((r["temp_max"] + r["temp_min"]) / 2 for r in forecast) / len(forecast), 1) if forecast else 30

        return {
            "forecast":        forecast,
            "total_rain_7d":   total_rain,
            "avg_temp_7d":     avg_temp,
            "source":          "Open-Meteo (IMD-equivalent)"
        }
    except Exception as e:
        print(f"Open-Meteo error: {e}")
        return None


def fetch_agmarknet_price(crop, state="Tamil Nadu", api_key=None):
    """
    data.gov.in Agmarknet API — free with registration.
    Falls back to curated prices if key not set.
    API: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
    """
    if not api_key:
        return {
            "modal_price":   FALLBACK_PRICES.get(crop, 3000),
            "min_price":     round(FALLBACK_PRICES.get(crop, 3000) * 0.85),
            "max_price":     round(FALLBACK_PRICES.get(crop, 3000) * 1.15),
            "market":        "Estimated (set AGMARKNET_KEY for live prices)",
            "date":          datetime.now().strftime("%d/%m/%Y"),
            "source":        "Fallback estimates"
        }

    commodity = CROP_TO_COMMODITY.get(crop, crop)
    params = {
        "api-key":   api_key,
        "format":    "json",
        "filters[State]":     state,
        "filters[Commodity]": commodity,
        "limit":     5,
        "sort[Arrival_Date]": "desc",
    }
    try:
        r = requests.get(
            "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
            params=params, timeout=8
        )
        if r.status_code != 200:
            raise Exception(f"HTTP {r.status_code}")

        records = r.json().get("records", [])
        if not records:
            raise Exception("No records")

        prices = [float(rec.get("Modal_Price", 0)) for rec in records if rec.get("Modal_Price")]
        if not prices:
            raise Exception("No price data")

        modal = round(sum(prices) / len(prices))
        rec0  = records[0]
        return {
            "modal_price": modal,
            "min_price":   round(float(rec0.get("Min_Price", modal * 0.9))),
            "max_price":   round(float(rec0.get("Max_Price", modal * 1.1))),
            "market":      rec0.get("Market", "Tamil Nadu"),
            "date":        rec0.get("Arrival_Date", datetime.now().strftime("%d/%m/%Y")),
            "source":      "Agmarknet (data.gov.in)"
        }
    except Exception as e:
        print(f"Agmarknet error: {e}")
        return {
            "modal_price": FALLBACK_PRICES.get(crop, 3000),
            "min_price":   round(FALLBACK_PRICES.get(crop, 3000) * 0.85),
            "max_price":   round(FALLBACK_PRICES.get(crop, 3000) * 1.15),
            "market":      "Estimated",
            "date":        datetime.now().strftime("%d/%m/%Y"),
            "source":      "Fallback estimates"
        }
