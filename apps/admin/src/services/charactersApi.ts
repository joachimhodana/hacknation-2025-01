import type { CharacterType, CharacterCreateData, CharacterUpdateData, ApiResponse } from "@/types/CharactersType.tsx"

const API_BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:8080"
const ADMIN_CHARACTERS_ENDPOINT = `${API_BASE_URL}/admin/characters`

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  // Get session token from better-auth
  // This will be handled by cookies automatically if using cookie-based auth
  // If using token-based auth, you might need to get it from authClient
  return {
    "Content-Type": "application/json",
  }
}

// Get all characters
export const getCharacters = async (): Promise<CharacterType[]> => {
  try {
    const response = await fetch(ADMIN_CHARACTERS_ENDPOINT, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include", // Include cookies for auth
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

// Get single character by ID
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

// Create new character
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
        // Don't set Content-Type header - browser will set it with boundary for FormData
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

// Update character
export const updateCharacter = async (id: number, data: CharacterUpdateData): Promise<CharacterType> => {
  try {
    const response = await fetch(`${ADMIN_CHARACTERS_ENDPOINT}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
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

// Delete character
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

// Upload avatar file and get URL
// Note: This assumes you have an endpoint for file uploads
// If not, you'll need to handle file upload separately
export const uploadAvatar = async (file: File): Promise<string> => {
  // TODO: Implement file upload endpoint
  // For now, return a placeholder or handle it differently
  // You might need to create a FormData and upload to a separate endpoint
  throw new Error("Avatar upload not implemented yet. Please implement file upload endpoint first.")
}
