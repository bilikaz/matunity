<?php
declare(strict_types=1);

namespace App\Banner\Model;

use App\Library\Repository\Model;

class Banner extends Model
{

    public $banner_id;
    public $content;
    public $description;
    public $name;
    public $owner;
    public $timestamp_minted;
    public $timestamp_updated;
    public $timestamp_lifetime;

    public function initialize()
    {
        $this->setSource('banners');
    }

    public function afterFetch()
    {
        if ($this->timestamp_lifetime && $this->timestamp_lifetime < time()) {
            $this->content = null;
            $this->description = null;
            $this->name = null;
            $this->owner = null;
            $this->timestamp_minted = null;
            $this->timestamp_updated = null;
            $this->timestamp_lifetime = null;
        }
    }

}
