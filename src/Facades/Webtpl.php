<?php

namespace Greatatoo\Webtpl\Facades;

use Illuminate\Support\Facades\Facade;

class Webtpl extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor(): string
    {
        return 'webtpl';
    }
}
