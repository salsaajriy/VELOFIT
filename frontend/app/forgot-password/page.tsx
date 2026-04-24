// app/forgot-password/page.js
import Link from 'next/link';
import { FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';
import { HiShieldCheck } from 'react-icons/hi';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            VELOFIT
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <div className="text-left mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we will send you a link to reset your password.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-linear-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Send Reset Link
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <HiShieldCheck className="h-4 w-4 text-gray-500" />
            <span>Secure Connection</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiLock className="h-4 w-4 text-gray-500" />
            <span>Data Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}