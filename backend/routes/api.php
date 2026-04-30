<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\HelmetController;
use App\Http\Controllers\API\RideController;

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

    Route::post('/ride/start', [RideController::class, 'startRide']);
    Route::post('/ride/finish/{id}', [RideController::class, 'finishRide']);
    Route::get('/ride/history', [RideController::class, 'history']);
    Route::get('/ride/{id}', [RideController::class, 'show']);

});