// Mock do Leaflet para testes
export const L = {
  map: jest.fn(() => ({
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
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn()
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    setLatLng: jest.fn(),
    getLatLng: jest.fn(() => ({ lat: 0, lng: 0 }))
  })),
  icon: jest.fn(() => ({})),
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: jest.fn(),
        mergeOptions: jest.fn()
      },
      mergeOptions: jest.fn()
    }
  },
  latLng: jest.fn((lat, lng) => ({ lat, lng })),
  latLngBounds: jest.fn(() => ({
    extend: jest.fn(),
    getNorthEast: jest.fn(() => ({ lat: 1, lng: 1 })),
    getSouthWest: jest.fn(() => ({ lat: -1, lng: -1 }))
  })),
  control: {
    layers: jest.fn(() => ({
      addTo: jest.fn()
    }))
  }
};

export default L;
