# 🔧 Wallet Connection Troubleshooting Guide

## Current Status
The Arpo Studio platform is running on **http://localhost:3000** with a wallet connection debugger.

## 🔍 Debugging Steps

### 1. **Check the Wallet Debugger**
- Go to: http://localhost:3000
- Expand the "🔧 Wallet Connection Debugger" section at the top
- This will show you exactly what's happening with wallet detection

### 2. **Common Issues & Solutions**

#### ❌ **"No Ethereum provider found"**
**Problem**: MetaMask is not installed or not detected
**Solutions**:
- Install MetaMask from https://metamask.io/download/
- Refresh the browser after installation
- Make sure MetaMask extension is enabled

#### ❌ **"MetaMask Detected: ✗"**
**Problem**: Ethereum provider exists but it's not MetaMask
**Solutions**:
- Disable other wallet extensions (Coinbase Wallet, Phantom, etc.)
- Refresh the page
- Check if MetaMask is set as default wallet

#### ❌ **"Connection was rejected by user"**
**Problem**: You clicked "Cancel" in MetaMask popup
**Solutions**:
- Click "Connect Wallet" again
- Approve the connection in MetaMask popup
- Make sure MetaMask is unlocked

### 3. **Browser Console Debugging**
Open browser developer tools (F12) and check the Console tab for errors:

```javascript
// Test wallet detection manually in console:
console.log("Window ethereum:", window.ethereum)
console.log("Is MetaMask:", window.ethereum?.isMetaMask)
console.log("Provider available:", typeof window.ethereum !== "undefined")
```

### 4. **MetaMask Setup Checklist**
- [ ] MetaMask extension installed
- [ ] MetaMask is unlocked (enter password)
- [ ] MetaMask is connected to a network (Ethereum Mainnet, etc.)
- [ ] No conflicting wallet extensions enabled
- [ ] Browser allows pop-ups from localhost

### 5. **Test on Different Browsers**
Try opening http://localhost:3000 in:
- Chrome with MetaMask
- Firefox with MetaMask
- Edge with MetaMask

## 🎯 Quick Test Commands

### Test 1: Basic Environment Check
1. Go to http://localhost:3000
2. Expand the debugger
3. Check all green checkmarks ✓

### Test 2: Connection Test
1. Click "Test Connection" button in debugger
2. Approve MetaMask popup if it appears
3. Should show connected account address

### Test 3: Submit Artwork Page
1. Go to http://localhost:3000/submit-artwork
2. Try connecting wallet there
3. Check if same issue persists

## 📱 Alternative Access URLs
- **Main Site**: http://localhost:3000
- **Debug Page**: http://localhost:3000/debug
- **Submit Artwork**: http://localhost:3000/submit-artwork
- **Admin Panel**: http://localhost:3000/admin/dashboard

## 🔧 Technical Details

The wallet connection uses:
- **Detection**: `window.ethereum` object
- **Connection**: `eth_requestAccounts` method
- **Account Check**: `eth_accounts` method
- **Provider**: MetaMask primarily, with fallbacks

## 💡 Pro Tips

1. **Clear Browser Cache**: Sometimes helps with extension conflicts
2. **Restart MetaMask**: Disable and re-enable the extension
3. **Check Network**: Make sure MetaMask is on a supported network
4. **Private/Incognito Mode**: Test in private browsing to rule out extension conflicts

---

**The debugger on the main page will give you exact details about what's going wrong with your wallet connection!** 🚀
