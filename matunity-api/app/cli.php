<?php
declare(strict_types=1);

use Phalcon\DI\FactoryDefault,
    Phalcon\Di\FactoryDefault\Cli,
	Phalcon\CLI\Console;

use Library\Response\Handler as ResponseHandler,
    Library\Resolver;

error_reporting(E_ALL);
ini_set('display_errors', '1');

define('BASE_PATH', realpath(__DIR__.'/..') . '/');
define('WEB_PATH', BASE_PATH . 'public_html/');

if (isset($_SERVER['APPLICATION_ENV']) && in_array($_SERVER['APPLICATION_ENV'], ['development', 'testing', 'production'])) {
    define('ENVIRONMENT', $_SERVER['APPLICATION_ENV']);
} else {
    define('ENVIRONMENT', 'production');
}

$di = new Cli();

include(BASE_PATH . 'app/bootstrap.php');

$console = new Console();
$console->setDI($di);

$params = ['uri' => ''];
foreach ($argv as $k => $arg) {
    if ($k == 1) {
        $params['task'] = $arg;
    } elseif ($k == 2) {
        $params['action'] = $arg;
    } elseif ($k >= 3) {
        $params['params'][] = $arg;
    }
}

$console->handle($params);
print_r($di->getShared('dispatcher')->getReturnedValue());


function dd($var) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: *');
    print_r($var); exit();
}
