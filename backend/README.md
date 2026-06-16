# ScholarAI backend

The backend targets Python 3.11.

```sh
cd backend
/opt/homebrew/bin/python3.11 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

Use the virtual environment's Python explicitly. On macOS, `/usr/bin/python3` is Apple Python
3.9 and is not the project runtime.

For local development, CORS accepts both `http://localhost:5173` and
`http://127.0.0.1:5173`. Set `FRONTEND_URLS` to a comma-separated list to configure additional
origins.

Docker Compose also uses Python 3.11 and passes the frontend API URL and both local CORS origins
explicitly.
