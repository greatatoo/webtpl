<?php

namespace Greatatoo\Webtpl\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
		if (!$request->user()->hasRole($role)) {
			Log::debug('user has no role');
			abort(401);
		}

		if ($permission !== null && !$request->user()->can($permission)) {
			Log::debug('user has no permission');
			abort(403);
		}

		return $next($request);
	}
}
