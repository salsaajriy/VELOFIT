<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// ── Public routes (tidak butuh login) ────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Protected routes (butuh token Bearer) ────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',    [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});