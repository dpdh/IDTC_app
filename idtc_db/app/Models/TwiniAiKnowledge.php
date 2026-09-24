<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['slug', 'topic', 'question', 'answer', 'keywords', 'source', 'priority', 'is_active'])]
class TwiniAiKnowledge extends Model
{
    protected $table = 'twini_ai_knowledge';

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
