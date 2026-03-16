#!/usr/bin/env python3
"""
Enhanced Model Setup Script
Generates realistic training data and trains the ML model for crop prediction
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def setup_directories():
    """Create necessary directories"""
    directories = ["./data", "./models"]
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"📁 Created directory: {directory}")

def main():
    print("Enhanced Crop Prediction Model Setup")
    print("=" * 40)
    
    # Create directories
    setup_directories()
    
    # Generate enhanced training data
    if run_command("python generate_enhanced_data.py", "Generating enhanced training data"):
        
        # Train the model with new data
        if run_command("python train_model.py", "Training ML model"):
            
            print("\n🎉 Setup completed successfully!")
            print("\nNext steps:")
            print("1. Start the Flask server: python app.py")
            print("2. Test the system: python test_enhanced_system.py")
            print("3. Start the frontend and test the enhanced recommendations")
            
        else:
            print("\n❌ Model training failed. Check the error messages above.")
    else:
        print("\n❌ Data generation failed. Check the error messages above.")

if __name__ == "__main__":
    main()