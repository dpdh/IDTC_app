<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\SoftDeletable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['slug', 'name', 'facility_type', 'status', 'health_score', 'description', 'aps_project_id', 'aps_hub_id', 'model_urn', 'metadata'])]
class Project extends Model
{
    use SoftDeletes;

    protected function casts(): array { return ['metadata' => 'array']; }
    public function contents(): HasMany { return $this->hasMany(Content::class); }
}
