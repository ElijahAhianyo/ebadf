---
title: "Memory Consistency and Cache Coherence"
excerpt: "A deep dive into memory models and cache coherence in rust"
date: "2026-05-01"
readingTime: "12 min read"
slug: memory-consistency-cache-coherence
---

Memory Consistency and Cache Coherence are concepts that are deep rooted in concurrency and the design of modern computer architectures. There's already a lot of content on the web about this topic, but I'm going to try to explain this with as much detail as possible, explaining the the motivation and evolution of these concepts over the years from the hardware layer to the software layer and how to reason about them when writing concurrent code in Rust.

# Table of Contents
This is going to be a really long post, so I've added a table of contents to make it easier to navigate in case you want to jump to or skip some sections.

The first part of the post talks about the history and evolution of single processors into multi-core processors. We address the bottlenecks of single processors and how multi-core processors fixed those bottlenecks, but also introduced new challenges in terms of memory consistency and cache coherence.

The second section gives a brief introduction into caching system in modern computer processors, how they work and various protocols introduced to maintain cache coherence.

The third section talks about memory consistency models such as the sequential consistency model, the TSO (Total Store Order) model used in x86 architectures, the relaxed consistency model used in ARM/RISC architectures and the release-acquire consistency model. We also talk about how these models are implemented in hardware and how they affect the way we write concurrent code in Rust.

In the fourth section, we go through a few synchronization primitives provided by rust such as atomic types and mutexes, memory barriers and how they can be used to ensure correct behavior in concurrent programs.

Finally, we build mental models by going through some examples of concurrent code and when to use the right memory ordering to ensure the correct behavior.

- [Evolution of Processors](#evolution-of-processors)
- [Caching Systems and Cache Coherence Protocols](#caching-systems-and-cache-coherence-protocols)
- [Memory Consistency Models](#memory-consistency-models)
    - [Sequential Consistency](#sequential-consistency)
    - [Total Store Order (TSO)](#total-store-order-tso)
    - [Relaxed Consistency](#relaxed-consistency)
    - [SC-DRF (Sequential Consistency for Data-Race-Free Programs)](#sc-drf-sequential-consistency-for-data-race-free-programs)
    - [Release-Acquire Consistency](#release-acquire-consistency)
- [Synchronization Primitives in Rust](#synchronization-primitives-in-rust)
    - [Read-Modify-Write (RMW) Operations](#read-modify-write-rmw-operations)
        - [Compare-and-Swap (CAS)](#compare-and-swap-cas)
        - [Fetch-and-Add](#fetch-and-add)
    - [Memory Barriers](#memory-barriers)
- [Building Mental Models](#building-mental-models)
    - [Example 1: Producer-Consumer Problem](#example-1-producer-consumer-problem)
    - [Example 2: Double-Checked Locking](#example-2-double-checked-locking)
    - [Example 3: Lock-Free Data Structures](#example-3-lock-free-data-structures)
- [Conclusion](#conclusion)


## Evolution of Processors
