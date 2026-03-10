from datetime import datetime, timezone


async def write_audit_log(
    db,
    actor_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    meta: dict | None = None,
) -> None:
    await db.audit_logs.insert_one(
        {
            'actor_id': actor_id,
            'action': action,
            'entity_type': entity_type,
            'entity_id': entity_id,
            'meta': meta or {},
            'created_at': datetime.now(timezone.utc),
        }
    )
