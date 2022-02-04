<?php
declare(strict_types=1);

namespace App\Block\Exception;

use App\Library\Api\Exception\ApiException;

class UnsuportedEncodingException extends ApiException
{

    protected $responseCode = 500;
    protected $errorCode = 5006;
    protected $errorMessage = 'Unsuported encoding';

}
