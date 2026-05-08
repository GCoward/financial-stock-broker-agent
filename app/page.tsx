'use client';

import { Dashboard } from '../components/Dashboard/Dashboard';

/**
 * HomePage is the root entry point of the application.
 * Renders the main agent dashboard with portfolio overview and trade controls.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 md:px-8">
      <Dashboard />
    </main>
  );
}
