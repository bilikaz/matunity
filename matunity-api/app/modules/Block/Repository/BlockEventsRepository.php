<?php
declare(strict_types=1);

namespace App\Block\Repository;

use App\Library\Repository\AbstractRepository;

class BlockEventsRepository extends AbstractRepository
{

    const MODEL = 'App\Block\Model\BlockEvent';
    const ALIAS = 'event';
    const ID = 'param';

    public function getByTransaction($transaction)
    {
        $query = $this->query()
            ->andWhere('event.transaction = :transaction:', ['transaction' => $transaction]);

        return $this->getResult($query, true);
    }

    public function getUnprocessedEvent()
    {
        $query = $this->query()
            ->andWhere('event.timestamp_processed IS NULL');

        return $this->getResult($query, false);
    }

    public function getUnprocessedEventCount()
    {
        $query = $this->query()
            ->columns(['count' => 'COUNT(*)'])
            ->andWhere('event.timestamp_processed IS NULL');

        return $this->getResult($query, false)->count;
    }

}
