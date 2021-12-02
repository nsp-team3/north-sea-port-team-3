<?php

namespace App\Http\Resources;

use DOMDocument;
use DOMXPath;
use Exception;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonException;
use NumberFormatter;

class BrugTokenResource extends JsonResource
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

    public static function getToken($request)
    {
        $client = new \GuzzleHttp\Client();
        try {
            $response = $client->request('GET', "https://www.brug-open.nl/aisradar");
        } catch (Exception $e) {
            return json_encode([
                "error" => "Could not get bruggen"
            ]);
        }

        $body = $response->getBody();
        //$body = preg_replace('/\t+|\n+|\r+/', '', $body);

        preg_match('/<div id="map" token="(.*?)"/', $body, $token);

        return json_encode([
            "token" => $token[1]
        ]);
    }
}




