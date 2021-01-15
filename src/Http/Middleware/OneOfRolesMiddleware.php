<?php

namespace Greatatoo\Webtpl\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;

class OneOfRolesMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  \Greatatoo\Webtpl\Models\Role $role
     * @param  \Greatatoo\Webtpl\Models\Permission $permission
     * @return mixed
     */
    public function handle($request, Closure $next, ...$roles)
    {
        if (in_array($request->ip(), ['localhost', '127.0.0.1']))
            return $next($request);

        foreach ($roles as $role) {
            if ($request->user()->hasRole($role)) {
                return $next($request);
            }
        }
        abort(401, "one of roles [" . implode(",", $roles) . "] required");
    }
}
