<?php

namespace Greatatoo\Webtpl\Http\Controllers;

use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;

class UserController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		return User::all();
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
			$user->save();
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
		//
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
		//
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($id)
	{
		//
	}
}
