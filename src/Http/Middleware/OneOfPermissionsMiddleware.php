<?php

namespace Greatatoo\Webtpl\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;

class OneOfPermissionsMiddleware
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
    public function handle($request, Closure $next, ...$permissions)
    {
        if (in_array($request->ip(), ['localhost', '127.0.0.1']))
            return $next($request);

        if(!$request->user())
            abort(403, "forbidden");

        foreach ($permissions as $permission) {
            if ($request->user()->can($permission)) {
                return $next($request);
            }
        }
        abort(401, "one of permissions [" . implode(",", $permissions) . "] required");
    }
}
