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
        Route::get('/locale/locale.js', [\App\Http\Controllers\Essential\LocaleController::class, 'getJs'])->name('locale.js');

        Route::prefix('rest')->group(function () {
            Route::middleware(['web'])->group(function () {
                Route::get('/session', [\App\Http\Controllers\Essential\SessionController::class, 'query']);
                Route::post('/session', [\App\Http\Controllers\Essential\SessionController::class, 'create']);
                Route::post('/session/{column}', [\App\Http\Controllers\Essential\SessionController::class, 'create']);
                Route::delete('/session', [\App\Http\Controllers\Essential\SessionController::class, 'destroy']);
                Route::put('/locale/{locale}', [\App\Http\Controllers\Essential\LocaleController::class, 'update'])->name('set.locale');
                Route::get('/locale/{locale}', [\App\Http\Controllers\Essential\LocaleController::class, 'show'])->name('get.locale');
            });

            Route::middleware(['role:admin'])->group(function () {
                Route::apiResources([
                    'user' => \App\Http\Controllers\Essential\UserController::class,
                    'role' => \App\Http\Controllers\Essential\RoleController::class,
                    'permission' => \App\Http\Controllers\Essential\PermissionController::class,
                ]);
                Route::post('user/{user}/role/{role}', [\App\Http\Controllers\Essential\UserController::class, 'addRole']);
                Route::delete('user/{user}/role/{role}', [\App\Http\Controllers\Essential\UserController::class, 'removeRole']);

                Route::post('user/{user}/permission/{permission}', [\App\Http\Controllers\Essential\UserController::class, 'addPermission']);
                Route::delete('user/{user}/permission/{permission}', [\App\Http\Controllers\Essential\UserController::class, 'removePermission']);
                
                Route::get('role/{role}/user', [\App\Http\Controllers\Essential\RoleController::class, 'getUsers']);
                Route::post('role/{role}/user/{user}', [\App\Http\Controllers\Essential\RoleController::class, 'addUser']);
                Route::post('role/{role}/account/{account}', [\App\Http\Controllers\Essential\RoleController::class, 'addUserByAccount']);               
                Route::delete('role/{role}/user/{user}', [\App\Http\Controllers\Essential\RoleController::class, 'removeUser']);

                Route::post('role/{role}/permission/{permission}', [\App\Http\Controllers\Essential\RoleController::class, 'addPermission']);
                Route::post('role/{role}/slug/{slug}', [\App\Http\Controllers\Essential\RoleController::class, 'addPermissionBySlug']);               
                Route::delete('role/{role}/permission/{permission}', [\App\Http\Controllers\Essential\RoleController::class, 'removePermission']);

                Route::get('permission/{permission}/user', [\App\Http\Controllers\Essential\PermissionController::class, 'getUsers']);
                Route::post('permission/{permission}/user/{user}', [\App\Http\Controllers\Essential\PermissionController::class, 'addUser']);
                Route::post('permission/{permission}/account/{account}', [\App\Http\Controllers\Essential\PermissionController::class, 'addUserByAccount']);               
                Route::delete('permission/{permission}/user/{user}', [\App\Http\Controllers\Essential\PermissionController::class, 'removeUser']);

                Route::get('permission/{permission}/role', [\App\Http\Controllers\Essential\PermissionController::class, 'getRoles']);
                Route::post('permission/{permission}/role/{role}', [\App\Http\Controllers\Essential\PermissionController::class, 'addRole']);
                Route::post('permission/{permission}/slug/{slug}', [\App\Http\Controllers\Essential\PermissionController::class, 'addRoleBySlug']);               
                Route::delete('permission/{permission}/role/{role}', [\App\Http\Controllers\Essential\PermissionController::class, 'removeRole']);

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

                //jquery component backend - datatable.net
                Route::post('datatable', [\App\Http\Controllers\DataTable\DataTableController::class, 'store'])->name('datatable.post');
            });
        });
    }

    /**
     * Set ui routes
     */
    public static function uiRoutes()
    {        
            //Guest
            Route::post('login', [\App\Http\Controllers\Auth\LoginController::class, 'doAuth'])->name('login');
            Route::post('logout', [\App\Http\Controllers\Essential\SessionController::class, 'destroy'])->name('logout');

            Route::middleware(['locale'])->group(function () {
                Route::get('login', [\App\Http\Controllers\Auth\LoginController::class, 'show'])->name('login.form');
                Route::get('/', function () {
                    return view('homepage');
                });
            });          

            //Personal
            Route::middleware(['auth','locale'])->group(function () {
                Route::get('home', [\App\Http\Controllers\HomeController::class, 'show'])->name('home');
            });

            //Dashboard
            Route::middleware(['auth', 'locale', 'role:admin'])->group(function () {
                Route::get('dashboard/users', [\App\Http\Controllers\Dashboard\UsersController::class, 'show'])->name('dashboard.users');
                Route::get('dashboard/users/{user}', [\App\Http\Controllers\Dashboard\UserDetailController::class, 'show'])->name('dashboard.user.detail');
                Route::get('dashboard/roles', [\App\Http\Controllers\Dashboard\RolesController::class, 'show'])->name('dashboard.roles');
                Route::get('dashboard/roles/{role}', [\App\Http\Controllers\Dashboard\RoleDetailController::class, 'show'])->name('dashboard.role.detail');
                Route::get('dashboard/permissions', [\App\Http\Controllers\Dashboard\PermissionsController::class, 'show'])->name('dashboard.permissions');
                Route::get('dashboard/permissions/{permission}', [\App\Http\Controllers\Dashboard\PermissionDetailController::class, 'show'])->name('dashboard.permission.detail');
                Route::get('dashboard/test/ebus', [\App\Http\Controllers\Dashboard\TestEbusController::class, 'show'])->name('dashboard.test.ebus');
            });
    }

    public static function apiRoutes()
    {
    }
}
