<?php

namespace Greatatoo\Webtpl\Traits;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Redirect;

use App\Providers\RouteServiceProvider;

trait SessionResourceTrait
{
    use HasPermissionsTrait;

    //the column in users table is regarded as a username to authenticate
    protected $username = 'account';

    /**
     *  Return user's detail info containing user record, roles and permissions.
     */
    public function query(Request $request)
    {
        if (!Auth::user())
            return new JsonResponse([], 200);
        $userId = Auth::user()->id;
        $userDetail = HasPermissionsTrait::getUserDetail($userId);
        return new JsonResponse($userDetail, 200);
    }

    /**
     * Login
     */
    public function login(Request $request, $column = 'account')
    {
        return $this->create($request, $column);
    }

    /**
     * Create session by account or email.
     */
    public function create(Request $request, $column = 'account')
    {
        //check if already logged in.
        if ($request->user()) {
            //Log::debug(Auth::user());
            Log::debug("user has logged in");
            return $this->sendLoginResponse($request);
        }

        //check if login column is available.
        //name and email are the columns on users table.
        if (!in_array($column, ['account', 'email'])) {
            Log::error("login method '$column' not supported");
            return $this->sendFailedLoginResponse($request);
        }

        //current column is regarded as a username to authenticate.
        $this->username = $column;

        //check the request parameters.
        //$this->username() returns ether 'account' or 'email'.
        $request->validate([
            $this->username() => 'required|string',
            'password' => 'required|string',
        ]);

        //do the authentication
        $credentials = [
            $this->username() => $request->account,
            'password' => $request->password
        ];
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
        return $this->destroy($request);
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
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
        //Log::debug('post logged out');
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

        $userId = Auth::user()->id;
        $userDetail = HasPermissionsTrait::getUserDetail($userId);

        if ($response = $this->authenticated($request, Auth::user()))
            return $response;

        return $request->wantsJson()
            ? new JsonResponse($userDetail, 200)
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
        //Log::debug('post logged in');
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

    /**
     * Pick a column to be the username for authentication.
     */
    public function username()
    {
        return $this->username;
    }

    /**
     * The URL to which the fail authentication will redirect
     */
    protected function redirectPath()
    {
        return RouteServiceProvider::HOME;
    }
}
