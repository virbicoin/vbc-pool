# Enforcing Policies

Pool policy server collecting several stats on per IP basis. There are two options: `iptables+ipset` or simple application level bans. Banning is disabled by default.

## Configuration Overview

```json
{
  "policy": {
    "workers": 8,
    "resetInterval": "60m",
    "refreshInterval": "1m",
    "banning": {
      "enabled": false,
      "ipset": "blacklist",
      "timeout": 1800,
      "invalidPercent": 30,
      "checkThreshold": 30,
      "malformedLimit": 5
    },
    "limits": {
      "enabled": false,
      "limit": 30,
      "grace": "5m",
      "limitJump": 10
    }
  }
}
```

## Firewall Banning

First you need to configure your firewall to use `ipset`, read [this article](https://wiki.archlinux.org/index.php/Ipset).

### Setup

1. **Create ipset:**
```bash
sudo ipset create blacklist hash:ip timeout 1800
```

2. **Configure iptables:**
```bash
sudo iptables -I INPUT -m set --match-set blacklist src -j DROP
```

3. **Configure sudoers** (`/etc/sudoers.d/pool`):
```
pool ALL=NOPASSWD: /sbin/ipset
```

The pool process will execute commands like:
```bash
sudo ipset add blacklist x.x.x.x timeout 1800
```

### Banning Parameters

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| `ipset` | Name of ipset (empty = app-level ban) | `blacklist` |
| `timeout` | Ban duration in seconds | 1800 (30 min) |
| `invalidPercent` | % of invalid shares to trigger ban | 30 |
| `checkThreshold` | Shares before checking | 30 |
| `malformedLimit` | Malformed requests before ban | 5 |

### Application-Level Banning

If you need something simple, just set `ipset` name to blank string and simple application level banning will be used instead. This doesn't require `ipset` or `sudo` configuration.

## Connection Rate Limiting

Under some weird circumstances you can enforce limits to prevent connection flood to stratum.

### Limiting Parameters

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| `limit` | Initial connections per IP | 30 |
| `grace` | Grace period after start | 5m |
| `limitJump` | Connections added per valid share | 10 |

### How It Works

1. Each IP starts with `limit` allowed connections
2. For each valid share submitted, limit increases by `limitJump`
3. During `grace` period, limits are not enforced
4. Limits reset every `resetInterval`

## Whitelist and Blacklist

The pool supports IP whitelists and blacklists stored in Redis:

```bash
# Add to whitelist (never banned)
redis-cli SADD eth:policy:whitelist "192.168.1.100"

# Add to blacklist (always banned)
redis-cli SADD eth:policy:blacklist "10.0.0.50"
```

## Monitoring

Check current policy stats:

```bash
# View banned IPs
redis-cli SMEMBERS eth:policy:bans

# Check connection stats
redis-cli HGETALL eth:policy:stats
```

## Security Considerations

> ⚠️ **Security Audit Finding (January 2026)**: The IP banning system uses shell commands via `exec.Command()`. Ensure IP addresses are validated before being passed to the banning function. See [SECURITY.md](SECURITY.md) for details.

- **Enable in Production**: Always enable banning for public-facing pools
- **Tune Parameters**: Adjust `invalidPercent` based on your network conditions
- **Monitor Logs**: Watch for patterns that might indicate attacks
- **Regular Review**: Periodically review banned IPs and adjust whitelist
- **X-Forwarded-For**: If behind reverse proxy, configure `behindReverseProxy: true` and ensure only trusted proxies can set this header
- **IP Validation**: The pool validates IPs before banning, but always monitor for unusual patterns

For comprehensive security guidance, see [SECURITY.md](SECURITY.md).

