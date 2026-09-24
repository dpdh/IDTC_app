<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['content_id', 'heading', 'body', 'section_type', 'sort_order'])]
class ContentSection extends Model
{
    public function content(): BelongsTo { return $this->belongsTo(Content::class); }
}
