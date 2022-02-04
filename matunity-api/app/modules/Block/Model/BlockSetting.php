<?php
declare(strict_types=1);

namespace App\Block\Model;

use App\Library\Repository\Model;

class BlockSetting extends Model
{

    public $param;
    public $value;

    public function initialize()
    {
        $this->setSource('block_settings');
    }

}
