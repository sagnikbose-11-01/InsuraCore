'use client';
// ============================================================
// components/shared/ThemeToggle.tsx
// Premium theme toggle with smooth layout animations and dropdown
// options (Light, Dark, System) mapping next-themes bindings.
// ============================================================

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  const currentIcon = () => {
    if (theme === 'system') return <Laptop className="w-4 h-4 text-sky-400" />;
    return resolvedTheme === 'dark' 
      ? <Moon className="w-4 h-4 text-violet-400" />
      : <Sun className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div ref={dropdownRef} className="relative z-50">
      {/* Primary Clickable Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-base-600)] bg-[var(--color-base-800)] text-[var(--color-base-200)] hover:text-white hover:border-[var(--color-base-500)] shadow-sm hover:shadow-[0_0_12px_rgba(255,255,255,0.03)] transition-all duration-200 text-xs font-bold select-none cursor-pointer"
      >
        {currentIcon()}
        <span className="capitalize hidden md:inline">{theme}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-base-500)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dynamic Dropdown Select Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-32 rounded-xl border border-[var(--color-base-600)] bg-[var(--color-base-800)] shadow-2xl p-1.5 space-y-1 overflow-hidden"
          >
            {options.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-xs font-semibold select-none cursor-pointer transition-all duration-150 ${
                    isActive 
                      ? 'bg-[var(--color-brand-500)] text-white shadow-md' 
                      : 'text-[var(--color-base-400)] hover:text-white hover:bg-[var(--color-base-700)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[var(--color-base-500)]'}`} />
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
