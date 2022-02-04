<?php
declare(strict_types=1);

namespace App\Ankr\Exception;

use App\Library\Api\Exception\ApiException;

class BadResponseException extends ApiException
{

    protected $responseCode = 500;
    protected $errorCode = 5005;
    protected $errorMessage = 'Bad response from Ankr node';

}
