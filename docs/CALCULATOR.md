# Mining Calculator

The mining calculator helps users estimate their potential mining rewards based on their hardware.

## Features

- **GPU Selection**: 80+ GPU presets with hashrate and power consumption data
- **Profitability Calculation**: Revenue, electricity costs, and profit estimates
- **Network Statistics**: Real-time network hashrate and block reward data
- **Multi-Currency Support**: Works with any Ethash-based coin

## GPU Database

### NVIDIA GeForce

| Series | GPUs |
|--------|------|
| **RTX 5000** | 5090, 5080, 5070 Ti, 5070, 5060 Ti, 5060 |
| **RTX 4000** | 4090, 4080 Super, 4080, 4070 Ti Super, 4070 Ti, 4070 Super, 4070, 4060 Ti, 4060 |
| **RTX 3000** | 3090 Ti, 3090, 3080 Ti, 3080, 3070 Ti, 3070, 3060 Ti, 3060, 3050 |

### NVIDIA Professional

| Series | GPUs |
|--------|------|
| **Ada Generation** | RTX 6000, RTX 5000, RTX 4500, RTX 4000 |
| **Ampere** | RTX A6000, A5500, A5000, A4500, A4000, A2000 |

### AMD Radeon

| Series | GPUs |
|--------|------|
| **RX 7000** | 7900 XTX, 7900 XT, 7900 GRE, 7800 XT, 7700 XT, 7600 XT, 7600 |
| **RX 6000** | 6950 XT, 6900 XT, 6800 XT, 6800, 6750 XT, 6700 XT, 6650 XT, 6600 XT, 6600, 6500 XT |

### AMD Radeon Pro

W7900, W7800, W7700, W7600, W6800, W6600

### Intel Arc

A770 16GB, A770 8GB, A750, A580, A380

### Mining Rigs (Multi-GPU)

Pre-configured multi-GPU setups for quick estimation:

- 6x RTX 4090 Rig
- 8x RTX 4070 Rig
- 6x RTX 3080 Rig
- 8x RTX 3070 Rig
- 6x RX 7900 XTX Rig
- Small Farm (1 GH/s)
- Medium Farm (5 GH/s)
- Large Farm (10 GH/s)

## Calculations

### Mining Reward Formula

```
Daily Reward = (Your Hashrate / Network Hashrate) × Blocks Per Day × Block Reward
```

Where:
- **Blocks Per Day** = 86400 / Block Time (in seconds)
- **Network Hashrate** = Total hashrate of all miners on the network

### Profitability Formula

```
Daily Profit = (Daily Reward × Coin Price) - (Power Consumption × 24h × Electricity Cost)
```

## Live Price Feed

The calculator automatically fetches the current VBC price from external sources:

### Price Sources (Priority Order)

1. **WikaEx API** - Primary source (`https://wikaex.com/api/spot/coingecko/tickers`)
   - Fetches VBC_USDT and VBC_BTC trading pairs
   - Same data source as vbc-explorer
2. **Explorer API** - Fallback (`https://explorer.virbicoin.com/api/dex/external-price`)
   - Uses the vbc-explorer's price aggregation service

### Price API Endpoint

The pool provides a `/api/price` endpoint that:
- Caches price data for 60 seconds
- Returns price in USD and BTC
- Indicates the data source (wikaex/explorer)
- Refreshes automatically every 60 seconds in the UI

```json
// GET /api/price response
{
  "success": true,
  "data": {
    "symbol": "VBC",
    "priceUSD": 0.0123,
    "priceBTC": 0.00000012,
    "timestamp": 1718182800000,
    "source": "wikaex"
  },
  "cached": false
}
```

### UI Indicators

- **🟢 Live** badge: Shows when price is being fetched live
- **Source label**: Displays "WikaEx" or "Explorer" below the price field
- Users can still manually override the price at any time

## Usage

1. **Select GPU**: Click a GPU category and select your specific GPU model
2. **Or Enter Manually**: Type your hashrate in MH/s, GH/s, or TH/s
3. **Configure Costs**: Enter power consumption (W) and electricity cost ($/kWh)
4. **Coin Price**: Automatically fetched live (can be manually overridden)
5. **View Results**: See estimated rewards (hourly, daily, weekly, monthly, yearly)

## Configuration

The calculator reads network statistics from the pool API:

```typescript
const { data: statsData } = useSWR(API_BASE_URL + "/api/stats", fetcher, {
  refreshInterval: 30000, // Update every 30 seconds
});

// Auto-fetch VBC price
const { data: priceData } = useSWR("/api/price", fetcher, {
  refreshInterval: 60000, // Refresh every 60 seconds
});
```

### Configuration File (poolConfig)

The calculator uses the following settings from `config.json`:

```json
{
  "block": {
    "time": 15,        // Block time in seconds
    "reward": 2        // Block reward in coins
  },
  "calculator": {
    "defaultPowerConsumption": 200,   // Default power in watts
    "defaultElectricityCost": 0.10    // Default $/kWh
  }
}
```

## GPU Efficiency (MH/W)

Each GPU displays its efficiency rating in MH/W (hashrate per watt), helping users compare power efficiency:

```
Efficiency = Hashrate (MH/s) / Power Consumption (kW)
```

Higher values indicate better efficiency.

## Example Results

For an RTX 4090 (135 MH/s, 350W) at network hashrate 500 GH/s:

| Period | Estimated Reward |
|--------|-----------------|
| Hourly | 0.0054 coins |
| Daily | 0.1296 coins |
| Weekly | 0.9072 coins |
| Monthly | 3.888 coins |
| Yearly | 47.304 coins |

*Note: Actual results vary based on luck, network difficulty changes, and pool fees.*

## Disclaimer

The calculator provides estimates based on current network conditions. Actual mining rewards may vary due to:

- Luck variance
- Network difficulty changes
- Pool fees
- Hardware performance variations
- Block reward changes (halving events)

This calculator assumes solo mining equivalent rewards. Pool mining provides more consistent payouts but with the same long-term average.
