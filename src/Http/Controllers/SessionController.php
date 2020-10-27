<?php

namespace Greatatoo\Webtpl\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Redirect;

class SessionController extends Controller
{
	//the users table colume regarded as the username.
	private $username = 'email';

	public function query(Request $request)
	{
		return new JsonResponse(Auth::user(), 200);
	}

	public function login(Request $request, $method = 'email')
	{
		//check if already logged in
		if ($request->user()) {
			//Log::debug(Auth::user());
			Log::debug("user has logged in");
			return $this->sendLoginResponse($request);
		}

		//check if method is available
		if (!in_array($method, ['name', 'email'])) {
			Log::error("method '$method' not supported");
			return $this->sendFailedLoginResponse($request);
		}

		//current colume regarded as the username
		$this->username = $method;

		//check the request parameters
		$request->validate([
			$this->username() => 'required|string',
			'password' => 'required|string',
		]);

		//do the authentication
		$credentials = $request->only($this->username(), 'password');
		if (Auth::attempt($credentials, $request->filled('remember')))
			return $this->sendLoginResponse($request);

		return $this->sendFailedLoginResponse($request);
	}

	/**
	 * Log the user out of the application.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
	 */
	public function logout(Request $request)
	{
		Auth::logout();

		$request->session()->invalidate();

		$request->session()->regenerateToken();

		if ($response = $this->loggedOut($request))
			return $response;

		return $request->wantsJson()
			? new JsonResponse([], 204)
			: redirect('/');
	}

	/**
	 * The user has logged out of the application.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return mixed
	 */
	protected function loggedOut(Request $request)
	{
		Log::debug('post logged out');
	}

	/**
	 * Send the response after the user was authenticated.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
	 */
	protected function sendLoginResponse(Request $request)
	{
		$request->session()->regenerate();

		if ($response = $this->authenticated($request, Auth::user()))
			return $response;

		return $request->wantsJson()
			? new JsonResponse(Auth::user(), 200)
			: Redirect::intended($this->redirectPath());
	}

	/**
	 * The user has been authenticated.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  mixed  $user
	 * @return mixed
	 */
	protected function authenticated(Request $request, $user)
	{
		Log::debug('post logged in');
	}

	/**
	 * Get the failed login response instance.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Symfony\Component\HttpFoundation\Response
	 *
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function sendFailedLoginResponse(Request $request)
	{
		throw ValidationException::withMessages([
			$this->username() => [trans('auth.failed')],
		]);
	}

	public function username()
	{
		return $this->username;
	}
}
