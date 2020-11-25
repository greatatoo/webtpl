<?php

namespace Greatatoo\Webtpl\Console\Commands;

use Illuminate\Console\Command;
use InvalidArgumentException;

use Greatatoo\Webtpl\Presets\Bootstrap;
use Greatatoo\Webtpl\Presets\React;
use Greatatoo\Webtpl\Presets\Vue;

class UiCommand extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'webtpl:ui
					{ type=bootstrap : The preset type (bootstrap) }
					{--force : Overwrite existing views by default}';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Scaffold basic login and registration views and routes.';

	/**
	 * The views that need to be exported.
	 *
	 * @var array
	 */
	protected $views = [
		'auth/login.stub' => 'auth/login.blade.php',
		'home.stub' => 'home.blade.php',
		'homepage.stub' => 'homepage.blade.php',
		'layouts/app.stub' => 'layouts/app.blade.php',
	];

	/**
	 * The controllers that need to be exported.
	 *
	 * @var array
	 */
	protected $controllers = [
		'Auth/LoginController.stub' => 'Auth/LoginController.php',
		'HomeController.stub' => 'HomeController.php',
	];

	/**
	 * Execute the console command.
	 *
	 * @return void
	 *
	 * @throws \InvalidArgumentException
	 */
	public function handle()
	{
		if (static::hasMacro($this->argument('type'))) {
			return call_user_func(static::$macros[$this->argument('type')], $this);
		}

		if (!in_array($this->argument('type'), ['bootstrap'])) {
			throw new InvalidArgumentException('Invalid preset.');
		}

		$this->exportViews();
		$this->exportControllers();
		$this->addRoutes();
		$this->applyWebtplUi();

		//Install bootstrap, vue or react components
		$this->{$this->argument('type')}();

		$this->info('Webtpl ui scaffolding generated successfully.');
	}

	/**
	 * Install the "bootstrap" preset.
	 *
	 * @return void
	 */
	protected function bootstrap()
	{
		Bootstrap::install();

		$this->info('Bootstrap scaffolding installed successfully.');
		$this->comment('Please run "npm install && npm run dev" to compile your fresh scaffolding.');
	}

	/**
	 * Install the "vue" preset.
	 *
	 * @return void
	 */
	protected function vue()
	{
		Bootstrap::install();
		Vue::install();

		$this->info('Vue scaffolding installed successfully.');
		$this->comment('Please run "npm install && npm run dev" to compile your fresh scaffolding.');
	}

	/**
	 * Install the "react" preset.
	 *
	 * @return void
	 */
	protected function react()
	{
		Bootstrap::install();
		React::install();

		$this->info('React scaffolding installed successfully.');
		$this->comment('Please run "npm install && npm run dev" to compile your fresh scaffolding.');
	}

	/**
	 * Export the authentication views.
	 *
	 * @return void
	 */
	protected function exportViews()
	{
		foreach ($this->views as $key => $value) {
			if (file_exists($view = $this->getViewPath($value)) && !$this->option('force')) {
				if (!$this->confirm("The [{$value}] view already exists. Do you want to replace it?")) {
					continue;
				}
			}

			$viewDir = dirname($view);
			if (!file_exists($viewDir))
				mkdir($viewDir, 0755, true);

			$stubFile = __DIR__ . '/../../../stubs/Ui/' . $this->argument('type') . '/' . $key;

			copy(
				$stubFile,
				$view
			);
			$this->info("Copy $view");
		}
	}

	/**
	 * Export the controllers for views.
	 *
	 * @return void
	 */
	protected function exportControllers()
	{
		foreach ($this->controllers as $key => $value) {
			if (file_exists($controller = $this->getControllerPath($value)) && !$this->option('force')) {
				if (!$this->confirm("The [{$value}] controller already exists. Do you want to replace it?")) {
					continue;
				}
			}

			$controllerDir = dirname($controller);
			if (!file_exists($controllerDir))
				mkdir($controllerDir, 0755, true);

			$stubFile = __DIR__ . '/../../../stubs/Controllers/' . $key;

			copy(
				$stubFile,
				$controller
			);
			$this->info("Copy $controller");
		}
	}

	/**
	 * Compiles the "HomeController" stub.
	 *
	 * @return string
	 */
	protected function compileControllerStub()
	{
		return str_replace(
			'{{namespace}}',
			$this->laravel->getNamespace(),
			file_get_contents(__DIR__ . '/Auth/stubs/controllers/HomeController.stub')
		);
	}

	/**
	 * Get full view path relative to the application's configured view path.
	 *
	 * @param  string  $path
	 * @return string
	 */
	protected function getViewPath($path)
	{
		return implode(DIRECTORY_SEPARATOR, [
			config('view.paths')[0] ?? resource_path('views'), $path,
		]);
	}


	/**
	 * Get full controller path relative to the application's configured controller path.
	 *
	 * @param  string  $path
	 * @return string
	 */
	protected function getControllerPath($path)
	{
		return implode(DIRECTORY_SEPARATOR, [
			app_path("Http/Controllers"), $path,
		]);
	}

	/**
	 * Apply Webtpl UI
	 */
	protected function applyWebtplUi()
	{
		$lines = $this->fileToLines(base_path('routes/web.php'));

		if (!$this->linesContain($lines, 'welcome'))
			return;

		$newLines = [];
		foreach ($lines as $line) {
			$line = preg_replace("/'welcome'/", "'homepage'", $line);
			$newLines[] = $line;
		}
		$this->linesToFile($newLines, base_path('routes/web.php'));
		$this->info("Modify welcome → homepage in routes/web.php");
	}

	/**
	 * Add routes in routes/web.php
	 */
	protected function addRoutes()
	{
		$lines = $this->fileToLines(base_path('routes/web.php'));

		//check if Webtpl::uiRoutes exists
		if ($this->linesContain($lines, 'Webtpl::uiRoutes()'))
			return;

		$newLines = [];
		foreach ($lines as $line)
			$newLines[] = $line;

		$newLines[] = '';
		$newLines[] = '//Set Webtpl ui routes';
		$newLines[] = 'Greatatoo\Webtpl\Webtpl::uiRoutes();';

		$this->linesToFile($newLines, base_path('routes/web.php'));
		$this->info("Modify routes/web.php");
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
