<?php
declare(strict_types=1);

namespace App\Library\Api\Response;

use Phalcon\Mvc\Micro as Application;

class PngResponse implements ResponseInterface
{

    private $response;

    public function setResponse($content, int $responseCode, Application $application)
    {
        $this->response = $application->getSharedService('response');
        $this->response->setStatusCode($responseCode);
        $this->response->setContentType('image/png');
        $this->response->setContent($content);
    }

    public function send()
    {
        $this->response->send();
    }

}
