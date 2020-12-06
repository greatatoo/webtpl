<?php

namespace Greatatoo\Webtpl;

use Illuminate\Support\Facades\Route;

class Webtpl
{
    /**
     * Set essential routes
     */
    public static function routes()
    {
        Route::middleware(['web'])->group(function () {
            Route::get('/session', [\App\Http\Controllers\Essential\SessionController::class, 'query']);
            Route::post('/session', [\App\Http\Controllers\Essential\SessionController::class, 'create']);
            Route::post('/session/{column}', [\App\Http\Controllers\Essential\SessionController::class, 'create']);
            Route::delete('/session', [\App\Http\Controllers\Essential\SessionController::class, 'destroy']);
        });

        Route::middleware(['role:admin'])->group(function () {
            Route::apiResources([
                'user' => \App\Http\Controllers\Essential\UserController::class,
                'role' => \App\Http\Controllers\Essential\RoleController::class,
                'permission' => \App\Http\Controllers\Essential\PermissionController::class,
            ]);

            Route::post('user/search', [\App\Http\Controllers\Essential\UserController::class, 'search']);
            Route::get('user/{user}/detail', [\App\Http\Controllers\Essential\UserController::class, 'detail']);

            Route::get('role/{role}/permission', [\App\Http\Controllers\Essential\RolePermissionController::class, 'show']);
            Route::put('role/{role}/permission', [\App\Http\Controllers\Essential\RolePermissionController::class, 'update']);
            Route::delete('role/{role}/permission', [\App\Http\Controllers\Essential\RolePermissionController::class, 'destroy']);

            Route::get('user/{user}/permission', [\App\Http\Controllers\Essential\UserPermissionController::class, 'show']);
            Route::put('user/{user}/permission', [\App\Http\Controllers\Essential\UserPermissionController::class, 'update']);
            Route::delete('user/{user}/permission', [\App\Http\Controllers\Essential\UserPermissionController::class, 'destroy']);

            Route::get('user/{user}/role', [\App\Http\Controllers\Essential\UserRoleController::class, 'show']);
            Route::put('user/{user}/role', [\App\Http\Controllers\Essential\UserRoleController::class, 'update']);
            Route::delete('user/{user}/role', [\App\Http\Controllers\Essential\UserRoleController::class, 'destroy']);
        });
    }

    /**
     * Set ui routes
     */
    public static function uiRoutes()
    {
        //Guest
        Route::post('login', [\App\Http\Controllers\Auth\LoginController::class, 'doAuth'])->name('login');
        Route::get('login', [\App\Http\Controllers\Auth\LoginController::class, 'show'])->name('login.form');
        Route::post('logout', [\App\Http\Controllers\Essential\SessionController::class, 'destroy'])->name('logout');

        //Personal
        Route::middleware(['auth'])->group(function () {
            Route::get('home', [\App\Http\Controllers\HomeController::class, 'show'])->name('home');
        });

        //Dashboard
        Route::middleware(['auth', 'role:admin'])->group(function () {
            Route::get('dashboard/users', [\App\Http\Controllers\Dashboard\UsersController::class, 'show'])->name('dashboard.users');
            //jquery component backend - datatable.net
            Route::post('datatable', [\App\Http\Controllers\DataTable\DataTableController::class, 'store'])->name('datatable.post');
        });
    }

    public static function apiRoutes()
    {
    }
}
