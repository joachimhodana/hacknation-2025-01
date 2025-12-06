// Type matching the API response from backend
export type CharacterType = {
    id: number,
    name: string,
    avatarUrl: string | null,
    description: string | null,
    voicePreset: string | null,
    createdBy: string,
    createdAt: string,
    updatedAt: string,
}

// Type for creating/updating character
export type CharacterCreateData = {
    name: string,
    avatarFile?: File,
    description?: string,
    voicePreset?: string,
}

export type CharacterUpdateData = {
    name?: string,
    avatarUrl?: string,
    description?: string,
    voicePreset?: string,
}

// API Response types
export type ApiResponse<T> = {
    success: boolean,
    data?: T,
    error?: string,
    message?: string,
}