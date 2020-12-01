<?php

namespace Greatatoo\Webtpl\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePermissionModel extends Model
{
    use HasFactory;

    protected $table = 'roles_permissions';
    public $timestamps = false;
}
