<?php
require '../vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ParameterBag;
use Dompdf\Dompdf;
use Hashids\Hashids;

Request::setTrustedProxies(['172.31.0.0/16']);
$app = new Silex\Application();
$app['DEBUG'] = (getenv('DEBUG')?getenv('DEBUG'):false);
$server_name = strtolower($_SERVER['SERVER_NAME']);
$env = strpos($server_name, 'staging') ? 'dev' : 'prod';
$config = require('../config/'.$env.'.php');

$app->register(new Silex\Provider\DoctrineServiceProvider(), [
    'db.options' => [
        'driver'    => 'pdo_mysql',
        'host'      => $_SERVER['RDS_HOSTNAME'],
        'dbname'    => $_SERVER['RDS_DB_NAME'],
        'user'      => $_SERVER['RDS_USERNAME'],
        'password'  => $_SERVER['RDS_PASSWORD'],
        'charset'   => 'utf8',
    ]
]);

$app->before(function (Request $request) {
    if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
        $data = json_decode($request->getContent(), true);
        $request->request->replace(is_array($data) ? $data : array());
    }
});

$app['Hashids'] = new Hashids($config['hash_id']['salt'], $config['hash_id']['minlength'], $config['hash_id']['alphabet']);

$app->post('/', function (Request $request) use ($app, $config) {    
    $allowed = array(
        'xxx.xxx.xxx.xxx' // Array of allowed ip addresses        
    );
    if (!in_array($request->getClientIp(), $allowed) && false === strpos($request->getHost(), 'shorturl.local'))
        return $app->json(array('status' => 'ERROR', 'body' => 'Unauthorized Acccess'), 401);
    try {
        $app['db']->insert('short_link', array('url' => $request->request->get('url')));
    } catch (\Exception $e) {
        return $app->json(array('status' => 'ERROR', 'body' => $e->getMessage()), 500);
    }
        
    $hash = $app['Hashids']->encode($app['db']->lastInsertId());
    $data = array('short_url' => $config['short_link_domain'].'/'.$hash);
    
    return $app->json(array('status' => 'OK', 'body' => $data), 200);
});

$app->error(function (\Exception $e, Request $request, $code) use ($app, $config) {
    $uri = $request->getRequestUri();
    $arr = $app['Hashids']->decode(trim($uri, " \t\n\r\0\x0B/"));    
    if (count($arr) === 1 && is_numeric($arr[0])) {
        $id = (int)$arr[0];
        if ($id !== 0) {
            $url = $app['db']->fetchColumn('SELECT `url` FROM `short_link` WHERE `id` = ?', array($id));
            if (!empty($url)) {
                return $app->redirect($url, 301);
            }
        }
    }
    
    $error = file_get_contents('404.html');
    return new Response($error, 404);  
});

$app->run();