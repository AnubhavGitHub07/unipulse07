import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, attendance, timetable, pyq, result

app = FastAPI(
    title="UniPulse API",
    description="Smart Campus Platform API",
    version="1.0.0"
)

# CORS middleware
cors_origins = settings.CORS_ORIGINS
if isinstance(cors_origins, str):
    cors_origins = ["*"] if cors_origins == "*" else cors_origins.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if isinstance(cors_origins, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(timetable.router)
app.include_router(pyq.router)
app.include_router(result.router)

# Create uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "pyq"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "results"), exist_ok=True)

# Serve uploaded files
app.mount("/files", StaticFiles(directory=settings.UPLOAD_DIR), name="files")


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_mongo_connection()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "UniPulse API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
