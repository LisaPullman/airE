"""允许 `python -m tts_skill` 调用。"""
from .tts_client import main
import sys

if __name__ == "__main__":
    sys.exit(main())