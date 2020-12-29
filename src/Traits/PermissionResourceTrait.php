<?php

namespace Greatatoo\Webtpl\Traits;

use App\Models\User;

use Greatatoo\Webtpl\Models\Role;
use Greatatoo\Webtpl\Models\Permission;
use Greatatoo\Webtpl\Models\UserPermissionModel;
use Greatatoo\Webtpl\Models\RolePermissionModel;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait PermissionResourceTrait
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Permission::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string',
            'desc' => 'nullable|string',
        ]);

        try {
            $permission = new Permission();
            $permission->name = $request->name;
            $permission->slug = $request->slug;
            $permission->desc = $request->desc;
            $permission->save();
        } catch (QueryException $e) {
            return new JsonResponse(
                ["reason" => $e->getMessage()],
                400
            );
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Permission::find($id);
    }

    /**
     * Get users of the role
     */
    public function getUsers($permissionId)
    {
        return DB::table('users_permissions')
            ->leftJoin('users', 'users_permissions.user_id', '=', 'users.id')
            ->where('users_permissions.permission_id', $permissionId)
            ->get([
                'users_permissions.permission_id as permission_id',
                'users.id as user_id',
                'users.account as user_account',
                'users.name as user_name',
            ]);
    }

    public function addUserByAccount($permissionId, $account)
    {
        $users = DB::table('users')
            ->where('account', $account)
            ->get();

        if (!sizeof($users)) {
            return new JsonResponse(
                ["reason" => "No such account. $account"],
                404
            );
        }

        $userId = $users[0]->id;
        return $this->addUser($permissionId, $userId);
    }

    /**
     * Add a user to the permission
     */
    public function addUser($permissionId, $userId)
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                return new JsonResponse(
                    ["reason" => "No such userId. $userId"],
                    404
                );
            }

            $model = new UserPermissionModel();
            $model->user_id = $userId;
            $model->permission_id = $permissionId;
            $model->save();
        } catch (\Exception $e) {
            // Log::debug($e->getMessage());
        }
    }

    /**
     * Remove a user from the permission relation
     */
    public function removeUser($permissionId, $userId)
    {
        //Skip admin user-permission
        if ($permissionId == 1 && $userId == 1)
            return;

        try {
            DB::table('users_permissions')
                ->where([
                    ['permission_id', '=', $permissionId],
                    ['user_id', '=', $userId]
                ])
                ->delete();
        } catch (QueryException $e) {
            return new JsonResponse(
                ["reason" => $e->getMessage()],
                400
            );
        }
    }

    /**
     * Get users of the role
     */
    public function getRoles($permissionId)
    {
        return DB::table('roles_permissions')
            ->leftJoin('roles', 'roles_permissions.role_id', '=', 'roles.id')
            ->where('roles_permissions.permission_id', $permissionId)
            ->get([
                'roles_permissions.permission_id as permission_id',
                'roles.id as role_id',
                'roles.name as role_name',
                'roles.slug as role_slug',
                'roles.desc as role_desc',
            ]);
    }

    /**
     * Add role by a given slug.
     */
    public function addRoleBySlug($permissionId, $slug)
    {
        $roles = DB::table('roles')
            ->where('slug', $slug)
            ->get();

        if (!sizeof($roles)) {
            return new JsonResponse(
                ["reason" => "No such role. $slug"],
                404
            );
        }

        $roleId = $roles[0]->id;
        return $this->addRole($permissionId, $roleId);
    }

    /**
     * Add a role to the permission
     */
    public function addRole($permissionId, $roleId)
    {
        try {
            $role = Role::find($roleId);
            if (!$role) {
                return new JsonResponse(
                    ["reason" => "No such roleId. $roleId"],
                    404
                );
            }

            $model = new RolePermissionModel();
            $model->role_id = $roleId;
            $model->permission_id = $permissionId;
            $model->save();
        } catch (\Exception $e) {
            // Log::debug($e->getMessage());
        }
    }

    /**
     * Remove a permission from the role
     */
    public function removeRole($permissionId, $roleId)
    {
        //Skip admin role-permission
        if ($roleId == 1 && $permissionId == 1)
            return;

        try {
            DB::table('roles_permissions')
                ->where([
                    ['role_id', '=', $roleId],
                    ['permission_id', '=', $permissionId]
                ])
                ->delete();
        } catch (QueryException $e) {
            return new JsonResponse(
                ["reason" => $e->getMessage()],
                400
            );
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string',
            'desc' => 'nullable|string',
        ]);

        try {
            $permission = Permission::find($id);
            $permission->name = $request->name;
            if (!is_null($request->desc))
                $permission->desc = $request->desc;
            $permission->save();
            return $permission;
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
    public function destroy($id)
    {
        if ($id == 1)
            return new JsonResponse(
                ["reason" => 'admin permission can not be deleted'],
                406
            );
        try {
            $permission = Permission::find($id);
            if ($permission)
                $permission->delete();
        } catch (QueryException $e) {
            return new JsonResponse(
                ["reason" => $e->getMessage()],
                400
            );
        }
    }
}
