"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";

export default function ResetPassword() {
  // const router = useRouter();
  // const params = useSearchParams();
  // const email = params.get("email");
  // const token = params.get("token");

  // const [password, setPassword] = useState("");
  // const [passwordConfirmation, setPasswordConfirmation] = useState("");
  // const [loading, setLoading] = useState(false);
  // const [success, setSuccess] = useState("");
  // const [error, setError] = useState("");
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // useEffect(() => {
  //     if (!email || !token) {
  //         setError("The password reset link is not valid. Please request a new link.");
  //     }
  // }, [email, token]);

  // const submit = async (e: React.FormEvent) => {
  //     e.preventDefault();

  //     if (!email || !token) {
  //         setError("Password reset link is not valid.");
  //         return;
  //     }

  //     if (password.length < 8) {
  //         setError("Password must be at least 8 characters.");
  //         return;
  //     }

  //     if (password !== passwordConfirmation) {
  //         setError("Password doesnt match.");
  //         return;
  //     }

  //     setLoading(true);
  //     setSuccess("");
  //     setError("");

  //     try {
  //         const response = await fetch(
  //             "http://localhost:8000/api/reset-password",
  //             {
  //                 method: "POST",
  //                 headers: {
  //                     "Content-Type": "application/json"
  //                 },
  //                 body: JSON.stringify({
  //                     email,
  //                     token,
  //                     password,
  //                     password_confirmation: passwordConfirmation
  //                 })
  //             }
  //         );

  //         const data = await response.json();

  //         if (response.ok) {
  //             setSuccess(data.message || "Password berhasil direset!");
  //             setTimeout(() => {
  //                 router.push("/login");
  //             }, 3000);
  //         } else {
  //             setError(data.message || "Terjadi kesalahan. Silakan coba lagi.");
  //         }
  //     } catch (err) {
  //         setError("Koneksi error. Periksa koneksi internet Anda.");
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  // if (error && !loading && !success) {
  //     return (
  //         <div className="min-h-screen flex items-center justify-center bg-white p-4">
  //             <div className="max-w-md w-full">
  //                 <div className="bg-white rounded-lg shadow-lg border-4 border-red-500 p-6">
  //                     <div className="text-center">
  //                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
  //                             <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  //                             </svg>
  //                         </div>
  //                         <h2 className="text-xl font-bold text-gray-800 mb-2">Link Tidak Valid</h2>
  //                         <p className="text-gray-600 mb-6">{error}</p>
  //                         <Link href="/forgot-password" className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200">
  //                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  //                             </svg>
  //                             Minta Link Baru
  //                         </Link>
  //                     </div>
  //                 </div>
  //             </div>
  //         </div>
  //     );
  // }

  // return (
  //     <div className="min-h-screen flex items-center justify-center bg-white p-4">
  //         <div className="max-w-md w-full">
  //             {/* Header */}
  //             <div className="text-center mb-8">
  //                 <div className="m-6 relative inline-block">
  //                     <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-20">
  //                     </div>
  //                     <div className="relative w-20 h-20 mx-auto rounded-2xl rotate-45 flex items-center justify-center shadow-lg"
  //                         style={{
  //                             background: "linear-gradient(90deg, #e05a2b 0%, #f0a500 100%)",
  //                         }}>
  //                         <div className="absolute inset-1 bg-white rounded-xl">
  //                         </div>
  //                         <svg className="relative w-10 h-10 text-orange-500 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  //                         </svg>
  //                     </div>
  //                 </div>
  //                 <h1 className="mt-4 text-3xl font-bold text-gray-800">
  //                     Reset Password
  //                 </h1>
  //                 <p className="mt-2 text-gray-500">
  //                     Buat password baru untuk akun Anda
  //                 </p>
  //                 <div className="mt-2 text-sm text-gray-400">
  //                     <span className="inline-block bg-red-50 px-3 py-1 rounded-full">
  //                         {email || "email@example.com"}
  //                     </span>
  //                 </div>
  //             </div>

  //             {/* Card */}
  //             <div className="bg-white rounded-lg shadow-lg border-4 overflow-hidden">
  //                 {/* Top border 3 warna */}
  //                 <div className="h-2 flex"
  //                     style={{
  //                         background: "linear-gradient(90deg, #e05a2b 0%, #f0a500 100%)",
  //                     }}>
  //                 </div>

  //                 <form onSubmit={submit} className="p-6 space-y-6">
  //                     {/* Password Field */}
  //                     <div>
  //                         <label className="block text-sm font-medium text-gray-700 mb-2">
  //                             New Password
  //                         </label>
  //                         <div className="relative">
  //                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //                                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  //                                 </svg>
  //                             </div>
  //                             <input
  //                                 type={showPassword ? "text" : "password"}
  //                                 value={password}
  //                                 onChange={(e) => setPassword(e.target.value)}
  //                                 placeholder="Create a new password"
  //                                 required
  //                                 className="text-gray-700 w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
  //                                 disabled={loading}
  //                             />
  //                             <button
  //                                 type="button"
  //                                 onClick={() => setShowPassword(!showPassword)}
  //                                 className="absolute rounded-md inset-y-0 right-0 pr-3 flex items-center"
  //                             >
  //                                 {showPassword ? (
  //                                     <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  //                                     </svg>
  //                                 ) : (
  //                                     <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  //                                     </svg>
  //                                 )}
  //                             </button>
  //                         </div>
  //                         {password.length > 0 && password.length < 8 && (
  //                             <p className="mt-1 text-xs text-red-500">Password minimum 8 characters</p>
  //                         )}
  //                         {password.length >= 8 && (
  //                             <p className="mt-1 text-xs text-green-500">✓ Strong Password</p>
  //                         )}
  //                     </div>

  //                     {/* Confirm Password Field */}
  //                     <div>
  //                         <label className="block text-sm font-medium text-gray-700 mb-2">
  //                             Password Confirmation
  //                         </label>
  //                         <div className="relative">
  //                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //                                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  //                                 </svg>
  //                             </div>
  //                             <input
  //                                 type={showConfirmPassword ? "text" : "password"}
  //                                 value={passwordConfirmation}
  //                                 onChange={(e) => setPasswordConfirmation(e.target.value)}
  //                                 placeholder="Fill your password"
  //                                 required
  //                                 className="text-gray-800 w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
  //                                 disabled={loading}
  //                             />
  //                             <button
  //                                 type="button"
  //                                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  //                                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
  //                             >
  //                                 {showConfirmPassword ? (
  //                                     <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  //                                     </svg>
  //                                 ) : (
  //                                     <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  //                                     </svg>
  //                                 )}
  //                             </button>
  //                         </div>
  //                         {passwordConfirmation.length > 0 && password !== passwordConfirmation && (
  //                             <p className="mt-1 text-xs text-red-500">✗ Password tidak cocok</p>
  //                         )}
  //                         {passwordConfirmation.length > 0 && password === passwordConfirmation && (
  //                             <p className="mt-1 text-xs text-green-500">✓ Password cocok</p>
  //                         )}
  //                     </div>

  //                     {/* Error Message */}
  //                     {error && (
  //                         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
  //                             <div className="flex">
  //                                 <div className="shrink-0">
  //                                     <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  //                                     </svg>
  //                                 </div>
  //                                 <div className="ml-3">
  //                                     <p className="text-sm text-red-700">{error}</p>
  //                                 </div>
  //                             </div>
  //                         </div>
  //                     )}

  //                     {/* Success Message */}
  //                     {success && (
  //                         <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
  //                             <div className="flex">
  //                                 <div className="shrink-0">
  //                                     <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  //                                     </svg>
  //                                 </div>
  //                                 <div className="ml-3">
  //                                     <p className="text-sm text-green-700">{success}</p>
  //                                     <p className="text-xs text-green-600 mt-1">Redirecting ke halaman login...</p>
  //                                 </div>
  //                             </div>
  //                         </div>
  //                     )}

  //                     {/* Submit Button */}
  //                     <button
  //                         type="submit"
  //                         disabled={loading || !!success}
  //                         className="w-full relative overflow-hidden group"
  //                     >
  //                         <div className="absolute inset-0 flex"
  //                             style={{
  //                                 background: "linear-gradient(90deg, #e05a2b 0%, #f0a500 100%)",
  //                             }}>
  //                         </div>
  //                         <span className="relative z-10 block w-full py-2 px-4 text-white font-medium text-sm">
  //                             {loading ? (
  //                                 <span className="flex items-center justify-center">
  //                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
  //                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  //                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  //                                     </svg>
  //                                     Mereset Password...
  //                                 </span>
  //                             ) : success ? (
  //                                 "✓ Password Berhasil Direset"
  //                             ) : (
  //                                 "Reset Password"
  //                             )}
  //                         </span>
  //                     </button>

  //                     {/* Password Requirements */}
  //                     <div className="bg-gray-50 rounded-md p-3">
  //                         <p className="text-xs text-gray-600 font-medium mb-1">Password harus:</p>
  //                         <ul className="text-xs text-gray-500 space-y-1">
  //                             <li className="flex items-center">
  //                                 <span className={`inline-block w-4 h-4 rounded-full mr-2 ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}>
  //                                     {password.length >= 8 && (
  //                                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  //                                         </svg>
  //                                     )}
  //                                 </span>
  //                                 Minimal 8 karakter
  //                             </li>
  //                             <li className="flex items-center">
  //                                 <span className={`inline-block w-4 h-4 rounded-full mr-2 ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}>
  //                                     {/[A-Z]/.test(password) && (
  //                                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  //                                         </svg>
  //                                     )}
  //                                 </span>
  //                                 Minimal 1 huruf kapital
  //                             </li>
  //                             <li className="flex items-center">
  //                                 <span className={`inline-block w-4 h-4 rounded-full mr-2 ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}>
  //                                     {/[0-9]/.test(password) && (
  //                                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  //                                         </svg>
  //                                     )}
  //                                 </span>
  //                                 Minimal 1 angka
  //                             </li>
  //                         </ul>
  //                     </div>

  //                     {/* Back to Login */}
  //                     <div className="text-center">
  //                         <Link
  //                             href="/login"
  //                             className="inline-flex items-center text-sm text-gray-600 hover:text-yellow-500 transition-colors duration-200"
  //                         >
  //                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  //                             </svg>
  //                             Kembali ke Login
  //                         </Link>
  //                     </div>
  //                 </form>

  //                 {/* Bottom border 3 warna */}
  //                 <div className="h-2 flex"
  //                     style={{
  //                         background: "linear-gradient(90deg, #e05a2b 0%, #f0a500 100%)",
  //                     }}>
  //                 </div>
  //             </div>

  //             {/* Footer */}
  //             <div className="mt-6 text-center">
  //                 <div className="flex justify-center space-x-2">
  //                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
  //                     <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
  //                     <div className="w-2 h-2 rounded-full bg-orange-500"></div>
  //                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
  //                     <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
  //                     <div className="w-2 h-2 rounded-full bg-orange-500"></div>
  //                 </div>
  //             </div>
  //         </div>
  //     </div>
  // );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
