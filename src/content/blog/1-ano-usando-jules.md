---
title: '1 Año Usando Google Jules: De la Experimentación al Desarrollo Autónomo por Oleadas Paralelas'
excerpt: 'Retrospectiva desde el primer push de Jules (11 jun 2025, beta pública) hasta el 28 ago 2026: GitCore, oleadas de 15 tareas y métricas de 81 repositorios. Antigravity llegó el 18 nov 2025.'
date: '2026-08-28'
tags: ['Jules', 'AI Agents', 'Gemini Pro', 'GitCore', 'Hermes', 'Architecture', 'DevOps']
draft: false
published: true
---

# 1 Año Usando Google Jules: De la Experimentación al Desarrollo Autónomo por Oleadas Paralelas

El **11 de junio de 2025, a las 02:05 UTC**, Jules hizo el primer push en mis repositorios. El commit es `e08ea510` en el repo privado `news4humans`. El pull request #1 se mergeó a las 03:50 UTC de ese día. Jules estaba en beta pública desde el Google I/O del 20 de mayo. El primer commit con una feature (`5685b7ad`, almacenamiento local) llegó 22 minutos después, en el mismo pull request.

Al **28 de agosto de 2026**, con **11,240 commits** contados en 81 repositorios, el flujo ya no es un chat: es una **fábrica de software asíncrona y determinista** que despacha **oleadas de hasta 15 micro-tareas paralelas** a [Google Jules](https://jules.google), coordinadas por **Hermes** y verificadas por la máquina de estados de [GitCore](https://github.com/iberi22/GitCore).

Esta es la retrospectiva técnica de ese tramo: la evolución de las herramientas, las soluciones para evitar colisiones de contexto, las métricas del cierre y las lecciones aprendidas.

---

## 1. El Inicio: Filosofía Minimalista y Primeras Herramientas

Para junio de 2025 yo ya venía experimentando con agentes de código en local. El corte fue ese primer push de Jules, no un IDE. **Google Antigravity no existía**: salió el **18 de noviembre de 2025**, el mismo día que Gemini 3, como IDE con agentes. Las oleadas de esta nota las despacha Jules.

Mi postura técnica sigue siendo minimalista:

> **Principio de Fricción Mínima:** *Entre menos herramientas, extensiones y configuraciones intermedias acumules, más productivo eres. Menos tiempo perdido debatiendo qué editor usar y más tiempo enfocado en resolver el problema.*

En esa primavera Google Labs tenía dos cosas distintas. **Jules** es el agente asíncrono: clona el repo en una VM y devuelve un pull request. Estuvo en beta pública del 20 de mayo al 6 de agosto de 2025. [Google Stitch](https://stitch.withgoogle.com) genera interfaz, no parches de un repositorio. Salió el mismo 20 de mayo.

Éramos plenamente conscientes de que operábamos como *early adopters* ("conejillos de indias") en una tecnología naciente. Pero también era evidente la visión de fondo: **Google no estaba intentando crear otro autocompletador de código local, sino apalancar la infraestructura en la nube más grande del planeta para el desarrollo de software.**

---

## 2. La Solución al Cuello de Botella: GitHub como Bus de Cómputo

Cualquier ingeniero que haya intentado delegar trabajo a 4 o 5 agentes corriendo simultáneamente en una misma máquina local se estrella contra el mismo muro físico: **las colisiones de archivos y la sobrescritura de estado.** Dos agentes editando el mismo archivo en local destruyen el espacio de trabajo.

En ese tramo la salida no fue un sistema de archivos virtual, sino el pipeline que la industria ya tenía resuelto: **GitHub**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PIPELINE DISTRIBUIDO DE GOOGLE JULES                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   GitHub Issues          Google Cloud Compute        Pull Requests     │
│  ┌──────────────┐       ┌─────────────────────┐    ┌─────────────────┐ │
│  │ Spec atómico │ ────► │ Sandbox Aislado     │ ──►│ Diff limpio +   │ │
│  │ + Criterios  │       │ (Jules Agent Run)   │    │ Tests verdes    │ │
│  └──────────────┘       └─────────────────────┘    └─────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

Al transformar el flujo en **Issue → Tarea de Agente Aislada → Pull Request**, cada instancia de Jules se ejecuta en un contenedor efímero e independiente respaldado por los datacenters de Google, eliminando cualquier interferencia entre agentes.

Ese aislamiento es el de este tramo: una rama y un pull request por agente. Gestalt VFS, para que varios agentes editen el mismo archivo, es posterior. El artículo del cierre lo cuenta.

### El techo de 15 tareas concurrentes
Ese número no existía el 11 de junio. Llegó el **6 de agosto de 2025**, cuando Jules salió de beta. En Google AI Pro el cupo quedó en **15 tareas concurrentes**. El plan gratis quedó en 3. Desde entonces las oleadas se arman contra ese techo: un agente cierra un hito acotado, no un subsistema entero.

En esa salida Jules usaba **Gemini 2.5 Pro**. La ventana de más de 1M de tokens alcanzaba para un crate o un módulo con sus tipos y sus pruebas, si el issue no pretendía ser el sistema completo.

---

## 3. Del Caos al Arnés: La Creación de GitCore y Sprints de 30 Minutos

A medida que el volumen de PRs creció, empezaron a surgir anomalías: *context drift*, inconsistencias en dependencias cruzadas y ramas huérfanas. No podíamos depender de la suerte.

Fue allí cuando desarrollé el arnés de ingeniería alrededor de **GitCore**, transformando el proceso en un **ciclo determinista de verificación formal**:

1. **Matriz de Features (`features.json`):** Cada proyecto define su avance porcentual y criterios de aceptación verificables.
2. **Limpieza Automatizada de Ramas:** Reconciliación continua de ramas remotas tras cada merge.
3. **Baterías de Pruebas E2E y Compilación Estricta:** Ningún PR se aprueba si no pasa el 100% de la suite de tests automatizados.

```
┌──────────────────────────────────────────────────────────────────┐
│             AI SPRINT LIFECYCLE (OLEADA DE 30 MINUTOS)           │
├──────────────────────────────────────────────────────────────────┤
│  1. Lectura de estado previo en Xavier (Memoria) y features.json  │
│  2. Fragmentación en 3-4 micro-issues por feature (Islas)         │
│  3. Auditoría pre-dispatch (0 colisiones de archivos)             │
│  4. Dispatch paralelo a Jules con label 'jules' (hasta 15 tasks) │
│  5. Monitoreo asíncrono y resolución de suites de tests           │
│  6. Merge secuencial ordenado: Tipos ➔ Core ➔ API ➔ E2E          │
│  7. Actualización de métricas en features.json y cierre de sprint│
└──────────────────────────────────────────────────────────────────┘
```

La revelación fue inmediata: **organizar una oleada de agentes es exactamente igual a planificar un Sprint ágil de dos semanas**, con la diferencia de que el ciclo de estimación, desarrollo, testeo y entrega se ejecuta en **30 minutos**.

---

## 4. Métricas al cierre (28 de agosto de 2026)

Los conteos de commits son un escaneo del workspace a la fecha de esta nota. No son el recuento desde el 11 de junio, y las horas no salen de `git log`.

| Métrica del Ecosistema | Valor |
| :--- | :--- |
| **Primer push de Jules** | 11 de junio de 2025, 02:05 UTC (`news4humans`, PR #1) |
| **Cierre de este corte** | 28 de agosto de 2026 (443 días desde el primer push) |
| **Repositorios en el escaneo** | **81 repositorios** |
| **Commits en esos repositorios** | **11,240 commits** |
| **Commits de oleadas (Jules y otros agentes)** | **1,391 commits** |
| **Features en `features.json`** | **1,723 especificaciones** |
| **Pull requests mergeados** | **1,000+ PRs** |
| **Horas equivalentes de trabajo manual** | **~6,250 h, estimación, fuera del escaneo** |
| **Multiplicador** | **6.5x – 8.0x, estimación** |

### Top Repositorios con Mayor Actividad Agéntica

1. **[Xavier](https://github.com/iberi22/xavier):** 1,922 commits totales / 255 commits de Jules *(Memoria cognitiva vectorial en Rust)*.
2. **[OrionHealth](https://github.com/iberi22/OrionHealth):** 1,243 commits totales / 61 commits de Jules *(Salud offline-first en Flutter)*.
3. **[GARA-G](https://github.com/iberi22/gara-g):** 860 commits totales / 111 commits de Jules *(Red de movilidad DePIN)*.
4. **[WorldExams](https://github.com/iberi22/worldexams):** 844 commits totales / 85 commits de Jules *(Plataforma de evaluación global)*.
5. **[Gestalt](https://github.com/iberi22/gestalt):** 635 commits totales / 200 commits de Jules *(Orquestador multi-agente en Rust)*.
6. **[Shelf](https://estante-inventario.vercel.app):** 628 commits totales / 48 commits de Jules *(Inventario local-first en React 19)*.
7. **[Synapse Trading](https://github.com/iberi22/synapse-trading):** 569 commits totales / 78 commits de Jules *(Bot de trading cripto sobre Binance Futures)*.
8. **[GitCore](https://github.com/iberi22/GitCore):** 391 commits totales / 19 commits de Jules *(Motor y arnés de automatización)*.

---

## 5. Patrones Clave: Micro-Fragmentación e Islas de Archivos Disjuntas

Para lograr que 15 agentes concurrentes trabajen sin destruirse mutuamente, el arnés implementa dos reglas inviolables:

### A. Micro-Fragmentación
Ningún issue supera las 150 líneas de impacto ni abarca más de dos capas arquitectónicas. Cada feature grande se subdivide en:
- `[Micro-A]`: Contratos de tipos, traits y structs.
- `[Micro-B]`: Lógica pura de dominio y algoritmos.
- `[Micro-C]`: Adaptadores de entrada/salida (HTTP, IPC, CLI).
- `[Micro-D]`: Baterías de pruebas unitarias y mocks.

### B. Islas de Archivos Disjuntas (Disjoint File Islands)
Antes de despachar una oleada con el label `jules`, un script valida que la intersección de archivos asignados a cada issue sea un conjunto vacío:

```python
# Verificación de Islas de Archivos Disjuntas (Pre-Dispatch QA)
islands = {
    '#issue-101': ['crates/core/src/types.rs'],
    '#issue-102': ['crates/core/src/codec.rs'],
    '#issue-103': ['crates/api/src/routes.rs'],
    '#issue-104': ['crates/core/tests/e2e_test.rs'],
}

for i1, f1 in islands.items():
    for i2, f2 in islands.items():
        if i1 < i2 and set(f1) & set(f2):
            raise SystemExit(f"❌ COLISIÓN DETECTADA: {i1} y {i2} tocan {set(f1) & set(f2)}")
print("✅ 100% Islas Disjuntas Verificadas.")
```

---

## 6. La Triada de Infraestructura: GitCore, Hermes y Xavier

Jules no opera en el vacío. La articulación de todo el ecosistema depende de tres pilares diseñados a medida:

```
                  ┌──────────────────────────────┐
                  │    XAVIER (Memoria Viva)     │
                  │  Contexto histórico & Vector │
                  └──────────────┬───────────────┘
                                 │ Context Feed
                                 ▼
┌──────────────────┐      ┌──────────────┐      ┌──────────────────┐
│  HERMES GATEWAY  │ ───► │  GITCORE CLI │ ───► │   GOOGLE JULES   │
│  Despacho Rápido │      │ State Engine │      │ 15 Parallel PRs  │
└──────────────────┘      └──────────────┘      └──────────────────┘
```

1. **[GitCore](https://github.com/iberi22/GitCore):** El arnés maestro que gobierna el contrato **1 Issue → 1 Rama → 1 PR**, actualiza `features.json` y corre los linters pre-merge.
2. **Hermes:** El dispatcher de alta velocidad que gestiona el ciclo de vida de los agentes, la rotación de credenciales y los límites de cuota.
3. **[Xavier](https://github.com/iberi22/xavier):** Memoria cognitiva persistente con búsqueda semántica vectorial. Alimenta a los issues con decisiones arquitectónicas tomadas meses atrás.

---

## 7. Áreas de Mejora y Siguientes Pasos

Desde el primer push, el 11 de junio de 2025, estas son las 4 áreas donde el flujo se está optimizando:

1. **Aserción Semántica en CI:** Integrar validación de compatibilidad de tipos entre ramas de una misma oleada antes de ejecutar el merge a `main`.
2. **Alertas Tempranas de Timeout:** Detección predictiva cuando un agente supera 15 minutos en tareas de compilación pesada.
3. **Ingestión en Tiempo Real a Xavier:** Webhooks automáticos que indexen el diff de cada PR aprobado en la memoria vectorial.
4. **Sandboxing Efímero de Red:** Aislamiento de sockets y puertos para suites de pruebas concurrentes.

---

## 8. Conclusión: La Nueva Era de la Ingeniería

La gran lección de este primer año es contundente: **el verdadero salto de productividad no está en escribir código más rápido con un autocompletado en el teclado, sino en diseñar arneses rigurosos que permitan articular enjambres autónomos en paralelo.**

Google Jules, respaldado por la potencia de Gemini y orquestado mediante un arnés determinista como GitCore, nos demostró que un solo ingeniero con la arquitectura correcta puede liderar y entregar proyectos con la cadencia, robustez y calidad de un equipo de ingeniería completo.



---

## Continúa la lectura

Las **oleadas de 15 issues paralelos** que se mencionan en este post (Wave 1, Wave 2, Wave 3) ya tienen un artículo dedicado: **[Waves: oleadas como sprints de 30 minutos y Gestalt VFS](/blog/waves-oleadas-sprints-30min-gestalt-vfs/)**. Allí explico por qué 30 min × N waves vence al sprint clásico, y presento Gestalt VFS como la PoC que rompe el techo de paralelismo (muchos agentes sobre el mismo archivo, merge en Rust).
