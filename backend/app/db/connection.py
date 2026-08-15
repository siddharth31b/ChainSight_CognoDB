from neo4j import GraphDatabase

from app.core.config import settings


class CognoDB:
    """Manages the application's CognoDB connection."""

    def __init__(self) -> None:
        self.driver = GraphDatabase.driver(
            settings.cognodb_uri,
            auth=(
                settings.cognodb_user,
                settings.cognodb_password,
            ),
        )

    def verify_connection(self) -> None:
        self.driver.verify_connectivity()

    def close(self) -> None:
        self.driver.close()


cognodb = CognoDB()
