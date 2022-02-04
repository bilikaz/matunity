<?php
declare(strict_types=1);

namespace App\Library\Api\Filter;

use Exception;

use App\Library\Repository\AbstractRepository;

class ValidIdFilter implements FilterInterface
{

    private $abstractRepository;

    public function __construct( AbstractRepository $abstractRepository ) {
        $this->abstractRepository = $abstractRepository;
    }

    public function filter($value, array $values)
    {
        try {

            if( $this->abstractRepository->getById($value, true) ) {
                return $value;
            }

        } catch (Exception $e) {
            throw new Exception('Corresponding object was not found.');
        }
        
    }

}
