<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SearchResource extends JsonResource
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
     * Zoekt naar het zoekterm in de request naar schepen met die naam
     * en stuurt het antwoord direct door als return als een soort proxy,
     * dit moet wegens CORS restrictie.
     * @param  \Illuminate\Http\Request  $request de aanvraag
     */
    public static function search($request)
    {
        $validData = SearchResource::validate($request);
        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', "https://www.myshiptracking.com/requests/autocomplete.php?req=" . $validData['query'] . "&res=all");
        return $response->getBody();
    }

    /**
     * checkt de aanvraag of de benodigde items erin zitten
     * @param  \Illuminate\Http\Request  $request de aanvraag
     */
    private static function validate($request)
    {
        return $request->validate([
            'query' => ['required', 'string', 'min:1', 'max:255']
        ]);
    }
}
