/**
 * Real, honest answers matching how Oja Square actually works, not
 * generic marketplace boilerplate. Rendered as visible page content (not
 * hidden behind an accordion, so crawlers and AI answer engines see the
 * full text in the initial HTML) and mirrored as FAQPage JSON-LD.
 */
export const HOME_FAQ = [
  {
    question: "What is Oja Square?",
    answer:
      "Oja Square is Oja's cross-store marketplace: one place to browse products from every independent merchant selling on Oja, instead of visiting one store's website at a time.",
  },
  {
    question: "Is Oja Square a separate marketplace from my Oja store?",
    answer:
      "No. Every active, in-stock product already listed on a merchant's Oja storefront is automatically part of what buyers find on Oja Square. There's no separate listing step or second inventory to manage.",
  },
  {
    question: "How do I pay when I buy something on Oja Square?",
    answer:
      "Checkout happens on the merchant's own store, using the same Paystack-backed checkout and order tracking Oja already provides. Oja Square itself doesn't run a separate cart or payment flow; it hands you off to the right store to complete the purchase.",
  },
  {
    question: "How do I start selling on Oja Square?",
    answer:
      "Open a store on Oja. It takes a few minutes, and once your products are active and in stock, they're automatically discoverable on Oja Square alongside every other merchant's catalog.",
  },
  {
    question: "Is Oja Square free for buyers?",
    answer:
      "Yes. Browsing and buying on Oja Square costs nothing beyond the product price and whatever fees the merchant's own store already shows at checkout.",
  },
] as const;
