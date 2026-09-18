import { Mail, Phone, Share2 } from "lucide-react";
import Link from "next/link";
import { listMarketplaceCategories } from "@/lib/api/categories";
import { getMarketingBase, getMarketingUrl } from "@/lib/oja-links";
import AppLogo from "./AppLogo";
import NewsletterForm from "./NewsletterForm";

const QUICK_LINKS = [
  { name: "About Us", path: "/about-us" },
  { name: "Contact Us", path: "/contact-us" },
  { name: "Support", path: "/support" },
  { name: "Blog", path: "/blog" },
  { name: "FAQ", path: "/faq" },
  { name: "Careers", path: "/careers" },
  { name: "Resources", path: "/resources" },
  { name: "Help Center", path: "/help-center" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Terms & Conditions", path: "/terms-of-service" },
];

const FALLBACK_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Books & Media",
];

/**
 * Restored marketplace footer from `oja-frontend/src/components/shared/Footer.tsx`.
 * Marketing links go to useoja.com; category links stay on Oja Square.
 */
export default async function Footer() {
  let categories: { id: string; name: string }[] = [];
  try {
    categories = (await listMarketplaceCategories(5)).map((c) => ({
      id: c.id,
      name: c.name,
    }));
  } catch {
    categories = [];
  }

  const year = new Date().getFullYear();
  const marketingHome = getMarketingBase();

  return (
    <footer className="mt-auto border-t border-teal-100 bg-white pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <AppLogo className="h-8 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-gray-600">
              Your one-stop destination for premium products from thousands of
              trusted stores. Quality, reliability, and fast delivery, always.
            </p>
            <div className="flex gap-4">
              {["Facebook", "X", "Instagram", "YouTube"].map((label) => (
                <a
                  key={label}
                  href={marketingHome}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 transition-all hover:text-teal-600 hover:shadow-md"
                  aria-label={label}
                >
                  <Share2 className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-gray-900">Quick Links</h4>
            <ul className="space-y-4">
              {QUICK_LINKS.map((item) => (
                <li key={item.name}>
                  <a
                    href={getMarketingUrl(item.path)}
                    className="text-sm text-gray-600 transition-colors hover:text-teal-600"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-gray-900">Categories</h4>
            <ul className="space-y-4">
              {categories.length > 0
                ? categories.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/products?categoryIds=${item.id}`}
                        className="text-sm text-gray-600 transition-colors hover:text-teal-600"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))
                : FALLBACK_CATEGORIES.map((item) => (
                    <li key={item}>
                      <Link
                        href="/categories"
                        className="text-sm text-gray-600 transition-colors hover:text-teal-600"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
              <li>
                <Link
                  href="/categories"
                  className="text-sm font-semibold text-teal-600 hover:underline"
                >
                  All categories →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-gray-900">Join Our Newsletter</h4>
            <p className="mb-4 text-sm text-gray-600">
              Subscribe to get updates on new products and special offers.
            </p>
            <NewsletterForm />
            <div className="mt-8">
              <h5 className="mb-4 text-xs font-black uppercase tracking-widest text-gray-400">
                Support
              </h5>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-teal-600" />
                  support@useoja.com
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-teal-600" />
                  +234 704 343 0082
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 md:flex-row">
          <p className="text-center text-xs text-gray-500">
            © {year} useoja.com. All rights reserved.
          </p>
          <div className="flex gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
              alt="Visa"
              className="h-4 opacity-50 grayscale transition-opacity hover:opacity-100"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
              alt="Mastercard"
              className="h-4 opacity-50 grayscale transition-opacity hover:opacity-100"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png"
              alt="Paypal"
              className="h-4 opacity-50 grayscale transition-opacity hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
