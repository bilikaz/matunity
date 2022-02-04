<?php
declare(strict_types=1);

namespace App\Block\UserController\Blocks;

use App\Library\Api\Controller,
    App\Library\Api\Request\Mapper\Entity\BasicRequestEntity,
    App\Library\Api\Exception\EntityNotFoundException,
    App\Block\Model\Block,
    App\Block\Exception\UnsuportedEncodingException,
    App\Library\Api\Response\PngResponse;

class ImageController extends Controller
{

    public function get(Block $blockModel, string $encoding)
    {
        if ($encoding != 'png') {
            throw new UnsuportedEncodingException();
        }
        $response = new PngResponse();
        if ($blockModel->content) {
            $response->setResponse(base64_decode(preg_replace('/data:image\/[^;]+;base64,/', '', $blockModel->content, 22)), 200, $this->application);
        } elseif ($blockModel->owner) {
            $response->setResponse(file_get_contents(WEB_PATH . 'static/under.png'), 200, $this->application);
        } else {
            $response->setResponse(file_get_contents(WEB_PATH . 'static/block.png'), 200, $this->application);
        }
        return $response;
    }

}
