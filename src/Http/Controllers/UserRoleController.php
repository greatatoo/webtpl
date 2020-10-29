<?php

namespace Greatatoo\Webtpl\Http\Controllers;

use Greatatoo\Webtpl\Models\UserRoleModel;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserRoleController extends Controller
{

	/**
	 * Display all roles the user owns.
	 *
	 * route: /user/{userId}/role
	 * payload: void
	 * 
	 * @param $userId
	 * @return \Illuminate\Http\Response
	 */
	public function show($userId)
	{
		return DB::table('users_roles')
			->leftJoin('roles', 'users_roles.role_id', '=', 'roles.id')
			->where('users_roles.user_id', $userId)
			->get([
				'users_roles.user_id',
				'users_roles.role_id',
				'roles.name as role_name',
				'roles.slug as role_slug',
			]);
	}

	/**
	 * Set a list of roles to a user.
	 * Notice: it'll clear all roles before assigning.
	 * 
	 * route: /user/{userId}/role
	 * payload: {"roles":[]}
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function update(Request $request, $userId)
	{
		$request->validate([
			'roles' => 'required|array',
		]);

		DB::beginTransaction();

		//clear all roles for the user.
		$this->destroy($userId);

		//set roles at once.
		foreach (array_unique($request->roles) as $roleId) {
			try {
				$model = new UserRoleModel();
				$model->user_id = $userId;
				$model->role_id = $roleId;
				$model->save();
			} catch (\Exception $e) {
				DB::rollBack();
				return new JsonResponse([
					'reason' => $e->getMessage()
				], 400);
			}
		}
		DB::commit();
	}

	/**
	 * Remove the specified roles from a user.
	 * 
	 * route: /user/{userId}/role
	 * payload: {"roles":[]}
	 *
	 * @param  int  $userId
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($userId)
	{
		return DB::table('users_roles')
			->where('user_id', $userId)
			->delete();
	}
}
