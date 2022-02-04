<?php
declare(strict_types=1);

namespace App\Banner\Response\Mapper;

use App\Library\Api\Response\Mapper\ResponseMapperInterface;

class BannerMapper implements ResponseMapperInterface
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
            'image' => $response->getDi()->get('config')->application->uri . 'banners/' . $array['banner_id'] . '/image/png' . $add,
            'content' => $array['content'],
            'banner_attributes' => [
                'banner_id' => $array['banner_id'],
                'owner' => $array['owner'],
                'timestamp_lifetime' => $array['timestamp_lifetime'],
                'timestamp_minted' => $array['timestamp_minted'],
            ]
        ];

        return $result;
    }

}
