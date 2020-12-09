<?php

namespace Greatatoo\Webtpl\Presets;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Console\Concerns\InteractsWithIO;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class Bootstrap extends Preset
{
    use InteractsWithIO;

    /**
     * Install the preset.
     *
     * @return void
     */
    public static function install()
    {
        static::updatePackages();
        static::updateWebpackConfiguration();
        static::updateSass();
        static::updateBootstrapping();
        static::removeNodeModules();
    }

    /**
     * Update the given package array.
     *
     * @param  array  $packages
     * @return array
     */
    protected static function updatePackageArray(array $packages)
    {
        return [
            'bootstrap' => '^4.0.0',
            'jquery' => '^3.2',
            'popper.js' => '^1.12',
            'sass' => '^1.15.2',
            'sass-loader' => '^8.0.0',
        ] + static::getAdditionalPackageArray() + $packages;
    }

    /**
     * Add additional packages
     * Remember to update bootstrap-stubs/webpack.mix.js to copy the required files to resource_path()
     */
    protected static function getAdditionalPackageArray()
    {
        return [
            'datatables.net-bs4' => '^1.10.22',
        ];
    }

    /**
     * Update the Webpack configuration.
     *
     * @return void
     */
    protected static function updateWebpackConfiguration()
    {
        copy(__DIR__ . '/bootstrap-stubs/webpack.mix.js', base_path('webpack.mix.js'));
    }

    /**
     * Update the Sass files for the application.
     *
     * @return void
     */
    protected static function updateSass()
    {
        (new Filesystem)->ensureDirectoryExists(resource_path('sass'));


        $stubDir = realpath(__DIR__ . '/bootstrap-stubs');

        $directory = new RecursiveDirectoryIterator($stubDir);
        $iterator = new RecursiveIteratorIterator($directory);
        $files = array();
        foreach ($iterator as $info) {
            $filePath = substr($info->getPathname(), strlen($stubDir));
            $filePath = preg_replace('/^\//', '', $filePath);
            if (preg_match('/\.$/', $filePath))
                continue;
            if (!preg_match('/css$/', $filePath))
                continue;
            $files[] = $filePath;
        }

        foreach ($files as $file) {
            $srcFile = "$stubDir/$file";
            $tgtFile = resource_path("sass/$file");
            copy($srcFile, $tgtFile);
        }
    }

    /**
     * Update the bootstrapping files.
     *
     * @return void
     */
    protected static function updateBootstrapping()
    {
        $stubDir = realpath(__DIR__ . '/bootstrap-stubs');

        $directory = new RecursiveDirectoryIterator($stubDir);
        $iterator = new RecursiveIteratorIterator($directory);
        $files = array();
        foreach ($iterator as $info) {
            $filePath = substr($info->getPathname(), strlen($stubDir));
            $filePath = preg_replace('/^\//', '', $filePath);
            if (preg_match('/\.$/', $filePath))
                continue;
            if (!preg_match('/\.js$/', $filePath))
                continue;
            $files[] = $filePath;
        }

        foreach ($files as $file) {
            $srcFile = "$stubDir/$file";
            $tgtFile = resource_path("js/$file");
            copy($srcFile, $tgtFile);
        }
    }
}
