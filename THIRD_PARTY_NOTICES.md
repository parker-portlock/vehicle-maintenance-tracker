# Third-Party Notices

Third-party software used by **vehicle-maintenance-tracker** and the licenses under which it is provided.

- Generated: 2026-10-22
- Pinned versions: `frontend/package-lock.json`, `backend/requirements.lock`, `backend/requirements-dev.lock`

## 1. Platform and runtime software

| Software | Version | License |
|---|---|---|
| Node.js (frontend build stage) | 20 (Alpine) | MIT |
| Python (backend runtime) | 3.12 (Alpine) | PSF-2.0 |
| nginx (static file server, /api proxy) | Alpine stock | BSD-2-Clause |
| PostgreSQL (database) | 16 (Alpine) | PostgreSQL License |
| Alpine Linux (base images) | 3.x | Public domain (busybox is BSD-2-Clause); each package retains its own license |
| Docker Engine / Compose (build and orchestration) | - | Apache-2.0 |

## 2. Frontend (`frontend/`, React + Vite)

### 2.1 Direct runtime dependencies

| Package | Version | License |
|---|---|---|
| `@mantine/core` | `7.17.8` | MIT |
| `@mantine/dates` | `7.17.8` | MIT |
| `@mantine/form` | `7.17.8` | MIT |
| `@mantine/hooks` | `7.17.8` | MIT |
| `@tabler/icons-react` | `3.47.0` | MIT |
| `@tanstack/react-query` | `5.102.8` | MIT |
| `dayjs` | `1.11.23` | MIT |
| `react` | `18.3.1` | MIT |
| `react-dom` | `18.3.1` | MIT |
| `react-router-dom` | `7.18.3` | MIT |

### 2.2 Direct development dependencies

| Package | Version | License |
|---|---|---|
| `@types/react` | `18.3.31` | MIT |
| `@types/react-dom` | `18.3.7` | MIT |
| `@vitejs/plugin-react` | `4.7.0` | MIT |
| `typescript` | `5.9.3` | Apache-2.0 |
| `vite` | `7.3.6` | MIT |

### 2.3 Transitive runtime dependencies

| Package | Version | License |
|---|---|---|
| `@babel/runtime` | `7.29.7` | MIT |
| `@floating-ui/core` | `1.8.0` | MIT |
| `@floating-ui/dom` | `1.8.0` | MIT |
| `@floating-ui/react` | `0.26.28` | MIT |
| `@floating-ui/react-dom` | `2.1.9` | MIT |
| `@floating-ui/utils` | `0.2.12` | MIT |
| `@tabler/icons` | `3.47.0` | MIT |
| `@tanstack/query-core` | `5.102.8` | MIT |
| `@types/prop-types` | `15.7.15` | MIT |
| `@types/react` | `18.3.31` | MIT |
| `clsx` | `2.1.1` | MIT |
| `cookie` | `1.1.1` | MIT |
| `csstype` | `3.2.3` | MIT |
| `detect-node-es` | `1.1.0` | MIT |
| `fast-deep-equal` | `3.1.3` | MIT |
| `get-nonce` | `1.0.1` | MIT |
| `js-tokens` | `4.0.0` | MIT |
| `klona` | `2.0.6` | MIT |
| `loose-envify` | `1.4.0` | MIT |
| `react-number-format` | `5.4.5` | MIT |
| `react-remove-scroll` | `2.7.2` | MIT |
| `react-remove-scroll-bar` | `2.3.8` | MIT |
| `react-router` | `7.18.3` | MIT |
| `react-style-singleton` | `2.2.3` | MIT |
| `react-textarea-autosize` | `8.5.9` | MIT |
| `scheduler` | `0.23.2` | MIT |
| `set-cookie-parser` | `2.7.2` | MIT |
| `tabbable` | `6.5.0` | MIT |
| `tslib` | `2.8.1` | 0BSD |
| `type-fest` | `4.41.0` | (MIT OR CC0-1.0) |
| `use-callback-ref` | `1.3.3` | MIT |
| `use-composed-ref` | `1.4.0` | MIT |
| `use-isomorphic-layout-effect` | `1.2.1` | MIT |
| `use-latest` | `1.3.0` | MIT |
| `use-sidecar` | `1.1.3` | MIT |

