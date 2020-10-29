<?php

namespace Greatatoo\Webtpl\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPermissionModel extends Model
{
	use HasFactory;
	
	protected $table = 'users_permissions';
	public $timestamps = false;
}
