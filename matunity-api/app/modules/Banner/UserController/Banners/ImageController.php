<?php
declare(strict_types=1);

namespace App\Banner\UserController\Banners;

use App\Library\Api\Controller,
    App\Library\Api\Request\Mapper\Entity\BasicRequestEntity,
    App\Library\Api\Exception\EntityNotFoundException,
    App\Banner\Model\Banner,
    App\Banner\Exception\UnsuportedEncodingException,
    App\Library\Api\Response\PngResponse;

class ImageController extends Controller
{

    public function get(Banner $bannerModel, string $encoding)
    {
        if ($encoding != 'png') {
            throw new UnsuportedEncodingException();
        }
        $response = new PngResponse();
        if ($bannerModel->content) {
            $response->setResponse(base64_decode(preg_replace('/data:image\/[^;]+;base64,/', '', $bannerModel->content, 22)), 200, $this->application);
        } elseif ($bannerModel->owner) {
            $response->setResponse(file_get_contents(WEB_PATH . 'static/under.png'), 200, $this->application);
        } else {
            $response->setResponse(file_get_contents(WEB_PATH . 'static/banner.png'), 200, $this->application);
        }
        return $response;
    }

}
