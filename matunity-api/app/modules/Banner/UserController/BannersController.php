<?php
declare(strict_types=1);

namespace App\Banner\UserController;

use App\Library\Api\Controller,
    App\Library\Api\Request\Mapper\Entity\BasicRequestEntity,
    App\Library\Api\Exception\EntityNotFoundException;

class BannersController extends Controller
{

    public function getResponseMappers()
    {
        return [
            'get' => 'App\Banner\Response\Mapper\BannerMapper',
            'list' => 'App\Banner\Response\Mapper\BannersMapper',
        ];
    }

    public function get(string $id)
    {
        return $this->bannersRepository->getById($id, true);
    }

    public function list(BasicRequestEntity $request)
    {
        return $this->bannersRepository->getLiveBanners($request->toArray());
    }

}
