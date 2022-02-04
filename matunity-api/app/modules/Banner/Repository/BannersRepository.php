<?php
declare(strict_types=1);

namespace App\Banner\Repository;

use App\Library\Repository\AbstractRepository;

class BannersRepository extends AbstractRepository
{

    const MODEL = 'App\Banner\Model\Banner';
    const ALIAS = 'banner';
    const ID = 'banner_id';


    public function getLiveBanners(array $filters=[])
    {
        $query = $this->query()
            ->columns([
                'banner_id',
                'name',
                'description',
                'owner',
                'timestamp_minted',
                'timestamp_updated',
                'timestamp_lifetime',
                'content',
            ])
            ->andWhere('banner.timestamp_lifetime >= :timestamp_lifetime:', ['timestamp_lifetime' => time()]);

        if (isset($filters['address'])) {
            $query->andWhere('banner.owner = :address:', ['address' => $filters['address']]);
        }

        return $this->getResultsByField($query, 'banner_id', false);
    }

    public function getAllBanners(array $filters=[])
    {
        $query = $this->query()
            ->columns([
                'banner_id',
                'name',
                'description',
                'owner',
                'timestamp_minted',
                'timestamp_updated',
                'timestamp_lifetime',
                'content',
            ]);

        if (isset($filters['address'])) {
            $query->andWhere('banner.owner = :address:', ['address' => $filters['address']]);
        }

        return $this->getResultsByField($query, 'banner_id', false);
    }

}
