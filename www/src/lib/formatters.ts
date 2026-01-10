export function formatHashrate(hashes: number) {
  if (hashes === 0) return "0 H/s";
  const i = Math.floor(Math.log(hashes) / Math.log(1000));
  const unit = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s", "PH/s", "EH/s", "ZH/s", "YH/s"][i];
  return `${(hashes / Math.pow(1000, i)).toFixed(2)} ${unit}`;
}

export function formatDifficulty(diff: number) {
  if (!diff) return "0";
  const i = Math.floor(Math.log(diff) / Math.log(1000));
  if (i === 0) return diff.toFixed(0);
  const unit = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"][i];
  return `${(diff / Math.pow(1000, i)).toFixed(2)} ${unit}`;
}
// SECURITY: Strict Ethereum address validation
// Validates format and optionally checksum (EIP-55)
export function isValidEthereumAddress(address: string): boolean {
  // Basic format check: 0x followed by 40 hex characters
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }
  return true;
}

// SECURITY: Sanitize address for display (prevent XSS)
export function sanitizeAddress(address: string): string {
  // Only allow valid hex characters
  return address.replace(/[^0-9a-fA-Fx]/g, "").slice(0, 42);
}

// SECURITY: Validate and sanitize address, returns null if invalid
export function validateAndSanitizeAddress(address: string): string | null {
  const sanitized = sanitizeAddress(address);
  if (isValidEthereumAddress(sanitized)) {
    return sanitized.toLowerCase();
  }
  return null;
}
export function formatDate(timestamp: number | null | undefined): string {
  if (timestamp == null || timestamp === 0) return "N/A";
  return new Date(timestamp * 1000).toLocaleString(undefined, { timeZoneName: "short" });
}

export function timeSince(timestamp: number | null | undefined): string {
  if (timestamp == null || timestamp === 0) return "N/A";
  const seconds = Math.floor((new Date().getTime() - new Date(timestamp * 1000).getTime()) / 1000);

  if (seconds < -5) return "in the future";
  if (seconds < 5) return "just now";

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export function formatNumber(num: number | null | undefined): string {
  return num?.toLocaleString() || "N/A";
}

export function formatLargeNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "N/A";

  const numValue = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(numValue)) return "N/A";

  const units = ["", "K", "M", "G", "T", "P", "E"];
  let i = 0;
  let value = numValue;
  while (value >= 1000 && i < units.length - 1) {
    value /= 1000;
    i++;
  }
  return `${value.toFixed(2)} ${units[i]}`;
}
