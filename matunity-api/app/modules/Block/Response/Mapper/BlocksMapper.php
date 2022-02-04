<?php
declare(strict_types=1);

namespace App\Block\Response\Mapper;

use Phalcon\DI;

use App\Library\Api\Response\Mapper\ResponseMapperInterface;

class BlocksMapper implements ResponseMapperInterface
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
                'image' => $uri . 'blocks/' . $array['block_id'] . '/image/png' . $add,
                'content' => $array['content'],
                'block_attributes' => [
                    'block_id' => $array['block_id'],
                    'owner' => $array['owner'],
                    'earned' => $array['earned'],
                    'claimed' => $array['claimed'],
                    'timestamp_minted' => $array['timestamp_minted'],
                ]
            ];

            $rows[$row_id] = $result;
        }

        return $rows;
    }

}
