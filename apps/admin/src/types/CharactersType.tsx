export type CharacterType = {
    id: string,
    name: string,
    avatar: File,
    createdBy: string,
    createdAt: string,
    lastModifiedAt: string,
    deafultPosition: {
        latitude: number,
        longitude: number,
        description: string
    }
}