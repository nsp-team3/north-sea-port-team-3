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

    /**
     * Haalt een lijst van bruggen op gebaseerd op de coordinaten in de body van de request
     * en stuurt het antwoord direct door als return als een soort proxy,
     * dit moet wegens CORS restrictie.
     * @param  \Illuminate\Http\Request  $request de aanvraag
     */
    public static function getBridges($request)
    {
        $client = new \GuzzleHttp\Client();
        try {
            $response = $client->request('POST', "https://waterkaart.net/items/php/dbase_ophalen.php", [
                'body' => $request->getContent(),
                'headers' => [
                    "Content-Type" => "application/x-www-form-urlencoded; charset=UTF-8",
                    "Referer" => "https://waterkaart.net/gids/brug-en-sluistijden.php",
                ]
            ]);
        } catch (Exception $e) {
            return json_encode([
                "error" => "Could not get bridges"
            ]);
        }

        return $response->getBody(); //json
    }

    /**
     * Haalt meer informatie van een brug op voor de brugfoto wanneer je op een brug klikt in de map
     * en stuurt het antwoord direct door als return als een soort proxy,
     * dit moet wegens CORS restrictie.
     * @param  \Illuminate\Http\Request  $request de aanvraag
     */
    public static function detailed($request)
    {
        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', "https://waterkaart.net/items/php/bruggen-en-sluizen-v2.php?". $request->getQueryString());
        return $response->getBody();
    }
}
