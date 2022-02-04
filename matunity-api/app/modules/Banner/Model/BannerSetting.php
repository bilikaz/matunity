<?php
declare(strict_types=1);

namespace App\Banner\Model;

use App\Library\Repository\Model;

class BannerSetting extends Model
{

    public $param;
    public $value;

    public function initialize()
    {
        $this->setSource('banner_settings');
    }

}
