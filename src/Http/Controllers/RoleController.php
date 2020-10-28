<?php

namespace Greatatoo\Webtpl\Http\Controllers;

use Greatatoo\Webtpl\Models\Role;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;

class RoleController extends Controller
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
