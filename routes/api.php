<?php

use App\Http\Resources\PortResource;
use App\Http\Resources\SearchResource;
use App\Http\Resources\BridgesResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

/*
| informatie ophalen van havens: "/api/ports" via https://www.myshiptracking.com/ports/
| word gebruikt in /api/AIS.ts voor het ophalen van de havens voor elk schip wegens CORS restrictie
*/
Route::get('/ports', function (Request $request) {
    return PortResource::getPort($request);
});

/*
| informatie ophalen van schepen: "/api/search" via https://www.myshiptracking.com/requests/autocomplete.php
| word gebruikt in /api/AIS.ts voor het ophalen van schepen voor het zoekvenster wegens CORS restrictie
*/
Route::get('/search', function (Request $request) {
    return SearchResource::search($request);
});

/*
| informatie ophalen van bruggen: "/api/bridges" via https://waterkaart.net/items/php/dbase_ophalen.php
| word gebruikt in /layers/bridgelayers voor bruggen ophalen wegens CORS restrictie
*/
Route::post('/bridges/', function (Request $request) {
    return BridgesResource::getBridges($request);
});

/*
| gedetaileerde informatie ophalen van bruggen: "/api/bridges" via https://waterkaart.net/items/php/bruggen-en-sluizen-v2.php
| word gebruikt in /layers/bridgelayers voor foto van de brug wegens CORS restrictie
*/
Route::get('/detailedbridge', function (Request $request) {
    return BridgesResource::detailed($request);
});

Route::get('/bridgeadministration/{id}', function ($id) {
    return BridgesResource::administration($id);
});

// CORS: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
