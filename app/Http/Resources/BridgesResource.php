<?php

namespace App\Http\Resources;

use DOMDocument;
use DOMXPath;
use Exception;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonException;
use NumberFormatter;

class BridgesResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return parent::toArray($request);
    }

    public static function getBridges($request)
    {
        $client = new \GuzzleHttp\Client();
        try {
            $response = $client->request('POST', "https://waterkaart.net/items/php/dbase_ophalen.php", [
                'body' => $request->getContent(),
                'headers' => [
                    "accept" => "*/*",
                    "accept-language" => "en-US,en;q=0.9",
                    "content-type" => "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-fetch-dest" => "empty",
                    "sec-fetch-mode" => "cors",
                    "sec-fetch-site" => "same-origin",
                    "sec-gpc" => "1",
                    "x-requested-with" => "XMLHttpRequest",
                    "Referer" => "https://waterkaart.net/gids/brug-en-sluistijden.php",
                    "Referrer-Policy" => "strict-origin-when-cross-origin"
                ]
            ]);
        } catch (Exception $e) {
            return json_encode([
                "error" => "Could not get bridges"
            ]);
        }

        return $response->getBody(); //json
    }

    public static function detailed($request)
    {
        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', "https://waterkaart.net/items/php/bruggen-en-sluizen-v2.php?". $request->getQueryString());
        return $response->getBody();
    }
}
