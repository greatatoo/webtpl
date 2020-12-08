<?php

namespace Greatatoo\Webtpl\Presets;

use Illuminate\Filesystem\Filesystem;

class Bootstrap extends Preset
{
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
    protected static function getAdditionalPackageArray(){
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
        copy(__DIR__.'/bootstrap-stubs/webpack.mix.js', base_path('webpack.mix.js'));
    }

    /**
     * Update the Sass files for the application.
     *
     * @return void
     */
    protected static function updateSass()
    {
        (new Filesystem)->ensureDirectoryExists(resource_path('sass'));

        copy(__DIR__.'/bootstrap-stubs/_variables.scss', resource_path('sass/_variables.scss'));
        copy(__DIR__.'/bootstrap-stubs/app.scss', resource_path('sass/app.scss'));
        copy(__DIR__.'/bootstrap-stubs/bootstrap-supplyment.css', resource_path('sass/bootstrap-supplyment.css'));
    }

    /**
     * Update the bootstrapping files.
     *
     * @return void
     */
    protected static function updateBootstrapping()
    {
        copy(__DIR__.'/bootstrap-stubs/app.js', resource_path('js/app.js'));
        copy(__DIR__.'/bootstrap-stubs/bootstrap.js', resource_path('js/bootstrap.js'));
        copy(__DIR__.'/bootstrap-stubs/jqe.js', resource_path('js/jqe.js'));
        copy(__DIR__.'/bootstrap-stubs/dashboard_users.js', resource_path('js/dashboard_users.js'));
        copy(__DIR__.'/bootstrap-stubs/dashboard_user_detail.js', resource_path('js/dashboard_user_detail.js'));
    }
}
