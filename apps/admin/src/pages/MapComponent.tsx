import { useState, useEffect, useRef } from "react"
import { Icon } from "@iconify/react"

interface RoutePoint {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  order: number
}

interface MapComponentProps {
  points: RoutePoint[]
  onMapClick: (lat: number, lng: number) => void
}

export default function MapComponent({ points, onMapClick }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  // Zakres współrzędnych dla Polski/Europy
  const minLat = 49.0
  const maxLat = 55.0
  const minLng = 14.0
  const maxLng = 25.0

  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        setMapSize({
          width: mapRef.current.offsetWidth,
          height: mapRef.current.offsetHeight,
        })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Konwersja współrzędnych geograficznych na pozycję pikselową
  const latLngToPixel = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * mapSize.width
    const y = mapSize.height - ((lat - minLat) / (maxLat - minLat)) * mapSize.height
    return { x, y }
  }

  // Konwersja pozycji pikselowej na współrzędne geograficzne
  const pixelToLatLng = (x: number, y: number) => {
    const lng = (x / mapSize.width) * (maxLng - minLng) + minLng
    const lat = maxLat - (y / mapSize.height) * (maxLat - minLat)
    return { lat, lng }
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return

    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect || mapSize.width === 0 || mapSize.height === 0) return

    const x = (e.clientX - rect.left - offset.x) / zoom
    const y = (e.clientY - rect.top - offset.y) / zoom

    const { lat, lng } = pixelToLatLng(x, y)
    onMapClick(lat, lng)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * delta)))
  }

  return (
    <div
      ref={mapRef}
      className="relative w-full h-full bg-muted overflow-hidden cursor-crosshair select-none"
      onClick={handleMapClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      />

      {points.map((point) => {
        const pos = latLngToPixel(point.lat, point.lng)
        return (
          <div
            key={point.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group z-20"
            style={{
              left: `${pos.x * zoom + offset.x}px`,
              top: `${pos.y * zoom + offset.y}px`,
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="relative">
              <Icon
                icon="solar:map-point-bold-duotone"
                className="h-8 w-8 text-primary drop-shadow-lg group-hover:text-primary/80 transition-colors"
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center -mt-1 shadow-md">
                {point.order}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-popover text-foreground px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm z-30 border border-border">
                <div className="font-semibold">{point.name}</div>
                {point.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {point.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-background rounded-lg shadow-lg p-2 border border-border z-30">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setZoom((prev) => Math.min(3, prev * 1.2))
          }}
          className="px-3 py-1 text-sm font-semibold hover:bg-accent rounded transition-colors"
        >
          +
        </button>
        <div className="text-xs text-center text-muted-foreground font-medium">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setZoom((prev) => Math.max(0.5, prev * 0.8))
          }}
          className="px-3 py-1 text-sm font-semibold hover:bg-accent rounded transition-colors"
        >
          −
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setOffset({ x: 0, y: 0 })
            setZoom(1)
          }}
          className="px-3 py-1 text-xs hover:bg-accent rounded mt-1 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="absolute top-4 left-4 bg-popover/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-30">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Kliknij</strong> na mapie, aby dodać punkt
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <strong className="text-foreground">Przeciągnij</strong> mapę, aby przesunąć
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <strong className="text-foreground">Kółko myszy</strong> do przybliżania
        </p>
      </div>
    </div>
  )
}
