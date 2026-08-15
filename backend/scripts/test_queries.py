from pprint import pprint

from app.db.connection import cognodb
from app.services.graph_service import graph_service


def main() -> None:
    try:
        cognodb.verify_connection()

        print("=" * 70)
        print("CHAINSIGHT CYPHER QUERY TESTS")
        print("=" * 70)

        print("\n[1] Components supplied by SUP-001")
        print("-" * 70)

        components = graph_service.get_supplier_components("SUP-001")

        for component in components:
            print(
                f"{component['component_name']} "
                f"({component['criticality']})"
            )

        print(f"\nTotal components: {len(components)}")

        print("\n" + "=" * 70)
        print("[2] Products affected by SUP-001")
        print("-" * 70)

        products = graph_service.get_affected_products("SUP-001")

        affected_product_names = sorted(
            {product["product_name"] for product in products}
        )

        for product_name in affected_product_names:
            print(product_name)

        print(f"\nUnique affected products: {len(affected_product_names)}")

        print("\n" + "=" * 70)
        print("[3] Full downstream supplier impact")
        print("-" * 70)

        supplier_impact = graph_service.get_supplier_impact("SUP-001")
        pprint(supplier_impact)

        print("\n" + "=" * 70)
        print("[4] Risk event cascading impact")
        print("-" * 70)

        risk_impact = graph_service.get_risk_event_impact("EVT-001")
        pprint(risk_impact)

        print("\n" + "=" * 70)
        print("ALL CYPHER QUERY TESTS COMPLETED")
        print("=" * 70)

    except Exception as exc:
        print("\nQuery test failed.")
        print(f"Error: {exc}")
        raise

    finally:
        cognodb.close()


if __name__ == "__main__":
    main()