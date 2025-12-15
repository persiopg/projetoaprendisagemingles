"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-50"
      >
        Sair
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Sair da conta
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Tem certeza que deseja sair?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
