<?php
declare(strict_types=1);

namespace App\Banner\Response\Mapper;

use Phalcon\DI;

use App\Library\Api\Response\Mapper\ResponseMapperInterface;

class BannersMapper implements ResponseMapperInterface
{

    public function mapResponse($response)
    {
        $rows = [];
        $uri = DI::getDefault()->get('config')->application->uri;

        foreach ($response as $row_id => $row) {
            $array = $row->toArray();

            $add = '';
            if ($array['timestamp_updated']) {
                $add = '?' . $array['timestamp_updated'];
            } elseif ($array['timestamp_minted']) {
                $add = '?' . $array['timestamp_minted'];
            }

            $result = [
                'name' => $array['name'],
                'description' => $array['description'],
                'image' => $uri . 'banners/' . $array['banner_id'] . '/image/png' . $add,
                'content' => $array['content'],
                'banner_attributes' => [
                    'banner_id' => $array['banner_id'],
                    'owner' => $array['owner'],
                    'timestamp_lifetime' => $array['timestamp_lifetime'],
                    'timestamp_minted' => $array['timestamp_minted'],
                ]
            ];

            $rows[$row_id] = $result;
        }

        return $rows;
    }

}
