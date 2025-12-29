---
title: "Ergonomic Async Trait Objects in Rust"
excerpt: "Designing ergonomic async trait interfaces in Rust"
date: "2025-12-25"
readingTime: "12 min read"
slug: "ergonomic-async-trait-objects-rust"
---

Async Rust can be a pain to deal with, and as library maintainers, it's crucial to do as much heavy lifting as possible so your users don't inherit the 
headaches of dealing with it. We recently added support for dynamic cache backends in [cot](https://github.com/cot-rs/cot) and one small challenge was getting the API design and ergonomics right.
The use cases and code used here were lifted directly from the codebase. Cot is a Rust web framework inspired by Django.

## Problem Background
We needed to add caching machinery to the cot web framework that provides users with a simple cache interface while abstracting away how objects are stored and retrieved from the cache.
We also wanted to support multiple cache backends and allow users to implement their own custom cache backends if they wanted to. How do we design such an API in Rust, especially when dealing with async code?

## The Synchronous Version

Let's start with a simple synchronous implementation. Take this code:
```rust
use std::collections::HashMap;
use serde_json::Value;
use serde::{Serialize, de::DeserializeOwned};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CacheError {
    #[error("Cache operation failed: {0}")]
    Backend(String),
    #[error("Serde error: {0}")]
    SerdeJson(#[from] serde_json::Error),
}

pub type CacheResult<T> = std::result::Result<T, CacheError>;

pub trait CacheStore: Send + Sync + 'static {
    fn get(&self, key: &str) -> CacheResult<Option<Value>>;
    fn insert(&mut self, key: &str, value: Value) -> CacheResult<()>;
    fn remove(&mut self, key: &str) -> CacheResult<()>;
}

#[derive(Debug, Clone)]
pub struct Memory {
    map: HashMap<String, Value>,
}

impl Memory {
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }
}

impl CacheStore for Memory {
    fn get(&self, key: &str) -> CacheResult<Option<Value>> {
        Ok(self.map.get(key).cloned())
    }

    fn insert(&mut self, key: &str, value: Value) -> CacheResult<()> {
        self.map.insert(key.to_string(), value);
        Ok(())
    }

    fn remove(&mut self, key: &str) -> CacheResult<()> {
        self.map.remove(key);
        Ok(())
    }
}

pub struct Cache {
    store: Box<dyn CacheStore>,
}

impl Cache {
    pub fn new(store: impl CacheStore) -> Self {
        let store = Box::new(store);
        Self { store }
    }

    pub fn get<K, V>(&self, key: K) -> CacheResult<Option<V>>
    where
        K: AsRef<str>,
        V: DeserializeOwned,
    {
        self.store
            .get(key.as_ref())?
            .map(serde_json::from_value)
            .transpose()
            .map_err(CacheError::from)
    }

    pub fn insert<K, V>(&mut self, key: K, value: V) -> CacheResult<()>
    where
        K: AsRef<str>,
        V: Serialize,
    {
        self.store.insert(key.as_ref(), serde_json::to_value(value)?)
    }

    pub fn remove<K>(&mut self, key: K) -> CacheResult<()>
    where
        K: AsRef<str>,
    {
        self.store.remove(key.as_ref())
    }
}
```

In this code, we define a `CacheStore` trait as a common interface since we want to support multiple cache stores with a few required associative methods to manage cache data. For the sake of simplicity, let's keep this to a bare minimum.

We provide a simple in-memory store which implements the methods provided in the `CacheStore`. Adding other stores like `file` or `redis` means they provide implementations to the methods in `CacheStore` as well. 
We also provide a public facing `Cache` API struct that defines that users can interact directly with. This wraps our store together with any other cache-specific configs and provides methods for managing the cache 
that mostly forward operations to the store. 

We can test this with the code below:
```rust
fn main() {
    let store = Memory::new();
    let cache = Cache::new(store);
    
    cache.insert("foo", "bar");
    let expected: Option<String> = cache.get("foo");
    assert_eq!(expected, Some("foo".to_string()));
}

```

This works just fine. However, the code is synchronous and does not scale, especially when you add other stores like `redis`, or`file` which perform I/O operations.
This means we need to change the design to an asynchronous one. 

## The Naive Async Version

Rust supports async traits, so the updated code (without showing elided lifetimes) should look something like this:

```rust
pub trait CacheStore: Send + Sync + 'static{
    async fn get(&self, key: &str) -> CacheResult<Option<Value>>;
    async fn insert(&self, key: &str, value: Value) -> CacheResult<()>;
    async fn remove(&self, key: &str) -> CacheResult<()>;
}


#[derive(Debug, Clone)]
pub struct Memory {
    map: Arc<Mutex<HashMap<String, Value>>>,
}

impl CacheStore for Memory {
    async fn get(&self, key: &str) -> CacheResult<Option<Value>> {
        // implementation
    }

    async fn insert(&self, key: &str, value: Value) -> CacheResult<()> { 
        // implementation
    }

    async fn remove(&self, key: &str) -> CacheResult<()> { 
        // implementation
    }
}


...
impl CacheStore {

    ...
    pub fn get<K, V>(&self, key: K) -> CacheResult<Option<V>>
    where
        K: AsRef<str>,
        V: DeserializeOwned,
    {
        self.store.get(key.as_ref()).await?.map(serde_json::from_value).transpose().map_err(CacheError::from)
    }

    pub fn insert<K, V>(&self, key: K, value: V) -> CacheResult<Option<V>>
    where
        K: AsRef<str>,
        V: Serialize,
        {
            self.store.insert(key.as_ref(), serde_json::to_value(serde_json::to_value(value)?)).await
        }

    pub fn remove<K: AsRef<str>>(&self, key: K) -> CacheResult<()>
    where
        K: AsRef<str>,
        {
            self.store.remove(key.as_ref()).await?
        }

}
```

In the above code, we gate the in-memory store behind a `Mutex` and drop the `mut` requirement in the trait methods.
We also update our main function to use `tokio`'s async runtime:

```rust
#[tokio::main]
fn main() -> Result<(), String> {
    let store = Memory::new();
    let cache = Cache::new(store);
    
    cache.insert("foo", "bar");
    let expected: Option<String> = cache.get("foo").await?;
    assert_eq!(expected, Some("foo".to_string()));
}

```

Unfortunately, this does not work as expected. You typically run into an error like this:

```
error[E0038]: the trait `CacheStore` is not dyn compatible
  --> src/bin/asyn_t.rs:52:16
   |
52 |         Self { store }
   |                ^^^^^ `CacheStore` is not dyn compatible
   |
note: for a trait to be dyn compatible it needs to allow building a vtable
      for more information, visit <https://doc.rust-lang.org/reference/items/traits.html#dyn-compatibility>
  --> src/bin/asyn_t.rs:11:14

```
Moreover, the compiler will [scream](https://blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits/?#async-fn-in-public-traits) 
at you if you attempt to use `async fn` in public trait methods with trait objects.

## Object Safety

To understand why this happens, we need to understand the concept of [object safety ](https://rust-lang.github.io/rfcs/0255-object-safety.html#detailed-design)in Rust. In rust, traits can be used as trait objects (i.e., `dyn Trait`) 
only if they are object safe. For a trait to be object safe, it must satisfy two main conditions:
1. All trait methods must not have any generic type parameters.
2. All methods must have a receiver of type `&self`, `&mut self`, or `Box<Self>`.

The issue with async functions in traits is that they desugar into functions that return `impl Future`, so our example becomes something like this under the hood:

```rust
pub trait CacheStore: Send + Sync + 'static{
    fn get(&self, key: &str) -> impl Future<Output = Result<Value, String>>;
    fn insert(&mut self, key: &str, value: Value) -> impl Future<Output = Result<(), String>>;
    fn remove(&mut self, key: &str) -> impl Future<Output = Result<(), String>>;
}
```
This means that the methods now have generic return types, which violates the first condition of object safety.

## The `async-trait` Crate
One way to work around this limitation is to use the `async-trait` crate which provides a way to define async functions in 
traits while maintaining object safety. Here's how we can modify our code to use `async-trait`:

```rust
use async_trait::async_trait;

#[async_trait]
pub trait CacheStore: Send + Sync + 'static{
    async fn get(&self, key: &str) -> Result<Option<Value>, String>;
    async fn insert(&self, key: &str, value: Value) -> Result<(), String>;
    async fn remove(&self, key: &str) -> Result<(), String>;
}

...
#[async_trait]
impl CacheStore for Memory {
    async fn get(&self, key: &str) -> CacheResult<Option<Value>> {
        // implementation
    }
    async fn insert(&self, key: &str, value: Value) -> CacheResult<()> { 
        // implementation
    }
    async fn remove(&self, key: &str) -> CacheResult<()> { 
        // implementation
    }
}
```

By annotating the trait and its implementations with `#[async_trait]`, the crate takes care of the necessary transformations to make the async methods object safe.
This allows us to use `dyn CacheStore` without running into object safety issues.
However we decided to limit the use of  `async-trait` because it sometimes generates error messages that were hard to debug.
Also, using `async-trait` generates documentation littered with unnecessary details for trait methods which can make it hard to read. 
For example, running `cargo doc --open` produces this for our `CacheStore` trait:

```rust
pub trait CacheStore:
Send
+ Sync
+ 'static {
    // Required methods
    fn get<'life0, 'life1, 'async_trait>(
        &'life0 self,
        key: &'life1 str,
    ) -> Pin<Box<dyn Future<Output = CacheResult<Option<Value>>> + Send + 'async_trait>>
    where Self: 'async_trait,
          'life0: 'async_trait,
          'life1: 'async_trait;
    fn insert<'life0, 'life1, 'async_trait>(
        &'life0 self,
        key: &'life1 str,
        value: Value,
    ) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send + 'async_trait>>
    where Self: 'async_trait,
          'life0: 'async_trait,
          'life1: 'async_trait;
    fn remove<'life0, 'life1, 'async_trait>(
        &'life0 self,
        key: &'life1 str,
    ) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send + 'async_trait>>
    where Self: 'async_trait,
          'life0: 'async_trait,
          'life1: 'async_trait;
}
```

That leads to the question: how do we balance ergonomics, performance and documentation quality without using `async-trait`?
To answer that, we would need to do something similar to what `async-trait` does under the hood, but manually.

##  Manual Pin and Boxed Futures
As we mentioned earlier, async functions in traits desugar into functions that return `impl Future`, which are not object safe. However, we can work
around this by Boxing the returned future ( `Box<dyn Future + Send>`), which makes it a concrete type and thus object safe. However, this is not 
enough because futures can be self-referential (they contain references to data within themselves), we also need to pin them in memory using `Pin`. 
This prevents the future from being moved in memory, which would invalidate any internal references.

That leads us to the following signature for our trait methods:

```rust
use std::pin::Pin;
use std::future::Future;

pub trait CacheStore: Send + Sync + 'static{
    fn get(&self, key: &str) -> Pin<Box<dyn Future<Output = CacheResult<Option<Value>>> + Send>>;
    fn insert(&self, key: &str, value: Value) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send>>;
    fn remove(&self, key: &str) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send>>;
}
```

Now we can update our `CacheStore` implementation for `Memory` like this:

```rust
use std::pin::Pin;
use std::future::Future;
use std::boxed::Box;
use std::collections::HashMap;
use serde_json::Value;
use std::sync::{Arc, Mutex};
use futures::future;

#[derive(Debug, Clone)]
pub struct Memory {
    map: Arc<Mutex<HashMap<String, Value>>>,
}

...

impl CacheStore for Memory {
    fn get(&self, key: &str) -> Pin<Box<dyn Future<Output = CacheResult<Option<Value>>> + Send>> {
        let map = self.map.clone();
        let key = key.to_string();
        Box::pin(async move {
            let map = map.lock().unwrap();
            Ok(map.get(&key).cloned())
        })
    }

    fn insert(&self, key: &str, value: Value) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send>> {
        let map = self.map.clone();
        let key = key.to_string();
        Box::pin(async move {
            let mut map = map.lock().unwrap();
            map.insert(key, value);
            Ok(())
        })
    }

    fn remove(&self, key: &str) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send>> {
        let map = self.map.clone();
        let key = key.to_string();
        Box::pin(async move {
            let mut map = map.lock().unwrap();
            map.remove(&key);
            Ok(())
        })
    }
}
```

Our public facing `Cache` API stays the same as before, run this and it should work as expected. The good thing is, our users using 
the `Cache` API don't have to deal with any of the async trait complexities, they can just use it as is.

However, I don't know about you, but the signatures of the trait method implementations look really ugly and verbose. 
```rust
fn get(&self, key: &str) -> Pin<Box<dyn Future<Output = CacheResult<Option<Value>>> + Send>>
```

For instance, say we want downstream users or third-party library authors to implement their own cache stores, they would 
have to deal with this verbosity which is not ideal from an ergonomic perspective. What if we could also make life easier for them?

## Blanket Async Trait Implementations
Instead of having our `CacheStore` trait return pinned boxed futures directly, we can delegate that to a helper trait that does all the dirty work and
have our `CacheStore` trait define async methods as usual. Let's see this in action:

```rust
use std::pin::Pin;
use std::future::Future;
use serde_json::Value;

pub(crate) trait BoxedCacheStore: Send + Sync + 'static{
    fn get<'a>(&'a self, key: &'a str) -> Pin<Box<dyn Future<Output = CacheResult<Option<Value>>> + Send + 'a>>;
    fn insert<'a>(&'a self, key: &str, value: Value) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send + 'a>>;
    fn remove<'a>(&'a self, key: &'a str) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send + 'a>>;
}

pub trait CacheStore: Send + Sync + 'static{
    fn get(&self, key: &str) -> impl Future<Output = CacheResult<Option<Value>>> + Send;
    fn insert(&self, key: &str, value: Value) -> impl Future<Output = CacheResult<()>> + Send;
    fn remove(&self, key: &str) -> impl Future<Output = CacheResult<()>> + Send;
}

impl<T: CacheStore> BoxedCacheStore for T
{
    fn get<'a>(&'a self, key: &'a str) -> Pin<Box<dyn Future<Output = CacheResult<Option<Value>>> + Send + 'a>> {
        Box::pin(async move {
            T::get(self, key).await
        })
    }

    fn insert<'a>(&'a self, key: &str, value: Value) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send + 'a>> {
        Box::pin(async move {
            T::insert(self, key, value).await
        })
    }

    fn remove<'a>(&'a self, key: &'a str) -> Pin<Box<dyn Future<Output = CacheResult<()>> + Send + 'a>> {
        Box::pin(async move {
            T::remove(self, key).await
        })
    }
}
```

Now, lets unpack what is happening here. We provide an internal helper trait `BoxedCacheStore` that defines methods with similar signatures as 
our previous `CacheStore`. We then provide a blanket implementation of this trait for any type `T` that implements
the `CacheStore` trait. The implementation simply delegates calls to the actual or concrete implementation of the `CacheStore` trait and 
boxes the returned futures.

You may also notice that we provided explicit lifetimes for the methods in `BoxedCacheStore`. This is crucial because of how Rust [elision rules](https://doc.rust-lang.org/reference/lifetime-elision.html?#r-lifetime-elision.trait-object) apply to trait objects.
Without the explicit lifetimes, the compiler assumes `'static` for the trait:

```rust
fn get(&self, key: &str) -> Pin<Box<dyn Future<Output = ...> + Send>>;

// is equivalent to

fn get(&self, key: &str) -> Pin<Box<dyn Future<Output = ...> + Send + 'static>>;
```
But our futures do borrow from `self` and `key` parameter, which means they cannot be `'static` and makes omitting the explicit lifetime illegal.
By providing an explicit lifetime, we're essentially telling the compiler that the boxed future's lifetime is tied to the lifetime of the references it captures.

Now we update our `Memory` implementation as below:

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde_json::Value;

#[derive(Debug, Clone)]
pub struct Memory {
    map: Arc<Mutex<HashMap<String, Value>>>,
}

impl Memory {
    pub fn new() -> Self {
        Self {
            map: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl CacheStore for Memory {
    async fn get(&self, key: &str) -> CacheResult<Option<Value>> {
        let map = self.map.lock().unwrap();
        Ok(map.get(key).cloned())
    }

    async fn insert(&self, key: &str, value: Value) -> CacheResult<()> {
        let mut map = self.map.lock().unwrap();
        map.insert(key, value);
        Ok(())
    }

    async fn remove(&self, key: &str) -> CacheResult<()> {
        let mut map = self.map.lock().unwrap();
        map.remove(key);
        Ok(())
    }
}

```
Much cleaner! No pinned boxes, no manual boxing of futures, just plain async functions.

We can now update our `Cache` struct to expose `CacheStore` in the public API while internally using `BoxedCacheStore`:
```rust

use std::sync::Arc;
use serde::{Serialize, de::DeserializeOwned};

#[derive(Clone)]
pub struct Cache {
    store: Arc<dyn BoxedCacheStore>,
}

impl Cache {
    pub fn new(store: impl CacheStore) -> Self {
        let store = Arc::new(store) as Arc<dyn BoxedCacheStore>;
        Self { store }
    }

    pub async fn get<K, V>(&self, key: K) -> CacheResult<Option<V>>
    where
        K: AsRef<str>,
        V: DeserializeOwned,
    {
        self.store
            .get(key.as_ref())
            .await?
            .map(serde_json::from_value)
            .transpose()
            .map_err(CacheError::from)
    }

    pub async fn insert<K, V>(&self, key: K, value: V) -> CacheResult<()>
    where
        K: AsRef<str>,
        V: Serialize,
    {
        self.store
            .insert(
                key.as_ref(),
                serde_json::to_value(value)?,
            )
            .await?
    }

    pub async fn remove<K>(&self, key: K) -> CacheResult<()>
    where
        K: AsRef<str>,
    {
        self.store.remove(key.as_ref()).await
    }
}
```

As you can see,our store field now uses `BoxedCacheStore` as the trait object, but our public-facing API accepts anything that implements `CacheStore`. We 
then cast the provided store to `BoxedCacheStore` when creating a new `Cache` instance.  This looks much better if you ask me.

One downside of this approach is that it is more boilerplate heavy, and we now have more code to maintain.
However, this shouldn't be a problem since the boilerplate is minimal and mostly mechanical--the helper trait simply delegates to the actual implementation.
A small price to pay for better ergonomics and documentation quality.
