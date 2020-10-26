<?php

namespace Greatatoo\Webtpl;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;

class WebtplServiceProvider extends ServiceProvider
{
	/**
	 * Perform post-registration booting of services.
	 *
	 * @return void
	 */
	public function boot(): void
	{
		// $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'greatatoo');
		// $this->loadViewsFrom(__DIR__.'/../resources/views', 'greatatoo');
		$this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
		// $this->loadRoutesFrom(__DIR__.'/routes.php');

		// Publishing is only necessary when using the CLI.
		if ($this->app->runningInConsole()) {
			$this->bootForConsole();
		}
	}

	/**
	 * Register any package services.
	 *
	 * @return void
	 */
	public function register(): void
	{
		$this->mergeConfigFrom(__DIR__ . '/../config/webtpl.php', 'webtpl');

		// Register the service the package provides.
		$this->app->singleton('webtpl', function ($app) {
			return new Webtpl;
		});
	}

	/**
	 * Get the services provided by the provider.
	 *
	 * @return array
	 */
	public function provides()
	{
		return ['webtpl'];
	}

	/**
	 * Console-specific booting.
	 *
	 * @return void
	 */
	protected function bootForConsole(): void
	{
		// Publishing the configuration file.
		$this->publishes([
			__DIR__ . '/../config/webtpl.php' => config_path('webtpl.php'),
		], 'webtpl.config');

		// Publishing the views.
		/*$this->publishes([
            __DIR__.'/../resources/views' => base_path('resources/views/vendor/greatatoo'),
        ], 'webtpl.views');*/

		// Publishing assets.
		/*$this->publishes([
            __DIR__.'/../resources/assets' => public_path('vendor/greatatoo'),
        ], 'webtpl.views');*/

		// Publishing the translation files.
		/*$this->publishes([
            __DIR__.'/../resources/lang' => resource_path('lang/vendor/greatatoo'),
        ], 'webtpl.views');*/

		//Registering package commands.
		$this->commands([
			Console\Commands\InstallCommand::class
		]);
	}
}
