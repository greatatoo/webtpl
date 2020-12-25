<?php

namespace Greatatoo\Webtpl\Providers;

use Greatatoo\Webtpl\Models\Permission;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;

class PermissionsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        try {
            Permission::get()->map(function ($permission) {
                Gate::define($permission->slug, function ($user) use ($permission) {
                    return $user->hasPermissionTo($permission);
                });
            });
        } catch (\Exception $e) {
            report($e);
            return false;
        }

        //Blade Direvtive @role
        Blade::if('role', function (...$roles) {
            if (!auth()->user())
                return false;
            foreach ($roles as $role) {
                if (auth()->user()->hasRole($role)) // hasRole comes from HasPermissionsTrait.php
                    return true;
            }
            return false;
        });

        //Blade Direvtive @permission
        Blade::if('permission', function (...$permissions) {
            if (!auth()->user())
                return false;
            foreach ($permissions as $permission) {
                //Read https://www.codechief.org/article/laravel-6-authorization-using-gates
                if (auth()->user()->can($permission))
                    return true;
            }
            return false;
        });
    }
}
