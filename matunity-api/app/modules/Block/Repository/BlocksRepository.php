<?php
declare(strict_types=1);

namespace App\Block\Repository;

use App\Library\Repository\AbstractRepository;

class BlocksRepository extends AbstractRepository
{

    const MODEL = 'App\Block\Model\Block';
    const ALIAS = 'block';
    const ID = 'block_id';


    public function getMintedBlocks(array $filters=[])
    {
        $query = $this->query()
            ->columns([
                'block_id',
                'name',
                'description',
                'owner',
                'earned',
                'claimed',
                'timestamp_minted',
                'timestamp_updated',
                'content',
            ])
            ->andWhere('block.timestamp_minted IS NOT NULL');

        if (isset($filters['address'])) {
            $query->andWhere('block.owner = :address:', ['address' => $filters['address']]);
        }

        return $this->getResultsByField($query, 'block_id', false);
    }

    public function getAllBlocks(array $filters=[])
    {
        $query = $this->query()
            ->columns([
                'block_id',
                'name',
                'description',
                'owner',
                'earned',
                'claimed',
                'timestamp_minted',
                'timestamp_updated',
                'content',
            ]);

        if (isset($filters['address'])) {
            $query->andWhere('block.owner = :address:', ['address' => $filters['address']]);
        }

        return $this->getResultsByField($query, 'block_id', false);
    }

}
