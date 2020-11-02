<?php

namespace Greatatoo\Webtpl\Traits;

use Greatatoo\Webtpl\Models\Permission;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;

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
		]);

		try {
			$permission = new Permission();
			$permission->name = $request->name;
			$permission->slug = $request->slug;
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
			$permission = Permission::find($id);
			$permission->name = $request->name;
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
