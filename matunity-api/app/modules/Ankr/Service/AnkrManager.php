<?php
declare(strict_types=1);

namespace App\Ankr\Service;

use GuzzleHttp\Psr7\Request,
    GuzzleHttp\Psr7\Utils,
    GuzzleHttp\Client;

use App\Library\Service\AbstractService,
    App\Ankr\Exception\BadResponseException;


class AnkrManager extends AbstractService
{

    protected $apiUri;
    protected $contractAddress;
    protected $tokenDataFormat;
    protected $client = null;

    public function __construct(string $apiUri, string $contractAddress, array $tokenDataFormat)
    {
        $this->apiUri = $apiUri;
        $this->contractAddress = $contractAddress;
        $this->tokenDataFormat = $tokenDataFormat;
    }

    private function getClient(): Client
    {
        if (!isset($this->client)) {
            $this->client = new Client(['base_uri' => $this->apiUri]);
        }
        return $this->client;
    }

    public function getLogs(?int $fromBlock = null, ?int $toBlock = null): array
    {
        $body = [
            'jsonrpc' => '2.0',
            'method' => 'eth_getLogs',
            'params' => [
                [
                    'address' => $this->contractAddress,
                ]
            ],
            'id' => time() * 1000 + rand(1, 999)
        ];
        if ($fromBlock) {
            $body['params'][0]['fromBlock'] = '0x' . dechex($fromBlock);
        }
        if ($toBlock) {
            $body['params'][0]['toBlock'] = '0x' . dechex($toBlock);
        }
        $response = $this->getClient()->request('POST', '', [
            'timeout' => 30,
            'json' => $body
        ]);
        if ($response->getStatusCode() != 200) {
            throw new BadResponseException();
        }
        $data = json_decode($response->getBody()->getContents(), true);
        return $data['result'];
    }

    public function getCurrentBlock(): int
    {
        $body = [
            'jsonrpc' => '2.0',
            'method' => 'eth_blockNumber',
            'params' => [
            ],
            'id' => time() * 1000 + rand(1, 999)
        ];
        $response = $this->getClient()->request('POST', '', [
            'timeout' => 30,
            'json' => $body
        ]);
        if ($response->getStatusCode() != 200) {
            throw new BadResponseException();
        }
        $data = json_decode($response->getBody()->getContents(), true);
        return hexdec(substr($data['result'], 2));
    }

    public function getTokenData(int $blockId): array
    {
        $data = '0xa0f42fc4'; //getTokenData(uint256 _tokenId)
        $data .= str_pad(dechex($blockId), 64, '0', STR_PAD_LEFT);

        $body = [
            'jsonrpc' => '2.0',
            'method' => 'eth_call',
            'params' => [
                [
                    'to' => $this->contractAddress,
                    'data' => $data
                ], "latest"
            ],
            'id' => time() * 1000 + rand(1, 999)
        ];
        $response = $this->getClient()->request('POST', '', [
            'timeout' => 30,
            'json' => $body
        ]);
        if ($response->getStatusCode() != 200) {
            throw new BadResponseException();
        }
        $data = json_decode($response->getBody()->getContents(), true);
        $result = [];

        foreach ($this->tokenDataFormat as $id => $details) {
            if ($details['format'] == 'string') {
                $result[$details['field']] = $this->getStringFromResponse($data['result'], $id + 1);
            } elseif ($details['format'] == 'address') {
                $result[$details['field']] = $this->getAddressFromResponse($data['result'], $id + 1);
            } elseif ($details['format'] == 'int') {
                $result[$details['field']] = $this->getIntFromResponse($data['result'], $id + 1);
            } elseif ($details['format'] == 'decimal') {
                $result[$details['field']] = $this->getDecimalFromResponse($data['result'], $id + 1, $details['precision']);
            }
        }

        return $result;
    }

    public function getIntFromResponse(string $hexResponse, int $result = 1): int
    {
        $string = substr($hexResponse, 2);
        $string = substr($string, 64 * ($result - 1), 64);
        return hexdec(ltrim($string, '0'));
    }

    protected function hexToDec(string $hex): string
    {
        $dec = '0';
        $len = strlen($hex);
        for ($i = 1; $i <= $len; $i++) {
            $dec = bcadd($dec, bcmul(strval(hexdec($hex[$i - 1])), bcpow('16', strval($len - $i))));
        }
        return $dec;
    }

    public function getDecimalFromResponse(string $hexResponse, int $result = 1, int $precision = 16): string
    {
        $string = substr($hexResponse, 2);
        $string = substr($string, 64 * ($result - 1), 64);
        $string = ltrim($string, '0');
        $string = $this->hexToDec($string);
        $strint = str_pad($string, 18, '0', STR_PAD_LEFT);
        $string = substr($string, 0, -$precision) . '.' . substr($string, -$precision);
        $string = ltrim($string, '0');
        if (strlen($string) == $precision + 1) {
            $string = '0' . $string;
        }
        return $string;
    }

    public function getAddressFromResponse(string $hexResponse, int $result = 1): string
    {
        $string = substr($hexResponse, 2);
        $string = substr($string, 64 * ($result - 1), 64);
        return '0x' . substr($string, 24);
    }

    public function getStringFromResponse(string $hexResponse, int $result = 1): string
    {
        $line = $this->getIntFromResponse($hexResponse, $result) / 32;
        $length = $this->getIntFromResponse($hexResponse, $line + 1);
        $tmp = substr($hexResponse, 2 + 64 * ($line + 1), $length * 2);
        $result = '';
        for ($i=0; $i < $length; $i++) {
            $result .= chr(hexdec($tmp[$i * 2] . $tmp[$i * 2 + 1]));
        }
        return $result;
    }

}
