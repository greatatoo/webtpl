<?php

namespace Greatatoo\Webtpl\Traits;

use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;

use Greatatoo\Webtpl\Models\Role;
use Greatatoo\Webtpl\Models\Permission;
use Greatatoo\Webtpl\Models\UserRoleModel;
use Greatatoo\Webtpl\Models\UserPermissionModel;

trait UserResourceTrait
{
    use HasPermissionsTrait;

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
        return HasPermissionsTrait::getUserDetail($userId);
    }

    /**
     * Update the info for a user.
     * 
     * route: /user/{userId}
     * payload:
     * {
     *   "name":"",
     *   "email":"",
     *   "password":"",
     *   "api_token": "",
     *   "active": 0
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
            'api_token' => 'nullable|string',
            'active' => 'nullable|numeric',
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
            if ($request->api_token)
                $user->api_token = $request->api_token;
            if ($request->active !== null)
                $user->active = $request->active;
            if ($userId == 1)
                $user->active = 1;

            $user->save();

            return response()->json($user, 200, [], JSON_NUMERIC_CHECK);
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
        if ($userId == 1)
            return new JsonResponse(
                ["reason" => 'admin can not be deleted'],
                406
            );
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

    /**
     * Add a role to the user
     */
    public function addRole($userId, $roleId)
    {
        try {
            $perm = Role::find($roleId);
            if (!$perm) {
                return new JsonResponse(
                    ["reason" => "No such permissionId. $perm"],
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
     * Remove a role from the user
     */
    public function removeRole($userId, $roleId)
    {
        //Skip admin user-role
        if ($userId == 1 && $roleId == 1)
            return;

        try {
            DB::table('users_roles')
                ->where([
                    ['user_id', '=', $userId],
                    ['role_id', '=', $roleId]
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
     * Add a permission to the user
     */
    public function addPermission($userId, $permId)
    {
        try {
            $perm = Permission::find($permId);
            if (!$perm) {
                return new JsonResponse(
                    ["reason" => "No such permissionId. $perm"],
                    404
                );
            }

            $model = new UserPermissionModel();
            $model->user_id = $userId;
            $model->permission_id = $permId;
            $model->save();
        } catch (\Exception $e) {
            // Log::debug($e->getMessage());
        }
    }

    /**
     * Remove a permission from the user
     */
    public function removePermission($userId, $permId)
    {
        //Skip admin user-permission
        if ($userId == 1 && $permId == 1)
            return;

        try {
            DB::table('users_permissions')
                ->where([
                    ['user_id', '=', $userId],
                    ['permission_id', '=', $permId]
                ])
                ->delete();
        } catch (QueryException $e) {
            return new JsonResponse(
                ["reason" => $e->getMessage()],
                400
            );
        }
    }
}
