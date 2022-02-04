<?php
declare(strict_types=1);

namespace App\Banner\Service;

use App\Library\Service\AbstractService,
    App\Library\Api\Request\Mapper\Entity\BasicRequestEntity,
    App\Library\Api\Config;

use App\Banner\Model\Banner,
    App\Banner\Repository\BannersRepository;

class BannerManager extends AbstractService
{

    protected function getConfig(): Config
    {
        return $this->resolveService('config');
    }

    protected function getBannersRepository(): BannersRepository
    {
        return $this->resolveService('bannersRepository');
    }

}
