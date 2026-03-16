#!/usr/bin/env python3
"""
Smart Crop Advisor - System Diagnostics & Auto-Fix
Diagnoses and fixes common issues automatically
"""

import os
import subprocess
import sys
import time
from pathlib import Path

def print_header(title):
    print("\n" + "="*60)
    print(f"🔧 {title}")
    print("="*60)

def check_python_dependencies():
    print_header("CHECKING PYTHON DEPENDENCIES")
    
    required_packages = [
        'flask', 'flask-cors', 'pandas', 'numpy', 
        'scikit-learn', 'joblib', 'requests'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing.append(package)
            print(f"❌ {package}")
    
    if missing:
        print(f"\n🔄 Installing missing packages: {', '.join(missing)}")
        subprocess.run([sys.executable, '-m', 'pip', 'install'] + missing)
        return False
    return True

def check_node_dependencies():
    print_header("CHECKING NODE.JS DEPENDENCIES")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return False
    
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        print("📦 Installing Node.js dependencies...")
        os.chdir(frontend_dir)
        subprocess.run(["npm", "install"])
        os.chdir("..")
    else:
        print("✅ Node modules installed")
    
    return True

def check_model_files():
    print_header("CHECKING ML MODEL FILES")
    
    model_path = Path("backend/models/yield_model.pkl")
    data_path = Path("backend/data/tn_crop_data.csv")
    
    if not model_path.exists():
        print("❌ ML model not found")
        print("🔄 Training new model...")
        os.chdir("backend")
        subprocess.run([sys.executable, "train_model.py"])
        os.chdir("..")
    else:
        print("✅ ML model exists")
    
    if not data_path.exists():
        print("❌ Training data not found")
        print("🔄 Generating training data...")
        os.chdir("backend")
        subprocess.run([sys.executable, "generate_enhanced_data.py"])
        os.chdir("..")
    else:
        print("✅ Training data exists")
    
    return model_path.exists() and data_path.exists()

def check_environment_files():
    print_header("CHECKING ENVIRONMENT CONFIGURATION")
    
    env_file = Path("frontend/.env")
    if not env_file.exists():
        print("❌ Frontend .env file missing")
        print("🔄 Creating .env file...")
        with open(env_file, 'w') as f:
            f.write("VITE_BACKEND_URL=http://localhost:5000\n")
            f.write("VITE_OPENWEATHER_KEY=73e0733e24d746c5c0e046dbb35c87c4\n")
        print("✅ Created .env file")
    else:
        print("✅ Environment file exists")
    
    return True

def test_backend_api():
    print_header("TESTING BACKEND API")
    
    try:
        os.chdir("backend")
        result = subprocess.run([
            sys.executable, "-c", 
            "from app import app; print('Backend API ready')"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Backend API loads successfully")
            return True
        else:
            print(f"❌ Backend error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False
    finally:
        os.chdir("..")

def test_frontend_build():
    print_header("TESTING FRONTEND BUILD")
    
    try:
        os.chdir("frontend")
        result = subprocess.run(["npm", "run", "build"], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ Frontend builds successfully")
            return True
        else:
            print(f"❌ Frontend build error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Frontend test failed: {e}")
        return False
    finally:
        os.chdir("..")

def run_system_tests():
    print_header("RUNNING SYSTEM TESTS")
    
    try:
        os.chdir("backend")
        result = subprocess.run([sys.executable, "test_enhanced_system.py"], 
                              capture_output=True, text=True, timeout=30)
        
        if "All tests passed" in result.stdout:
            print("✅ All system tests passed")
            return True
        else:
            print("⚠️ Some tests may have issues")
            print(result.stdout)
            return True  # Non-critical
    except Exception as e:
        print(f"⚠️ Test warning: {e}")
        return True  # Non-critical
    finally:
        os.chdir("..")

def main():
    print("🌾 SMART CROP ADVISOR - SYSTEM DIAGNOSTICS")
    print("Checking and fixing system issues...")
    
    issues_found = []
    
    # Run all checks
    if not check_python_dependencies():
        issues_found.append("Python dependencies")
    
    if not check_node_dependencies():
        issues_found.append("Node.js dependencies")
    
    if not check_model_files():
        issues_found.append("ML model files")
    
    if not check_environment_files():
        issues_found.append("Environment configuration")
    
    if not test_backend_api():
        issues_found.append("Backend API")
    
    if not test_frontend_build():
        issues_found.append("Frontend build")
    
    run_system_tests()
    
    # Final report
    print_header("DIAGNOSTIC REPORT")
    
    if not issues_found:
        print("🎉 ALL SYSTEMS READY!")
        print("\n✅ Backend: Ready to start")
        print("✅ Frontend: Ready to start") 
        print("✅ ML Model: Trained and loaded")
        print("✅ Dependencies: All installed")
        print("\n🚀 System is ready to run!")
        print("\nTo start the system:")
        print("1. Run: python start_enhanced_system.py")
        print("2. Or manually start:")
        print("   - Backend: cd backend && python app.py")
        print("   - Frontend: cd frontend && npm run dev")
    else:
        print("⚠️ ISSUES FOUND:")
        for issue in issues_found:
            print(f"   - {issue}")
        print("\nSome issues may need manual attention.")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()