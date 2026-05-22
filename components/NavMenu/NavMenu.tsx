'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Login' },
  { href: '/instructions', label: 'Instructions' },
] as const;

/**
 * NavMenu provides top-level site navigation with a responsive hamburger menu for mobile.
 * Meets WCAG 2.1 AA: aria-label, aria-expanded, aria-current, visible focus rings.
 */
export function NavMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">
        <span className="text-slate-100 font-semibold tracking-tight">Broker Agent</span>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-6" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                className="text-sm text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded aria-[current=page]:text-white aria-[current=page]:underline underline-offset-4 transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded p-1 transition-all duration-200"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul id="mobile-menu" role="list" className="md:hidden border-t border-slate-800 px-4 py-3 flex flex-col gap-3">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className="block text-sm text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded aria-[current=page]:text-white aria-[current=page]:underline underline-offset-4 transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
