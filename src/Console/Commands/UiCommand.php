<?php

namespace Greatatoo\Webtpl\Console\Commands;

use Illuminate\Console\Command;
use InvalidArgumentException;

use Greatatoo\Webtpl\Presets\Bootstrap;
use Greatatoo\Webtpl\Presets\React;
use Greatatoo\Webtpl\Presets\Vue;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

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
        $this->exportJsCss();

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

    protected function exportJsCss()
    {
        $stubDir = realpath(__DIR__ . '/../../../src/Presets/js-css-stubs');

        $directory = new RecursiveDirectoryIterator($stubDir);
        $iterator = new RecursiveIteratorIterator($directory);
        $jsFiles = array();
        $cssFiles = array();
        $webpackFiles = array();
        foreach ($iterator as $info) {
            $filePath = substr($info->getPathname(), strlen($stubDir));
            $filePath = preg_replace('/^\//', '', $filePath);
            if (preg_match('/\.$/', $filePath))
                continue;

            //Collect js files
            if(preg_match('/\.js$/',$filePath)){
                if('webpack.mix.js' == $filePath){
                    $webpackFiles[] = $filePath;
                }else{
                    $jsFiles[] = $filePath;
                }
            }
            //Collect css files
            if(preg_match('/css$/',$filePath))
                $cssFiles[] = $filePath;
        }
        
        //Export webpack files
        foreach ($webpackFiles as $file) {
            if (file_exists($targetFile = base_path($file)) && !$this->option('force')) {
                if (!$this->confirm("The [{$file}] view already exists. Do you want to replace it?")) {
                    continue;
                }
            }
            $stubFile = "$stubDir/$file";
            copy(
                $stubFile,
                $targetFile
            );
        }

        //Export js files
        foreach ($jsFiles as $file) {
            if (file_exists($targetFile = resource_path("js/$file")) && !$this->option('force')) {
                if (!$this->confirm("The [{$file}] view already exists. Do you want to replace it?")) {
                    continue;
                }
            }

            $targetDir = dirname($targetFile);
            if (!file_exists($targetDir))
                mkdir($targetDir, 0755, true);

            $stubFile = "$stubDir/$file";

            copy(
                $stubFile,
                $targetFile
            );
            $this->info("Copy $targetFile");
        }

        //Export css files
        foreach ($cssFiles as $file) {
            if (file_exists($targetFile = resource_path("sass/$file")) && !$this->option('force')) {
                if (!$this->confirm("The [{$file}] view already exists. Do you want to replace it?")) {
                    continue;
                }
            }

            $targetDir = dirname($targetFile);
            if (!file_exists($targetDir))
                mkdir($targetDir, 0755, true);

            $stubFile = "$stubDir/$file";

            copy(
                $stubFile,
                $targetFile
            );
            $this->info("Copy $targetFile");
        }
    }

    /**
     * Export the authentication views.
     *
     * @return void
     */
    protected function exportViews()
    {
        $stubDir = realpath(__DIR__ . '/../../../stubs/Ui/' . $this->argument('type'));

        $directory = new RecursiveDirectoryIterator($stubDir);
        $iterator = new RecursiveIteratorIterator($directory);
        $files = array();
        foreach ($iterator as $info) {
            $filePath = substr($info->getPathname(), strlen($stubDir));
            $filePath = preg_replace('/^\//', '', $filePath);
            if (preg_match('/\.$/', $filePath))
                continue;
            $files[] = $filePath;
        }

        foreach ($files as $file) {
            $targetFile = preg_replace('/\.stub$/', '.blade.php', $file);

            if (file_exists($viewFile = $this->getViewPath($targetFile)) && !$this->option('force')) {
                if (!$this->confirm("The [{$targetFile}] view already exists. Do you want to replace it?")) {
                    continue;
                }
            }

            $viewDir = dirname($viewFile);
            if (!file_exists($viewDir))
                mkdir($viewDir, 0755, true);

            $stubFile = "$stubDir/$file";

            copy(
                $stubFile,
                $viewFile
            );
            $this->info("Copy $viewFile");
        }
    }

    /**
     * Export the controllers for views.
     *
     * @return void
     */
    protected function exportControllers()
    {
        $stubDir = realpath(__DIR__ . '/../../../stubs/Controllers');

        $directory = new RecursiveDirectoryIterator($stubDir);
        $iterator = new RecursiveIteratorIterator($directory);
        $files = array();
        foreach ($iterator as $info) {
            $filePath = substr($info->getPathname(), strlen($stubDir));
            $filePath = preg_replace('/^\//', '', $filePath);
            if (preg_match('/\.$/', $filePath))
                continue;
            $files[] = $filePath;
        }

        foreach ($files as $file) {
            $targetFile = preg_replace('/\.stub$/', '.php', $file);
            if (file_exists($controllerFile = $this->getControllerPath($targetFile)) && !$this->option('force')) {
                if (!$this->confirm("The [{$targetFile}] controller already exists. Do you want to replace it?")) {
                    continue;
                }
            }

            $controllerDir = dirname($controllerFile);
            if (!file_exists($controllerDir))
                mkdir($controllerDir, 0755, true);

            $stubFile = "$stubDir/$file";

            copy(
                $stubFile,
                $controllerFile
            );
            $this->info("Copy $controllerFile");
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
     * Add routes in routes/web.php and api.php
     */
    protected function addRoutes()
    {
        //web.php
        $lines = $this->fileToLines(base_path('routes/web.php'));

        //check if Webtpl::uiRoutes exists
        if (!$this->linesContain($lines, 'Webtpl::uiRoutes()')) {
            $newLines = [];
            foreach ($lines as $line)
                $newLines[] = $line;

            $newLines[] = '';
            $newLines[] = '//Set Webtpl ui routes';
            $newLines[] = 'Greatatoo\Webtpl\Webtpl::uiRoutes();';

            $this->linesToFile($newLines, base_path('routes/web.php'));
            $this->info("Modify routes/web.php");
        }

        //api.php
        $lines = $this->fileToLines(base_path('routes/api.php'));

        //check if Webtpl::uiRoutes exists
        if (!$this->linesContain($lines, 'Webtpl::apiRoutes()')) {
            $newLines = [];
            foreach ($lines as $line)
                $newLines[] = $line;

            $newLines[] = '';
            $newLines[] = '//Set Webtpl api routes';
            $newLines[] = 'Greatatoo\Webtpl\Webtpl::apiRoutes();';

            $this->linesToFile($newLines, base_path('routes/api.php'));
            $this->info("Modify routes/api.php");
        }
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
