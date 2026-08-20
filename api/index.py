import sys
import os

# Add root directory to sys.path so main.py and rag_engine.py are discoverable by Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from main import app

# Export the FastAPI app instance for Vercel
app = app
