#!/usr/bin/env python3
"""
Smart Crop Advisor - Simple System Startup
Starts both backend and frontend servers
"""

import os
import subprocess
import sys
import time
import threading
from pathlib import Path

def print_banner():
    print("=" * 60)
    print("🌾 SMART CROP ADVISOR - AI FARMING ASSISTANT")
    print("   Enhanced Crop Prediction System")
    print("=" * 60)
    print()

def start_backend():
    """Start Flask backend server"""
    def run_backend():
        print("🚀 Starting Backend API Server...")
        os.chdir("backend")
        try:
            subprocess.run([sys.executable, "app.py"])
        except KeyboardInterrupt:
            print("Backend stopped")
        finally:
            os.chdir("..")
    
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    return backend_thread

def start_frontend():
    """Start Vite frontend server"""
    def run_frontend():
        print("🌐 Starting Frontend Development Server...")
        os.chdir("frontend")
        try:
            subprocess.run(["npm", "run", "dev"])
        except KeyboardInterrupt:
            print("Frontend stopped")
        finally:
            os.chdir("..")
    
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    frontend_thread.start()
    return frontend_thread

def show_system_info():
    """Display system URLs and information"""
    print("\n" + "=" * 60)
    print("🎉 SMART CROP ADVISOR SYSTEM READY!")
    print("=" * 60)
    print()
    print("📊 ACCESS POINTS:")
    print("   • Backend API: http://localhost:5000")
    print("   • Frontend App: http://localhost:3000")
    print()
    print("🌾 FEATURES:")
    print("   • AI Crop Yield Prediction")
    print("   • Intelligent Crop Recommendations")
    print("   • 16+ Crop Varieties Supported")
    print("   • Mobile-Optimized Interface")
    print("   • PDF Report Generation")
    print()
    print("🔧 TESTING:")
    print("   • Test API: python backend/test_enhanced_system.py")
    print("   • Open App: http://localhost:3000")
    print()
    print("=" * 60)

def main():
    print_banner()
    
    # Quick checks
    if not Path("backend/app.py").exists():
        print("❌ Backend not found! Make sure you're in the project root.")
        return
    
    if not Path("frontend/package.json").exists():
        print("❌ Frontend not found! Make sure you're in the project root.")
        return
    
    # Start servers
    print("🔄 Starting system components...")
    
    backend_thread = start_backend()
    time.sleep(3)  # Give backend time to start
    
    frontend_thread = start_frontend()
    time.sleep(2)  # Give frontend time to start
    
    show_system_info()
    
    try:
        print("🔄 System running... Press Ctrl+C to stop")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down Smart Crop Advisor...")
        print("Thank you for using our AI farming assistant!")

if __name__ == "__main__":
    main()