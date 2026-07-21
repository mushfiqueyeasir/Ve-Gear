import Script from "next/script";
import { GoogleAnalyticsOne } from "./googleAnalytics";
import { FacebookPixel } from "./facebookPixel";

// Injects GA / Meta Pixel / GTM based on ids stored in site_settings.
// Rendered by the store layout only when analytics_enabled is true.
export const Analytics: React.FC<{
  googleAnalyticsId?: string | null;
  metaPixelId?: string | null;
  gtmId?: string | null;
}> = ({ googleAnalyticsId, metaPixelId, gtmId }) => (
  <>
    {googleAnalyticsId && <GoogleAnalyticsOne id={googleAnalyticsId} />}
    {metaPixelId && <FacebookPixel id={metaPixelId} />}
    {gtmId && (
      <Script id="gtm-init" strategy="afterInteractive">
        {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `}
      </Script>
    )}
  </>
);
