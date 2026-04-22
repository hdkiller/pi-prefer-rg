# pi-prefer-rg

A pi extension that teaches the agent to prefer `rg`/ripgrep over `grep` in shell commands and examples.

## Features

- Appends a system prompt rule to prefer `rg` over `grep`
- Optional bash enforcement that blocks plain `grep` search commands
- Session-persistent settings via `/prefer-rg`

## Install

### From GitHub

```bash
pi install git:github.com/hdkiller/pi-prefer-rg
```

### From local path

```bash
pi install ./pi-prefer-rg
```

## Usage

Reload pi after installing:

```text
/reload
```

Commands:

- `/prefer-rg status`
- `/prefer-rg on`
- `/prefer-rg off`
- `/prefer-rg enforce-on`
- `/prefer-rg enforce-off`

## What it injects

The extension adds this guidance to the prompt:

- prefer `rg` over `grep`
- use `rg` by default for recursive text and code search
- only use `grep` if the user explicitly asks for it or grep-specific behavior is required

## Development

Run pi with the local package:

```bash
pi -e ./pi-prefer-rg
```
