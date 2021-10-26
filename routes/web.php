<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('home');
});

Route::get('/search', function (Request $request) {
    $query = $request->getQueryString();
    $question = $request->getBaseUrl() . $request->getPathInfo() === '/' ? '/?' : '?';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://www.myshiptracking.com/requests/autocomplete.php" . $question . $query);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $urlContent = curl_exec($ch);
    if (!curl_errno($ch)) {
        $info = curl_getinfo($ch);
        header('Content-Type: ' . $info['content_type']);
        echo $urlContent;
    }
    curl_close($ch);
});