### 2.4 Transitive development dependencies (build tooling, not shipped)

| Package | Version | License |
|---|---|---|
| `@babel/code-frame` | `7.29.7` | MIT |
| `@babel/compat-data` | `7.29.7` | MIT |
| `@babel/core` | `7.29.7` | MIT |
| `@babel/generator` | `7.29.8` | MIT |
| `@babel/helper-compilation-targets` | `7.29.7` | MIT |
| `@babel/helper-globals` | `7.29.7` | MIT |
| `@babel/helper-module-imports` | `7.29.7` | MIT |
| `@babel/helper-module-transforms` | `7.29.7` | MIT |
| `@babel/helper-plugin-utils` | `7.29.7` | MIT |
| `@babel/helper-string-parser` | `7.29.7` | MIT |
| `@babel/helper-validator-identifier` | `7.29.7` | MIT |
| `@babel/helper-validator-option` | `7.29.7` | MIT |
| `@babel/helpers` | `7.29.7` | MIT |
| `@babel/parser` | `7.29.8` | MIT |
| `@babel/plugin-transform-react-jsx-self` | `7.29.7` | MIT |
| `@babel/plugin-transform-react-jsx-source` | `7.29.7` | MIT |
| `@babel/template` | `7.29.7` | MIT |
| `@babel/traverse` | `7.29.8` | MIT |
| `@babel/types` | `7.29.8` | MIT |
| `@esbuild/aix-ppc64` | `0.28.2` | MIT |
| `@esbuild/android-arm` | `0.28.2` | MIT |
| `@esbuild/android-arm64` | `0.28.2` | MIT |
| `@esbuild/android-x64` | `0.28.2` | MIT |
| `@esbuild/darwin-arm64` | `0.28.2` | MIT |
| `@esbuild/darwin-x64` | `0.28.2` | MIT |
| `@esbuild/freebsd-arm64` | `0.28.2` | MIT |
| `@esbuild/freebsd-x64` | `0.28.2` | MIT |
| `@esbuild/linux-arm` | `0.28.2` | MIT |
| `@esbuild/linux-arm64` | `0.28.2` | MIT |
| `@esbuild/linux-ia32` | `0.28.2` | MIT |
| `@esbuild/linux-loong64` | `0.28.2` | MIT |
| `@esbuild/linux-mips64el` | `0.28.2` | MIT |
| `@esbuild/linux-ppc64` | `0.28.2` | MIT |
| `@esbuild/linux-riscv64` | `0.28.2` | MIT |
| `@esbuild/linux-s390x` | `0.28.2` | MIT |
| `@esbuild/linux-x64` | `0.28.2` | MIT |
| `@esbuild/netbsd-arm64` | `0.28.2` | MIT |
| `@esbuild/netbsd-x64` | `0.28.2` | MIT |
| `@esbuild/openbsd-arm64` | `0.28.2` | MIT |
| `@esbuild/openbsd-x64` | `0.28.2` | MIT |
| `@esbuild/openharmony-arm64` | `0.28.2` | MIT |
| `@esbuild/sunos-x64` | `0.28.2` | MIT |
| `@esbuild/win32-arm64` | `0.28.2` | MIT |
| `@esbuild/win32-ia32` | `0.28.2` | MIT |
| `@esbuild/win32-x64` | `0.28.2` | MIT |
| `@jridgewell/gen-mapping` | `0.3.13` | MIT |
| `@jridgewell/remapping` | `2.3.5` | MIT |
| `@jridgewell/resolve-uri` | `3.1.2` | MIT |
| `@jridgewell/sourcemap-codec` | `1.6.0` | MIT |
| `@jridgewell/trace-mapping` | `0.3.31` | MIT |
| `@napi-rs/lzma-linux-x64-gnu` | `1.5.1` | MIT |
| `@rolldown/pluginutils` | `1.0.0-beta.27` | MIT |
| `@rollup/rollup-android-arm-eabi` | `4.63.1` | MIT |
| `@rollup/rollup-android-arm64` | `4.63.1` | MIT |
| `@rollup/rollup-darwin-arm64` | `4.63.1` | MIT |
| `@rollup/rollup-darwin-x64` | `4.63.1` | MIT |
| `@rollup/rollup-freebsd-arm64` | `4.63.1` | MIT |
| `@rollup/rollup-freebsd-x64` | `4.63.1` | MIT |
| `@rollup/rollup-linux-arm-gnueabihf` | `4.63.1` | MIT |
| `@rollup/rollup-linux-arm-musleabihf` | `4.63.1` | MIT |
| `@rollup/rollup-linux-arm64-gnu` | `4.63.1` | MIT |
| `@rollup/rollup-linux-arm64-musl` | `4.63.1` | MIT |
| `@rollup/rollup-linux-loong64-gnu` | `4.63.1` | MIT |
| `@rollup/rollup-linux-loong64-musl` | `4.63.1` | MIT |
| `@rollup/rollup-linux-ppc64-gnu` | `4.63.1` | MIT |
| `@rollup/rollup-linux-ppc64-musl` | `4.63.1` | MIT |
| `@rollup/rollup-linux-riscv64-gnu` | `4.63.1` | MIT |
| `@rollup/rollup-linux-riscv64-musl` | `4.63.1` | MIT |
| `@rollup/rollup-linux-s390x-gnu` | `4.63.1` | MIT |
| `@rollup/rollup-linux-x64-gnu` | `4.63.1` | MIT |
| `@rollup/rollup-linux-x64-musl` | `4.63.1` | MIT |
| `@rollup/rollup-openbsd-x64` | `4.63.1` | MIT |
| `@rollup/rollup-openharmony-arm64` | `4.63.1` | MIT |
| `@rollup/rollup-win32-arm64-msvc` | `4.63.1` | MIT |
| `@rollup/rollup-win32-ia32-msvc` | `4.63.1` | MIT |
| `@rollup/rollup-win32-x64-gnu` | `4.63.1` | MIT |
| `@rollup/rollup-win32-x64-msvc` | `4.63.1` | MIT |
| `@types/babel__core` | `7.20.5` | MIT |
| `@types/babel__generator` | `7.27.0` | MIT |
| `@types/babel__template` | `7.4.4` | MIT |
| `@types/babel__traverse` | `7.28.0` | MIT |
| `@types/estree` | `1.0.9` | MIT |
| `baseline-browser-mapping` | `2.11.21` | Apache-2.0 |
| `browserslist` | `4.28.9` | MIT |
| `caniuse-lite` | `1.0.30001810` | CC-BY-4.0 |
| `convert-source-map` | `2.0.0` | MIT |
| `debug` | `4.4.3` | MIT |
| `electron-to-chromium` | `1.5.422` | ISC |
| `esbuild` | `0.28.2` | MIT |
| `escalade` | `3.2.0` | MIT |
| `fdir` | `6.5.0` | MIT |
| `fsevents` | `2.3.3` | MIT |
| `gensync` | `1.0.0-beta.2` | MIT |
| `jsesc` | `3.1.0` | MIT |
| `json5` | `2.2.3` | MIT |
| `lru-cache` | `5.1.1` | ISC |
| `ms` | `2.1.3` | MIT |
| `nanoid` | `3.3.18` | MIT |
| `node-releases` | `2.0.54` | MIT |
| `picocolors` | `1.1.1` | ISC |
| `picomatch` | `4.0.7` | MIT |
| `postcss` | `8.5.28` | MIT |
| `react-refresh` | `0.17.0` | MIT |
| `rollup` | `4.63.1` | MIT |
| `semver` | `6.3.1` | ISC |
| `source-map-js` | `1.2.1` | BSD-3-Clause |
| `tinyglobby` | `0.2.17` | MIT |
| `update-browserslist-db` | `1.3.2` | MIT |
| `yallist` | `3.1.1` | ISC |

