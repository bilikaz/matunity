<?php
declare(strict_types=1);

namespace App\Library\Api\EventsManager;

use App\Library\Service\AbstractService,
    App\Library\Api\Auth\Entity\Auth,
    App\Library\Api\Route\RouteInterface,
    App\Library\Api\Auth\Manager\AuthManagerInterface;


class AuthManager extends AbstractService implements AuthManagerInterface
{

    public function handleAuth(RouteInterface $route): Auth
    {
        $auth = new Auth();

        $auth->clientId = 'dummy_client_id';
        $auth->userId = 'dummy_user_id';
        $auth->scopes = ['dummy_scope'];
        return $auth;
    }


}
