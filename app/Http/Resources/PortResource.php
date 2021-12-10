<?php

namespace App\Http\Resources;

use DOMDocument;
use DOMXPath;
use Exception;
use Illuminate\Http\Resources\Json\JsonResource;
use JsonException;
use NumberFormatter;

class PortResource extends JsonResource
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
     * Haalt meer informatie op van een haven via het id meegegeven in de request
     * en en zet de gekregen data om naar json voor makkelijker gebruik,
     * dit moet wegens CORS restrictie.
     * @param  \Illuminate\Http\Request  $request de aanvraag
     */
    public static function getPort($request)
    {
        $validData = PortResource::validateRequest($request);

        // Haal info op van de api
        $client = new \GuzzleHttp\Client();
        try {
            $response = $client->request('GET', "https://www.myshiptracking.com/ports/id-" . $validData['id']);
        } catch (Exception $e) {
            return json_encode([
                "error" => "Could not find port with id: " . $validData['id']
            ]);
        }

        $body = $response->getBody();
        $body = preg_replace('/\t+|\n+|\r+/', '', $body);

        // Zoek naar informatie in de opgehaalde html
        preg_match('/<td class="vessels_table_key">Country<\/td><td>\[(.*?)\] (.*?)<\/td>/', $body, $countryMatch);
        preg_match('/<td class="vessels_table_key">Longitude<\/td><td>(.*?)°<\/td>/', $body, $longitudeMatch);
        preg_match('/<td class="vessels_table_key">Latitude<\/td><td>(.*?)°<\/td>/', $body, $latitudeMatch);
        preg_match('/<td class="vessels_table_key">Name<\/td><td><strong>(.*?)<\/strong><\/td>/', $body, $nameMatch);
        preg_match('/<td class="vessels_table_key">Area size<\/td><td>(.*?)<\/td>/', $body, $sizeMatch);

        // stuur de info gevonden in html als json door
        return json_encode([
            "id" => intval($validData['id']),
            "name" => $nameMatch[1],
            "countryCode" => $countryMatch[1],
            "country" => $countryMatch[2],
            "longitude" => doubleval($longitudeMatch[1]),
            "latitude" => doubleval($latitudeMatch[1]),
            "size" => $sizeMatch[1]
        ]);
    }

    /**
     * checkt de aanvraag of de benodigde items erin zitten
     * @param  \Illuminate\Http\Request  $request de aanvraag
     */
    private static function validateRequest($request)
    {
        return $request->validate([
            'id' => ['required', 'integer']
        ]);
    }
}
