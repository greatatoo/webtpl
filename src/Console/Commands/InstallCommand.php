<?php

namespace Greatatoo\Webtpl\Console\Commands;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class InstallCommand extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'webtpl:install';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Install the Webtpl components and resources';

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * Execute the console command.
	 *
	 * @return int
	 */
	public function handle()
	{
		/*
		 +------------------------------------------------------------
		 | vendor:publish
		 +------------------------------------------------------------
		 |
		 | webtpl.config is defined in WebtplServiceProvider.php
		 */
		$this->callSilent('vendor:publish', ['--tag' => 'webtpl.config', '--force' => true]);

		/*
		 +------------------------------------------------------------
		 | Custom default setting
		 +------------------------------------------------------------
		 */
		// $this->replaceHomeWithDashboard(); //
		// $this->installWebtplServiceProvider(); // already registered in composer.json
		$this->modifyUserModel();
		$this->addRoleMiddleware();
		$this->copySeeders();
		$this->info('Webtpl installed successfully.');
		return 0;
	}

	/**
	 * Copy seeders to project
	 */
	protected function copySeeders()
	{
		copy(__DIR__ . '/../../../database/seeders/RolePermissionDummySeeder.php', database_path('seeders/RolePermissionDummySeeder.php'));
		$this->info("Seeders copied");
	}

	/**
	 * Replace /home with /dashboard
	 */
	protected function replaceHomeWithDashboard()
	{
		$this->replaceInFile('/home', '/dashboard', app_path('Providers/RouteServiceProvider.php'));

		if (file_exists(resource_path('views/welcome.blade.php'))) {
			$this->replaceInFile('/home', '/dashboard', resource_path('views/welcome.blade.php'));
			$this->replaceInFile('Home', 'Dashboard', resource_path('views/welcome.blade.php'));
		}
		$this->info("/home → /dashboard modified");
	}

	/**
	 * Install the Webtpl service provider in the application configuration file.
	 *
	 * @return void
	 */
	protected function installWebtplServiceProvider()
	{
		if (!Str::contains($appConfig = file_get_contents(config_path('app.php')), 'Greatatoo\\Webtpl\\WebtplServiceProvider::class')) {
			file_put_contents(config_path('app.php'), str_replace(
				"App\\Providers\RouteServiceProvider::class,",
				"App\\Providers\RouteServiceProvider::class," . PHP_EOL . "        Greatatoo\Webtpl\WebtplServiceProvider::class,",
				$appConfig
			));
		}
		$this->info("WebtplServiceProvider appended to app.php");
	}

	/**
	 * Add HasPermissionsTrait to User Model
	 */
	protected function modifyUserModel()
	{
		$lines = $this->fileToLines(app_path('Models/User.php'));

		//check if HasPermissionsTrait exists
		if ($this->linesContain($lines, 'HasPermissionsTrait'))
			return;

		$newLines = [];
		foreach ($lines as $line) {
			if (preg_match('/class User extends Authenticatable/', $line)) {
				$newLines[] = 'use Greatatoo\Webtpl\Traits\HasPermissionsTrait;';
				$newLines[] = '';
			}

			$newLines[] = $line;

			if (preg_match('/use HasFactory/', $line)) {
				$newLines[] = '    use HasPermissionsTrait;';
			}
		}

		$this->linesToFile($newLines, app_path("Models/User.php"));
		$this->info("User.php modified");
	}

	/**
	 * Add RoleMiddleware
	 */
	protected function addRoleMiddleware()
	{
		$lines = $this->fileToLines(app_path('Http/Kernel.php'));

		//check if RoleMiddleware exists
		if ($this->linesContain($lines, 'RoleMiddleware'))
			return;

		$newLines = [];
		foreach ($lines as $line) {
			$newLines[] = $line;
			if (preg_match('/protected \$routeMiddleware =/', $line)) {
				$newLines[] = "        'role' => \Greatatoo\Webtpl\Http\Middleware\RoleMiddleware::class,";
			}
		}

		$this->linesToFile($newLines, app_path("Http/Kernel.php"));
		$this->info("RoleMiddleware added to Http/Kernel.php");
	}

	/**
	 * Replace a given string within a given file.
	 *
	 * @param  string  $search
	 * @param  string  $replace
	 * @param  string  $path
	 * @return void
	 */
	protected function replaceInFile($search, $replace, $path)
	{
		file_put_contents($path, str_replace($search, $replace, file_get_contents($path)));
	}

	private function fileToLines($filePath)
	{
		return file($filePath, FILE_IGNORE_NEW_LINES);
	}

	private function linesToFile($lines, $filePath)
	{
		$fp = fopen($filePath, 'w');
		foreach ($lines as $line)
			fwrite($fp, "$line\n");
		fclose($fp);
	}

	private function linesContain($lines, $str)
	{
		foreach ($lines as $line) {
			if (preg_match("/$str/", $line))
				return true;
		}
		return false;
	}
}
