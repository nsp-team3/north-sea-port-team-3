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

    public static function getPort($request)
    {
        $validData = PortResource::validateRequest($request);
       
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

        preg_match('/<td class="vessels_table_key">Country<\/td><td>\[(.*?)\] (.*?)<\/td>/', $body, $countryMatch);
        preg_match('/<td class="vessels_table_key">Longitude<\/td><td>(.*?)°<\/td>/', $body, $longitudeMatch);
        preg_match('/<td class="vessels_table_key">Latitude<\/td><td>(.*?)°<\/td>/', $body, $latitudeMatch);
        preg_match('/<td class="vessels_table_key">Name<\/td><td><strong>(.*?)<\/strong><\/td>/', $body, $nameMatch);
        preg_match('/<td class="vessels_table_key">Area size<\/td><td>(.*?)<\/td>/', $body, $sizeMatch);

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

    private static function validateRequest($request)
    {
        return $request->validate([
            'id' => ['required', 'integer']
        ]);
    }
}
