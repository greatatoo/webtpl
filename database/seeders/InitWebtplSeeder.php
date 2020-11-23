<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Greatatoo\Webtpl\Models\Role;
use Greatatoo\Webtpl\Models\Permission;

class InitWebtplSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		$adminPermission = new Permission();
		$adminPermission->slug = 'admin-permission';
		$adminPermission->name = 'Admin Permission';
		$adminPermission->save();

		$adminRole = new Role();
		$adminRole->slug = 'admin';
		$adminRole->name = 'Admin Role';
		$adminRole->save();
		$adminRole->permissions()->attach($adminPermission);

		$adminUser = new User();
		$adminUser->account = 'admin';
		$adminUser->name = 'Administrator';
		$adminUser->email = 'admin@example.com';
		$adminUser->password = bcrypt('admin');
		$adminUser->api_token = uniqid($adminUser->account);
		$adminUser->save();
		$adminUser->roles()->attach($adminRole);
		$adminUser->permissions()->attach($adminPermission);
	}
}
