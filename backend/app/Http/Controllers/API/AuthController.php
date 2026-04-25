<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Exception;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => 'hashed',
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Registrasi berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'status' => false,
                'message' => 'Login gagal. Email dan Password salah.'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;
        $dashboard = $user->role === 'admin' ? '/admin/dashboard' : '/dashboard';

        return response()->json([
            'status'       => true,
            'message'      => 'Login berhasil',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'role'         => $user->role,
            'redirect'     => $dashboard,
            'user'         => $user
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    // ════════════════════════════════════════════════════════════
    //  METHOD: Google OAuth
    // ════════════════════════════════════════════════════════════

    public function redirectToGoogle() {

        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'status'       => true,
            'redirect_url' => $url,
        ]);
    }

    public function handleGoogleCallback(Request $request) {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $user = User::where('google_id', $googleUser->getId())->first()
                ?? User::where('email', $googleUser->getEmail())->first();
    
                if ($user) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar'    => $googleUser->getAvatar(),
                    ]);
                } else {
                    $user = User::create([
                        'name'      => Str::limit(strip_tags($googleUser->getName()), 255),
                        'email'     => filter_var($googleUser->getEmail(), FILTER_VALIDATE_EMAIL),
                        'google_id' => $googleUser->getId(),
                        'avatar'    => filter_var($googleUser->getAvatar(), FILTER_VALIDATE_URL)
                                    ? $googleUser->getAvatar() : null,
                        'role'      => 'user',
                        'password' => Hash::make(Str::random(16)),
                    ]);

                }
    
                $user->tokens()->where('name', 'google_auth_token')->delete();
    
                $token = $user->createToken('google_auth_token')->plainTextToken;
    
                $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
    
                $redirectUrl = "{$frontendUrl}/auth/callback?" . http_build_query([
                    'token' => $token,
                    'type' => 'google'
                ]);

                return redirect()->away($redirectUrl);
    
            } catch (Exception $e) {
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                return redirect()->away("{$frontendUrl}/auth/login?error=oauth_failed");
            }
        }
    
} 
