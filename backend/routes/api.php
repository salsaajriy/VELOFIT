<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\HelmetController;
use App\Http\Controllers\API\RideController;
use App\Http\Controllers\API\IoTController;
use App\Http\Controllers\API\GoalController;

//------------------------------------------------------------------
// PUBLIC ROUTES (tidak perlu token)
//------------------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');;

    Route::get('/google', [AuthController::class, 'redirectToGoogle'])
        ->middleware('throttle:google-oauth');
    
    Route::get('/google/callback', [AuthController::class, 'handleGoogleCallback'])
        ->middleware('throttle:google-oauth');

});

Route::post('/helmets/data', [HelmetController::class, 'receiveData']);
Route::post('/iot/location', [IoTController::class, 'receiveData']);


//------------------------------------------------------------------
// PROTECTED ROUTES (wajib pakai bearer token)
//----------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    
    Route::prefix('user')->middleware('role.user')->group(function () {
        Route::get('/dashboard', [UserController::class, 'dashboard']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::post('/profile', [ProfileController::class, 'update']);
    });

    Route::prefix('admin')->middleware('role.admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [UserController::class, 'index']);
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('helmets')->group(function () {
        Route::get('/',                 [HelmetController::class, 'index']);
        Route::post('/',                [HelmetController::class, 'store']);
        Route::put('/{id}',             [HelmetController::class, 'update']);
        Route::patch('/{id}/activate',  [HelmetController::class, 'activate']);
        Route::delete('/{id}',          [HelmetController::class, 'destroy']);
    });

    Route::prefix('rides')->group(function () {
        Route::post('/start',    [RideController::class, 'start']);
        Route::post('/location', [RideController::class, 'location']);
        Route::get('/active',    [RideController::class, 'active']);
        Route::get('/history',   [RideController::class, 'history']);
        Route::get('/stats',     [RideController::class, 'stats']);
        Route::delete('/{ride}',    [RideController::class, 'destroy']);
    
        Route::post('/{ride}/pause',  [RideController::class, 'pause']);
        Route::post('/{ride}/resume', [RideController::class, 'resume']);
        Route::post('/{ride}/finish', [RideController::class, 'finish']);
        Route::get('/{ride}',         [RideController::class, 'show']);
    });

    Route::get('/goals/progress', [GoalController::class, 'progress']);
    
    Route::apiResource('goals', GoalController::class);
});