// Enhanced Language System with Performance Optimization
export const LANGUAGES = {
  en: { name: "English", flag: "🇺🇸", code: "en" },
  ta: { name: "தமிழ்", flag: "🇮🇳", code: "ta" },
  hi: { name: "हिंदी", flag: "🇮🇳", code: "hi" }
};

export const LANG = {
  en: {
    // App Core
    appTitle: "Smart Crop Advisor",
    appSubtitle: "AI-Powered Farming Assistant",
    
    // Navigation
    home: "Home",
    predict: "Predict",
    history: "History",
    settings: "Settings",
    
    // Home Page
    homeTitle: "Tamil Nadu Crop Yield Predictor",
    homeDesc: "Get intelligent crop recommendations using AI and real-time weather data",
    welcomeMsg: "Welcome to Smart Farming",
    getStarted: "Get Started",
    learnMore: "Learn More",
    
    // Prediction Page
    predictTitle: "Crop Yield Prediction",
    inputForm: "Enter Farm Details",
    crop: "Crop Type",
    season: "Season",
    area: "Area (Hectares)",
    district: "District",
    soil: "Soil Type",
    rainfall: "Rainfall (mm)",
    temperature: "Temperature (°C)",
    predictBtn: "Predict Yield",
    predicting: "Predicting...",
    
    // Results
    results: "Prediction Results",
    predictedYield: "Predicted Yield",
    recommendedCrop: "Recommended Crop",
    marketPrice: "Market Price",
    suitabilityScore: "Suitability Score",
    topRecommendations: "Top Recommendations",
    currentCropAnalysis: "Current Crop Analysis",
    
    // Weather
    liveWeather: "Live Weather",
    weatherData: "Weather Data",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    
    // Charts & Analytics
    chartTitle: "Yield Analysis",
    yieldTrend: "Yield Trend",
    comparison: "Comparison",
    historical: "Historical Data",
    
    // Actions
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    export: "Export",
    download: "Download",
    share: "Share",
    
    // Status Messages
    loading: "Loading...",
    success: "Success!",
    error: "Error occurred",
    noData: "No data available",
    tryAgain: "Try Again",
    
    // Units
    tonsPerHectare: "tons/hectare",
    rupees: "₹",
    celsius: "°C",
    millimeters: "mm",
    percentage: "%",
    
    // Crops
    crops: {
      rice: "Rice",
      maize: "Maize",
      sugarcane: "Sugarcane",
      cotton: "Cotton",
      groundnut: "Groundnut",
      banana: "Banana",
      coconut: "Coconut",
      ragi: "Ragi",
      chilli: "Chilli",
      turmeric: "Turmeric",
      millets: "Millets",
      blackGram: "Black Gram",
      greenGram: "Green Gram",
      sesame: "Sesame",
      sunflower: "Sunflower",
      soybean: "Soybean"
    },
    
    // Seasons
    seasons: {
      kharif: "Kharif (Monsoon)",
      rabi: "Rabi (Winter)",
      summer: "Summer"
    },
    
    // Soil Types
    soilTypes: {
      alluvial: "Alluvial",
      red: "Red Soil",
      black: "Black Soil",
      clay: "Clay",
      loamy: "Loamy"
    },
    
    // Districts
    districts: {
      thanjavur: "Thanjavur",
      coimbatore: "Coimbatore",
      salem: "Salem",
      madurai: "Madurai",
      erode: "Erode",
      trichy: "Trichy",
      vellore: "Vellore",
      tirunelveli: "Tirunelveli",
      kancheepuram: "Kancheepuram"
    },

    // Prediction Summary & Analysis
    summary: {
      title: "Prediction Summary",
      overview: "Analysis Overview",
      keyInsights: "Key Insights",
      recommendations: "Recommendations",
      riskFactors: "Risk Factors",
      nextSteps: "Next Steps",
      confidence: "Confidence Level",
      accuracy: "Prediction Accuracy"
    },

    // Detailed Analysis Content
    analysis: {
      excellent: "Excellent conditions for cultivation",
      good: "Good conditions with minor considerations",
      moderate: "Moderate conditions requiring attention",
      poor: "Poor conditions - consider alternatives",
      unsuitable: "Unsuitable conditions for this crop",
      
      soilMatch: "Soil type is well-suited for this crop",
      soilMismatch: "Soil type may not be optimal",
      rainfallOptimal: "Rainfall levels are optimal",
      rainfallLow: "Rainfall is below optimal levels",
      rainfallHigh: "Rainfall is above optimal levels",
      tempOptimal: "Temperature is in the ideal range",
      tempLow: "Temperature is below optimal range",
      tempHigh: "Temperature is above optimal range",
      seasonGood: "Season is suitable for cultivation",
      seasonPoor: "Season may not be ideal",
      
      yieldHigh: "Expected yield is above average",
      yieldAverage: "Expected yield is average",
      yieldLow: "Expected yield is below average",
      
      priceGood: "Market prices are favorable",
      priceAverage: "Market prices are moderate",
      pricePoor: "Market prices are currently low"
    },

    // Advice & Recommendations
    advice: {
      irrigation: "Consider supplemental irrigation",
      drainage: "Ensure proper drainage systems",
      fertilizer: "Apply recommended fertilizers",
      pestControl: "Monitor for pest and disease",
      timing: "Plant at the optimal time",
      varieties: "Choose suitable crop varieties",
      soilPrep: "Prepare soil adequately",
      weatherWatch: "Monitor weather conditions",
      
      highYield: "Conditions favor high yield potential",
      mediumYield: "Moderate yield expected with proper care",
      lowYield: "Consider alternative crops or improved practices",
      
      marketTiming: "Consider market timing for better prices",
      storageNeeds: "Plan for proper storage facilities",
      transportAccess: "Ensure transport access to markets"
    },

    // Risk Assessment
    risks: {
      weather: "Weather-related risks",
      market: "Market price volatility",
      pest: "Pest and disease pressure",
      soil: "Soil-related challenges",
      water: "Water availability issues",
      
      low: "Low risk",
      medium: "Medium risk",
      high: "High risk",
      
      drought: "Drought risk due to low rainfall",
      flood: "Flooding risk due to excess rainfall",
      heat: "Heat stress risk",
      cold: "Cold damage risk"
    },

    // PDF Report Content
    report: {
      title: "Crop Prediction Report",
      generatedOn: "Generated on",
      farmDetails: "Farm Details",
      predictions: "Predictions & Analysis",
      recommendations: "Recommendations",
      disclaimer: "This report is based on AI predictions and should be used as guidance only",
      
      sections: {
        input: "Input Parameters",
        results: "Prediction Results",
        analysis: "Detailed Analysis",
        advice: "Expert Advice",
        alternatives: "Alternative Crops",
        timeline: "Cultivation Timeline"
      }
    }
  },

  ta: {
    // App Core
    appTitle: "ஸ்மார்ட் பயிர் ஆலோசகர்",
    appSubtitle: "AI-சக்தி வாய்ந்த விவசாய உதவியாளர்",
    
    // Navigation
    home: "முகப்பு",
    predict: "கணிப்பு",
    history: "வரலாறு",
    settings: "அமைப்புகள்",
    
    // Home Page
    homeTitle: "தமிழ்நாடு பயிர் விளைச்சல் கணிப்பான்",
    homeDesc: "AI மற்றும் நேரடி வானிலை தரவுகளைப் பயன்படுத்தி புத்திசாலித்தனமான பயிர் பரிந்துரைகளைப் பெறுங்கள்",
    welcomeMsg: "ஸ்மார்ட் விவசாயத்திற்கு வரவேற்கிறோம்",
    getStarted: "தொடங்குங்கள்",
    learnMore: "மேலும் அறிக",
    
    // Prediction Page
    predictTitle: "பயிர் விளைச்சல் கணிப்பு",
    inputForm: "பண்ணை விவரங்களை உள்ளிடுங்கள்",
    crop: "பயிர் வகை",
    season: "பருவம்",
    area: "பரப்பளவு (ஹெக்டேர்)",
    district: "மாவட்டம்",
    soil: "மண் வகை",
    rainfall: "மழைப்பொழிவு (மிமீ)",
    temperature: "வெப்பநிலை (°C)",
    predictBtn: "விளைச்சலை கணிக்கவும்",
    predicting: "கணிக்கிறது...",
    
    // Results
    results: "கணிப்பு முடிவுகள்",
    predictedYield: "கணிக்கப்பட்ட விளைச்சல்",
    recommendedCrop: "பரிந்துரைக்கப்பட்ட பயிர்",
    marketPrice: "சந்தை விலை",
    suitabilityScore: "பொருத்தமான மதிப்பெண்",
    topRecommendations: "சிறந்த பரிந்துரைகள்",
    currentCropAnalysis: "தற்போதைய பயிர் பகுப்பாய்வு",
    
    // Weather
    liveWeather: "நேரடி வானிலை",
    weatherData: "வானிலை தரவு",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    
    // Charts & Analytics
    chartTitle: "விளைச்சல் பகுப்பாய்வு",
    yieldTrend: "விளைச்சல் போக்கு",
    comparison: "ஒப்பீடு",
    historical: "வரலாற்று தரவு",
    
    // Actions
    save: "சேமிக்கவும்",
    cancel: "ரத்து செய்",
    reset: "மீட்டமை",
    export: "ஏற்றுமதி",
    download: "பதிவிறக்கம்",
    share: "பகிர்வு",
    
    // Status Messages
    loading: "ஏற்றுகிறது...",
    success: "வெற்றி!",
    error: "பிழை ஏற்பட்டது",
    noData: "தரவு இல்லை",
    tryAgain: "மீண்டும் முயற்சிக்கவும்",
    
    // Units
    tonsPerHectare: "டன்/ஹெக்டேர்",
    rupees: "₹",
    celsius: "°C",
    millimeters: "மிமீ",
    percentage: "%",
    
    // Crops
    crops: {
      rice: "நெல்",
      maize: "சோளம்",
      sugarcane: "கரும்பு",
      cotton: "பருத்தி",
      groundnut: "நிலக்கடலை",
      banana: "வாழை",
      coconut: "தென்னை",
      ragi: "கேழ்வரகு",
      chilli: "மிளகாய்",
      turmeric: "மஞ்சள்",
      millets: "சிறுதானியங்கள்",
      blackGram: "உளுந்து",
      greenGram: "பயறு",
      sesame: "எள்",
      sunflower: "சூரியகாந்தி",
      soybean: "சோயாபீன்"
    },
    
    // Seasons
    seasons: {
      kharif: "கரீப் (மழைக்காலம்)",
      rabi: "ரபி (குளிர்காலம்)",
      summer: "கோடைகாலம்"
    },
    
    // Soil Types
    soilTypes: {
      alluvial: "வண்டல் மண்",
      red: "சிவப்பு மண்",
      black: "கருப்பு மண்",
      clay: "களிமண்",
      loamy: "கலப்பு மண்"
    },
    
    // Districts
    districts: {
      thanjavur: "தஞ்சாவூர்",
      coimbatore: "கோயம்புத்தூர்",
      salem: "சேலம்",
      madurai: "மதுரை",
      erode: "ஈரோடு",
      trichy: "திருச்சி",
      vellore: "வேலூர்",
      tirunelveli: "திருநெல்வேலி",
      kancheepuram: "காஞ்சிபுரம்"
    },

    // Prediction Summary & Analysis
    summary: {
      title: "கணிப்பு சுருக்கம்",
      overview: "பகுப்பாய்வு மேலோட்டம்",
      keyInsights: "முக்கிய நுண்ணறிவுகள்",
      recommendations: "பரிந்துரைகள்",
      riskFactors: "ஆபத்து காரணிகள்",
      nextSteps: "அடுத்த படிகள்",
      confidence: "நம்பிக்கை நிலை",
      accuracy: "கணிப்பு துல்லியம்"
    },

    // Detailed Analysis Content
    analysis: {
      excellent: "சாகுபடிக்கு சிறந்த நிலைமைகள்",
      good: "சிறிய கவனிப்புகளுடன் நல்ல நிலைமைகள்",
      moderate: "கவனம் தேவைப்படும் மிதமான நிலைமைகள்",
      poor: "மோசமான நிலைமைகள் - மாற்றுகளை பரிசீலிக்கவும்",
      unsuitable: "இந்த பயிருக்கு பொருத்தமற்ற நிலைமைகள்",
      
      soilMatch: "மண் வகை இந்த பயிருக்கு மிகவும் பொருத்தமானது",
      soilMismatch: "மண் வகை சிறந்ததாக இல்லாமல் இருக்கலாம்",
      rainfallOptimal: "மழைப்பொழிவு அளவுகள் சிறந்தவை",
      rainfallLow: "மழைப்பொழிவு சிறந்த அளவுகளுக்கு கீழே உள்ளது",
      rainfallHigh: "மழைப்பொழிவு சிறந்த அளவுகளுக்கு மேலே உள்ளது",
      tempOptimal: "வெப்பநிலை சிறந்த வரம்பில் உள்ளது",
      tempLow: "வெப்பநிலை சிறந்த வரம்பிற்கு கீழே உள்ளது",
      tempHigh: "வெப்பநிலை சிறந்த வரம்பிற்கு மேலே உள்ளது",
      seasonGood: "பருவம் சாகுபடிக்கு பொருத்தமானது",
      seasonPoor: "பருவம் சிறந்ததாக இல்லாமல் இருக்கலாம்",
      
      yieldHigh: "எதிர்பார்க்கப்படும் விளைச்சல் சராசரிக்கு மேலே உள்ளது",
      yieldAverage: "எதிர்பார்க்கப்படும் விளைச்சல் சராசரி",
      yieldLow: "எதிர்பார்க்கப்படும் விளைச்சல் சராசரிக்கு கீழே உள்ளது",
      
      priceGood: "சந்தை விலைகள் சாதகமானவை",
      priceAverage: "சந்தை விலைகள் மிதமானவை",
      pricePoor: "சந்தை விலைகள் தற்போது குறைவாக உள்ளன"
    },

    // Advice & Recommendations
    advice: {
      irrigation: "கூடுதல் நீர்ப்பாசனத்தை பரிசீலிக்கவும்",
      drainage: "சரியான வடிகால் அமைப்புகளை உறுதி செய்யவும்",
      fertilizer: "பரிந்துரைக்கப்பட்ட உரங்களை பயன்படுத்தவும்",
      pestControl: "பூச்சி மற்றும் நோய்களை கண்காணிக்கவும்",
      timing: "சிறந்த நேரத்தில் நடவு செய்யவும்",
      varieties: "பொருத்தமான பயிர் வகைகளை தேர்வு செய்யவும்",
      soilPrep: "மண்ணை போதுமான அளவு தயார் செய்யவும்",
      weatherWatch: "வானிலை நிலைமைகளை கண்காணிக்கவும்",
      
      highYield: "நிலைமைகள் அதிக விளைச்சல் சாத்தியத்தை ஆதரிக்கின்றன",
      mediumYield: "சரியான பராமரிப்புடன் மிதமான விளைச்சல் எதிர்பார்க்கப்படுகிறது",
      lowYield: "மாற்று பயிர்கள் அல்லது மேம்பட்ட நடைமுறைகளை பரிசீலிக்கவும்",
      
      marketTiming: "சிறந்த விலைகளுக்கு சந்தை நேரத்தை பரிசீலிக்கவும்",
      storageNeeds: "சரியான சேமிப்பு வசதிகளுக்கு திட்டமிடவும்",
      transportAccess: "சந்தைகளுக்கு போக்குவரத்து அணுகலை உறுதி செய்யவும்"
    },

    // Risk Assessment
    risks: {
      weather: "வானிலை தொடர்பான ஆபத்துகள்",
      market: "சந்தை விலை ஏற்ற இறக்கம்",
      pest: "பூச்சி மற்றும் நோய் அழுத்தம்",
      soil: "மண் தொடர்பான சவால்கள்",
      water: "நீர் கிடைக்கும் பிரச்சினைகள்",
      
      low: "குறைந்த ஆபத்து",
      medium: "மிதமான ஆபத்து",
      high: "அதிக ஆபத்து",
      
      drought: "குறைந்த மழைப்பொழிவு காரணமாக வறட்சி ஆபத்து",
      flood: "அதிக மழைப்பொழிவு காரணமாக வெள்ள ஆபத்து",
      heat: "வெப்ப அழுத்த ஆபத்து",
      cold: "குளிர் சேத ஆபத்து"
    },

    // PDF Report Content
    report: {
      title: "பயிர் கணிப்பு அறிக்கை",
      generatedOn: "உருவாக்கப்பட்ட தேதி",
      farmDetails: "பண்ணை விவரங்கள்",
      predictions: "கணிப்புகள் மற்றும் பகுப்பாய்வு",
      recommendations: "பரிந்துரைகள்",
      disclaimer: "இந்த அறிக்கை AI கணிப்புகளை அடிப்படையாகக் கொண்டது மற்றும் வழிகாட்டுதலாக மட்டுமே பயன்படுத்தப்பட வேண்டும்",
      
      sections: {
        input: "உள்ளீட்டு அளவுருகள்",
        results: "கணிப்பு முடிவுகள்",
        analysis: "விரிவான பகுப்பாய்வு",
        advice: "நிபுணர் ஆலோசனை",
        alternatives: "மாற்று பயிர்கள்",
        timeline: "சாகுபடி காலவரிசை"
      }
    }
  },

  hi: {
    // App Core
    appTitle: "स्मार्ट फसल सलाहकार",
    appSubtitle: "AI-संचालित कृषि सहायक",
    
    // Navigation
    home: "होम",
    predict: "भविष्यवाणी",
    history: "इतिहास",
    settings: "सेटिंग्स",
    
    // Home Page
    homeTitle: "तमिलनाडु फसल उत्पादन भविष्यवक्ता",
    homeDesc: "AI और वास्तविक समय मौसम डेटा का उपयोग करके बुद्धिमान फसल सिफारिशें प्राप्त करें",
    welcomeMsg: "स्मार्ट खेती में आपका स्वागत है",
    getStarted: "शुरू करें",
    learnMore: "और जानें",
    
    // Prediction Page
    predictTitle: "फसल उत्पादन भविष्यवाणी",
    inputForm: "खेत का विवरण दर्ज करें",
    crop: "फसल का प्रकार",
    season: "मौसम",
    area: "क्षेत्रफल (हेक्टेयर)",
    district: "जिला",
    soil: "मिट्टी का प्रकार",
    rainfall: "वर्षा (मिमी)",
    temperature: "तापमान (°C)",
    predictBtn: "उत्पादन की भविष्यवाणी करें",
    predicting: "भविष्यवाणी कर रहा है...",
    
    // Results
    results: "भविष्यवाणी परिणाम",
    predictedYield: "अनुमानित उत्पादन",
    recommendedCrop: "सुझाई गई फसल",
    marketPrice: "बाजार मूल्य",
    suitabilityScore: "उपयुक्तता स्कोर",
    topRecommendations: "शीर्ष सिफारिशें",
    currentCropAnalysis: "वर्तमान फसल विश्लेषण",
    
    // Weather
    liveWeather: "लाइव मौसम",
    weatherData: "मौसम डेटा",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    windSpeed: "हवा की गति",
    
    // Charts & Analytics
    chartTitle: "उत्पादन विश्लेषण",
    yieldTrend: "उत्पादन प्रवृत्ति",
    comparison: "तुलना",
    historical: "ऐतिहासिक डेटा",
    
    // Actions
    save: "सेव करें",
    cancel: "रद्द करें",
    reset: "रीसेट",
    export: "निर्यात",
    download: "डाउनलोड",
    share: "साझा करें",
    
    // Status Messages
    loading: "लोड हो रहा है...",
    success: "सफलता!",
    error: "त्रुटि हुई",
    noData: "कोई डेटा उपलब्ध नहीं",
    tryAgain: "पुनः प्रयास करें",
    
    // Units
    tonsPerHectare: "टन/हेक्टेयर",
    rupees: "₹",
    celsius: "°C",
    millimeters: "मिमी",
    percentage: "%",
    
    // Crops
    crops: {
      rice: "चावल",
      maize: "मक्का",
      sugarcane: "गन्ना",
      cotton: "कपास",
      groundnut: "मूंगफली",
      banana: "केला",
      coconut: "नारियल",
      ragi: "रागी",
      chilli: "मिर्च",
      turmeric: "हल्दी",
      millets: "बाजरा",
      blackGram: "उड़द",
      greenGram: "मूंग",
      sesame: "तिल",
      sunflower: "सूरजमुखी",
      soybean: "सोयाबीन"
    },
    
    // Seasons
    seasons: {
      kharif: "खरीफ (मानसून)",
      rabi: "रबी (सर्दी)",
      summer: "गर्मी"
    },
    
    // Soil Types
    soilTypes: {
      alluvial: "जलोढ़",
      red: "लाल मिट्टी",
      black: "काली मिट्टी",
      clay: "चिकनी मिट्टी",
      loamy: "दोमट मिट्टी"
    },
    
    // Districts
    districts: {
      thanjavur: "तंजावुर",
      coimbatore: "कोयंबटूर",
      salem: "सेलम",
      madurai: "मदुरै",
      erode: "इरोड",
      trichy: "तिरुचि",
      vellore: "वेल्लोर",
      tirunelveli: "तिरुनेलवेली",
      kancheepuram: "कांचीपुरम"
    }
  }
};

// Language utility functions
export const getLanguageFromStorage = () => {
  try {
    return localStorage.getItem('preferredLanguage') || 'en';
  } catch {
    return 'en';
  }
};

export const setLanguageToStorage = (lang) => {
  try {
    localStorage.setItem('preferredLanguage', lang);
  } catch {
    console.warn('Could not save language preference');
  }
};

export const getTranslation = (lang, key, fallback = key) => {
  try {
    const keys = key.split('.');
    let value = LANG[lang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || LANG.en[key] || fallback;
  } catch {
    return fallback;
  }
};

// Performance optimized translation hook
export const useTranslation = (lang) => {
  const t = (key, fallback) => getTranslation(lang, key, fallback);
  
  return { t, lang, translations: LANG[lang] };
};
  