from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    database: str


class SupplierSummary(BaseModel):
    supplier_id: str
    name: str
    country: str
    tier: int
    reliability_score: float


class ComponentResponse(BaseModel):
    supplier_id: str
    supplier_name: str
    component_id: str
    component_name: str
    category: str
    criticality: str
    contract_type: str
    min_order_qty: int


class AffectedProductResponse(BaseModel):
    supplier_id: str
    supplier_name: str
    component_id: str
    component_name: str
    product_id: str
    product_name: str
    product_category: str


class SupplierImpactResponse(BaseModel):
    supplier_id: str
    supplier_name: str
    components: list[str]
    products: list[str]
    factories: list[str]
    regions: list[str]


class RiskEventSummary(BaseModel):
    event_id: str
    name: str
    event_type: str
    severity: str
    status: str


class RiskEventImpactResponse(BaseModel):
    event_id: str
    event_name: str
    severity: str
    status: str
    impact_level: str

    disrupted_entity_type: str
    disrupted_entity_id: str
    disrupted_entity_name: str

    supplier_id: str | None = None
    disrupted_supplier: str | None = None

    factory_id: str | None = None
    disrupted_factory: str | None = None

    affected_components: list[str]
    affected_products: list[str]
    affected_factories: list[str]
    affected_regions: list[str]


class DashboardSummary(BaseModel):
    total_suppliers: int
    total_components: int
    total_products: int
    total_factories: int
    total_regions: int
    total_risk_events: int
    active_risk_events: int
    critical_components: int
    average_supplier_reliability: float