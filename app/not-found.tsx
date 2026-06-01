import { EyeOff, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-base-950)] text-[var(--color-base-100)] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[oklch(15%_0.02_230/0.75)] border border-[oklch(28%_0.08_230)] backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-fade-in">
        
        {/* Glowing 404 Radar Circle */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-[oklch(18%_0.08_230)] rounded-full border border-[oklch(28%_0.10_230)] glow-brand">
          <EyeOff className="w-10 h-10 text-[oklch(72%_0.20_230)] animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-[oklch(72%_0.20_230/0.3)] animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-[var(--color-brand-400)] font-bold uppercase tracking-widest bg-[var(--color-brand-950)] border border-[var(--color-brand-900)] px-2.5 py-1 rounded-full">
            404 — Not Found
          </span>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-base-100)] pt-2">
            Page does not exist
          </h2>
          <p className="text-sm text-[var(--color-base-500)] leading-relaxed">
            The resource you are looking for has been moved, deleted, or never existed in the core index.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button
              className="w-full"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Portal Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
