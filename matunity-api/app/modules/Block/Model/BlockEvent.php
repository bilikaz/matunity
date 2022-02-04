<?php
declare(strict_types=1);

namespace App\Block\Model;

use App\Library\Repository\Model;

class BlockEvent extends Model
{

    public $transaction;
    public $block_id;
    public $owner;
    public $event;
    public $timestamp_created;
    public $timestamp_processed;

    public function initialize()
    {
        $this->setSource('block_events');
    }

    public function beforeValidation()
    {
        if (!isset($this->timestamp_created)) {
            $this->timestamp_created = time();
        }
    }
}

