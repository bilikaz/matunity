<?php
declare(strict_types=1);

namespace App\Banner\Repository;

use App\Library\Repository\AbstractRepository;

class BannerSettingsRepository extends AbstractRepository
{

    const MODEL = 'App\Banner\Model\BannerSetting';
    const ALIAS = 'setting';
    const ID = 'param';

    public function getByParam($param)
    {
        $query = $this->query()
            ->andWhere('setting.param = :param:', ['param' => $param]);

        return $this->getResult($query, true);
    }

}
