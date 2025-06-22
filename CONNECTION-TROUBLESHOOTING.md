# Connection Troubleshooting Guide

This document provides solutions to common connection issues that might occur when running the Digital Art Auction platform, particularly focusing on the `net::ERR_TUNNEL_CONNECTION_FAILED` error.

## Quick Fix

If you're experiencing connection issues, try running:

```bash
./start-improved.sh
```

This script includes enhanced error handling and will automatically attempt to resolve common connection issues.

## Diagnosing Connection Issues

You can run the connection test utility to diagnose specific issues:

```bash
node connection-test.js
```

## Common Issues and Solutions

### 1. Port Already in Use

**Symptoms**: Server fails to start, or you see "address already in use" errors.

**Solution**:
```bash
# Find processes using ports 3000 and 3008
lsof -i :3000
lsof -i :3008

# Kill those processes
kill -9 <PID>
```

### 2. DNS Resolution Issues

**Symptoms**: `net::ERR_TUNNEL_CONNECTION_FAILED` errors, localhost not resolving.

**Solutions**:

a) Check your hosts file:
```bash
cat /etc/hosts
```

Make sure it contains:
```
127.0.0.1 localhost
::1 localhost
```

b) If it doesn't, add these entries:
```bash
sudo nano /etc/hosts
```
Add the lines above if missing.

### 3. Network Interface Issues

**Symptoms**: Local connections work but tunneled connections fail.

**Solution**:
```bash
# Check loopback interface
ifconfig lo0
```

Make sure it's up and has 127.0.0.1 assigned.

### 4. Node.js Memory Issues

**Symptoms**: Server crashes unexpectedly or becomes unresponsive.

**Solution**: Set NODE_OPTIONS before starting:
```bash
export NODE_OPTIONS="--max-old-space-size=4096 --max-http-header-size=16384"
```

### 5. Next.js Configuration Issues

Our enhanced `next.config.mjs` includes optimized settings to prevent connection issues, including:
- `httpAgentOptions` with `keepAlive: true`
- Experimental features to improve connection stability
- Appropriate timeouts to prevent disconnects

## Advanced Troubleshooting

If you continue experiencing connection issues:

1. Check your firewall settings and ensure ports 3000 and 3008 are allowed.
2. Look for errors in the browser console and terminal outputs.
3. Try disabling any VPN or proxy services temporarily.
4. Check system resources (CPU/memory) to ensure they're not constrained.

## Running in Force Mode

If you've tried all solutions and still encounter issues, you can bypass connection checks:

```bash
./start-improved.sh --force
```

## Contact Support

If connection issues persist after trying these solutions, please raise an issue on the GitHub repository or contact the development team with:
- Your operating system version
- Node.js version (`node -v`)
- npm version (`npm -v`)
- Error messages from the browser console and terminal
- Steps to reproduce the issue
