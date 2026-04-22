<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController as APIAuthController;
use App\Http\Controllers\API\UserController;

//------------------------------------------------------------------
// PUBLIC ROUTES (tidak perlu token)
//------------------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
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

    // Admin routes
    Route::prefix('admin')->middleware('role.admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [UserController::class, 'index']);
    });

    // Logout route
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});