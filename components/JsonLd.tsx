/**
 * Injects a JSON-LD `<script>` block. `dangerouslySetInnerHTML` is the
 * correct, Next.js-documented way to do this (not a real XSS risk here:
 * `data` is always a structured object we built ourselves, never raw user
 * input passed through verbatim).
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
