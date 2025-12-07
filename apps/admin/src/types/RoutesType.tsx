export type RoutesObjectType = {
    pathId: string,
    id?: number, // Numeric ID from database for API calls
    title: string,
    shortDescription: string,
    longDescription: string,
    category: string,
    totalTimeMinutes: number,
    difficulty: string,
    distanceMeters: number,
    thumbnailUrl: string,
    isPublished: boolean,
    stylePreset: string,
    makerIconUrl: string,
    createBy:string,
    createdAt: number
    updatedAt: number,
    stops: RouteStopType[],
    pointsCount?: number // Number of points from API
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