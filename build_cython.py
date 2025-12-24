# build_cython.py
from setuptools import setup
from Cython.Build import cythonize
import os
import glob

# Находим все .py файлы в src, кроме __init__.py (их лучше оставить как есть для пакетов)
# и server.py (точка входа, ее часто проще оставить скриптом или скомпилировать отдельно)
files = glob.glob("src/**/*.py", recursive=True)
files = [f for f in files if "venv" not in f and "tests" not in f]

setup(
    ext_modules=cythonize(
        files,
        compiler_directives={'language_level': "3"},
        build_dir="build_c" # Временная папка для C файлов
    )
)