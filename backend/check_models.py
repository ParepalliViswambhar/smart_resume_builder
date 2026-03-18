#!/usr/bin/env python3
"""
Script to check available Gemini models with your API key
"""
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY not found in .env file")
    exit(1)

print("Checking available Gemini models...\n")

try:
    genai.configure(api_key=GEMINI_API_KEY)
    
    print("Available models:")
    print("-" * 60)
    
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✓ {model.name}")
            print(f"  Display Name: {model.display_name}")
            print(f"  Description: {model.description[:80]}...")
            print()
    
    print("-" * 60)
    print("\nTesting model initialization:")
    
    # Try to initialize the most common models
    test_models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
    
    for model_name in test_models:
        try:
            test_model = genai.GenerativeModel(model_name)
            print(f"✓ {model_name} - SUCCESS")
        except Exception as e:
            print(f"✗ {model_name} - FAILED: {str(e)[:60]}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nMake sure your API key is valid.")
    print("Get a new key at: https://aistudio.google.com/app/apikey")
