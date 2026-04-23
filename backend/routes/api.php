<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;

//------------------------------------------------------------------
// PUBLIC ROUTES (tidak perlu token)
//------------------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/google', [AuthController::class, 'redirectToGoogle'])
        ->middleware('throttle:google-oauth');
    
    Route::get('/google/callback', [AuthController::class, 'handleGoogleCallback'])
        ->middleware('throttle:google-oauth');

});




//------------------------------------------------------------------
// PROTECTED ROUTES (wajib pakai bearer token)
//------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::prefix('user')->middleware('role.user')->group(function () {
        Route::get('/dashboard', [UserController::class, 'dashboard']);
        Route::get('/profile', [UserController::class, 'profile']);
    });

    Route::prefix('admin')->middleware('role.admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [UserController::class, 'index']);
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);
});