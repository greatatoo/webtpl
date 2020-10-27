<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Greatatoo\Webtpl\Models\Role;
use Greatatoo\Webtpl\Models\Permission;

class RolePermissionDummySeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 * @see https://www.codechief.org/article/user-roles-and-permissions-tutorial-in-laravel-without-packages
	 */
	public function run()
	{
		$devPermission = Permission::where('slug', 'create-tasks')->first();
		$managerPermission = Permission::where('slug', 'edit-users')->first();

		//RoleTableSeeder.php
		$devRole = new Role();
		$devRole->slug = 'developer';
		$devRole->name = 'Front-end Developer';
		$devRole->save();
		$devRole->permissions()->attach($devPermission);

		$managerRole = new Role();
		$managerRole->slug = 'manager';
		$managerRole->name = 'Assistant Manager';
		$managerRole->save();
		$managerRole->permissions()->attach($managerPermission);

		$devRole = Role::where('slug', 'developer')->first();
		$managerRole = Role::where('slug', 'manager')->first();

		$createTasks = new Permission();
		$createTasks->slug = 'create-tasks';
		$createTasks->name = 'Create Tasks';
		$createTasks->save();
		$createTasks->roles()->attach($devRole);

		$editUsers = new Permission();
		$editUsers->slug = 'edit-users';
		$editUsers->name = 'Edit Users';
		$editUsers->save();
		$editUsers->roles()->attach($managerRole);

		$devRole = Role::where('slug', 'developer')->first();
		$managerRole = Role::where('slug', 'manager')->first();
		$devPerm = Permission::where('slug', 'create-tasks')->first();
		$managerPerm = Permission::where('slug', 'edit-users')->first();

		$developer = new User();
		$developer->name = 'greatatoo';
		$developer->email = 'greatatoo@gmail.com';
		$developer->password = bcrypt('secret');
		$developer->save();
		$developer->roles()->attach($devRole);
		$developer->permissions()->attach($devPerm);

		$manager = new User();
		$manager->name = 'david';
		$manager->email = 'david@ccgopro.com';
		$manager->password = bcrypt('secret');
		$manager->save();
		$manager->roles()->attach($managerRole);
		$manager->permissions()->attach($managerPerm);
	}
}
