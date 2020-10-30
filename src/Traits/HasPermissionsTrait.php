<?php

namespace Greatatoo\Webtpl\Traits;

use App\Models\User;

use Greatatoo\Webtpl\Models\Permission;
use Greatatoo\Webtpl\Models\Role;

use Illuminate\Support\Facades\DB;

trait HasPermissionsTrait
{

	public function givePermissionsTo(...$permissions)
	{
		$permissions = $this->getAllPermissions($permissions);

		if ($permissions === null) {
			return $this;
		}
		$this->permissions()->saveMany($permissions);
		return $this;
	}

	public function withdrawPermissionsTo(...$permissions)
	{
		$permissions = $this->getAllPermissions($permissions);
		$this->permissions()->detach($permissions);
		return $this;
	}

	public function refreshPermissions(...$permissions)
	{
		$this->permissions()->detach();
		return $this->givePermissionsTo($permissions);
	}

	public function hasPermissionTo($permission)
	{
		return $this->hasPermissionThroughRole($permission) || $this->hasPermission($permission);
	}

	public function hasPermissionThroughRole($permission)
	{
		foreach ($permission->roles as $role) {
			if ($this->roles->contains($role)) {
				return true;
			}
		}
		return false;
	}

	public function hasRole(...$roles)
	{
		foreach ($roles as $role) {
			if ($this->roles->contains('slug', $role)) {
				return true;
			}
		}
		return false;
	}

	public function roles()
	{
		return $this->belongsToMany(Role::class, 'users_roles');
	}

	public function permissions()
	{
		return $this->belongsToMany(Permission::class, 'users_permissions');
	}

	protected function hasPermission($permission)
	{
		return (bool) $this->permissions->where('slug', $permission->slug)->count();
	}

	protected function getAllPermissions(array $permissions)
	{
		return Permission::whereIn('slug', $permissions)->get();
	}

	/**
	 * Get user's detail info containing user record, roles and permissions.
	 */
	public static function getUserDetail($userId)
	{
		//get user record
		$user = User::find($userId);
		if (!$user) {
			return [];
		}
		//get user's roles
		$roles = HasPermissionsTrait::getUserRoles($userId);
		//get user's permissions
		$permissions = HasPermissionsTrait::getUserPermissions($userId);

		return [
			'user' => $user,
			'roles' => $roles,
			'permissions' => $permissions
		];
	}

	/**
	 * Get the roles the user belongs to.
	 * 
	 * @param $userId
	 * @return an array of roles
	 */
	public static function getUserRoles($userId)
	{
		return DB::table('users_roles')
			->leftJoin('roles', 'users_roles.role_id', '=', 'roles.id')
			->where('users_roles.user_id', $userId)
			->get([
				'users_roles.role_id',
				'roles.name as role_name',
				'roles.slug as role_slug',
			]);
	}

	/**
	 * Get the permissions the user has.
	 * 
	 * @param $userId
	 * @return an array of permissions
	 */
	public static function getUserPermissions($userId)
	{
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
		return $query1->union($query2)->get();
	}
}
