<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\SoftDeletable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['author_id', 'project_id', 'slug', 'title', 'content_type', 'status', 'excerpt', 'description', 'sort_order', 'published_at'])]
class Content extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function author(): BelongsTo { return $this->belongsTo(User::class, 'author_id'); }
    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function sections(): HasMany { return $this->hasMany(ContentSection::class)->orderBy('sort_order'); }
    public function media(): HasMany { return $this->hasMany(ContentMedia::class)->orderBy('sort_order'); }
    public function progress(): HasMany { return $this->hasMany(ContentProgress::class); }
}
