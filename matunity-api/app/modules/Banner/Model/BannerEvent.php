<?php
declare(strict_types=1);

namespace App\Banner\Model;

use App\Library\Repository\Model;

class BannerEvent extends Model
{

    public $transaction;
    public $banner_id;
    public $owner;
    public $event;
    public $timestamp_created;
    public $timestamp_processed;

    public function initialize()
    {
        $this->setSource('banner_events');
    }

    public function beforeValidation()
    {
        if (!isset($this->timestamp_created)) {
            $this->timestamp_created = time();
        }
    }
}

