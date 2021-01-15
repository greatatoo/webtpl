<?php

namespace Greatatoo\Webtpl\Http\Middleware;

use Closure;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
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
    public function handle($request, Closure $next, $role, $permission = null)
    {
        if (in_array($request->ip(), ['localhost', '127.0.0.1']))
            return $next($request);
            
        if (!$request->user()->hasRole($role)) {
            Log::debug("user has no role '$role'");
            abort(401, "role '$role' required");
        }

        if ($permission !== null && !$request->user()->can($permission)) {
            Log::debug("user has no permission '$permission'");
            abort(403, "permission '$permission' required");
        }

        return $next($request);
    }
}
