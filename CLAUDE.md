# ECS Design Principles

## System Orthogonality

Each system should do exactly one thing. Systems should not overlap in responsibility.

**Examples of correct separation:**
- `movementSystem` — applies `Velocity` to `Position` for all entities. Nothing else.
- `lifetimeSystem` — decrements `Lifetime.remaining` and removes expired entities. Nothing else.
- `attackSystem` — spawns attack entities from `world.attacks.pending`. Does not move them or expire them.

**Anti-patterns to avoid:**
- A system that both moves entities AND expires them (two responsibilities)
- Two systems that both write to the same component (e.g., two systems updating `Position`)
- A specialized system (e.g., `attackSystem`) duplicating logic that a general system (e.g., `movementSystem`) already handles for all entities

**Why this matters:**
ECS derives its power from composability. Generic systems (`movementSystem`, `lifetimeSystem`) automatically apply to any entity that has the right components — including new entity types added later. Keeping systems orthogonal means adding a new entity type rarely requires touching existing systems.
