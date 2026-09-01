---
title: 'Token Economics 2026: Benchmarking Google Jules 15-Wave Parallelism, Claude Code CLI Subagents, and Local Ollama Qwen 2.5 Coder'
excerpt: 'Doce meses midiendo el coste real por feature entregada en tres arquitecturas de agentes de código: orquestación asíncrona por oleadas con Jules, subagentes sincrónicos con Claude Code CLI y inferencia local gratuita con Ollama + Qwen 2.5 Coder. Métricas de tokens, wall-clock time, tasa de aceptación de PRs y coste efectivo por línea de código producción-ready.'
description: 'Comparativa técnica empírica de token economics entre Google Jules (15 oleadas paralelas), Claude Code CLI (subagentes) y Ollama Qwen 2.5 Coder (local): coste por PR fusionada, tokens desperdiciados en re-drift, wall-clock time y trade-offs de cada arquitectura.'
date: '2026-08-29'
tags: ['AI Agents', 'LLM', 'Benchmarking', 'Jules', 'Claude Code', 'Ollama', 'DevOps']
draft: false
published: true
canonical: 'https://iberi22.github.io/portfolio-iberi22/blog/benchmarking-ai-agent-token-economics-2026/'
readingTime: 14
---

# Token Economics 2026: El Coste Real de Cada Arquitectura de Agente

Cuando empezamos a orquestar agentes de código en el ecosistema SWAL en agosto de 2025, la pregunta de todos los foros era *"¿qué modelo es más inteligente?"*. Doce meses y más de 80 repositorios después, la pregunta correcta resultó ser otra muy distinta: **¿cuánto te cuesta realmente una feature fusionada en `main`?**

Este artículo documenta el benchmarking interno que ejecutamos durante tres sprints sobre tres arquitecturas radicalmente distintas de consumo de tokens:

1. **Google Jules** — orquestación asíncrona por oleadas (hasta 15 agentes en paralelo vía GitHub Issues).
2. **Claude Code CLI** — subagentes sincrónicos con delegación en árbol dentro de una sesión.
3. **Ollama + Qwen 2.5 Coder 32B** — inferencia local, coste marginal cero, sin SLA.

Todos los números provienen de telemetría real de nuestras propias tuberías (`git log`, registros de la API de Jules, contadores de tokens de Claude Code y métricas de `ollama`), no de benchmarks sintéticos de terceros.

---

## 1. Por qué "precio por token" es la métrica equivocada

El precio de lista de un modelo (`$/M tokens`) mide el coste del *intento*, no el coste del *resultado*. En un pipeline agéntico, cada feature consume tokens en cuatro fases:

| Fase | Qué pasa | ¿Aporta valor? |
|------|----------|----------------|
| **Exploración** | El agente lee el repo, construye contexto | Parcialmente |
| **Generación** | Escribe el código | Sí |
| **Re-drift** | El agente se contradice, rehace archivos, pierde el hilo | **No** |
| **Corrección** | CI falla, el agente interpreta errores y parchea | Sí (si converge) |

La métrica que usamos es **`$/PR_fusionada`**: coste total de tokens (incluida la fase de re-drift) dividido entre PRs que terminaron en `main` con CI verde. Dos agentes pueden tener el mismo precio por token y un coste por resultado que difiere 5×.

Definimos también el **Drift Tax**: `(tokens en re-drift / tokens totales) × 100`. Es nuestra señal de eficiencia arquitectónica, y es donde las tres topologías divergen más.

---

## 2. Metodología

Cada arquitectura recibió el mismo lote de 12 issues de GitHub, cuidadosamente emparejados: 4 de backend (Rust/Axum), 3 de frontend (Svelte 5), 2 de tests E2E, 2 de documentación técnica y 1 de refactor de infraestructura. Los issues seguían nuestra plantilla canónica: contexto de repo, criterios de aceptación verificables y restricción explícita de "islas de archivos disjuntas" (ningún agente toca dos archivos que otro agente pueda tocar en la misma oleada).

Mediciones registradas por tarea:

- **Wall-clock time** desde asignación hasta PR con CI verde.
- **Tokens entrada/salida** (facturados en Jules y Claude; estimados por conteo de vocabulario en Ollama).
- **Tasa de fusión en primer intento** (PR fusionada sin intervención humana).
- **Re-drift observable**: commits que revierten o reescriben trabajo anterior del mismo agente.

---

## 3. Arquitectura A: Jules y el modelo de oleadas paralelas

Jules ejecuta cada issue en una VM efímera aislada, de forma completamente asíncrona. Nuestra orquestación habitual ("wave pattern") lanza hasta 15 issues simultáneos, cada uno con una restricción de `Files touched` disjunta, y un orquestador humano (o Hermes, mediante skills) hace de *merge reconciler* al final de la ola.

### Comportamiento económico

- **Contexto pagado una sola vez**: cada VM reconstruye contexto desde cero (~40-60k tokens de entrada en repos de tamaño medio). En una ola de 15 agentes, eso son 600k-900k tokens de exploración *en paralelo*.
- **Drift Tax bajo**: el aislamiento por VM elimina la categoría entera de "el agente perdió el hilo" — cada agente solo conoce su isla. Medimos un Drift Tax medio de **7%**.
- **Tasa de fusión primer intento: 73%** (9/12). Los 3 fallos compartieron causa: interfaces implícitas entre islas (un agente definió un tipo que otro esperaba distinto).

La clave: el coste de explorar contexto 15 veces en paralelo es *aceptable* porque el tiempo es lineal, no aditivo. 15 issues de 40 minutos terminan en ~45 minutos de reloj. El coste por hora-hombre de supervisión cae a casi cero: el orquestador solo aparece en el reconcilio de merges.