## 3. Backend (`backend/`, FastAPI)

Direct dependencies from `pyproject.toml` plus resolved transitive dependencies (versions from `requirements.lock` and `requirements-dev.lock`):

| Package | Version | License |
|---|---|---|
| `alembic` | `1.20.1` | MIT |
| `annotated-doc` | `0.0.5` | MIT |
| `annotated-types` | `0.8.0` | MIT |
| `anyio` | `4.15.1` | MIT |
| `boto3` | `1.43.118` | Apache-2.0 |
| `botocore` | `1.43.118` | Apache-2.0 |
| `certifi` | `2026.10.19` | MPL-2.0 |
| `click` | `8.5.0` | BSD-3-Clause |
| `fastapi` | `0.161.1` | MIT |
| `h11` | `0.16.0` | MIT |
| `httpcore` | `1.0.9` | BSD-3-Clause |
| `httptools` | `0.9.0` | MIT |
| `httpx` | `0.28.1` | BSD-3-Clause |
| `idna` | `3.20` | BSD-3-Clause |
| `iniconfig` | `2.3.1` | MIT |
| `jmespath` | `1.1.0` | MIT |
| `Mako` | `1.4.3` | MIT |
| `MarkupSafe` | `3.0.4` | BSD-3-Clause |
| `opentelemetry-api` | `1.45.1` | Apache-2.0 |
| `packaging` | `26.3` | Apache-2.0 OR BSD-2-Clause |
| `pluggy` | `1.7.0` | MIT |
| `psycopg2-binary` | `2.9.13` | LGPL with exceptions |
| `pydantic` | `2.14.1` | MIT |
| `pydantic_core` | `2.50.1` | MIT |
| `pydantic-settings` | `2.16.1` | MIT |
| `Pygments` | `2.21.0` | BSD-2-Clause |
| `pytest` | `9.1.1` | MIT |
| `python-dateutil` | `2.9.0.post0` | Dual License |
| `python-dotenv` | `1.2.4` | BSD-3-Clause |
| `python-multipart` | `0.0.32` | Apache-2.0 |
| `PyYAML` | `6.0.3` | MIT |
| `s3transfer` | `0.19.3` | Apache License 2.0 |
| `six` | `1.17.0` | MIT |
| `SQLAlchemy` | `2.1.6` | MIT |
| `starlette` | `1.9.0` | BSD-3-Clause |
| `typing_extensions` | `4.16.0` | PSF-2.0 |
| `typing-inspection` | `0.4.4` | MIT |
| `urllib3` | `2.8.0` | MIT |
| `uvicorn` | `0.54.0` | BSD-3-Clause |
| `uvloop` | `0.23.0` | MIT License |
| `watchfiles` | `1.3.0` | MIT |
| `websockets` | `17.3` | BSD-3-Clause |

## 4. License summary

Permissive licenses used: **MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, 0BSD, ISC, PSF-2.0, PostgreSQL License, MPL-2.0**.

No GPL or AGPL components. The project may be redistributed under terms of the project's own license.

### Special notes

- **CC-BY-4.0**: [caniuse-lite](https://github.com/browserslist/caniuse-lite) contains data from [caniuse.com](https://caniuse.com), distributed under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. The original copyright notice and license link must be retained in redistributions.
- **LGPL with exceptions**: `psycopg2-binary` is under the GNU Lesser General Public License with the psycopg2 linking exception; distribution of the prebuilt binary is permitted.
- **Dual licensed**: `python-dateutil` (Apache-2.0 or BSD-3-Clause), `packaging` (Apache-2.0 or BSD-2-Clause), `type-fest` (MIT or CC0-1.0).

---

This file was generated from package manifests and installed package metadata. Regenerate after dependency changes.
