import sys
import os
import multiprocessing
import uvicorn

# 1. Принудительно включаем мгновенный вывод логов (без задержек)
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# 2. Фикс для Matplotlib на Mac (иначе он может зависнуть при создании кэша)
os.environ['MPLCONFIGDIR'] = "/tmp/matplotlib_cache"

# Нужно для Windows
if sys.platform.startswith('win'):
    multiprocessing.freeze_support()

# Импортируем сервер
from src.api.server import app

if __name__ == "__main__":
    # Запускаем
    print("--- LAUNCHER STARTED ---")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info", workers=1)