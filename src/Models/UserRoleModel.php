<?php

namespace Greatatoo\Webtpl\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRoleModel extends Model
{
	use HasFactory;
	
	protected $table = 'users_roles';
	public $timestamps = false;
}
