from fastapi import APIRouter, HTTPException

from app.db.connection import cognodb
from app.schemas.graph import (
    AffectedProductResponse,
    ComponentResponse,
    DashboardSummary,
    HealthResponse,
    RiskEventImpactResponse,
    RiskEventSummary,
    SupplierImpactResponse,
    SupplierSummary,
)
from app.services.graph_service import graph_service


router = APIRouter(prefix="/api")


@router.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
)
def health_check() -> HealthResponse:
    cognodb.verify_connection()

    return HealthResponse(
        status="ok",
        database="connected",
    )


@router.get(
    "/dashboard/summary",
    response_model=DashboardSummary,
    tags=["Dashboard"],
)
def get_dashboard_summary():
    return graph_service.get_dashboard_summary()


@router.get(
    "/graph",
    tags=["Graph Explorer"],
)
def get_graph():
    return graph_service.get_graph_data()


@router.get(
    "/suppliers",
    response_model=list[SupplierSummary],
    tags=["Suppliers"],
)
def get_suppliers():
    return graph_service.get_suppliers()


@router.get(
    "/suppliers/{supplier_id}/components",
    response_model=list[ComponentResponse],
    tags=["Suppliers"],
)
def get_supplier_components(supplier_id: str):
    results = graph_service.get_supplier_components(supplier_id)

    if not results:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found or has no components.",
        )

    return results


@router.get(
    "/suppliers/{supplier_id}/products",
    response_model=list[AffectedProductResponse],
    tags=["Suppliers"],
)
def get_affected_products(supplier_id: str):
    results = graph_service.get_affected_products(supplier_id)

    if not results:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found or has no affected products.",
        )

    return results


@router.get(
    "/suppliers/{supplier_id}/impact",
    response_model=SupplierImpactResponse,
    tags=["Impact Analysis"],
)
def get_supplier_impact(supplier_id: str):
    result = graph_service.get_supplier_impact(supplier_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Supplier impact path not found.",
        )

    return result


@router.get(
    "/risk-events",
    response_model=list[RiskEventSummary],
    tags=["Risk Events"],
)
def get_risk_events():
    return graph_service.get_risk_events()


@router.get(
    "/risk-events/{event_id}/impact",
    response_model=RiskEventImpactResponse,
    tags=["Impact Analysis"],
)
def get_risk_event_impact(event_id: str):
    result = graph_service.get_risk_event_impact(event_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Risk event impact path not found.",
        )

    return result