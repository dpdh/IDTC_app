<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $roles = [
            ['name' => 'super_admin', 'label' => 'Super Admin', 'description' => 'Full access to users, content, projects, and settings.'],
            ['name' => 'admin', 'label' => 'Admin', 'description' => 'Manage content, projects, and operational data without changing system ownership.'],
            ['name' => 'membership', 'label' => 'Membership', 'description' => 'Access member learning content, project summaries, and member features.'],
            ['name' => 'free', 'label' => 'Free', 'description' => 'Access public learning content and basic IDTC information.'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['name' => $role['name']],
                [...$role, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        $roleIds = DB::table('roles')->pluck('id', 'name');
        foreach ([
            'content_editor' => 'admin',
            'facility_manager' => 'membership',
            'viewer' => 'free',
        ] as $oldRole => $newRole) {
            $oldRoleId = $roleIds[$oldRole] ?? null;
            $newRoleId = $roleIds[$newRole] ?? null;
            if ($oldRoleId && $newRoleId) {
                DB::table('role_user')->where('role_id', $oldRoleId)->get()->each(function (object $assignment) use ($newRoleId): void {
                    DB::table('role_user')->updateOrInsert(
                        ['user_id' => $assignment->user_id, 'role_id' => $newRoleId],
                        ['created_at' => $assignment->created_at, 'updated_at' => now()]
                    );
                });
                DB::table('role_user')->where('role_id', $oldRoleId)->delete();
                DB::table('roles')->where('id', $oldRoleId)->delete();
            }
        }
    }

    public function down(): void
    {
        DB::table('roles')->whereIn('name', ['admin', 'membership', 'free'])->delete();
    }
};