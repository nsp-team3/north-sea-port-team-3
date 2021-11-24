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

    public static function search($request)
    {
        $validData = SearchResource::validate($request);
        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', "https://www.myshiptracking.com/requests/autocomplete.php?req=" . $validData['query'] . "&res=all");
        return $response->getBody();
    }

    private static function validate($request)
    {
        return $request->validate([
            'query' => ['required', 'string', 'min:1', 'max:255']
        ]);
    }
}
