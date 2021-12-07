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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/ports', function (Request $request) {
    return PortResource::getPort($request);
});

Route::get('/search', function (Request $request) {
    return SearchResource::search($request);
});

Route::post('/bridges/', function (Request $request) {
    return BridgesResource::getBridges($request);
});

Route::get('/detailedbridge', function (Request $request) {
    return BridgesResource::detailed($request);
});
