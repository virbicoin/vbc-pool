// 国旗SVGコンポーネント（最終フォールバック用）
export function CountryFlag({
  country,
  className = "w-6 h-4",
}: {
  country: string;
  className?: string;
}) {
  const flagSVGs: { [key: string]: React.ReactNode } = {
    GLOBAL: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle cx="12" cy="12" r="10" fill="#3B82F6" />
        <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#60A5FA" strokeWidth="0.5" />
        <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="#60A5FA" strokeWidth="0.5" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="#60A5FA" strokeWidth="0.5" />
        <line x1="12" y1="2" x2="12" y2="22" stroke="#60A5FA" strokeWidth="0.5" />
      </svg>
    ),
    IN: (
      <svg viewBox="0 0 3 2" className="w-full h-full">
        <rect x="0" y="0" width="3" height="0.67" fill="#FF9933" />
        <rect x="0" y="0.67" width="3" height="0.67" fill="#FFFFFF" />
        <rect x="0" y="1.33" width="3" height="0.67" fill="#138808" />
        <circle cx="1.5" cy="1" r="0.3" fill="none" stroke="#000080" strokeWidth="0.05" />
      </svg>
    ),
    JP: (
      <svg viewBox="0 0 3 2" className="w-full h-full">
        <rect x="0" y="0" width="3" height="2" fill="#FFFFFF" />
        <circle cx="1.5" cy="1" r="0.6" fill="#BC002D" />
      </svg>
    ),
    US: (
      <svg viewBox="0 0 19 10" className="w-full h-full">
        <rect x="0" y="0" width="19" height="10" fill="#B22234" />
        <rect x="0" y="0.77" width="19" height="0.77" fill="#FFFFFF" />
        <rect x="0" y="2.31" width="19" height="0.77" fill="#FFFFFF" />
        <rect x="0" y="3.85" width="19" height="0.77" fill="#FFFFFF" />
        <rect x="0" y="5.38" width="19" height="0.77" fill="#FFFFFF" />
        <rect x="0" y="6.92" width="19" height="0.77" fill="#FFFFFF" />
        <rect x="0" y="8.46" width="19" height="0.77" fill="#FFFFFF" />
        <rect x="0" y="0" width="7.6" height="5.38" fill="#3C3B6E" />
      </svg>
    ),
    SE: (
      <svg viewBox="0 0 16 10" className="w-full h-full">
        <rect x="0" y="0" width="16" height="10" fill="#006AA7" />
        <rect x="0" y="4" width="16" height="2" fill="#FECC00" />
        <rect x="4" y="0" width="2" height="10" fill="#FECC00" />
      </svg>
    ),
    SG: (
      <svg viewBox="0 0 4320 2880" className="w-full h-full">
        <rect x="0" y="0" width="4320" height="1440" fill="#ED2939" />
        <rect x="0" y="1440" width="4320" height="1440" fill="#FFFFFF" />
        <circle cx="1080" cy="720" r="540" fill="#FFFFFF" />
        <circle cx="1260" cy="720" r="540" fill="#ED2939" />
        <g fill="#FFFFFF">
          <polygon points="1080,180 1110,270 1200,270 1125,330 1155,420 1080,360 1005,420 1035,330 960,270 1050,270" />
          <polygon points="720,540 750,630 840,630 765,690 795,780 720,720 645,780 675,690 600,630 690,630" />
          <polygon points="1440,540 1470,630 1560,630 1485,690 1515,780 1440,720 1365,780 1395,690 1320,630 1410,630" />
          <polygon points="840,900 870,990 960,990 885,1050 915,1140 840,1080 765,1140 795,1050 720,990 810,990" />
          <polygon points="1320,900 1350,990 1440,990 1365,1050 1395,1140 1320,1080 1245,1140 1275,1050 1200,990 1290,990" />
        </g>
      </svg>
    ),
  };

  return <div className={className}>{flagSVGs[country] || null}</div>;
}
