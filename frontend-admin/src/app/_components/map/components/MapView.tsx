import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import * as L from 'leaflet';
import { BusStopData } from '../busMap';

interface MapViewProps {
  mapCenter: L.LatLngTuple;
  busStops: BusStopData[];
  selectedBusStop: BusStopData | null;
  currentBusStop: BusStopData | null;
  isCreatingBusStop: boolean;
  createBusStopIcon: ({ color }: { color: string }) => L.DivIcon;
  onMapClick: (latlng: L.LatLng) => void;
  onSelectBusStop: (busStop: BusStopData) => void;
  viewMode: 'all' | 'selected';
}

// Click handler component
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

const MapView = ({
  mapCenter,
  busStops,
  selectedBusStop,
  currentBusStop,
  isCreatingBusStop,
  createBusStopIcon,
  onMapClick,
  onSelectBusStop,
  viewMode
}: MapViewProps) => {
  // Quyết định hiển thị điểm dừng nào
  const visibleStops = viewMode === 'all' 
    ? busStops 
    : busStops.filter(stop => selectedBusStop && stop._id === selectedBusStop._id);

  return (
    <MapContainer
      center={mapCenter}
      zoom={15.5}
      style={{ height: '100%', width: '100%' }}
      maxBounds={[
        [10.830000, 106.830000], // Tọa độ góc dưới bên trái
        [10.850000, 106.860000]  // Tọa độ góc trên bên phải
      ]}
      maxBoundsViscosity={1.0}
      minZoom={16}
      maxZoom={19}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {visibleStops.map((stop) => (
        <Marker
          key={stop._id || stop.id}
          position={stop.position}
          icon={createBusStopIcon({ color: stop.color })}
          eventHandlers={{
            click: () => onSelectBusStop(stop)
          }}
        >
          <Popup>
            <div className="font-semibold">{stop.name}</div>
            {stop.description && <div className="text-sm mt-1">{stop.description}</div>}
            <div className="text-xs text-gray-600 mt-1">{stop.address}</div>
          </Popup>
        </Marker>
      ))}
      
      {currentBusStop && !currentBusStop._id && (
        <Marker
          position={currentBusStop.position}
          icon={createBusStopIcon({ color: currentBusStop.color })}
        >
          <Popup>
            <div className="font-semibold">{currentBusStop.name || 'Điểm dừng mới'}</div>
          </Popup>
        </Marker>
      )}
      
      {isCreatingBusStop && <MapClickHandler onMapClick={onMapClick} />}
    </MapContainer>
  );
};

export default MapView;