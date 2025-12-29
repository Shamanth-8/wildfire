
import blip_service
from PIL import Image
import io

def test_blip():
    print("Testing BLIP analysis...")
    # Create a simple RGB image
    img = Image.new('RGB', (200, 200), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()

    try:
        result = blip_service.analyze_image_bytes(img_bytes)
        print("Success:", result)
    except Exception as e:
        print("Failed:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_blip()
