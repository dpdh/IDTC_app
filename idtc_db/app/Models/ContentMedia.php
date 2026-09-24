<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['content_id', 'disk', 'path', 'media_type', 'alt_text', 'sort_order'])]
class ContentMedia extends Model
{
    public function content(): BelongsTo { return $this->belongsTo(Content::class); }
}
