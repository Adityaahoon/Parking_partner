import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Star, ArrowRight, MapPin, Zap } from 'lucide-react';
import { ParkingLocation } from '../../types';
import { AvailabilityBadge } from '../common/AvailabilityBadge';

interface ParkingMapProps {
  locations: ParkingLocation[];
  selectedLocation?: ParkingLocation | null;
  onSelectLocation?: (location: ParkingLocation) => void;
  center?: [number, number];
  zoom?: number;
}

// Controller component to smoothly pan/zoom to selected location
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const ParkingMap: React.FC<ParkingMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  center = [13.0405, 80.2450], // Default Chennai Center
  zoom = 12,
}) => {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.latitude, selectedLocation.longitude]);
      setMapZoom(14);
    }
  }, [selectedLocation]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(coords);
          setMapZoom(14);
        },
        (err) => {
          console.warn('Geolocation error:', err);
        }
      );
    }
  };

  // Create custom DivIcon for each parking location
  const createPriceIcon = (location: ParkingLocation, isSelected: boolean) => {
    let colorClass = 'marker-available';
    if (location.available_slots === 0) {
      colorClass = 'marker-full';
    } else if (location.available_slots <= 5) {
      colorClass = 'marker-limited';
    }

    const htmlString = `
      <div class="custom-price-marker ${colorClass} ${
        isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 scale-110' : ''
      }">
        <span>₹${location.hourly_rate}</span>
      </div>
    `;

    return L.divIcon({
      html: htmlString,
      className: 'custom-leaflet-marker',
      iconSize: [54, 28],
      iconAnchor: [27, 14],
      popupAnchor: [0, -16],
    });
  };

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden shadow-inner border border-slate-200/80 bg-slate-100">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Clean, Modern OpenStreetMap CartoDB Positron Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {locations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createPriceIcon(loc, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectLocation) onSelectLocation(loc);
                },
              }}
            >
              {/* Compact Marker Popup Card */}
              <Popup className="custom-popup" closeButton={false}>
                <div className="p-1 max-w-xs text-slate-900 font-sans">
                  <div className="relative h-24 rounded-lg overflow-hidden mb-2 bg-slate-100">
                    <img
                      src={loc.image_url}
                      alt={loc.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <AvailabilityBadge
                        availableSlots={loc.available_slots}
                        totalSlots={loc.total_slots}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {loc.name}
                    </h4>
                    <div className="flex items-center text-xs font-bold text-amber-600 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500 mr-0.5" />
                      {loc.rating}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {loc.address}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-base font-black text-slate-900">
                        ₹{loc.hourly_rate}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">/hr</span>
                    </div>

                    <button
                      onClick={() => navigate(`/parking/${loc.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition flex items-center gap-1 shadow-xs"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-white transition"
          title="Current Location"
          aria-label="Find my location"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-3 text-xs font-semibold text-slate-700 hidden sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Full</span>
        </div>
      </div>
    </div>
  );
};
