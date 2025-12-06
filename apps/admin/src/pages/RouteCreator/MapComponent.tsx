import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import "leaflet-routing-machine"
import { Icon } from "@iconify/react"

interface RoutePoint {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  order: number
  hasCustomAudio: boolean
  audioFile: File | null
  characterName: string
  dialog: string
}

interface MapComponentProps {
  points: RoutePoint[]
  onMapClick: (lat: number, lng: number) => void
  markerIconUrl?: string | null
  onRouteDistanceChange?: (distanceKm: number) => void
  onMarkerMove?: (pointId: string, lat: number, lng: number) => void
  onMarkerDelete?: (pointId: string) => void
  selectedPointId?: string | null
}

// Fix for default marker icons in Leaflet with Vite
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"
import iconRetina from "leaflet/dist/images/marker-icon-2x.png"

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Function to create icon with number badge
function createIconWithNumber(baseIcon: L.Icon, order: number, isSelected: boolean = false): L.DivIcon {
  // Get icon size from base icon - handle both array and PointExpression types
  const iconSizeValue = baseIcon.options.iconSize
  const baseIconSize: [number, number] = Array.isArray(iconSizeValue) 
    ? [iconSizeValue[0], iconSizeValue[1]]
    : [25, 41]
  
  // Make selected marker larger
  const iconSize: [number, number] = isSelected
    ? [baseIconSize[0] * 1.4, baseIconSize[1] * 1.4]
    : baseIconSize
  
  const iconAnchorValue = baseIcon.options.iconAnchor
  const baseIconAnchor: [number, number] = Array.isArray(iconAnchorValue)
    ? [iconAnchorValue[0], iconAnchorValue[1]]
    : [12, 41]
  
  // Adjust anchor for larger selected marker
  const iconAnchor: [number, number] = isSelected
    ? [baseIconAnchor[0] * 1.4, baseIconAnchor[1] * 1.4]
    : baseIconAnchor
  
  const popupAnchorValue = baseIcon.options.popupAnchor
  const popupAnchor: [number, number] = Array.isArray(popupAnchorValue)
    ? [popupAnchorValue[0], popupAnchorValue[1]]
    : [0, -iconSize[1]]
  
  // Selected marker styling
  const borderStyle = isSelected
    ? `border: 3px solid #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 4px 8px rgba(0,0,0,0.3);`
    : `box-shadow: 0 2px 4px rgba(0,0,0,0.2);`
  
  const animationStyle = isSelected
    ? `animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;`
    : ``
  
  // Create a div icon with the base icon image and a number badge
  return L.divIcon({
    html: `
      <style>
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      </style>
      <div style="position: relative; width: ${iconSize[0]}px; height: ${iconSize[1]}px; ${animationStyle}">
        <img 
          src="${baseIcon.options.iconUrl}" 
          style="width: ${iconSize[0]}px; height: ${iconSize[1]}px; ${borderStyle} border-radius: ${isSelected ? '8px' : '0'};"
          alt="Marker"
        />
        <div style="
          position: absolute;
          top: -4px;
          left: -4px;
          width: ${isSelected ? '22px' : '18px'};
          height: ${isSelected ? '22px' : '18px'};
          background-color: ${isSelected ? '#2563eb' : '#3b82f6'};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '12px' : '10px'};
          font-weight: bold;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 1000;
        ">${order}</div>
      </div>
    `,
    className: `custom-marker-with-number ${isSelected ? 'selected-marker' : ''}`,
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor,
  })
}

// Draggable marker component with click-to-select, drag-to-move functionality
function DraggableMarker({
  point,
  icon,
  isSelected,
  onMarkerMove,
  onMarkerDelete,
}: {
  point: RoutePoint
  icon: L.Icon
  isSelected?: boolean
  onMarkerMove?: (pointId: string, lat: number, lng: number) => void
  onMarkerDelete?: (pointId: string) => void
}) {
  // Create icon with number badge - update when selection changes
  const iconWithNumber = createIconWithNumber(icon, point.order, isSelected)
  const [isDragEnabled, setIsDragEnabled] = useState(false)
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Handle marker click - first click shows popup, second enables dragging
  const handleClick = (e: L.LeafletMouseEvent) => {
    e.originalEvent.stopPropagation()
    
    // Clear any pending timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
      // Second click within timeout - enable dragging
      setIsDragEnabled(true)
      if (markerRef.current) {
        markerRef.current.setOpacity(0.7)
      }
    } else {
      // First click - set timeout to enable dragging on second click
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null
      }, 500) // 500ms window for second click
    }
  }

  // Handle drag end to update position
  const handleDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target as L.Marker
    const newLat = marker.getLatLng().lat
    const newLng = marker.getLatLng().lng
    if (onMarkerMove) {
      onMarkerMove(point.id, newLat, newLng)
    }
    setIsDragEnabled(false) // Disable dragging after move
    marker.setOpacity(1)
  }

  // Handle when marker is added to map
  const handleMarkerAdd = (e: L.LeafletEvent) => {
    markerRef.current = e.target as L.Marker
  }

  // Update dragging state when isDragEnabled changes
  useEffect(() => {
    if (markerRef.current) {
      if (isDragEnabled) {
        markerRef.current.dragging?.enable()
      } else {
        markerRef.current.dragging?.disable()
      }
    }
  }, [isDragEnabled])

  // Update icon when selection changes
  useEffect(() => {
    if (markerRef.current) {
      const newIcon = createIconWithNumber(icon, point.order, isSelected)
      markerRef.current.setIcon(newIcon)
    }
  }, [isSelected, icon, point.order])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  return (
    <Marker
      position={[point.lat, point.lng]}
      icon={iconWithNumber}
      draggable={isDragEnabled}
      eventHandlers={{
        click: handleClick,
        dragend: handleDragEnd,
        add: handleMarkerAdd,
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">
                {point.order}. {point.name}
              </div>
              {point.description && (
                <div className="text-xs text-gray-600 mb-1">
                  {point.description}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
              </div>
            </div>
            {onMarkerDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm(`Czy na pewno chcesz usunąć punkt "${point.name}"?`)) {
                    onMarkerDelete(point.id)
                  }
                }}
                className="shrink-0 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Usuń punkt"
              >
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4" />
              </button>
            )}
          </div>
          {isDragEnabled && (
            <div className="text-xs text-blue-600 mt-2 font-medium pt-2 border-t border-gray-200">
              Przeciągnij, aby przesunąć
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  const map = useMap()

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    }

    map.on("click", handleClick)
    return () => {
      map.off("click", handleClick)
    }
  }, [map, onMapClick])

  return null
}

