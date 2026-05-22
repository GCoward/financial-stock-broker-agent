import { AuthForm } from '../../components/AuthForm/AuthForm';
import { Bot } from 'lucide-react';

/**
 * LoginPage renders the authentication screen with login and sign-up tabs.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-sky-600/20 p-3">
            <Bot size={28} className="text-sky-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-50">Broker Agent</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage your portfolio</p>
        </div>

        <AuthForm />
      </div>
    </main>
  );
}
