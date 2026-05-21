import React from "react";
import { Lock } from "lucide-react";
import { loginWithGoogle } from "../../firebase/config";

export default function AdminLogin({ onLoginSuccess, adminError, setAdminError }) {
  const handleAdminLogin = async () => {
    try {
      setAdminError("");
      const result = await loginWithGoogle();
      if (result.success && result.user) {
        if (result.user.email === "rene.puskas@googlemail.com") {
          onLoginSuccess(result.user);
        } else {
          setAdminError("Unauthorized email address.");
        }
      }
    } catch (error) {
      setAdminError("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-coal/20 border border-white/5 space-y-6 text-center">
      <Lock className="text-champagne-gold mx-auto" size={32} />
      <div>
        <h3 className="font-serif text-xl text-white tracking-wide">Secure Admin Access</h3>
        <p className="text-xs text-mineral-slate mt-2 tracking-wide font-light">
          Authenticate with your Google account to view orders.
        </p>
      </div>
      <div className="space-y-4 pt-4">
        <button 
          onClick={handleAdminLogin}
          className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-champagne-gold hover:text-black tracking-[0.15em] text-sm uppercase transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-y-px flex items-center justify-center space-x-3"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
        {adminError && <p className="text-red-400 text-xs mt-4 font-medium">{adminError}</p>}
      </div>
    </div>
  );
}
