# Webtpl

[![Latest Version on Packagist][ico-version]][link-packagist]
[![Total Downloads][ico-downloads]][link-downloads]
[![Build Status][ico-travis]][link-travis]
[![StyleCI][ico-styleci]][link-styleci]

This is where your description should go. Take a look at [contributing.md](contributing.md) to see a to do list.

## Installation

Via Composer

``` bash
composer require greatatoo/webtpl
php artisan webtpl:install
php artisan migrate
```

## Usage

### Session Authentication

routes/web.php

```php
//Get session
Route::get('/session', [\Greatatoo\Webtpl\Http\Controllers\SessionController::class, 'query']);

//Create session by account (login)
Route::post('/session', [\Greatatoo\Webtpl\Http\Controllers\SessionController::class, 'create']);

//Create session by email (login)
Route::post('/session/{column}', [\Greatatoo\Webtpl\Http\Controllers\SessionController::class, 'create']);

//Destroy session (logout)
Route::delete('/session', [\Greatatoo\Webtpl\Http\Controllers\SessionController::class, 'destroy']);
```

### Token Authentication

routes/api.php

```php
Route::middleware(['auth:api','role:admin'])->group(function () {
    Route::apiResources([
        'user' => \App\Http\Controllers\Essential\UserController::class,
        'role' => \App\Http\Controllers\Essential\RoleController::class,
        'permission' => \App\Http\Controllers\Essential\PermissionController::class,
    ]);

    Route::post('user/search', [\App\Http\Controllers\Essential\UserController::class, 'search']);
    Route::get('user/{user}/detail', [\App\Http\Controllers\Essential\UserController::class, 'detail']);

    Route::get('role/{role}/permission',[\App\Http\Controllers\Essential\RolePermissionController::class,'show']);
    Route::put('role/{role}/permission',[\App\Http\Controllers\Essential\RolePermissionController::class,'update']);
    Route::delete('role/{role}/permission',[\App\Http\Controllers\Essential\RolePermissionController::class,'destroy']);

    Route::get('user/{user}/permission',[\App\Http\Controllers\Essential\UserPermissionController::class,'show']);
    Route::put('user/{user}/permission',[\App\Http\Controllers\Essential\UserPermissionController::class,'update']);
    Route::delete('user/{user}/permission',[\App\Http\Controllers\Essential\UserPermissionController::class,'destroy']);

    Route::get('user/{user}/role',[\App\Http\Controllers\Essential\UserRoleController::class,'show']);
    Route::put('user/{user}/role',[\App\Http\Controllers\Essential\UserRoleController::class,'update']);
    Route::delete('user/{user}/role',[\App\Http\Controllers\Essential\UserRoleController::class,'destroy']);
});
```

cURL

```bash
curl -X GET --header "Authorization: Bearer user_api_token_on_users_table"  http://localhost/api/role
```

## Change log

Please see the [changelog](changelog.md) for more information on what has changed recently.

## Testing

``` bash
composer test
```

## Contributing

Please see [contributing.md](contributing.md) for details and a todolist.

## Security

If you discover any security related issues, please email author email instead of using the issue tracker.

## Credits

- [author name][link-author]
- [All Contributors][link-contributors]

## License

license. Please see the [license file](license.md) for more information.

[ico-version]: https://img.shields.io/packagist/v/greatatoo/webtpl.svg?style=flat-square
[ico-downloads]: https://img.shields.io/packagist/dt/greatatoo/webtpl.svg?style=flat-square
[ico-travis]: https://img.shields.io/travis/greatatoo/webtpl/master.svg?style=flat-square
[ico-styleci]: https://styleci.io/repos/12345678/shield

[link-packagist]: https://packagist.org/packages/greatatoo/webtpl
[link-downloads]: https://packagist.org/packages/greatatoo/webtpl
[link-travis]: https://travis-ci.org/greatatoo/webtpl
[link-styleci]: https://styleci.io/repos/12345678
[link-author]: https://github.com/greatatoo
[link-contributors]: ../../contributors

## Reference

- [Laravel 8.x User Roles and Permissions Tutorial](https://www.codechief.org/article/user-roles-and-permissions-tutorial-in-laravel-without-packages)
