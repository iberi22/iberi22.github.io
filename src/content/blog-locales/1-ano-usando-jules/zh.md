---
title: '使用 Google Jules 的一年：从试验到并行波次的自主开发'
excerpt: '回顾 Jules 的第一次 push（2025 年 6 月 11 日，公开测试）到 2026 年 8 月 28 日：GitCore、15 个任务的波次，以及 81 个仓库的指标。Antigravity 于 2025 年 11 月 18 日发布。'
locale: zh
entry: 1-ano-usando-jules
---

**2025 年 6 月 11 日 02:05 UTC**，Jules 在我的账号上做了第一次 push。当天 03:50 UTC，那个 pull request 被合并。Jules 自 5 月 20 日的 Google I/O 起处于公开测试。带有功能的第一次改动在 22 分钟后到达，仍在同一个 pull request 里。

到 **2026 年 8 月 28 日**，81 个仓库里数出 **11,240 个 commit**。这条流水线不再是聊天：它是一座**异步、确定性的软件工厂**，向 [Google Jules](https://jules.google) 派出**最多 15 个并行微任务的波次**，由 **Hermes** 协调，由 **GitCore** 的状态机核验。

这是那一段的技术回顾：工具怎么演进，怎么避开上下文碰撞，收口时的指标，以及我学到的东西。

---

## 1. 起点：极简立场和第一批工具

到 2025 年 6 月，我已经在本地试过编程代理。分界是 Jules 的那一次 push，不是某个 IDE。**Google Antigravity 当时不存在**：它在 **2025 年 11 月 18 日**发布，和 Gemini 3 同一天，是带代理的 IDE。这篇笔记里的波次由 Jules 派出。

我的技术立场仍然极简：

> **最小摩擦原则：** *工具、扩展和中间配置堆得越少，你越有产出。少花时间争论用哪个编辑器，多花时间解决问题。*

那个春天，Google Labs 有两件不同的东西。**Jules** 是异步代理：它在一台 VM 里克隆仓库，然后交回一个 pull request。公开测试从 5 月 20 日持续到 2025 年 8 月 6 日。[Google Stitch](https://stitch.withgoogle.com) 生成界面，不给仓库打补丁。它也在 5 月 20 日发布。

我们清楚自己是一门刚出生的技术上的 *early adopters*（“试验品”）。底层的判断也很清楚：**Google 不是在做又一个本地代码补全，而是把这颗星球上最大的云放到软件开发下面。**

---

## 2. 瓶颈：把 GitHub 当作计算总线

任何工程师如果让 4 或 5 个代理同时在同一台本地机器上干活，都会撞上同一堵物理墙：**文件冲突和状态被覆盖。** 两个代理在本地改同一个文件，工作区就毁了。

那一段的出路不是虚拟文件系统，而是业界已经解决的管道：**GitHub**。

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

把流程变成 **Issue → 隔离的代理任务 → Pull Request** 之后，每一个 Jules 实例都跑在 Google 数据中心里自己的短生命周期容器中，代理之间不再互相干扰。

这段时期的隔离就是这样：一个代理一条分支、一个 pull request。让多个代理编辑同一个文件的 Gestalt VFS 是后来的事。收口的那篇文章讲那一部分。

### 15 个并发任务的上限

6 月 11 日还没有这个数字。它出现在 **2025 年 8 月 6 日**，Jules 离开测试、正式发布的那天。Google AI Pro 的额度是 **15 个并发任务**。免费计划停在 3。从那时起，波次按这个上限来组：一个代理收掉一个有边界的里程碑，而不是整个子系统。

那次发布时，Jules 用的是 **Gemini 2.5 Pro**。超过 1M token 的窗口够一个 crate 或一个模块，连同它的类型和测试，前提是这个 issue 不假装自己是整个系统。

---

## 3. 从混乱到挽具：GitCore 和 30 分钟冲刺

PR 变多之后，异常出现了：*context drift*、交叉依赖，还有孤儿分支。不能靠运气。

那时我把工程挽具做在 **GitCore** 周围，把过程变成一个**确定性的形式核验循环**：

1. **功能矩阵（`features.json`）：** 每个项目定义自己的进度百分比，以及可以核验的验收标准。
2. **分支自动清理：** 每次合并之后，持续核对远端分支。
3. **E2E 套件和严格编译：** 自动化测试套件不是 100% 通过，PR 就不批准。

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

结论来得很快：**组织一波代理，就等于计划一个两周的敏捷冲刺**，差别是估算、开发、测试和交付这整个循环在 **30 分钟**里跑完。

---

## 4. 收口指标（2026 年 8 月 28 日）

commit 计数是这篇笔记日期上的一次工作区扫描。不是从 6 月 11 日重数的，小时数也不来自 `git log`。

| 生态指标 | 值 |
| :--- | :--- |
| **Jules 的第一次 push** | 2025 年 6 月 11 日，02:05 UTC |
| **这次收口** | 2026 年 8 月 28 日（距第一次 push 443 天） |
| **扫描中的仓库** | **81 个仓库** |
| **这些仓库中的 commit** | **11,240 个 commit** |
| **波次 commit（Jules 和其他代理）** | **1,391 个 commit** |
| **`features.json` 中的功能** | **1,723 条规格** |
| **已合并的 pull request** | **1,000+ 个 PR** |
| **等效的手工工时** | **约 6,250 小时，估算，不在扫描之内** |
| **乘数** | **6.5x – 8.0x，估算** |

### 代理活动最多的公开仓库

下面只列公开代码。表里的合计把这些代码和另一部分未发表的工作混在一起。那部分工作没有名字、没有链接、也没有单独计数。

1. **[Xavier](https://github.com/iberi22/xavier)：** 共 1,922 个 commit / Jules 255 个 *(Rust 里的向量认知记忆)*。
2. **[OrionHealth](https://github.com/iberi22/OrionHealth)：** 共 1,243 个 commit / Jules 61 个 *(Flutter 的离线优先健康应用)*。
3. **[WorldExams](https://github.com/iberi22/worldexams)：** 共 844 个 commit / Jules 85 个 *(考试练习，离线优先)*。
4. **[Gestalt](https://github.com/iberi22/gestalt)：** 共 635 个 commit / Jules 200 个 *(Rust 多代理编排器)*。

本地优先的库存应用在 [Shelf](https://estante-inventario.vercel.app)。

---

## 5. 关键模式：微切分和不相交的文件岛

要让 15 个并发代理干活而不互相毁掉，挽具有两条不让步的规则：

### A. 微切分

没有一个 issue 的影响超过 150 行，也不跨过两层以上的架构。每个大功能拆成：

- `[Micro-A]`：类型契约、trait 和 struct。
- `[Micro-B]`：纯领域逻辑和算法。
- `[Micro-C]`：输入/输出适配器（HTTP、IPC、CLI）。
- `[Micro-D]`：单元测试套件和 mock。

### B. 不相交的文件岛

在用 `jules` 标签派出一波之前，一段脚本核验分配给每个 issue 的文件交集是空集：

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

## 6. 基础设施三件套：GitCore、Hermes 和 Xavier

Jules 不是在真空里跑。整个生态靠三根为这件事做的柱子：

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

1. **GitCore：** 主挽具。它管 **1 个 Issue → 1 条分支 → 1 个 PR** 这份契约，更新 `features.json`，并在合并前跑 linter。
2. **Hermes：** 调度器。它管代理的生命周期和额度上限。
3. **[Xavier](https://github.com/iberi22/xavier)：** 持久的认知记忆，带向量语义搜索。它把几个月前的架构决定喂给 issue。

---

## 7. 接下来要收紧的地方

从 2025 年 6 月 11 日的第一次 push 起，流水线正在收紧的有 4 处：

1. **CI 里的语义断言：** 同一波的分支在合并到 `main` 之前，先核验类型是否相容。
2. **超时的早期警报：** 预测一个代理会不会在重编译上超过 15 分钟。
3. **实时写入 Xavier：** 用 webhook 把每个获批 PR 的 diff 索引进向量记忆。
4. **短生命周期的网络沙箱：** 为并发测试套件隔离 socket 和端口。

---

## 8. 结论：工程的新阶段

这一年真正的教训是：**生产力的跳跃不是靠补全把代码打得更快，而是设计严格的挽具，让自主的群体并行运转。**

Google Jules 靠 Gemini 撑着，又由 GitCore 这样的确定性挽具编排。它说明，一个工程师只要架构对，就可以用一支完整工程团队的节奏、稳固程度和质量来带领并交付项目。

---

## 继续读

这篇里提到的 **15 个并行 issue 的波次**（Wave 1、Wave 2、Wave 3）有一篇专门的文章：**[Waves：把波次当作 30 分钟冲刺，以及 Gestalt VFS](/blog/waves-oleadas-sprints-30min-gestalt-vfs/)**。那里我解释为什么 30 分钟 × N 波胜过经典冲刺，并把 Gestalt VFS 作为打破并行上限的概念验证（多个代理改同一个文件，用 Rust 合并）。
