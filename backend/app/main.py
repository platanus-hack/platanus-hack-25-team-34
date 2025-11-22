from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import app.seed
from app.api import trackers, invest, portfolio, auth
from app.api import chart

app.seed.main()

app = FastAPI(title=settings.PROJECT_NAME, version="0.1.0")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(trackers.router, prefix=settings.API_V1_STR)
app.include_router(invest.router, prefix=settings.API_V1_STR)
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(chart.router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {"message": "Welcome to Hedgie API", "docs": "/docs"}


@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    """Health check endpoint for monitoring and diagnostics."""
    return {"status": "healthy"}
