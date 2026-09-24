<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'content_id', 'progress_percent', 'started_at', 'completed_at', 'last_viewed_at'])]
class ContentProgress extends Model
{
    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'completed_at' => 'datetime', 'last_viewed_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function content(): BelongsTo { return $this->belongsTo(Content::class); }
}
