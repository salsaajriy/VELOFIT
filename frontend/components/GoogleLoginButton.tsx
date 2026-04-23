'use client';
import { FcGoogle } from "react-icons/fc";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
 
export default function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google`);
      const data = await res.json();
 
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      console.error('Gagal mendapatkan URL Google:', error);
    }
  };
 
  return (
    <button onClick={handleGoogleLogin}
      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
      <FcGoogle size={20} />
      <span>Lanjutkan dengan Google</span>
    </button>
  );
}
