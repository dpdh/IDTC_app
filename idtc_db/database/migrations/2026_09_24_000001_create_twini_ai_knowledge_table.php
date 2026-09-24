<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('twini_ai_knowledge', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('topic')->index();
            $table->text('question');
            $table->longText('answer');
            $table->json('keywords')->nullable();
            $table->string('source')->default('manual');
            $table->unsignedInteger('priority')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('twini_ai_knowledge');
    }
};
