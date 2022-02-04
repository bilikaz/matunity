<?php
declare(strict_types=1);

namespace App\Block\Service;

use App\Library\Service\AbstractService,
    App\Library\Api\Request\Mapper\Entity\BasicRequestEntity,
    App\Library\Api\Config;

use App\Block\Model\Block,
    App\Block\Repository\BlocksRepository;

class BlockManager extends AbstractService
{

    protected function getConfig(): Config
    {
        return $this->resolveService('config');
    }

    protected function getBlocksRepository(): BlocksRepository
    {
        return $this->resolveService('blocksRepository');
    }

}
