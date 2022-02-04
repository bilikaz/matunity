<?php
declare(strict_types=1);

namespace App\Block\Response\Mapper;

use App\Library\Api\Response\Mapper\ResponseMapperInterface;

class BlockMapper implements ResponseMapperInterface
{

    public function mapResponse($response)
    {
        $array = $response->toArray();

        $add = '';
        if ($array['timestamp_updated']) {
            $add = '?' . $array['timestamp_updated'];
        } elseif ($array['timestamp_minted']) {
            $add = '?' . $array['timestamp_minted'];
        }

        $result = [
            'name' => $array['name'],
            'description' => $array['description'],
            'image' => $response->getDi()->get('config')->application->uri . 'blocks/' . $array['block_id'] . '/image/png' . $add,
            'content' => $array['content'],
            'block_attributes' => [
                'block_id' => $array['block_id'],
                'owner' => $array['owner'],
                'earned' => $array['earned'],
                'claimed' => $array['claimed'],
                'timestamp_minted' => $array['timestamp_minted'],
            ]
        ];

        return $result;
    }

}
