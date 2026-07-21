import Script from "next/script";

// Google Analytics (gtag) — id supplied from site_settings via the store layout.
export const GoogleAnalyticsOne: React.FC<{ id: string }> = ({ id }) => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      strategy="afterInteractive"
    />
    <Script id="ga-init" strategy="afterInteractive">
      {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${id}');
    `}
    </Script>
  </>
);
