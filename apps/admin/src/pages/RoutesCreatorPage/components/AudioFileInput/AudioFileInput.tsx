import { useRef } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils.ts"

type AudioFileInputProps = {
  id: string
  file: File | null
  onFileChange: (file: File | null) => void
}

const AudioFileInput = ({ id, file, onFileChange }: AudioFileInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a']
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      const isValidType = validTypes.includes(selectedFile.type) ||
        ['mp3', 'wav', 'ogg', 'webm', 'm4a'].includes(fileExtension || '')

      if (!isValidType) {
        alert('Nieprawidłowy format pliku. Dozwolone formaty: MP3, WAV, OGG, WEBM, M4A')
        return
      }
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar: 10MB')
        return
      }
      onFileChange(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a']
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase()
      const isValidType = validTypes.includes(droppedFile.type) ||
        ['mp3', 'wav', 'ogg', 'webm', 'm4a'].includes(fileExtension || '')

      if (!isValidType) {
        alert('Nieprawidłowy format pliku. Dozwolone formaty: MP3, WAV, OGG, WEBM, M4A')
        return
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar: 10MB')
        return
      }
      onFileChange(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          file
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary hover:bg-primary/5"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="relative">
            <div className="flex items-center justify-center gap-3">
              <Icon icon="solar:music-note-bold-duotone" className="h-12 w-12 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div>
            <Icon icon="solar:upload-bold-duotone" className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Kliknij lub przeciągnij plik audio tutaj
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AudioFileInput
