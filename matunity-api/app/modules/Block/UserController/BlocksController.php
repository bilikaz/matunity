<?php
declare(strict_types=1);

namespace App\Block\UserController;

use App\Library\Api\Controller,
    App\Library\Api\Request\Mapper\Entity\BasicRequestEntity,
    App\Library\Api\Exception\EntityNotFoundException;

class BlocksController extends Controller
{

    public function getResponseMappers()
    {
        return [
            'get' => 'App\Block\Response\Mapper\BlockMapper',
            'list' => 'App\Block\Response\Mapper\BlocksMapper',
        ];
    }

    public function get(string $id)
    {
        return $this->blocksRepository->getById($id, true);
    }

    public function list(BasicRequestEntity $request)
    {
        return $this->blocksRepository->getMintedBlocks($request->toArray());
    }

}
