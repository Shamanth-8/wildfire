
try:
    from fine_tuned_blip import blip_service
    print("Success")
except ImportError as e:
    print(f"ImportError: {e}")
except ModuleNotFoundError as e:
    print(f"ModuleNotFoundError: {e}")
except Exception as e:
    print(f"Exception: {e}")
