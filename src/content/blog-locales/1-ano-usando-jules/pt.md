---
title: 'Um ano usando Google Jules: da experimentação ao desenvolvimento autônomo em ondas paralelas'
excerpt: 'Retrospectiva do primeiro push do Jules (11 jun 2025, beta pública) até 28 ago 2026: GitCore, ondas de 15 tarefas e métricas de 81 repositórios. O Antigravity chegou em 18 nov 2025.'
locale: pt
entry: 1-ano-usando-jules
---

Em **11 de junho de 2025, às 02:05 UTC**, o Jules fez o primeiro push na minha conta. O pull request foi mergeado às 03:50 UTC desse mesmo dia. O Jules estava em beta pública desde o Google I/O de 20 de maio. A primeira mudança com uma feature chegou 22 minutos depois, no mesmo pull request.

Em **28 de agosto de 2026**, com **11.240 commits** contados em 81 repositórios, o fluxo já não é um chat. É uma **fábrica de software assíncrona e determinista** que despacha **ondas de até 15 microtarefas paralelas** para o [Google Jules](https://jules.google), coordenadas pelo **Hermes** e verificadas pela máquina de estados do **GitCore**.

Esta é a retrospectiva técnica desse trecho: a evolução das ferramentas, as saídas para evitar colisões de contexto, as métricas do fechamento e o que ficou de aprendizado.

---

## 1. O começo: postura minimalista e as primeiras ferramentas

Em junho de 2025 eu já experimentava agentes de código em local. O corte foi aquele primeiro push do Jules, não um IDE. **O Google Antigravity não existia**: saiu em **18 de novembro de 2025**, no mesmo dia do Gemini 3, como IDE com agentes. As ondas desta nota são despachadas pelo Jules.

A postura técnica continua minimalista:

> **Princípio de fricção mínima:** *Quanto menos ferramentas, extensões e configurações intermediárias você acumula, mais produtivo você é. Menos tempo perdido discutindo qual editor usar e mais tempo no problema.*

Naquela primavera o Google Labs tinha duas coisas distintas. **Jules** é o agente assíncrono: clona o repositório numa VM e devolve um pull request. Ficou em beta pública de 20 de maio a 6 de agosto de 2025. O [Google Stitch](https://stitch.withgoogle.com) gera interface, não patches de um repositório. Saiu no mesmo 20 de maio.

Sabíamos que operávamos como *early adopters* ("cobaias") numa tecnologia que nascia. A aposta de fundo também era clara: **o Google não estava tentando criar mais um autocompletar de código local, e sim pôr a maior nuvem do planeta debaixo do desenvolvimento de software.**

---

## 2. O gargalo: GitHub como barramento de computação

Qualquer engenheiro que tenha tentado delegar trabalho a 4 ou 5 agentes rodando ao mesmo tempo numa máquina local esbarra no mesmo muro físico: **colisões de arquivos e sobrescrita de estado.** Dois agentes editando o mesmo arquivo em local destroem o espaço de trabalho.

Nesse trecho a saída não foi um sistema de arquivos virtual. Foi o pipeline que a indústria já tinha resolvido: **GitHub**.

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

Ao transformar o fluxo em **issue → tarefa de agente isolada → pull request**, cada instância do Jules roda num contêiner efêmero e independente, nos datacenters do Google, e os agentes deixam de interferir uns nos outros.

Esse isolamento é o deste trecho: um branch e um pull request por agente. O Gestalt VFS, para que vários agentes editem o mesmo arquivo, veio depois. O artigo de fechamento conta essa parte.

### O teto de 15 tarefas concorrentes

Esse número não existia em 11 de junho. Chegou em **6 de agosto de 2025**, quando o Jules saiu da beta. No Google AI Pro a cota ficou em **15 tarefas concorrentes**. O plano grátis ficou em 3. Desde então as ondas se armam contra esse teto: um agente fecha um marco delimitado, não um subsistema inteiro.

Nessa saída o Jules usava **Gemini 2.5 Pro**. Uma janela de mais de 1M de tokens alcançava um crate ou um módulo, com seus tipos e seus testes, se a issue não pretendesse ser o sistema completo.

---

## 3. Do caos ao arnês: GitCore e sprints de 30 minutos

Conforme o volume de PRs cresceu, apareceram anomalias: *context drift*, dependências cruzadas e branches órfãos. Não dava para depender da sorte.

Foi ali que desenvolvi o arnês de engenharia em volta do **GitCore**, transformando o processo num **ciclo determinista de verificação formal**:

1. **Matriz de features (`features.json`):** cada projeto define seu avanço percentual e critérios de aceitação verificáveis.
2. **Limpeza automatizada de branches:** reconciliação contínua dos branches remotos depois de cada merge.
3. **Baterias E2E e compilação estrita:** nenhum PR é aprovado se não passar 100% da suíte de testes automatizados.

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

A conclusão foi imediata: **organizar uma onda de agentes é exatamente planejar um sprint ágil de duas semanas**, com a diferença de que o ciclo de estimativa, desenvolvimento, teste e entrega roda em **30 minutos**.

---

## 4. Métricas no fechamento (28 de agosto de 2026)

As contagens de commits são um scan do workspace na data desta nota. Não são a recontagem desde 11 de junho, e as horas não saem do `git log`.

| Métrica do ecossistema | Valor |
| :--- | :--- |
| **Primeiro push do Jules** | 11 de junho de 2025, 02:05 UTC |
| **Fechamento deste corte** | 28 de agosto de 2026 (443 dias desde o primeiro push) |
| **Repositórios no scan** | **81 repositórios** |
| **Commits nesses repositórios** | **11.240 commits** |
| **Commits de ondas (Jules e outros agentes)** | **1.391 commits** |
| **Features em `features.json`** | **1.723 especificações** |
| **Pull requests mergeados** | **1.000+ PRs** |
| **Horas equivalentes de trabalho manual** | **~6.250 h, estimativa, fora do scan** |
| **Multiplicador** | **6,5x – 8,0x, estimativa** |

### Repositórios públicos com mais atividade de agentes

A lista abaixo é só código público. Os totais da tabela misturam esse código com outro trabalho que não está publicado. Esse outro trabalho não tem nome, link nem contagem.

1. **[Xavier](https://github.com/iberi22/xavier):** 1.922 commits no total / 255 commits do Jules *(memória cognitiva vetorial em Rust)*.
2. **[OrionHealth](https://github.com/iberi22/OrionHealth):** 1.243 commits no total / 61 commits do Jules *(saúde offline-first em Flutter)*.
3. **[WorldExams](https://github.com/iberi22/worldexams):** 844 commits no total / 85 commits do Jules *(prática de exames, offline-first)*.
4. **[Gestalt](https://github.com/iberi22/gestalt):** 635 commits no total / 200 commits do Jules *(orquestrador multiagente em Rust)*.

O inventário local-first está em [Shelf](https://estante-inventario.vercel.app).

---

## 5. Padrões-chave: microfragmentação e ilhas de arquivos disjuntas

Para que 15 agentes concorrentes trabalhem sem se destruir, o arnês implementa duas regras que não cedem:

### A. Microfragmentação

Nenhuma issue passa de 150 linhas de impacto nem cobre mais de duas camadas de arquitetura. Cada feature grande se divide em:

- `[Micro-A]`: contratos de tipos, traits e structs.
- `[Micro-B]`: lógica pura de domínio e algoritmos.
- `[Micro-C]`: adaptadores de entrada/saída (HTTP, IPC, CLI).
- `[Micro-D]`: suítes de testes unitários e mocks.

### B. Ilhas de arquivos disjuntas

Antes de despachar uma onda com o label `jules`, um script valida que a interseção dos arquivos atribuídos a cada issue é um conjunto vazio:

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

## 6. A tríade de infraestrutura: GitCore, Hermes e Xavier

O Jules não opera no vazio. A articulação de todo o ecossistema depende de três pilares feitos para isso:

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

1. **GitCore:** o arnês mestre. Governa o contrato **1 issue → 1 branch → 1 PR**, atualiza `features.json` e roda os linters antes do merge.
2. **Hermes:** o dispatcher. Gere o ciclo de vida dos agentes e os tetos de cota.
3. **[Xavier](https://github.com/iberi22/xavier):** memória cognitiva persistente com busca semântica vetorial. Alimenta as issues com decisões de arquitetura tomadas meses antes.

---

## 7. O que ainda aperta

Desde o primeiro push, em 11 de junho de 2025, o fluxo está sendo apertado em 4 pontos:

1. **Asserção semântica no CI:** validar a compatibilidade de tipos entre branches da mesma onda antes do merge em `main`.
2. **Alertas precoces de timeout:** prever quando um agente passa de 15 minutos numa compilação pesada.
3. **Ingestão em tempo real no Xavier:** webhooks que indexam o diff de cada PR aprovado na memória vetorial.
4. **Sandbox efêmero de rede:** isolamento de sockets e portas para suítes de testes concorrentes.

---

## 8. Conclusão: a nova era da engenharia

A lição dura deste primeiro ano: **o salto real de produtividade não é escrever código mais rápido com um autocompletar. É desenhar arneses rigorosos que articulem enxames autônomos em paralelo.**

O Google Jules, apoiado pelo Gemini e orquestrado por um arnês determinista como o GitCore, mostrou que um só engenheiro, com a arquitetura certa, pode liderar e entregar projetos com a cadência, a robustez e a qualidade de um time de engenharia completo.

---

## Continua a leitura

As **ondas de 15 issues paralelas** citadas neste post (Wave 1, Wave 2, Wave 3) já têm um artigo próprio: **[Waves: ondas como sprints de 30 minutos e Gestalt VFS](/blog/waves-oleadas-sprints-30min-gestalt-vfs/)**. Ali explico por que 30 min × N ondas vencem o sprint clássico, e apresento o Gestalt VFS como a prova de conceito que rompe o teto de paralelismo (vários agentes no mesmo arquivo, merge em Rust).
