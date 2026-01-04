declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE_URL?: string;
      NEXT_PUBLIC_POOL_BASE_URL?: string;
      // Dynamic pool URLs (up to 10 pools)
      [key: `NEXT_PUBLIC_POOL${number}_URL`]: string | undefined;
      NEXT_PUBLIC_STATS_API_URL?: string;
    }
  }
}

export {};
