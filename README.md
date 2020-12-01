# Webtpl

[![Latest Version on Packagist][ico-version]][link-packagist]
[![Total Downloads][ico-downloads]][link-downloads]
[![Build Status][ico-travis]][link-travis]
[![StyleCI][ico-styleci]][link-styleci]

Webtpl is a web template containing a bunch of essential features such as Role/Permission ACL, Authentication by account or email, Bearer Authorization and so on for common Laravel projects. Take a look at [contributing.md](contributing.md) to see a to do list.

## Installation

Via Composer

``` bash
composer create-project --prefer-dist laravel/laravel <project name>
cd <project name>
composer require greatatoo/webtpl
php artisan webtpl:install
php artisan webtpl:ui
php artisan migrate
php artisan db:seed --class=InitWebtplSeeder
```

## Authentication

The Webtpl provides two kinds of credentials, account and email, to verify the user.
Change the adopted credential you want from the defaults secion in config/auth.php.

```php
[
    'defaults' => [
        'verified_by' => 'account'
	]
]
```

## Routes

```php
//Set Webtpl essential routes
Greatatoo\Webtpl\Webtpl::routes();

//Set Webtpl ui routes
Greatatoo\Webtpl\Webtpl::uiRoutes();
```

[See Details](https://github.com/greatatoo/webtpl/blob/master/src/Webtpl.php)

## cURL with API token

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