// Component to fit map bounds to show all points
function MapBounds({ points }: { points: RoutePoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(
        points.map((point) => [point.lat, point.lng] as [number, number])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, points])

  return null
}

// Component to focus on selected point
function FocusOnSelectedPoint({ 
  selectedPoint
}: { 
  selectedPoint: RoutePoint | null
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedPoint) {
      // Smoothly pan and zoom to selected point
      map.setView(
        [selectedPoint.lat, selectedPoint.lng],
        Math.max(map.getZoom(), 16), // Zoom in at least to level 16
        { animate: true, duration: 0.5 }
      )
    }
  }, [map, selectedPoint])

  return null
}

// Component to handle routing between points
function RouteRenderer({ 
  points, 
  onRouteDistanceChange 
}: { 
  points: RoutePoint[]
  onRouteDistanceChange?: (distanceKm: number) => void
}) {
  const map = useMap()
  const routingControlRef = useRef<L.Routing.Control | null>(null)

  useEffect(() => {
    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current)
      routingControlRef.current = null
    }

    // Reset distance if less than 2 points
    if (points.length < 2) {
      if (onRouteDistanceChange) {
        onRouteDistanceChange(0)
      }
      return
    }

    // Only create route if we have 2+ points
    const sortedPoints = [...points].sort((a, b) => a.order - b.order)
    const waypoints = sortedPoints.map(
      (point) => L.latLng(point.lat, point.lng)
    )

      // Create routing control with OSRM (free routing service)
      // Using walking profile for pedestrian routes
      const routingControl = L.Routing.control({
        waypoints: waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "foot", // Use 'foot' profile for walking/pedestrian routes
        }),
        lineOptions: {
          styles: [
            {
              color: "#3b82f6",
              opacity: 0.8,
              weight: 5,
            },
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        } as L.Routing.LineOptions,
        addWaypoints: false, // Don't allow adding waypoints via UI
        fitSelectedRoutes: false, // Don't auto-fit (we handle bounds separately)
        showAlternatives: false, // Don't show alternative routes
        routeWhileDragging: false,
        createMarker: () => null, // Don't create default markers (we use our own)
      } as any) // Type assertion to avoid TypeScript issues with routing machine types

    // Listen for route calculation to get actual distance
    routingControl.on('routesfound', (e: any) => {
      if (e.routes && e.routes.length > 0) {
        const route = e.routes[0]
        // OSRM returns distance in meters, convert to kilometers
        const distanceKm = route.summary.totalDistance / 1000
        if (onRouteDistanceChange) {
          onRouteDistanceChange(distanceKm)
        }
      }
    })

    routingControl.addTo(map)
    routingControlRef.current = routingControl

    // Cleanup
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
    }
  }, [map, points, onRouteDistanceChange])

  return null
}

export default function MapComponent({
  points,
  onMapClick,
  markerIconUrl,
  onRouteDistanceChange,
  onMarkerMove,
  onMarkerDelete,
  selectedPointId,
}: MapComponentProps) {
  // Create custom icon if markerIconUrl is provided
  const customIcon = markerIconUrl
    ? L.icon({
        iconUrl: markerIconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })
    : DefaultIcon

  // Default center (Bydgoszcz, Poland)
  const defaultCenter: [number, number] = [53.1235, 18.0084]
  const defaultZoom = 13

  // Get center from points if available, otherwise use default
  const center: [number, number] =
    points.length > 0
      ? [points[0].lat, points[0].lng]
      : defaultCenter

  // Find selected point
  const selectedPoint = selectedPointId
    ? points.find(p => p.id === selectedPointId) || null
    : null

  return (
    <div className="w-full h-full relative" style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={onMapClick} />
        <MapBounds points={points} />
        <FocusOnSelectedPoint selectedPoint={selectedPoint} />
        <RouteRenderer points={points} onRouteDistanceChange={onRouteDistanceChange} />

        {/* Markers for each point */}
        {points
          .sort((a, b) => a.order - b.order)
          .map((point) => (
            <DraggableMarker
              key={point.id}
              point={point}
              icon={customIcon}
              isSelected={selectedPointId === point.id}
              onMarkerMove={onMarkerMove}
              onMarkerDelete={onMarkerDelete}
            />
          ))}
      </MapContainer>

      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700 z-1000">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong className="text-gray-900 dark:text-gray-100">Kliknij</strong> na mapie, aby dodać punkt
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          <strong className="text-gray-900 dark:text-gray-100">Przeciągnij</strong> mapę, aby przesunąć
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          <strong className="text-gray-900 dark:text-gray-100">Kółko myszy</strong> do przybliżania
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          <strong className="text-gray-900 dark:text-gray-100">Kliknij 2x</strong> marker, aby przesunąć
        </p>
      </div>
    </div>
  )
}

