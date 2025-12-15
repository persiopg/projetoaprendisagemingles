"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/locales";

export default function LoginPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "pt-br";
  const dict = getDictionary(locale);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(dict.loginErrorInvalid);
        return;
      }

      router.push(`/${locale}/meus-flashcards`);
      router.refresh();
    } catch (error) {
      setError(dict.loginErrorGeneric);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#2b1055]">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#9c27b0] via-[#2b1055] to-[#2b1055] opacity-80"></div>
      
      {/* Stars (simulated) */}
      <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"></div>
      <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse delay-75"></div>
      <div className="absolute top-40 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-150"></div>
      <div className="absolute bottom-1/3 right-10 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse delay-300"></div>
      
      {/* Mountain Silhouette (simulated with a dark gradient/shape at bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div className="absolute -bottom-20 -left-20 w-[150%] h-64 bg-[#1c0522] rounded-[100%] blur-xl transform -rotate-2 opacity-80"></div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-[350px] p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-light text-white text-center mb-8 tracking-wide">
          {dict.loginTitle}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full bg-transparent border border-white/30 rounded-full px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/50 transition-all text-sm"
                placeholder={dict.loginEmailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full bg-transparent border border-white/30 rounded-full px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/50 transition-all text-sm"
                placeholder={dict.loginPasswordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-right mt-2">
                <button type="button" className="text-xs text-white/70 hover:text-white transition-colors">
                  {dict.loginForgotPassword}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-300 text-xs text-center bg-red-900/20 py-1 rounded">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-white/10 hover:bg-white/20 border border-white/40 text-white rounded-full py-2.5 transition-all uppercase tracking-wider text-sm font-medium mt-4 shadow-lg hover:shadow-white/10"
          >
            {dict.loginButton}
          </button>
          
          <div className="text-center text-xs text-white/70 mt-6">
             {dict.loginNoAccount}{" "}
             <Link href={`/${locale}/register`} className="font-bold text-white hover:underline">
               {dict.loginRegisterLink}
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
