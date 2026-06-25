<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PasswordResetToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    public function forgot(Request $request)
    {
        $request->validate([
            'email'=>'required|email'
        ]);

        $user = User::where('email',$request->email)->first();

        if(!$user){
            return response()->json([
                'message'=>'Email tidak ditemukan'
            ],404);
        }

        $token = Str::random(60);
        PasswordResetToken::where('email',$request->email)->delete();
        PasswordResetToken::create([
            'email'=>$request->email,
            'token'=>$token
        ]);

        $link = env('FRONTEND_URL')."/reset-password?email=".$request->email."&token=".$token;
        Mail::raw(

            "Klik this link to reset password\n\n".$link,

            function($message) use($request){
                $message->to($request->email)
                    ->subject("Reset Password VELOFIT");
            }
        );

        return response()->json([
            'message'=>'Link reset password berhasil dikirim'
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email'=>'required|email',
            'token'=>'required',
            'password'=>'required|min:8'
        ]);

        $reset = PasswordResetToken::where('email',$request->email)
                    ->where('token',$request->token)
                    ->first();
        if(!$reset){
            return response()->json([
                'message'=>'Token tidak valid'
            ],400);
        }

        User::where('email',$request->email)->update([
            'password'=>Hash::make($request->password)
        ]);

        PasswordResetToken::where('email',$request->email)->delete();
        return response()->json([
            'message'=>'Password berhasil diubah'
        ]);
    }
}