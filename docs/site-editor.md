# Publishing from /admin

Open `/admin` and request a sign-in link for `yunusaalkamel@gmail.com`. The server verifies this email against Supabase Auth for every write. Choose a page in the toolbar. Click text and select words to format them. Drop a JPG, PNG or WebP (up to 3 MB) onto a photo, or click it to browse. Click a repeatable card and choose **Duplicate card**. Use **Browse pages** to follow links or open interactive elements. **Publish** saves the current edits across pages. **Discard** restores the last published content.

## Connect a deployment

- In Supabase Auth, enable email sign-in and allow the production and designated preview URLs ending in `/admin` as redirect URLs. The owner needs a verified email session.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel for the website's existing Supabase project. These public values are used in both the browser and function.
- In Sanity, create a token with permission to write documents and image assets. Set it as `SANITY_EDITOR_TOKEN` in Vercel. Use a public dataset for the published content. Set `SANITY_EDITOR_DATASET` to `production` for production and to a separate existing dataset for Preview. Use a trusted preview URL when testing email sign-in.
- Redeploy once to pick up configuration. In a preview, edit and publish a card, then open its public route in a private window. Production and preview publishing must use different datasets.

## Content behavior

Published overrides are stored in the Sanity document `website-inline-content`. Existing React content and Sanity queries supply defaults; a field edited through /admin takes precedence over its default. Draft edits stay in the browser tab until published. Uploaded assets are created on drop. Publishing checks the document revision to prevent one tab from overwriting another tab's changes.

Field and scope IDs in JSX are persistent content identifiers. Keep them when changing styling or moving content within a page. Live calendar data and calculated prayer times continue to come from their existing sources.
