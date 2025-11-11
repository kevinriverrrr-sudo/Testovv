# WireGuard WebAssembly Module

This directory would contain the WireGuard implementation compiled to WebAssembly.

For the MVP, we use Chrome's proxy API to simulate VPN functionality.

In production, this would include:
- WireGuard protocol implementation in Rust
- Compiled to WebAssembly (≈120 KB gzip)
- WebRTC DataChannel for connection (bypass corporate firewalls)
- Userspace networking stack

## Build Instructions

```bash
# Install Rust and wasm-pack
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install wasm-pack

# Build WireGuard WASM module
cd wireguard-rs
wasm-pack build --target web --release

# Copy to extension
cp pkg/*.wasm ../public/wasm/
```

## References
- WireGuard Protocol: https://www.wireguard.com/protocol/
- Rust WireGuard: https://github.com/cloudflare/boringtun
- WebAssembly: https://webassembly.org/
