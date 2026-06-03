import Script from "next/script";

/** Site-wide third-party scripts, each enabled only when its env var is set.
 *  - Plausible: NEXT_PUBLIC_PLAUSIBLE_DOMAIN (e.g. soccerdadhq.com)
 *  - Google Analytics 4: NEXT_PUBLIC_GA_ID (e.g. G-XXXXXXX)
 *  - Google AdSense library: NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX)
 *  Renders nothing in demo/dev when unset. */
export default function Analytics() {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const adsense = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <>
      {adsense && (
        <Script
          async
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`}
          strategy="afterInteractive"
        />
      )}
      {plausible && (
        <Script
          defer
          data-domain={plausible}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
    </>
  );
}
