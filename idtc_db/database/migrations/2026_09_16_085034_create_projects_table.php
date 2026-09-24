<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('facility_type')->nullable();
            $table->string('status')->default('draft');
            $table->unsignedTinyInteger('health_score')->nullable();
            $table->text('description')->nullable();
            $table->string('aps_project_id')->nullable()->index();
            $table->string('aps_hub_id')->nullable()->index();
            $table->string('model_urn')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
