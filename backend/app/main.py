import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from neo4j.exceptions import Neo4jError, ServiceUnavailable

from app.api.routes import router
from app.db.connection import cognodb


def get_allowed_origins() -> list[str]:
    default_origins = (
        "http://localhost:5173,"
        "http://localhost:3000"
    )

    origins = os.getenv(
        "CORS_ORIGINS",
        default_origins,
    )

    return [
        origin.strip()
        for origin in origins.split(",")
        if origin.strip()
    ]


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    cognodb.close()


app = FastAPI(
    title="ChainSight API",
    description=(
        "Supply Chain Risk & Impact Graph API "
        "powered by CognoDB."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ServiceUnavailable)
async def database_unavailable_handler(
    request: Request,
    exc: ServiceUnavailable,
):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "CognoDB is temporarily unavailable.",
            "status": "database_unavailable",
        },
    )


@app.exception_handler(Neo4jError)
async def database_error_handler(
    request: Request,
    exc: Neo4jError,
):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "A database error occurred.",
            "status": "database_error",
        },
    )


@app.get("/", tags=["System"])
def root():
    return {
        "name": "ChainSight API",
        "version": "1.0.0",
        "database": "CognoDB",
    }


app.include_router(router)