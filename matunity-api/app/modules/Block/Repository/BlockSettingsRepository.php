<?php
declare(strict_types=1);

namespace App\Block\Repository;

use App\Library\Repository\AbstractRepository;

class BlockSettingsRepository extends AbstractRepository
{

    const MODEL = 'App\Block\Model\BlockSetting';
    const ALIAS = 'setting';
    const ID = 'param';

    public function getByParam($param)
    {
        $query = $this->query()
            ->andWhere('setting.param = :param:', ['param' => $param]);

        return $this->getResult($query, true);
    }

}
