export type RoutesObjectType = {
    route_id: string,
    title: string,
    theme: string,
    category: string,
    total_time_minutes: number,
    difficulty: string,
    stops: RouteStopType[]
}

export type RouteStopType = {
    "stop_id": number,
    "name": string,
    "map_marker": {
        "display_name": string,
        "address": string,
        "coordinates": {
            "latitude": number,
            "longitude": number
        }
    },
    "place_description": string,
    "voice_over_text": string
}