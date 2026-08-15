from typing import Any

from app.db.connection import cognodb


class GraphService:
    """Cypher query layer for the ChainSight supply-chain graph."""

    def get_suppliers(self) -> list[dict[str, Any]]:
        query = """
        MATCH (s:Supplier)
        RETURN
            s.supplier_id AS supplier_id,
            s.name AS name,
            s.country AS country,
            s.tier AS tier,
            s.reliability_score AS reliability_score
        ORDER BY s.name
        """

        with cognodb.driver.session() as session:
            result = session.run(query)
            return [record.data() for record in result]

    def get_risk_events(self) -> list[dict[str, Any]]:
        query = """
        MATCH (e:RiskEvent)
        RETURN
            e.event_id AS event_id,
            e.name AS name,
            e.event_type AS event_type,
            e.severity AS severity,
            e.status AS status
        ORDER BY e.event_id
        """

        with cognodb.driver.session() as session:
            result = session.run(query)
            return [record.data() for record in result]

    def get_dashboard_summary(self) -> dict[str, Any]:
        with cognodb.driver.session() as session:
            total_suppliers = session.run(
                """
                MATCH (s:Supplier)
                RETURN count(s) AS value
                """
            ).single()["value"]

            total_components = session.run(
                """
                MATCH (c:Component)
                RETURN count(c) AS value
                """
            ).single()["value"]

            total_products = session.run(
                """
                MATCH (p:Product)
                RETURN count(p) AS value
                """
            ).single()["value"]

            total_factories = session.run(
                """
                MATCH (f:Factory)
                RETURN count(f) AS value
                """
            ).single()["value"]

            total_regions = session.run(
                """
                MATCH (r:Region)
                RETURN count(r) AS value
                """
            ).single()["value"]

            total_risk_events = session.run(
                """
                MATCH (e:RiskEvent)
                RETURN count(e) AS value
                """
            ).single()["value"]

            active_risk_events = session.run(
                """
                MATCH (e:RiskEvent)
                WHERE e.status = $status
                RETURN count(e) AS value
                """,
                status="Active",
            ).single()["value"]

            critical_components = session.run(
                """
                MATCH (c:Component)
                WHERE c.criticality = $criticality
                RETURN count(c) AS value
                """,
                criticality="Critical",
            ).single()["value"]

            average_reliability = session.run(
                """
                MATCH (s:Supplier)
                RETURN avg(s.reliability_score) AS value
                """
            ).single()["value"]

            return {
                "total_suppliers": total_suppliers,
                "total_components": total_components,
                "total_products": total_products,
                "total_factories": total_factories,
                "total_regions": total_regions,
                "total_risk_events": total_risk_events,
                "active_risk_events": active_risk_events,
                "critical_components": critical_components,
                "average_supplier_reliability": round(
                    average_reliability or 0,
                    1,
                ),
            }

    def get_supplier_components(
        self,
        supplier_id: str,
    ) -> list[dict[str, Any]]:
        query = """
        MATCH (s:Supplier {supplier_id: $supplier_id})
              -[rel:SUPPLIES]->(c:Component)
        RETURN
            s.supplier_id AS supplier_id,
            s.name AS supplier_name,
            c.component_id AS component_id,
            c.name AS component_name,
            c.category AS category,
            c.criticality AS criticality,
            rel.contract_type AS contract_type,
            rel.min_order_qty AS min_order_qty
        ORDER BY c.name
        """

        with cognodb.driver.session() as session:
            result = session.run(
                query,
                supplier_id=supplier_id,
            )
            return [record.data() for record in result]

    def get_affected_products(
        self,
        supplier_id: str,
    ) -> list[dict[str, Any]]:
        query = """
        MATCH (s:Supplier {supplier_id: $supplier_id})
              -[:SUPPLIES]->(c:Component)
              -[:USED_IN]->(p:Product)
        RETURN DISTINCT
            s.supplier_id AS supplier_id,
            s.name AS supplier_name,
            c.component_id AS component_id,
            c.name AS component_name,
            p.product_id AS product_id,
            p.name AS product_name,
            p.category AS product_category
        ORDER BY p.name, c.name
        """

        with cognodb.driver.session() as session:
            result = session.run(
                query,
                supplier_id=supplier_id,
            )
            return [record.data() for record in result]

    def get_supplier_impact(
        self,
        supplier_id: str,
    ) -> dict[str, Any] | None:
        query = """
        MATCH (s:Supplier {supplier_id: $supplier_id})
              -[:SUPPLIES]->(c:Component)
              -[:USED_IN]->(p:Product)
              -[:MANUFACTURED_AT]->(f:Factory)
              -[:SHIPS_TO]->(r:Region)
        RETURN
            s.supplier_id AS supplier_id,
            s.name AS supplier_name,
            collect(DISTINCT c.name) AS components,
            collect(DISTINCT p.name) AS products,
            collect(DISTINCT f.name) AS factories,
            collect(DISTINCT r.name) AS regions
        """

        with cognodb.driver.session() as session:
            record = session.run(
                query,
                supplier_id=supplier_id,
            ).single()

            return record.data() if record else None

    def get_risk_event_impact(
        self,
        event_id: str,
    ) -> dict[str, Any] | None:
        """
        Return cascading impact for a risk event.

        A RiskEvent can directly DISRUPT either:
        - a Supplier, or
        - a Factory.

        Supplier disruption path:
        RiskEvent -> Supplier -> Component -> Product -> Factory -> Region

        Factory disruption path:
        RiskEvent -> Factory
                     <- MANUFACTURED_AT <- Product
                     <- USED_IN <- Component
                     -> SHIPS_TO -> Region
        """

        event_query = """
        MATCH (e:RiskEvent {event_id: $event_id})
              -[d:DISRUPTS]->(target)
        RETURN
            e.event_id AS event_id,
            e.name AS event_name,
            e.severity AS severity,
            e.status AS status,
            d.impact_level AS impact_level,
            labels(target)[0] AS disrupted_entity_type,
            coalesce(
                target.supplier_id,
                target.factory_id
            ) AS disrupted_entity_id,
            target.name AS disrupted_entity_name
        """

        with cognodb.driver.session() as session:
            event_record = session.run(
                event_query,
                event_id=event_id,
            ).single()

            if not event_record:
                return None

            event_data = event_record.data()

            entity_type = event_data["disrupted_entity_type"]
            entity_id = event_data["disrupted_entity_id"]
            entity_name = event_data["disrupted_entity_name"]

            if entity_type == "Supplier":
                impact_query = """
                MATCH (s:Supplier {supplier_id: $entity_id})
                      -[:SUPPLIES]->(c:Component)
                      -[:USED_IN]->(p:Product)
                      -[:MANUFACTURED_AT]->(f:Factory)
                      -[:SHIPS_TO]->(r:Region)
                RETURN
                    collect(DISTINCT c.name) AS affected_components,
                    collect(DISTINCT p.name) AS affected_products,
                    collect(DISTINCT f.name) AS affected_factories,
                    collect(DISTINCT r.name) AS affected_regions
                """

                impact_record = session.run(
                    impact_query,
                    entity_id=entity_id,
                ).single()

                impact_data = (
                    impact_record.data()
                    if impact_record
                    else {
                        "affected_components": [],
                        "affected_products": [],
                        "affected_factories": [],
                        "affected_regions": [],
                    }
                )

                return {
                    **event_data,
                    "supplier_id": entity_id,
                    "disrupted_supplier": entity_name,
                    "factory_id": None,
                    "disrupted_factory": None,
                    **impact_data,
                }

            if entity_type == "Factory":
                impact_query = """
                MATCH (f:Factory {factory_id: $entity_id})

                OPTIONAL MATCH
                    (p:Product)-[:MANUFACTURED_AT]->(f)

                OPTIONAL MATCH
                    (c:Component)-[:USED_IN]->(p)

                OPTIONAL MATCH
                    (f)-[:SHIPS_TO]->(r:Region)

                RETURN
                    collect(DISTINCT c.name) AS affected_components,
                    collect(DISTINCT p.name) AS affected_products,
                    collect(DISTINCT f.name) AS affected_factories,
                    collect(DISTINCT r.name) AS affected_regions
                """

                impact_record = session.run(
                    impact_query,
                    entity_id=entity_id,
                ).single()

                impact_data = (
                    impact_record.data()
                    if impact_record
                    else {
                        "affected_components": [],
                        "affected_products": [],
                        "affected_factories": [],
                        "affected_regions": [],
                    }
                )

                return {
                    **event_data,
                    "supplier_id": None,
                    "disrupted_supplier": None,
                    "factory_id": entity_id,
                    "disrupted_factory": entity_name,
                    **impact_data,
                }

            return None

    def get_graph_data(self) -> dict[str, Any]:
        """
        Return the complete ChainSight graph for the Graph Explorer.

        Nodes:
        Supplier, Component, Product, Factory, Region, RiskEvent

        Relationships:
        SUPPLIES, USED_IN, MANUFACTURED_AT, SHIPS_TO, DISRUPTS
        """

        node_query = """
        MATCH (n)
        WHERE
            n:Supplier
            OR n:Component
            OR n:Product
            OR n:Factory
            OR n:Region
            OR n:RiskEvent
        RETURN
            labels(n)[0] AS node_type,
            coalesce(
                n.supplier_id,
                n.component_id,
                n.product_id,
                n.factory_id,
                n.region_id,
                n.event_id
            ) AS node_id,
            n.name AS name,
            properties(n) AS properties
        ORDER BY node_type, node_id
        """

        relationship_query = """
        MATCH (source)-[rel]->(target)
        WHERE
            (
                source:Supplier
                OR source:Component
                OR source:Product
                OR source:Factory
                OR source:Region
                OR source:RiskEvent
            )
            AND
            (
                target:Supplier
                OR target:Component
                OR target:Product
                OR target:Factory
                OR target:Region
                OR target:RiskEvent
            )
        RETURN
            coalesce(
                source.supplier_id,
                source.component_id,
                source.product_id,
                source.factory_id,
                source.region_id,
                source.event_id
            ) AS source_id,
            type(rel) AS relationship_type,
            coalesce(
                target.supplier_id,
                target.component_id,
                target.product_id,
                target.factory_id,
                target.region_id,
                target.event_id
            ) AS target_id,
            properties(rel) AS properties
        """

        with cognodb.driver.session() as session:
            node_result = session.run(node_query)

            nodes = [
                {
                    "id": record["node_id"],
                    "type": record["node_type"],
                    "name": record["name"],
                    "properties": record["properties"],
                }
                for record in node_result
            ]

            relationship_result = session.run(relationship_query)

            edges = []

            for index, record in enumerate(relationship_result):
                source_id = record["source_id"]
                target_id = record["target_id"]
                relationship_type = record["relationship_type"]

                edges.append(
                    {
                        "id": (
                            f"{source_id}-"
                            f"{relationship_type}-"
                            f"{target_id}-"
                            f"{index}"
                        ),
                        "source": source_id,
                        "target": target_id,
                        "type": relationship_type,
                        "properties": record["properties"],
                    }
                )

            return {
                "nodes": nodes,
                "edges": edges,
                "node_count": len(nodes),
                "edge_count": len(edges),
            }


graph_service = GraphService()