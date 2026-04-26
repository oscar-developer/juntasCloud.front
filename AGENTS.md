# AGENTS.md - juntasCloud.front

Guia para agentes que modifiquen este frontend. Respeta la arquitectura existente; no introduzcas capas, librerias o convenciones nuevas si el repo ya tiene un patron local.

## Stack real del proyecto

- React 19 + TypeScript + Vite.
- Material UI 7 con componentes MUI e iconos `@mui/icons-material`.
- Axios centralizado en `src/api/axios.ts`.
- Rutas con `react-router-dom`.
- Listas grandes con MUI + `@tanstack/react-virtual`.
- Multitenant por ruta `tenantId`, `TenantContext/useTenant` y header `X-Tenant-Id`.
- No uses `mui-datatables`: el patron actual son tablas/listas propias con MUI.

## Estructura de features

Cada dominio vive en `src/features/<feature>/`. Sigue las carpetas que ya usa la feature:

- `pages`: pantallas contenedoras. Orquestan estado, carga, filtros, paginacion, dialogs, toasts y responsive layout.
- `components`: UI presentacional de la feature: `Table`, `MobileList`, `FiltersCard`, `FormDialog`, `DetailDialog`, `Actions`, `Confirm...Dialog` y helpers `<feature>Ui.ts`.
- `api`: llamadas HTTP crudas con `apiClient`, paths, params, payloads y `X-Tenant-Id`.
- `services`: capa consumida por la UI. Normaliza DTOs, arma query params, adapta payloads, extrae totales y traduce errores.
- `types/index.ts`: tipos de dominio, DTOs de create/update, queries y respuestas listas para UI.
- `constants`, `routes`, `context` o `layout`: solo cuando la feature ya los necesita, como `tenant` o asistencias.

No muevas logica compartida a una nueva capa global salvo que exista repeticion real en varias features y el patron local lo justifique.

## API y multitenancy

- Usa `apiClient` desde `src/api/axios.ts` para endpoints axios.
- En APIs tenant-scoped recibe siempre `tenantId: string | number` y envia `headers: { 'X-Tenant-Id': String(tenantId) }`.
- Acepta `signal?: AbortSignal` en lecturas/listados para cancelar efectos de React.
- Resuelve paths como las features actuales: si `baseURL` ya termina en `/api`, usa `/recurso`; si no, usa `/api/recurso`.
- Mantén `api/<feature>Api.ts` delgado: `fetch...`, `fetch...ById`, `post...`, `patch...`, `delete...` o `deactivate...`.
- No hagas normalizacion de dominio en `api`; eso pertenece a `services`.

## Patron CRUD estandar

Para CRUDs nuevos o ajustes a CRUDs existentes, replica el flujo de `personas`, `bienes`, `faenas` y `asambleas`:

- `pages/<Feature>Page.tsx` obtiene `tenantId` con router o `useTenant`, maneja filtros, busqueda con debounce cuando aplique, paginacion, `reloadKey`, loading/error, dialogs, confirmaciones y `Toast`.
- `services/<feature>Api.ts` expone funciones de negocio como `getItems`, `getItemById`, `createItem`, `updateItem`, `deactivateItem/deleteItem`.
- Normaliza respuestas snake_case/camelCase a tipos UI estables en `types/index.ts`.
- Arma params de lista con `page`, `pageSize`, filtros no vacios y excluye valores como `TODOS`.
- Calcula `total` desde `x-total-count`; si no existe, usa la longitud de pagina como fallback.
- Propaga errores como mensajes legibles para la UI, revisando `message`, `error` y `Error.message`.
- Tras crear, editar o eliminar/desactivar, cierra dialog, incrementa `reloadKey` y muestra `Toast`.

## Tablas, listas y formularios

- Desktop: usa componentes MUI y, para listas grandes, `useVirtualizer` con altura estable, `overscan` y `onReachEnd`.
- Mobile: crea un `MobileList` separado con cards compactas y acciones reutilizadas.
- Acciones por fila van en `<Feature>Actions`.
- Filtros van en `<Feature>FiltersCard`; filtros moviles pueden tener dialog propio si ya existe en esa feature.
- Formularios van en `<Feature>FormDialog` con estado local, validacion local, `loading`, `submitting`, `loadError`, `onSaved` y `onShowMessage`.
- Detalles van en `<Feature>DetailDialog`; confirmaciones destructivas en `Confirm...Dialog`.
- Helpers visuales, formatters y chips van en `<feature>Ui.ts`, no mezclados en servicios.

## Reglas de implementacion

- Mantén cambios acotados al feature tocado.
- Usa imports relativos como el codigo actual.
- No cambies rutas publicas sin necesidad; las rutas tenant viven en `src/features/tenant/routes/tenantRoutes.tsx`.
- Respeta nombres existentes en espanol del dominio (`juntas`, `personas`, `bienes`, `faenas`, `asambleas`).
- Usa MUI `sx` y patrones visuales existentes antes de crear estilos globales.
- No agregues hooks por defecto. Extrae hooks locales solo si una pagina crece demasiado y mejora claramente la legibilidad.
- No agregues dependencias sin una razon fuerte y compatible con el stack actual.

## Verificacion esperada

- Para cambios de codigo, corre `npm run build` cuando sea razonable.
- Para cambios solo de documentacion, verifica manualmente que el archivo refleja la estructura real del repo.
