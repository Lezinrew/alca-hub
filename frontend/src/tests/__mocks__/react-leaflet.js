// Mock do react-leaflet para testes
import React from 'react';

export const MapContainer = ({ children, ...props }) => (
  <div data-testid="map-container" {...props}>
    {children}
  </div>
);

export const TileLayer = ({ ...props }) => (
  <div data-testid="tile-layer" {...props} />
);

export const Marker = ({ children, ...props }) => (
  <div data-testid="marker" {...props}>
    {children}
  </div>
);

export const Popup = ({ children, ...props }) => (
  <div data-testid="popup" {...props}>
    {children}
  </div>
);

export const useMap = () => ({
  setView: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  invalidateSize: jest.fn(),
  getBounds: jest.fn(() => ({
    getNorthEast: jest.fn(() => ({ lat: 1, lng: 1 })),
    getSouthWest: jest.fn(() => ({ lat: -1, lng: -1 }))
  }))
});

export const useMapEvents = () => ({});

export default {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
};
