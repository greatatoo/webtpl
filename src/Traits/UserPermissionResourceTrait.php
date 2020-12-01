<?php

namespace Greatatoo\Webtpl\Traits;

use Greatatoo\Webtpl\Models\UserPermissionModel;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait UserPermissionResourceTrait
{
    /**
     * Display all permissions the user owns.
     *
     * route: /user/{userId}/permission
     * payload: void
     * 
     * @param $userId
     * @return \Illuminate\Http\Response
     */
    public function show($userId)
    {
        return DB::table('users_permissions')
            ->leftJoin('permissions', 'users_permissions.permission_id', '=', 'permissions.id')
            ->where('users_permissions.user_id', $userId)
            ->get([
                'users_permissions.user_id',
                'users_permissions.permission_id',
                'permissions.name as permission_name',
                'permissions.slug as permission_slug',
            ]);
    }

    /**
     * Set a list of permissions to a user.
     * Notice: it'll clear all permissions before assigning.
     * 
     * route: /user/{userId}/permission
     * payload: {"permissions":[]}
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $userId)
    {
        $request->validate([
            'permissions' => 'required|array',
        ]);

        DB::beginTransaction();

        //clear all permissions for the user.
        $this->destroy($userId);

        //set permissions at once.
        foreach (array_unique($request->permissions) as $permissionId) {
            try {
                $model = new UserPermissionModel();
                $model->user_id = $userId;
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
     * Remove the specified permissions from a user.
     * 
     * route: /user/{userId}/permission
     * payload: {"permissions":[]}
     *
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function destroy($userId)
    {
        return DB::table('users_permissions')
            ->where('user_id', $userId)
            ->delete();
    }
}
