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

Cada dominio vive en `src/features/<feature>/`. La estructura estandar de una feature es:

- `pages`: pantallas contenedoras. Componen hooks, componentes, dialogs y estados visuales de la pantalla.
- `components`: UI presentacional de la feature: `Table`, `MobileList`, `FiltersCard`, `FormDialog`, `DetailDialog`, `Actions`, `Confirm...Dialog` y helpers `<feature>Ui.ts`.
- `services`: llamadas HTTP del feature y capa consumida por la UI. Usa `apiClient`, envia headers, arma paths, params y payloads, normaliza datos basicos, extrae totales y traduce errores.
- `types/index.ts`: tipos de dominio, DTOs de create/update, queries y respuestas listas para UI.
- `hooks`: coordinacion de estado, carga, filtros, paginacion, acciones, dialogs, reload y toasts cuando una pantalla lo requiera.

No crees carpetas `api` dentro de features. `src/api/axios.ts` queda solo como configuracion global de Axios.

No muevas logica compartida a una nueva capa global salvo que exista repeticion real en varias features y el patron local lo justifique.

## API y multitenancy

- Usa `apiClient` desde `src/api/axios.ts` para llamadas HTTP; no crees clientes Axios por feature.
- En APIs tenant-scoped recibe siempre `tenantId: string | number` y envia `headers: { 'X-Tenant-Id': String(tenantId) }`.
- Acepta `signal?: AbortSignal` en lecturas/listados para cancelar efectos de React.
- Resuelve paths como las features actuales: si `baseURL` ya termina en `/api`, usa `/recurso`; si no, usa `/api/recurso`.
- Mantén la comunicacion HTTP en `services/<feature>.service.ts`.
- Los services deben cubrir llamadas API, headers, params, payloads, normalizacion basica y manejo de errores.
- No agregues carpetas `api` dentro de features.

## Patron CRUD estandar

Para CRUDs nuevos o ajustes a CRUDs existentes, replica el flujo de `personas`, `bienes`, `faenas` y `asambleas`:

- Flujo: `Page -> Hook -> Service -> Components`.
- `pages/<Feature>Page.tsx` orquesta la pantalla y compone componentes, hooks y dialogs.
- `hooks/use<Feature>Page.ts` maneja estado, carga, filtros, busqueda con debounce cuando aplique, paginacion, `reloadKey`, acciones, dialogs, confirmaciones y `Toast`.
- `services/<feature>.service.ts` consume API y expone funciones de negocio como `getItems`, `getItemById`, `createItem`, `updateItem`, `deactivateItem/deleteItem`.
- `components` solo renderiza UI e interacciones del usuario mediante props.
- Normaliza respuestas snake_case/camelCase a tipos UI estables en `types/index.ts`.
- Arma params de lista con `page`, `pageSize`, filtros no vacios y excluye valores como `TODOS`.
- Calcula `total` desde `x-total-count`; si no existe, usa la longitud de pagina como fallback.
- Propaga errores como mensajes legibles para la UI, revisando `message`, `error` y `Error.message`.
- Tras crear, editar o eliminar/desactivar, cierra dialog, incrementa `reloadKey` y muestra `Toast`.

## Utilidades compartidas

- Las utilidades reutilizables van en `src/shared/utils`.
- La generacion frontend de Excel/PDF debe vivir en `src/shared/utils`, por ejemplo `exportExcel.ts` y `exportPdf.ts`.
- Cada feature solo debe preparar datos, columnas, nombres de archivo y metadata especifica del dominio.
- No crees `utils` dentro de cada feature salvo que sea estrictamente local y no reutilizable.

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
- Usa hooks locales para coordinacion de pantalla cuando haya estado, carga, filtros, paginacion o acciones.
- No agregues dependencias sin una razon fuerte y compatible con el stack actual.

## Verificacion esperada

- Para cambios de codigo, corre `npm run build` cuando sea razonable.
- Para cambios solo de documentacion, verifica manualmente que el archivo refleja la estructura real del repo.
