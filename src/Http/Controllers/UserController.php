<?php

namespace Greatatoo\Webtpl\Http\Controllers;

use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class UserController extends Controller
{
	/**
	 * Display a listing of the users.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		//TODO add pagination
		return User::all();
		// abort(501, "Not Implemented");
	}

	/**
	 * Create a new user.
	 * 
	 * route: /user
	 * payload:
	 * {
	 *   "account":"",
	 *   "name":"",
	 *   "email":"",
	 *   "password":""
	 * }
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(Request $request)
	{
		$request->validate([
			'account' => 'required|string|unique:users',
			'name' => 'nullable|string',
			'email' => 'nullable|email|unique:users',
			'password' => 'required|string|min:6'
		]);

		try {
			$user = new User();
			$user->account = $request->account;
			$user->name = $request->name ? $request->name : ucfirst($request->account);
			$user->email = $request->email ? $request->email : null;
			$user->password = bcrypt($request->password);
			$user->api_token = uniqid($user->account);
			$user->save();
			return $user;
		} catch (QueryException $e) {
			return new JsonResponse(
				["reason" => $e->getMessage()],
				400
			);
		}
	}

	/**
	 * Display the info of a user.
	 *
	 * route: /user/{userId}
	 * payload: void
	 * 
	 * @param  int  $userId
	 * @return \Illuminate\Http\Response
	 */
	public function show($userId)
	{
		$user = User::find($userId);
		return $user ? $user : abort(404, "no such user '$userId'");
	}

	/**
	 * Display the detail of a user.
	 * 
	 * route: /user/{userId}/detail
	 * payload:
	 * {
	 *   "user":{},
	 *   "roles":[],
	 *   "permissions":[]
	 * }
	 * 
	 * the array of permissions is an aggregation of permissions belonging to the user.
	 * 
	 * @param  int  $userId
	 * @return \Illuminate\Http\Response
	 */
	public function detail($userId)
	{
		$user = User::find($userId);

		if (!$user)
			abort(404, "no such user '$userId'");

		//query user's roles
		$roles = DB::table('users_roles')
			->leftJoin('roles', 'users_roles.role_id', '=', 'roles.id')
			->where('users_roles.user_id', $userId)
			->get([
				'users_roles.role_id',
				'roles.name as role_name',
				'roles.slug as role_slug',
			]);

		//query the permissions of the user
		$query1 = DB::table('users_permissions')
			->select(
				'permissions.id as permission_id',
				'permissions.name as permission_name',
				'permissions.slug as permission_slug'
			)
			->LeftJoin('permissions', 'users_permissions.permission_id', '=', 'permissions.id')
			->where([
				['user_id', $userId],
				['permission_id', '!=', null]
			]);

		//query the permissions of the roles of the user
		$query2 = DB::table('users_roles')
			->select(
				'roles_permissions.permission_id',
				'permissions.name as permission_name',
				'permissions.slug as permission_slug'
			)
			->leftJoin('roles_permissions', 'users_roles.role_id', '=', 'roles_permissions.role_id')
			->LeftJoin('permissions', 'roles_permissions.permission_id', '=', 'permissions.id')
			->where([
				['users_roles.user_id', '=', $userId],
				['roles_permissions.permission_id', '!=', null]
			]);

		//union both queries and join permissions
		$permissions = $query1->union($query2)->get();

		return [
			'user' => $user,
			'roles' => $roles,
			'permissions' => $permissions
		];
	}

	/**
	 * Update the info for a user.
	 * 
	 * route: /user/{userId}
	 * payload:
	 * {
	 *   "name":"",
	 *   "email":"",
	 *   "password":""
	 * }
	 * 
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $userId
	 * @return \Illuminate\Http\Response
	 */
	public function update(Request $request, $userId)
	{
		$request->validate([
			'name' => 'nullable|string',
			'email' => 'nullable|email',
			'password' => 'nullable|string|min:6',
		]);

		try {
			$user = User::find($userId);

			//check if user exists
			if (!$user)
				abort(400, "no such user '$userId'");

			//update user info
			if ($request->name)
				$user->name = $request->name;
			if ($request->email && strcmp($request->email, $user->email) !== 0) {
				$user->email = $request->email;
				$user->email_verified_at = null;
			}
			if ($request->password)
				$user->password = bcrypt($request->password);

			//update api_token
			$user->api_token = uniqid($user->account);

			$user->save();

			return $user;
		} catch (QueryException $e) {
			return new JsonResponse(
				["reason" => $e->getMessage()],
				400
			);
		}
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($userId)
	{
		try {
			$user = User::find($userId);
			if ($user)
				$user->delete();
		} catch (QueryException $e) {
			return new JsonResponse(
				["reason" => $e->getMessage()],
				400
			);
		}
	}

	/**
	 * Search users by keyword from specified columns.
	 * The query conditions will be processed with OR operation.
	 * 
	 * route: /user/search
	 * payload:
	 * {
	 *   "keyword":"",
	 *   "columns":[]
	 * }
	 * 
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function search(Request $request)
	{
		$request->validate([
			'keyword' => 'required|string',
			'columns' => 'required|array'
		]);

		try {
			$query = DB::table('users');

			$keyword = $request->keyword;
			foreach ($request->columns as $column) {
				if (!$column)
					continue;
				$query->orWhere($column, 'like', '%' . $keyword . '%');
			}
			return $query->get();
		} catch (QueryException $e) {
			return new JsonResponse(
				["reason" => $e->getMessage()],
				400
			);
		}
	}
}
