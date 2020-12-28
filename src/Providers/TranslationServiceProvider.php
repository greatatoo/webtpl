<?php

namespace Greatatoo\Webtpl\Providers;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

/**
 * @see https://pineco.de/using-laravels-localization-js/
 */
class TranslationServiceProvider extends ServiceProvider
{
    /** 
     * The path to the current lang files. 
     * 
     * @var string 
     */
    protected $langPath;

    /** 
     * Create a new service provider instance. 
     * 
     * @return void 
     */
    public function __construct()
    {
        $this->langPath = resource_path('lang/' . App::getLocale());
    }

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        Cache::rememberForever('translations', function () {
            return collect(File::allFiles($this->langPath))->flatMap(function ($file) {
                return [
                    ($translation = $file->getBasename('.php')) => trans($translation),
                ];
            })->toJson();
        });
    }
}
