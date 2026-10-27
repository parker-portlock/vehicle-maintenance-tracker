#!/usr/bin/env python3
"""Verify pinned dependencies against THIRD_PARTY_NOTICES.md.

Checks:
1. Every package in frontend/package-lock.json and backend/requirements*.lock
   is listed in THIRD_PARTY_NOTICES.md.
2. The version listed in THIRD_PARTY_NOTICES.md matches the pinned version.
3. No package in THIRD_PARTY_NOTICES.md has no matching lock file entry.

Exits non-zero when any check fails.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NOTICES = ROOT / "THIRD_PARTY_NOTICES.md"
FRONTEND_LOCK = ROOT / "frontend" / "package-lock.json"
BACKEND_LOCKS = [
    ROOT / "backend" / "requirements.lock",
    ROOT / "backend" / "requirements-dev.lock",
]

# Table rows whose name and version are both backticked, e.g.
# | `fastapi` | `0.161.1` | MIT |
# Runtime rows (Node.js, Python, ...) are not backticked and are skipped.
NOTICE_ROW = re.compile(r"^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|")
PIP_PIN = re.compile(r"^([A-Za-z0-9][A-Za-z0-9._-]*)==([^\s;#]+)")


def pip_key(name: str) -> str:
    """PEP 503 normalization so PyYAML == pyyaml == py_yaml match."""
    return re.sub(r"[-_.]+", "-", name).lower()


def parse_notices(path: Path) -> dict[str, tuple[str, set[str]]]:
    """Return {normalized name: (display name, versions listed)}."""
    notices: dict[str, tuple[str, set[str]]] = {}
    for line in path.read_text().splitlines():
        m = NOTICE_ROW.match(line)
        if not m:
            continue
        name, version = m.group(1).strip(), m.group(2).strip()
        # Lowercase keys: matches npm names exactly (they are lowercase by
        # convention), and pip names are compared via pip_key below.
        key = name.lower()
        if key in notices:
            notices[key][1].add(version)
        else:
            notices[key] = (name, {version})
    return notices


def npm_key(name: str) -> str:
    """npm names are case-sensitive but all lowercase by convention."""
    return name.lower()


def parse_npm_lock(path: Path) -> dict[str, tuple[str, str]]:
    """Return {lowercase name: (name, version)} from package-lock.json."""
    data = json.loads(path.read_text())
    deps: dict[str, tuple[str, str]] = {}
    for key, meta in data.get("packages", {}).items():
        if not key.startswith("node_modules/"):
            continue
        name = key[len("node_modules/") :]
        version = meta.get("version")
        if name and version:
            deps[npm_key(name)] = (name, version)
    return deps


def parse_pip_lock(path: Path) -> dict[str, tuple[str, str]]:
    """Return {pip key: (name, version)} from a requirements lock file."""
    deps: dict[str, tuple[str, str]] = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = PIP_PIN.match(line)
        if m:
            deps[pip_key(m.group(1))] = (m.group(1), m.group(2))
    return deps


def main() -> int:
    for required in [NOTICES, FRONTEND_LOCK, *BACKEND_LOCKS]:
        if not required.is_file():
            print(f"error: missing {required.relative_to(ROOT)}", file=sys.stderr)
            return 2

    # Notices keyed both ways: lowercase (npm names) and PEP 503 (pip names),
    # so `pydantic_core` and `@types/babel__core` each match their ecosystem.
    notices: dict[str, tuple[str, set[str]]] = {}
    for name, (display, versions) in parse_notices(NOTICES).items():
        notices[name] = (display, versions)
        notices[pip_key(display)] = (display, versions)
    frontend = parse_npm_lock(FRONTEND_LOCK)
    backend: dict[str, tuple[str, str]] = {}
    for lock in BACKEND_LOCKS:
        backend.update(parse_pip_lock(lock))

    errors: list[str] = []

    # 1+2: every locked dependency must be listed at the pinned version.
    for label, lock, keyfn in (
        ("frontend", frontend, npm_key),
        ("backend", backend, pip_key),
    ):
        for key, (name, version) in sorted(lock.items()):
            entry = notices.get(keyfn(name))
            if entry is None:
                errors.append(
                    f"{label}: {name}=={version} is not listed in THIRD_PARTY_NOTICES.md"
                )
            elif version not in entry[1]:
                listed = ", ".join(sorted(entry[1]))
                errors.append(
                    f"{label}: {name} is pinned at {version}, "
                    f"but THIRD_PARTY_NOTICES.md lists {listed}"
                )

    # 3: every notices entry must resolve to a locked dependency at that version.
    seen: set[str] = set()
    for name, (display, versions) in parse_notices(NOTICES).items():
        if display in seen:
            continue
        seen.add(display)
        candidates = [
            lock[keyfn(display)]
            for lock, keyfn in ((frontend, npm_key), (backend, pip_key))
            if keyfn(display) in lock
        ]
        if not candidates:
            errors.append(
                f"notices: {display} ({', '.join(sorted(versions))}) has no matching "
                "package in the lock files"
            )
        elif not any(pinned in versions for _, pinned in candidates):
            locks = ", ".join(f"{n}=={v}" for n, v in candidates)
            errors.append(
                f"notices: {display} is listed at {', '.join(sorted(versions))}, "
                f"but lock files pin {locks}"
            )

    if errors:
        print(f"THIRD_PARTY_NOTICES.md is out of sync ({len(errors)} issue(s)):")
        for error in errors:
            print(f"  - {error}")
        print("Update THIRD_PARTY_NOTICES.md or regenerate the lock files.")
        return 1

    print(
        f"THIRD_PARTY_NOTICES.md matches all pinned dependencies "
        f"({len(notices)} listed packages)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
