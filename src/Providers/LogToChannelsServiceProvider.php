<?php

/**
 * Logger service provider to be abled to log in different files
 *
  * @author     Romain Laneuville <romain.laneuville@hotmail.fr>
 */

namespace Greatatoo\Webtpl\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Class LogToChannelsServiceProvider
 *
 * @package Greatatoo\Webtpl\Providers
 */
class LogToChannelsServiceProvider extends ServiceProvider
{
    /**
     * Initialize the logger
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('Greatatoo\Webtpl\Providers\LogToChannels', function () {
            return new LogToChannels();
        });
    }
}
