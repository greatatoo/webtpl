<?php

namespace Greatatoo\Webtpl\Traits;

use App\Models\User;
use Greatatoo\Webtpl\Models\Role;
use Greatatoo\Webtpl\Models\UserRoleModel;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

trait RoleResourceTrait
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Role::all();
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
        ]);

        try {
            $role = new Role();
            $role->name = $request->name;
            $role->slug = $request->slug;
            $role->save();
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
        return Role::find($id);
    }

    /**
     * Get users of the role
     */
    public function getUsers($roleId)
    {
        return DB::table('users_roles')
            ->leftJoin('users', 'users_roles.user_id', '=', 'users.id')
            ->where('users_roles.role_id', $roleId)
            ->get([
                'users_roles.role_id as role_id',
                'users.id as user_id',
                'users.account as user_account',
                'users.name as user_name',
            ]);
    }

    public function addUserByAccount($roleId, $account)
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
        return $this->addUser($roleId, $userId);
    }

    /**
     * Add a user to the role
     */
    public function addUser($roleId, $userId)
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                return new JsonResponse(
                    ["reason" => "No such userId. $userId"],
                    404
                );
            }

            $model = new UserRoleModel();
            $model->user_id = $userId;
            $model->role_id = $roleId;
            $model->save();
        } catch (\Exception $e) {
            // Log::debug($e->getMessage());
        }
    }

    /**
     * Remove a user from the role
     */
    public function removeUser($roleId, $userId)
    {
        //Skip admin user-group
        if ($roleId == 1 && $userId == 1)
            return;

        try {
            $users = DB::table('users_roles')
                ->where([
                    ['role_id', '=', $roleId],
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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string'
        ]);

        try {
            $role = Role::find($id);
            $role->name = $request->name;
            $role->save();
            return $role;
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
        try {
            $role = Role::find($id);
            if ($role)
                $role->delete();
        } catch (QueryException $e) {
            return new JsonResponse(
                ["reason" => $e->getMessage()],
                400
            );
        }
    }
}
