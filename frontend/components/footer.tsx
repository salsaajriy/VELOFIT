import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer
          className="flex items-center justify-between px-8 md:px-12 py-4 flex-wrap gap-2"
          style={{
            borderTop: "1px solid #e0ddd8",
            backgroundColor: "#f0ede8",
          }}
        >
          <span className="font-syne text-sm font-semibold" style={{ color: "#7a7a7a" }}>
            Velofit
          </span>
          {/* <Link
            href="/contact"
            className="font-dm text-[0.85rem] transition-colors hover:text-gray-900"
            style={{ color: "#7a7a7a" }}
          >
            Contact Us
          </Link> */}
          <span className="font-dm text-[0.82rem]" style={{ color: "#9a9a9a" }}>
            © 2026 Velofit. Precision &amp; Safety.
          </span>
        </footer>
  );
}