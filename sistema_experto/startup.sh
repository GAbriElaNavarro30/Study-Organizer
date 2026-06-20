#!/bin/bash
pip install experta==1.9.4 --no-deps
pip install frozendict==2.3.4
python -m uvicorn app:app --host 0.0.0.0 --port 8000