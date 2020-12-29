<?php

namespace Greatatoo\Webtpl\Traits;

use Greatatoo\Webtpl\Models\RolePermissionModel;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait RolePermissionResourceTrait
{
    /**
     * Display all permissions the role owns.
     *
     * route: /role/{roleId}/permission
     * payload: void
     * 
     * @param $roleId
     * @return \Illuminate\Http\Response
     */
    public function show($roleId)
    {
        return DB::table('roles_permissions')
            ->leftJoin('permissions', 'roles_permissions.permission_id', '=', 'permissions.id')
            ->where('roles_permissions.role_id', $roleId)
            ->get([
                'roles_permissions.role_id',
                'roles_permissions.permission_id',
                'permissions.name as permission_name',
                'permissions.slug as permission_slug',
                'permissions.desc as permission_desc',
            ]);
    }

    /**
     * Set a list of permissions to a role.
     * Notice: it'll clear all permissions before assigning.
     * 
     * route: /role/{roleId}/permission
     * payload: {"permissions":[]}
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $roleId)
    {
        $request->validate([
            'permissions' => 'required|array',
        ]);

        DB::beginTransaction();

        //clear all permissions for the role.
        $this->destroy($roleId);

        //set permissions at once.
        foreach (array_unique($request->permissions) as $permissionId) {
            try {
                $model = new RolePermissionModel();
                $model->role_id = $roleId;
                $model->permission_id = $permissionId;
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
     * Remove the specified permissions from a role.
     * 
     * route: /role/{roleId}/permission
     * payload: {"permissions":[]}
     *
     * @param  int  $roleId
     * @return \Illuminate\Http\Response
     */
    public function destroy($roleId)
    {
        return DB::table('roles_permissions')
            ->where('role_id', $roleId)
            ->delete();
    }
}
