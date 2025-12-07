import type { CharacterType, CharacterCreateData, CharacterUpdateData, ApiResponse } from "@/types/CharactersType.tsx"

const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080"
const ADMIN_CHARACTERS_ENDPOINT = `${API_BASE_URL}/admin/characters`

const getAuthHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
  }
}

export const getCharacters = async (): Promise<CharacterType[]> => {
  try {
    const response = await fetch(ADMIN_CHARACTERS_ENDPOINT, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch characters: ${response.statusText}`)
    }

    const result: ApiResponse<CharacterType[]> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to fetch characters")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching characters:", error)
    throw error
  }
}

export const getCharacterById = async (id: number): Promise<CharacterType> => {
  try {
    const response = await fetch(`${ADMIN_CHARACTERS_ENDPOINT}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch character: ${response.statusText}`)
    }

    const result: ApiResponse<CharacterType> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || "Character not found")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching character:", error)
    throw error
  }
}

export const createCharacter = async (data: CharacterCreateData): Promise<CharacterType> => {
  try {
    const formData = new FormData()
    formData.append('name', data.name)
    
    if (data.avatarFile) {
      formData.append('avatarFile', data.avatarFile)
    }
    
    if (data.description) {
      formData.append('description', data.description)
    }
    
    if (data.voicePreset) {
      formData.append('voicePreset', data.voicePreset)
    }

    const response = await fetch(ADMIN_CHARACTERS_ENDPOINT, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
      },
      credentials: "include",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to create character: ${response.statusText}`)
    }

    const result: ApiResponse<CharacterType> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to create character")
    }

    return result.data
  } catch (error) {
    console.error("Error creating character:", error)
    throw error
  }
}

export const updateCharacter = async (id: number, data: CharacterUpdateData & { avatarFile?: File }): Promise<CharacterType> => {
  try {
    let body: FormData | string
    let headers: HeadersInit

    if (data.avatarFile) {
      const formData = new FormData()
      formData.append('name', data.name || '')
      if (data.description) formData.append('description', data.description)
      if (data.voicePreset) formData.append('voicePreset', data.voicePreset)
      formData.append('avatarFile', data.avatarFile)
      
      body = formData
      headers = {
        'Accept': 'application/json',
      }
    } else {
      body = JSON.stringify(data)
      headers = getAuthHeaders()
    }

    const response = await fetch(`${ADMIN_CHARACTERS_ENDPOINT}/${id}`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body,
    })

    if (!response.ok) {
      throw new Error(`Failed to update character: ${response.statusText}`)
    }

    const result: ApiResponse<CharacterType> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to update character")
    }

    return result.data
  } catch (error) {
    console.error("Error updating character:", error)
    throw error
  }
}

export const deleteCharacter = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${ADMIN_CHARACTERS_ENDPOINT}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete character: ${response.statusText}`)
    }

    const result: ApiResponse<void> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to delete character")
    }
  } catch (error) {
    console.error("Error deleting character:", error)
    throw error
  }
}