import os
import shutil
import glob
from setuptools import setup
from Cython.Build import cythonize
import PyInstaller.__main__
import clip

# 1. Настройки
BUILD_DIR = "build_cython"
DIST_DIR = "dist"

clip_path = os.path.dirname(clip.__file__)

# Шифрование кода (оставляем как было)
files_to_compile = []
for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(".py") and file != "__init__.py":
            files_to_compile.append(os.path.join(root, file))

try:
    setup(
        name="SculptorEngine",
        ext_modules=cythonize(
            files_to_compile,
            compiler_directives={'language_level': "3", 'always_allow_keywords': True},
            build_dir=BUILD_DIR
        ),
        script_args=["build_ext", "--inplace"]
    )
except Exception:
    pass # Игнорируем ошибки cython, если файлы уже есть

# 3. Упаковка PyInstaller (ГЛАВНЫЕ ИЗМЕНЕНИЯ ЗДЕСЬ)
print("📦 Packaging with PyInstaller (ONEDIR MODE)...")

add_data_sep = ":"

PyInstaller.__main__.run([
    'launcher.py',
    '--name=server',
    '--onedir',           # <--- БЫЛО --onefile, СТАЛО --onedir
    '--clean',
    '--noconsole',
    # '--windowed',       # Можно добавить для Mac, чтобы точно не было консоли
    
    # Данные
    f'--add-data=config.yaml{add_data_sep}.',
    f'--add-data={clip_path}{add_data_sep}clip',
    
    # Импорты
    '--hidden-import=uvicorn.logging',
    '--hidden-import=uvicorn.loops',
    '--hidden-import=uvicorn.loops.auto',
    '--hidden-import=uvicorn.protocols',
    '--hidden-import=uvicorn.protocols.http',
    '--hidden-import=uvicorn.protocols.http.auto',
    '--hidden-import=uvicorn.lifespan',
    '--hidden-import=uvicorn.lifespan.on',
    '--hidden-import=engineio.async_drivers.asgi',
    '--hidden-import=scikit-image',
    '--hidden-import=sklearn.neighbors._partition_nodes',
    
    '--paths=.',
])

print("✅ Build complete! Check 'dist/server' FOLDER")