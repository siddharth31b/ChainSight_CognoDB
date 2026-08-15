from app.db.connection import cognodb


def main() -> None:
    try:
        cognodb.verify_connection()

        with cognodb.driver.session() as session:
            result = session.run(
                """
                RETURN $message AS message
                """,
                message="ChainSight connected to CognoDB",
            )

            record = result.single()

            print("CognoDB connection successful!")
            print(record["message"])

    except Exception as exc:
        print("CognoDB connection failed.")
        print(f"Error: {exc}")

    finally:
        cognodb.close()


if __name__ == "__main__":
    main()
