from app.db.connection import cognodb

from data.seed_data import (
    SUPPLIERS,
    COMPONENTS,
    PRODUCTS,
    FACTORIES,
    REGIONS,
    RISK_EVENTS,
)

from data.relationships import (
    SUPPLIES,
    USED_IN,
    MANUFACTURED_AT,
    SHIPS_TO,
    DISRUPTS_SUPPLIER,
    DISRUPTS_FACTORY,
)


def run_query(session, query: str, **parameters) -> None:
    result = session.run(query, **parameters)
    result.consume()


def seed_nodes(session) -> None:
    print("Creating nodes...")

    run_query(
        session,
        """
        UNWIND $rows AS row
        MERGE (s:Supplier {supplier_id: row.supplier_id})
        SET
            s.name = row.name,
            s.country = row.country,
            s.tier = row.tier,
            s.reliability_score = row.reliability_score
        """,
        rows=SUPPLIERS,
    )

    run_query(
        session,
        """
        UNWIND $rows AS row
        MERGE (c:Component {component_id: row.component_id})
        SET
            c.name = row.name,
            c.category = row.category,
            c.criticality = row.criticality,
            c.unit_cost = row.unit_cost,
            c.lead_time_days = row.lead_time_days
        """,
        rows=COMPONENTS,
    )

    run_query(
        session,
        """
        UNWIND $rows AS row
        MERGE (p:Product {product_id: row.product_id})
        SET
            p.name = row.name,
            p.category = row.category,
            p.launch_status = row.launch_status
        """,
        rows=PRODUCTS,
    )

    run_query(
        session,
        """
        UNWIND $rows AS row
        MERGE (f:Factory {factory_id: row.factory_id})
        SET
            f.name = row.name,
            f.country = row.country,
            f.capacity_per_month = row.capacity_per_month
        """,
        rows=FACTORIES,
    )

    run_query(
        session,
        """
        UNWIND $rows AS row
        MERGE (r:Region {region_id: row.region_id})
        SET
            r.name = row.name,
            r.market_priority = row.market_priority
        """,
        rows=REGIONS,
    )

    run_query(
        session,
        """
        UNWIND $rows AS row
        MERGE (e:RiskEvent {event_id: row.event_id})
        SET
            e.name = row.name,
            e.event_type = row.event_type,
            e.severity = row.severity,
            e.status = row.status
        """,
        rows=RISK_EVENTS,
    )

    print("Nodes created successfully.")


def seed_relationships(session) -> None:
    print("Creating relationships...")

    supplies_rows = [
        {
            "supplier_id": supplier_id,
            "component_id": component_id,
            "contract_type": contract_type,
            "min_order_qty": min_order_qty,
        }
        for supplier_id, component_id, contract_type, min_order_qty in SUPPLIES
    ]

    run_query(
        session,
        """
        UNWIND $rows AS row
        MATCH (s:Supplier {supplier_id: row.supplier_id})
        MATCH (c:Component {component_id: row.component_id})
        MERGE (s)-[rel:SUPPLIES]->(c)
        SET
            rel.contract_type = row.contract_type,
            rel.min_order_qty = row.min_order_qty
        """,
        rows=supplies_rows,
    )

    used_in_rows = [
        {
            "component_id": component_id,
            "product_id": product_id,
            "units_required": units_required,
        }
        for component_id, product_id, units_required in USED_IN
    ]

    run_query(
        session,
        """
        UNWIND $rows AS row
        MATCH (c:Component {component_id: row.component_id})
        MATCH (p:Product {product_id: row.product_id})
        MERGE (c)-[rel:USED_IN]->(p)
        SET rel.units_required = row.units_required
        """,
        rows=used_in_rows,
    )

    manufactured_rows = [
        {
            "product_id": product_id,
            "factory_id": factory_id,
            "monthly_output": monthly_output,
        }
        for product_id, factory_id, monthly_output in MANUFACTURED_AT
    ]

    run_query(
        session,
        """
        UNWIND $rows AS row
        MATCH (p:Product {product_id: row.product_id})
        MATCH (f:Factory {factory_id: row.factory_id})
        MERGE (p)-[rel:MANUFACTURED_AT]->(f)
        SET rel.monthly_output = row.monthly_output
        """,
        rows=manufactured_rows,
    )

    ships_to_rows = [
        {
            "factory_id": factory_id,
            "region_id": region_id,
            "shipping_days": shipping_days,
        }
        for factory_id, region_id, shipping_days in SHIPS_TO
    ]

    run_query(
        session,
        """
        UNWIND $rows AS row
        MATCH (f:Factory {factory_id: row.factory_id})
        MATCH (r:Region {region_id: row.region_id})
        MERGE (f)-[rel:SHIPS_TO]->(r)
        SET rel.shipping_days = row.shipping_days
        """,
        rows=ships_to_rows,
    )

    disrupt_supplier_rows = [
        {
            "event_id": event_id,
            "supplier_id": supplier_id,
            "impact_level": impact_level,
        }
        for event_id, supplier_id, impact_level in DISRUPTS_SUPPLIER
    ]

    run_query(
        session,
        """
        UNWIND $rows AS row
        MATCH (e:RiskEvent {event_id: row.event_id})
        MATCH (s:Supplier {supplier_id: row.supplier_id})
        MERGE (e)-[rel:DISRUPTS]->(s)
        SET rel.impact_level = row.impact_level
        """,
        rows=disrupt_supplier_rows,
    )

    disrupt_factory_rows = [
        {
            "event_id": event_id,
            "factory_id": factory_id,
            "impact_level": impact_level,
        }
        for event_id, factory_id, impact_level in DISRUPTS_FACTORY
    ]

    run_query(
        session,
        """
        UNWIND $rows AS row
        MATCH (e:RiskEvent {event_id: row.event_id})
        MATCH (f:Factory {factory_id: row.factory_id})
        MERGE (e)-[rel:DISRUPTS]->(f)
        SET rel.impact_level = row.impact_level
        """,
        rows=disrupt_factory_rows,
    )

    print("Relationships created successfully.")


def verify_seed(session) -> None:
    print("\nDatabase summary:")

    labels = [
        "Supplier",
        "Component",
        "Product",
        "Factory",
        "Region",
        "RiskEvent",
    ]

    total_nodes = 0

    for label in labels:
        query = f"MATCH (n:{label}) RETURN count(n) AS count"
        record = session.run(query).single()
        count = record["count"]

        total_nodes += count

        print(f"{label}: {count}")

    record = session.run(
        """
        MATCH ()-[r]->()
        RETURN count(r) AS count
        """
    ).single()

    relationship_count = record["count"]

    print(f"\nTotal nodes: {total_nodes}")
    print(f"Total relationships: {relationship_count}")


def main() -> None:
    try:
        cognodb.verify_connection()

        print("Connected to CognoDB.")
        print("Starting ChainSight database seed...\n")

        with cognodb.driver.session() as session:
            seed_nodes(session)
            seed_relationships(session)
            verify_seed(session)

        print("\nChainSight seed completed successfully!")

    except Exception as exc:
        print("\nDatabase seed failed.")
        print(f"Error: {exc}")

        raise

    finally:
        cognodb.close()


if __name__ == "__main__":
    main()