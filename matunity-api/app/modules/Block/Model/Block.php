<?php
declare(strict_types=1);

namespace App\Block\Model;

use App\Library\Repository\Model;

class Block extends Model
{

    public $block_id;
    public $content;
    public $description;
    public $name;
    public $owner;
    public $earned;
    public $claimed;
    public $timestamp_minted;
    public $timestamp_updated;

    public function initialize()
    {
        $this->setSource('blocks');
    }

}
