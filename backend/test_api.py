#!/usr/bin/env python3
"""
Test script for SAM2 Backend API
"""

import requests
import json
import base64
from PIL import Image
import io
import time

API_BASE = "http://localhost:8000"

def create_test_image():
    """Create a simple test image"""
    img = Image.new("RGB", (400, 300), (100, 150, 200))
    # Draw some simple shapes to simulate a building
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    
    # Building outline
    draw.rectangle([50, 100, 350, 250], fill=(180, 140, 100), outline=(0, 0, 0), width=2)
    # Roof
    draw.polygon([(50, 100), (200, 50), (350, 100)], fill=(150, 50, 50))
    # Door
    draw.rectangle([180, 200, 220, 250], fill=(100, 50, 0), outline=(0, 0, 0), width=1)
    # Windows
    draw.rectangle([80, 150, 120, 190], fill=(200, 200, 255), outline=(0, 0, 0), width=1)
    draw.rectangle([280, 150, 320, 190], fill=(200, 200, 255), outline=(0, 0, 0), width=1)
    
    return img

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    response = requests.get(f"{API_BASE}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    return response.status_code == 200

def test_beam_connection():
    """Test Beam connection"""
    print("🔍 Testing Beam connection...")
    response = requests.get(f"{API_BASE}/test-beam")
    result = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Beam Connection: {result.get('connection')}")
    if result.get('error'):
        print(f"   Error: {result['error']}")
    return response.status_code == 200

def test_image_upload():
    """Test image upload"""
    print("🔍 Testing image upload...")
    
    # Create test image
    img = create_test_image()
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    # Upload
    files = {'file': ('test_building.png', img_bytes, 'image/png')}
    response = requests.post(f"{API_BASE}/upload-image", files=files)
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   Image ID: {result['image_id']}")
        print(f"   Dimensions: {result['width']}x{result['height']}")
        return result['image_id']
    else:
        print(f"   Error: {response.text}")
        return None

def test_mask_generation(image_id):
    """Test mask generation"""
    print("🔍 Testing mask generation...")
    
    response = requests.post(f"{API_BASE}/generate-masks/{image_id}")
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"   Masks generated: {result.get('total_masks', 0)}")
        print(f"   Status: {result.get('status')}")
        
        # If it's async, wait and check status
        if result.get('status') == 'processing':
            print("   Waiting for async processing...")
            time.sleep(2)
            
            check_response = requests.get(f"{API_BASE}/check-task/{image_id}")
            if check_response.status_code == 200:
                check_result = check_response.json()
                print(f"   Task Status: {check_result.get('status')}")
        
        return True
    else:
        print(f"   Error: {response.text}")
        return False

def test_mask_selection(image_id):
    """Test mask selection at point"""
    print("🔍 Testing mask selection...")
    
    # Test point in the middle of the image
    x, y = 200, 150
    response = requests.get(f"{API_BASE}/get-mask/{image_id}?x={x}&y={y}")
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        if result.get('mask'):
            print(f"   Found mask at ({x}, {y})")
            print(f"   Mask ID: {result['mask']['id']}")
            return result['mask']['id']
        else:
            print(f"   No mask found at ({x}, {y})")
            return None
    else:
        print(f"   Error: {response.text}")
        return None

def test_color_application(image_id, mask_id):
    """Test color application"""
    print("🔍 Testing color application...")
    
    if mask_id is None:
        print("   Skipping (no mask selected)")
        return False
    
    payload = {
        "mask_ids": [mask_id],
        "color": "#FF0000"
    }
    
    response = requests.post(
        f"{API_BASE}/apply-color/{image_id}",
        json=payload
    )
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   Applied color to {len(result.get('applied_masks', []))} masks")
        print(f"   Result image available: {'colored_image' in result}")
        return True
    else:
        print(f"   Error: {response.text}")
        return False

def test_image_status(image_id):
    """Test image status endpoint"""
    print("🔍 Testing image status...")
    
    response = requests.get(f"{API_BASE}/status/{image_id}")
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"   Image uploaded: {result.get('image_uploaded')}")
        print(f"   Masks generated: {result.get('masks_generated')}")
        print(f"   Task processing: {result.get('task_processing')}")
        return True
    else:
        print(f"   Error: {response.text}")
        return False

def main():
    """Run all tests"""
    print("🧪 SAM2 Backend API Test Suite")
    print("=" * 50)
    
    # Test basic connectivity
    if not test_health():
        print("❌ Health check failed - is the server running?")
        return
    
    # Test Beam connection
    test_beam_connection()
    
    # Test image upload
    image_id = test_image_upload()
    if not image_id:
        print("❌ Image upload failed")
        return
    
    # Test mask generation
    if not test_mask_generation(image_id):
        print("❌ Mask generation failed")
        return
    
    # Test mask selection
    mask_id = test_mask_selection(image_id)
    
    # Test color application
    test_color_application(image_id, mask_id)
    
    # Test status endpoint
    test_image_status(image_id)
    
    print("\n✅ Test suite completed!")
    print(f"🌐 Access the API docs at: {API_BASE}/docs")
    print(f"🖼️  Your test image ID: {image_id}")

if __name__ == "__main__":
    main()
