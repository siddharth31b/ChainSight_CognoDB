const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"

export interface DashboardSummary {
  total_suppliers: number
  total_components: number
  total_products: number
  total_factories: number
  total_regions: number
  total_risk_events: number
  active_risk_events: number
  critical_components: number
  average_supplier_reliability: number
}

export interface Supplier {
  supplier_id: string
  name: string
  country: string
  tier: number
  reliability_score: number
}

export interface RiskEvent {
  event_id: string
  name: string
  event_type: string
  severity: string
  status: string
}

export interface SupplierImpact {
  supplier_id: string
  supplier_name: string
  components: string[]
  products: string[]
  factories: string[]
  regions: string[]
}

export interface RiskEventImpact {
  event_id: string
  event_name: string
  severity: string
  status: string
  impact_level: string

  disrupted_entity_type: "Supplier" | "Factory"
  disrupted_entity_id: string
  disrupted_entity_name: string

  supplier_id: string | null
  disrupted_supplier: string | null

  factory_id: string | null
  disrupted_factory: string | null

  affected_components: string[]
  affected_products: string[]
  affected_factories: string[]
  affected_regions: string[]
}

export interface GraphNode {
  id: string
  type:
  | "Supplier"
  | "Component"
  | "Product"
  | "Factory"
  | "Region"
  | "RiskEvent"
  name: string
  properties: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type:
  | "SUPPLIES"
  | "USED_IN"
  | "MANUFACTURED_AT"
  | "SHIPS_TO"
  | "DISRUPTS"
  properties: Record<string, unknown>
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  node_count: number
  edge_count: number
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ detail: "Unknown API error" }))

    throw new Error(
      errorBody.detail || `Request failed with status ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>("/api/dashboard/summary")
}

export function getSuppliers() {
  return apiRequest<Supplier[]>("/api/suppliers")
}

export function getRiskEvents() {
  return apiRequest<RiskEvent[]>("/api/risk-events")
}

export function getSupplierImpact(supplierId: string) {
  return apiRequest<SupplierImpact>(
    `/api/suppliers/${encodeURIComponent(supplierId)}/impact`,
  )
}

export function getRiskEventImpact(eventId: string) {
  return apiRequest<RiskEventImpact>(
    `/api/risk-events/${encodeURIComponent(eventId)}/impact`,
  )
}

export function getGraphData() {
  return apiRequest<GraphData>("/api/graph")
}