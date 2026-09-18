import { JsonLd } from "./JsonLd";
import { absoluteUrl, getSiteUrl, OJA_SAME_AS, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/**
 * Site-wide Organization + WebSite + SearchAction graph, rendered once in
 * the root layout. The `SearchAction` is what makes a Google "sitelinks
 * search box" possible for branded queries — it points at a search flow
 * `/search` genuinely supports, not an aspirational one.
 *
 * Oja Square is presented as part of the same Oja organization (not a
 * separate company) — `alternateName` and `sameAs` tie back to the same
 * brand oja-landing-page's own JSON-LD establishes.
 */
export function SiteJsonLd() {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Oja",
        alternateName: ["Oja Square", "useoja", "useoja.com", "Oja Nigeria"],
        url: siteUrl,
        logo: absoluteUrl("/images/oja-logo-trans-icon.png"),
        description: SITE_DESCRIPTION,
        sameAs: OJA_SAME_AS,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_NAME,
        alternateName: ["Oja marketplace", "oja.com.ng"],
        url: siteUrl,
        description: SITE_DESCRIPTION,
        inLanguage: "en-NG",
        publisher: { "@id": orgId },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return <JsonLd data={data} />;
}