### Wall-clock por feature

```
Promedio Jules (ola de 12):  38 min/PR      Supervisión: ~6 min/PR
```

---

## 4. Arquitectura B: Claude Code CLI con subagentes

Claude Code opera en modo *pair-programmer síncrono* dentro de tu sesión de terminal, y delega subtareas a subagentes con contextos aislados pero compartiendo el workspace local.

### Comportamiento económico

- **Contexto incremental caro**: la sesión principal mantiene y reenvía el historial completo en cada turno. En tareas de más de 20 tool-calls, los tokens de entrada por turno crecen cuadráticamente hasta que el auto-compaction interviene — y ahí empieza el re-drift.
- **Drift Tax medio: 21%**. Típico patrón: el subagente termina, el padre "no recuerda" por qué encargó la tarea, y relanza trabajo solapado.
- **Tasa de fusión primer intento: 58%** (7/12). Claude Code brilla en *iteración interactiva* (cuando un humano refina en el loop) y pierde en *entrega autónoma* (cuando nadie mira).

Donde gana claro: **tareas de debugging con retroalimentación rica**. Ver el error, reproducir, parchear, volver a correr — el loop síncrono amortiza el coste de contexto. En nuestras 2 tareas de tests E2E, Claude Code las resolvió con 40% menos tokens totales que cualquier alternativa.

### Wall-clock por feature

```
Promedio Claude Code:        22 min/PR      Supervisión: ~15 min/PR (en loop)
```

El tiempo de reloj es menor pero la supervisión humana es 2.5× mayor. En coste total (incluido el tiempo del ingeniero), empata o pierde frente a Jules para trabajo autónoma.

---

## 5. Arquitectura C: Ollama + Qwen 2.5 Coder 32B (local)

Coste marginal de tokens: cero. Nuestra configuración: RX 6600 8GB con Q4_K_M, contexto 32k, `keep_alive` persistente.

### Comportamiento económico

- **El coste no desaparece, se transforma**: en tiempo y en calidad. Sin re-drift facturado (no hay factura), el "Drift Tax" se mide en *reintentos hasta converged*: 2.8× más iteraciones promedio que Jules.
- **Tasa de fusión primer intento: 25%** (3/12). Necesita un *reviewer* humano en cada PR — que es exactamente el cuello de botella que las otras arquitecturas eliminan.
- **Throughput**: ~14 tok/s de salida. Una tarea de 4k tokens de código = 5 minutos de generación, sin paralelismo real (una GPU, un turno).

Donde gana sin discusión: **tasks de volumen alto y validez trivialmente verificable** — generar 200 tests unitarios de un módulo, migrar tipos Rust↔TypeScript, reformatear documentación, completar boilerplate. Cosas donde el oráculo de verificación es el compilador, no un humano. También para código sensible que nunca debe salir de la máquina: ahí el argumento no es económico, es de soberanía de datos.

### Wall-clock por feature

```
Promedio Qwen local:         71 min/PR      Supervisión: ~25 min/PR (review obligatorio)
```

---

## 6. Tabla comparativa final

| Métrica | Jules (olas) | Claude Code (subagentes) | Qwen 2.5 C32B local |
|---|---|---|---|
| $/PR fusionada (lote de 12) | ≈ 2.1× Claude | 1× (referencia) | **≈ 0** (tokens) |
| Coste real con tiempo humano | **≈ 1.4× Claude** | 1.9× Qwen-equivalente | 1.9× (hora-ing) |
| Drift Tax | **7%** | 21% | n/a (36% reintentos) |
| Fusión primer intento | **73%** | 58% | 25% |
| Wall-clock/PR | 38 min | **22 min** | 71 min |
| Escala horizontal | **15× simultánea** | 1 sesión | GPU-bound |
| Código sensible fuera de máquina | Sí | No (local-first) | **No** |

*(El "1×" de referencia es el coste de tokens por PR de Claude Code en nuestro lote; Jules factura vía plan de Google AI Pro con quota, la comparación es la ratio normalizada.)*

---

## 7. Decisiones: cómo ruteamos hoy

El benchmark no arrojó un ganador único — arrojó una **función de ruteo**:

```
feature autónoma + islas disjuntas + sin secreto  → Jules (ola paralela)
debugging iterativo + humano en el loop          → Claude Code CLI
volumen + oráculo automático (compilador/tests)  → Qwen local vía Ollama
código bajo NDA / secretos                       → Qwen local (obligado)
```

Tres lecciones transversales que ahorraron más dinero que cualquier cambio de modelo:

1. **La restricción de islas de archivos reduce el Drift Tax más que cualquier prompt.** Cuesta más redactar el issue (10 min), ahorra más que el 7% evitado (horas de reconcilio).
2. **El parallelismo asíncrono convierte tokens en tiempo, no en dinero.** Pagar 15 exploraciones de contexto es barato si recuperas 14× de throughput. El cuello pasa a ser tu capacidad de fusión.
3. **Local-no-es-gratis.** El coste simplemente se mueve de la factura a la nómina del reviewer. Si no tienes quota de revisión, tu "gratis" produce PRs que nadie puede confiar en fusionar.

La economía de tokens de 2026 no se gana eligiendo el modelo más barato. Se gana eligiendo la **topología** que alinea el patrón de fallo del agente con tu cuello de botella real.

---

*El pipeline completo de este benchmark (plantillas de issues, scripts de telemetría y el reconciliador de merges) forma parte de nuestra tubería GitCore descrita en [1 Año Usando Google Jules](/portfolio-iberi22/blog/1-ano-usando-jules/).*
