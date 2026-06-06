// 国旗コンポーネント - 動的にCDNから取得
// GLOBALのみSVGで表示、その他はflagcdn.comから動的取得

import Image from "next/image";

export function CountryFlag({
  country,
  className = "w-6 h-4",
}: {
  country: string;
  className?: string;
}) {
  // GLOBALは地球アイコンを表示
  if (country === "GLOBAL") {
    return (
      <div className={className}>
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="#3B82F6" />
          <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#60A5FA" strokeWidth="0.5" />
          <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="#60A5FA" strokeWidth="0.5" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="#60A5FA" strokeWidth="0.5" />
          <line x1="12" y1="2" x2="12" y2="22" stroke="#60A5FA" strokeWidth="0.5" />
        </svg>
      </div>
    );
  }

  // その他の国はflagcdn.comから動的に取得
  // 国コードを小文字に変換（flagcdn.comは小文字を使用）
  // 一部の国コードをISO 3166-1 alpha-2に変換
  const countryCodeMap: { [key: string]: string } = {
    UK: "gb", // United Kingdom → Great Britain
  };
  const countryCode = (countryCodeMap[country] || country).toLowerCase();
  const flagUrl = `https://flagcdn.com/w80/${countryCode}.png`;

  return (
    <div className={className}>
      <Image
        src={flagUrl}
        alt={`${country} flag`}
        width={80}
        height={60}
        className="w-full h-full object-cover rounded-sm"
        unoptimized // 外部URLなので最適化をスキップ
      />
    </div>
  );
}
