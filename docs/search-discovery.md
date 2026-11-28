# Google and AI search setup

## Shipped site changes
- A real `/sitemap.xml` endpoint includes built-in pages and public, currently published CMS pages/albums. It retains a built-in fallback if Sanity is unavailable.
- Production robots.txt advertises the sitemap. Preview builds disallow crawling and keep noindex metadata.
- Twelve public routes deliver their own search titles, descriptions, canonical links and organization/page/breadcrumb data before JavaScript. The app keeps those canonicals on client navigation.
- Social-card titles/descriptions retain the exact organization name. The visible design and main page copy are unchanged.
- The production vercel.app hostname permanently redirects to msaatpitt.org while preserving paths and queries. Preview hosts are excluded.
- A useful noscript fallback and optional llms.txt directory point to public authoritative information. They do not contain hardcoded daily prayer times, fabricated freshness dates, or ranking promises.
- Private/error pages stay out of indexing; the existing Gaza image noindex headers remain intact.

## Owner actions after deployment
1. Open https://search.google.com/search-console/welcome, add a **Domain** property for `msaatpitt.org`, and copy Google's TXT verification record.
2. The domain's nameservers are Cloudflare. In Cloudflare DNS, add Google's TXT value at the root (`@`), then verify in Search Console. Keep the verification record.
3. Submit `https://msaatpitt.org/sitemap.xml` under Sitemaps. Use URL Inspection on the homepage, `/resources/prayer`, and `/resources`; run the live test and request indexing.
4. Put `https://msaatpitt.org` in the Pitt Experience organization website field, Instagram website link and Linktree. Check these directly rather than relying on old search snippets.
5. Update or redirect the old Weebly website. It is still searchable and publishes a different Jummah time/location. If you cannot redirect, replace the outdated information with a clear link to the current site.
6. Optionally import the verified site into https://www.bing.com/webmasters and submit the sitemap there too.

## AI visibility
Keep the organization's name, location, membership information and source links consistent.
Maintain clear FAQ answers and current event/prayer information. Permit public search
crawlers through robots.txt and hosting/firewall rules. Search crawling and model
training are separate settings; no new training preference has been introduced.
`llms.txt` is only a convenience directory, not a prerequisite or guaranteed ranking signal.

Google documentation: https://developers.google.com/search/docs/appearance/ai-features
OpenAI crawler documentation: https://developers.openai.com/api/docs/bots

## Validation
59 app/API tests, TypeScript and production/preview builds passed. Generated HTML
was checked for all 12 routes: correct canonical URLs, unchanged social branding,
non-JavaScript fallback and preview noindex/robots isolation. No Lighthouse passes
or dependency additions were needed for this change.

Google indexing status and rankings cannot be verified until the owner connects
Search Console; absence from a search sample alone is not proof of non-indexing.
