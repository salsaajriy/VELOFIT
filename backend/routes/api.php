<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\HelmetController;
use App\Http\Controllers\API\RideController;
use App\Http\Controllers\API\IoTController;
use App\Http\Controllers\API\TargetController;
use App\Http\Controllers\API\ForgotPasswordController;

//------------------------------------------------------------------
// PUBLIC ROUTES (tidak perlu token)
//------------------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login'])
        ->middleware('throttle:5,1');;

    Route::get('/google', [AuthController::class, 'redirectToGoogle'])
        ->middleware('throttle:google-oauth');
    Route::get('/google/callback', [AuthController::class, 'handleGoogleCallback'])
        ->middleware('throttle:google-oauth');
});

Route::post('/helmets/data', [HelmetController::class, 'receiveData']);
Route::post('/iot/location', [IoTController::class, 'receiveData']);

Route::post('/forgot-password',[ForgotPasswordController::class,'forgot']);
Route::post('/reset-password', [ForgotPasswordController::class,'reset']);

//------------------------------------------------------------------
// PROTECTED ROUTES (wajib pakai bearer token)
//----------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('user/profile',  [ProfileController::class, 'show']);
    Route::post('user/profile', [ProfileController::class, 'update']);
    
    Route::prefix('user')->middleware('role.user')->group(function () {
        Route::get('/dashboard', [UserController::class, 'dashboard']);
    });

    Route::prefix('admin')->middleware('role.admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users',     [UserController::class, 'index']);
        Route::get('/helmets',   [HelmetController::class, 'adminIndex']);
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('helmets')->group(function () {
        Route::get('/',                    [HelmetController::class, 'index']);
        Route::post('/',                   [HelmetController::class, 'store']);
        Route::put('/{helmet}',            [HelmetController::class, 'update']);
        Route::patch('/{helmet}/activate', [HelmetController::class, 'activate']);
        Route::delete('/{helmet}',         [HelmetController::class, 'destroy']);
        Route::post('/validate-connection',[HelmetController::class, 'validateConnection']);
    });

    Route::prefix('rides')->group(function () {
        Route::post('/start',                          [RideController::class, 'start']);
        Route::post('/{ride}/sensor-data',             [RideController::class, 'storeSensorData']);
        Route::get('/active',                          [RideController::class, 'active']);
        Route::post('/{ride}/finish',                  [RideController::class, 'finish']);
        Route::get('/history',                         [RideController::class, 'history']);
        Route::get('/{ride}',                          [RideController::class, 'show']);

    });

    Route::prefix('targets')->group(function () {
        Route::get('/active',           [TargetController::class, 'active']);
        Route::post('/',                [TargetController::class, 'store']);
        Route::get('/history',          [TargetController::class, 'history']);
        Route::get('/daily-breakdown',  [TargetController::class, 'dailyBreakdown']);
        Route::get('/weekly-breakdown', [TargetController::class, 'weeklyBreakdown']);
        Route::get('/stats',            [TargetController::class, 'stats']);
    });


});