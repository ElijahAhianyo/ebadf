---
title: "Designing an ergonomic CLI for Cot.rs"
excerpt: "Designing ergonomic CLI applications in Rust can be challenging, but with the right approach, you can create a user-friendly experience. In this post, we will explore how to design an ergonomic CLI for Cot.rs, a Rust web framework."
date: "2026-08-25"
readingTime: "6 min read"
---

I recently worked on improving the ergonomics and user experience of the CLI for [Cot.rs](https://cot.rs/), a batteries-included Rust web framework. In this post, I will share some of the design decisions and techniques employed to create a more user-friendly CLI experience.

For context, just like many other rust libraries, Cot has a root workspace with multiple sub-crates. The directory structure looks something like this:

```
cot/
├── cot-cli/
├── cot-core/
├── cot
├── cot-codegen/
├── cot-macros/
```
The `cot` sub-crate is the main library that provides the core functionality of the framework. This is typically what users will interface with when building web applications. It imports other sub-crates like `cot-core`, `cot-codegen`, and `cot-macros` to provide a comprehensive set of features.
The `cot-cli` sub-crate on the other hand imports the `cot` sub-crate and provides a command-line interface for users to interact with the framework. When you install `Cot` via cargo, `cot-cli` is the binary that gets installed, and it is the entry point to run commands like `cot new` which scaffolds a new project (creating a new directory with the necessary files and structure for a Cot.rs application), `cot migration` which provides an interface to create and generate migration files.

There is another CLI entry point though, which exists in the `cot` sub-crate and ships with the client application. Here, this CLI provides commands like `cot check` which proves as a health check for the application, `cot collect-static` which collects static files for the application, and another `cot migration` command which provides an interface to rollback committed migrations. This CLI can be invoked either by running the binary directly:
```
./target/debug/binary_name check
```
or by using the `cargo run` command:
```
cargo run --bin binary_name -- check
```

Analogous to Django, we also provide [CliTask](https://github.com/cot-rs/cot/blob/42bdf61a0497882587c9704ddcb9da8265de7f00/cot/src/cli.rs#L243) which allows users define custom CLI commands for their applications.

Now you may be wondering why there are two separate CLI entry points and why some commands like `migration` exist in both.
This is generally because the commands in the `cot-cli` crate do not actually require the compiled application binary or the runtime to be present. For example, the `cot new` command only copies template files into the specified directory, and the `cot migration make` command--for instance--only needs to walk through the project in search of migration files, calculate the diff between the current state of the application models and the state of the last migration model, and then generates s new migration file if there are any changes. As you see, these commands do not require the application to be compiled or running. Imagine if you had to compile the application every time you wanted to create a new project or generate a migration files. That would be a horrendous user experience. On the other hand, commands shipped with the `cot` binary like running or rolling back migrations do need the application to be compiled and a runtime since they require access to the database and also generate a graph of the migrations.

However, having two separate CLI entry points means there are multiple ways to run commands, and users need to remember which commands are available in the cot-cli (invoked via `cot`) and which commands are available in the cot binary (invoked either via `cargo` or running the binary directly). This can also be very confusing for users, expecially when there are commands in both CLIs like the `migration` command. To address this, we need a way to unify CLI commands into a single entry point so users only remember one way to run commands while under the hood, we still maintain the separation of commands that require the application binary and those that do not. 

## The proxy layer
One way to go about this is to create a proxy layer that sits between the user and the two CLI entry points. This proxy layer would be responsible for correctly dispatching commands to the appropriate CLI entry point. Since the `cot-cli` crate is the one that gets installed when users install Cot via cargo, it makes sense to keep the proxy mechanism here.
The CLI logic in the `cot-cli` currently looks something like this:

```rust
// src/args.rs
#[derive(Debug, Parser)]
#[command(
    name = "cot",
    version,
    about,
    long_about = None
)]
pub struct Cli {
    #[command(flatten)]
    pub verbose: Verbosity,
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Debug, Subcommand)]
pub enum Commands {
    /// Create a new Cot project
    New(ProjectNewArgs),

    /// Manage migrations for a Cot project
    #[command(subcommand)]
    Migration(MigrationCommands),
}

#[derive(Debug, Args)]
pub struct ProjectNewArgs {
    /// Path to the directory to create the new project in
    pub path: PathBuf,
    /// Set the resulting crate name [default: the directory name]
    #[arg(long)]
    pub name: Option<String>,
    #[command(flatten)]
    pub source: CotSourceArgs,
}

#[derive(Debug, Subcommand)]
pub enum MigrationCommands {
    /// List all migrations for a Cot project
    List(MigrationListArgs),
    /// Generate migrations for a Cot project
    Make(MigrationMakeArgs),
    /// Create a new empty migration
    New(MigrationNewArgs),
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::New(args) => handlers::handle_new_project(args),
        Commands::Migration(cmd) => match cmd {
            MigrationCommands::List(args) => handlers::handle_migration_list(args),
            MigrationCommands::Make(args) => handlers::handle_migration_make(args),
            MigrationCommands::New(args) => handlers::handle_migration_new(args),
        },
    }
}
```

Let's dissect this code a bit. The `Cli` struct is the main entry point for the CLI. It uses the `clap` crate to parse command-line arguments and subcommands. The `Commands` enum defines the available commands, such as `New` for creating a new project and `Migration` for managing migrations. When a command like `cot new foo_project` is invoked, the arg values are parsed into `ProjectNewArgs` via `Cli::parse`, and gets dispatched to the `Commands::New` match arm, and eventually to the `handle_new_project` handler function. The signature details of the `handle_new_project` function is not relevant here, but it is responsible for creating a new Cot project in the specified directory.

To support commands like `cot check` which lives in the `cot` binary, we need to allow the `Cli` struct to also parse commands that are not defined. Clap provides the `external_subcommand` feature, which allows you to add a catch-all command that will capture any subcommand that is not explicitly defined in the `Commands` enum.

```rust
#[derive(Debug, Subcommand)]
pub enum Commands {
    ...
    #[command(external_subcommand)]
    External(Vec<OsString>),
}

...

fn main() -> anyhow::Result<()> {
    ...
    match cli.command {
        ...
        Commands::External(args) => handlers::handle_external_command(args),
}
```

Before we dive into the implementation details of the `handle_external_command` handler, let's recap on what we have achieved so far. Our cli can now accept arbitrary commands that are not defined in the `Commands` enum. When we receive a command that is not defined, we can forward this to the `cot` compiled binary and let it handle the command by running `cargo run -- <args>`. Easy right? Well, not quite. 
One issue with this approach is that this will not work if the user hs not built the application binary (`cargo build`) or if the user is running the CLI command from a different directory than the application binary. It also wont work if the user is working in a workspace with multiple binaries. To address this, we need discovery logic to identify the correct binary to run.

### Discovering the application binary
Every Rust project(or Cot application) has a `Cargo.toml` file in the root directory. The `Cargo.toml` file contains metadata that contains information about the project, including whether it is a workspace, the package name, and the binaries that are defined in the project. Cargo also provides a way to 