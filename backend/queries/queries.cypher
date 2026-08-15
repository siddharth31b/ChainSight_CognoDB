// ChainSight — Main Cypher Queries
// CognoDB / openCypher
// These queries document the parameterized traversals used by the FastAPI backend.

// 1) Two-hop traversal: Supplier -> Component -> Product
// Parameter: $supplier_id
MATCH (s:Supplier {supplier_id: $supplier_id})
      -[:SUPPLIES]->(c:Component)
      -[:USED_IN]->(p:Product)
RETURN DISTINCT
  s.supplier_id AS supplier_id,
  s.name AS supplier_name,
  c.component_id AS component_id,
  c.name AS component_name,
  p.product_id AS product_id,
  p.name AS product_name
ORDER BY p.name, c.name;

// 2) Full supplier downstream impact
// Supplier -> Component -> Product -> Factory -> Region
// Parameter: $supplier_id
MATCH (s:Supplier {supplier_id: $supplier_id})
OPTIONAL MATCH (s)-[:SUPPLIES]->(c:Component)
OPTIONAL MATCH (c)-[:USED_IN]->(p:Product)
OPTIONAL MATCH (p)-[:MANUFACTURED_AT]->(f:Factory)
OPTIONAL MATCH (f)-[:SHIPS_TO]->(r:Region)
RETURN
  s.supplier_id AS supplier_id,
  s.name AS supplier_name,
  collect(DISTINCT c.name) AS affected_components,
  collect(DISTINCT p.name) AS affected_products,
  collect(DISTINCT f.name) AS affected_factories,
  collect(DISTINCT r.name) AS affected_regions;

// 3) Identify entity directly disrupted by a risk event
// Parameter: $event_id
MATCH (e:RiskEvent {event_id: $event_id})
      -[d:DISRUPTS]->(target)
RETURN
  e.event_id AS event_id,
  e.name AS event_name,
  e.severity AS severity,
  e.status AS status,
  d.impact_level AS impact_level,
  labels(target)[0] AS disrupted_entity_type,
  coalesce(target.supplier_id, target.factory_id) AS disrupted_entity_id,
  target.name AS disrupted_entity_name;

// 4) Supplier-target risk-event cascade
// RiskEvent -> Supplier -> Component -> Product -> Factory -> Region
// Parameter: $event_id
MATCH (e:RiskEvent {event_id: $event_id})
      -[d:DISRUPTS]->(s:Supplier)
OPTIONAL MATCH (s)-[:SUPPLIES]->(c:Component)
OPTIONAL MATCH (c)-[:USED_IN]->(p:Product)
OPTIONAL MATCH (p)-[:MANUFACTURED_AT]->(f:Factory)
OPTIONAL MATCH (f)-[:SHIPS_TO]->(r:Region)
RETURN
  e.event_id AS event_id,
  e.name AS event_name,
  d.impact_level AS impact_level,
  s.supplier_id AS supplier_id,
  s.name AS disrupted_supplier,
  collect(DISTINCT c.name) AS affected_components,
  collect(DISTINCT p.name) AS affected_products,
  collect(DISTINCT f.name) AS affected_factories,
  collect(DISTINCT r.name) AS affected_regions;

// 5) Factory-target risk-event cascade
// RiskEvent -> Factory, then upstream products/components and downstream regions
// Parameter: $event_id
MATCH (e:RiskEvent {event_id: $event_id})
      -[d:DISRUPTS]->(f:Factory)
OPTIONAL MATCH (p:Product)-[:MANUFACTURED_AT]->(f)
OPTIONAL MATCH (c:Component)-[:USED_IN]->(p)
OPTIONAL MATCH (f)-[:SHIPS_TO]->(r:Region)
RETURN
  e.event_id AS event_id,
  e.name AS event_name,
  d.impact_level AS impact_level,
  f.factory_id AS factory_id,
  f.name AS disrupted_factory,
  collect(DISTINCT c.name) AS affected_components,
  collect(DISTINCT p.name) AS affected_products,
  collect(DISTINCT f.name) AS affected_factories,
  collect(DISTINCT r.name) AS affected_regions;

// 6) Full graph nodes for Graph Explorer
MATCH (n)
RETURN
  labels(n)[0] AS type,
  coalesce(
    n.supplier_id,
    n.component_id,
    n.product_id,
    n.factory_id,
    n.region_id,
    n.event_id
  ) AS id,
  n.name AS name,
  properties(n) AS properties;

// 7) Full graph relationships for Graph Explorer
MATCH (source)-[rel]->(target)
RETURN
  coalesce(
    source.supplier_id,
    source.component_id,
    source.product_id,
    source.factory_id,
    source.region_id,
    source.event_id
  ) AS source,
  type(rel) AS type,
  coalesce(
    target.supplier_id,
    target.component_id,
    target.product_id,
    target.factory_id,
    target.region_id,
    target.event_id
  ) AS target,
  properties(rel) AS properties;
