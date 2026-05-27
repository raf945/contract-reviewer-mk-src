from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()

from .models.HealthCheck import HealthCheck
from .routers.bucket import router as files_router
from .routers.azure import router as analyse_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins='http://localhost:5173/',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files_router)
app.include_router(analyse_router)

@app.get(
    '/health/',
    tags=['healthcheck'],
    summary='Perform a Health Check',
    response_description='Return HTTP Status Code 200 (OK)',
    status_code=status.HTTP_200_OK,
    response_model=HealthCheck,
)
def get_health() -> HealthCheck:
    return HealthCheck(status='ok')