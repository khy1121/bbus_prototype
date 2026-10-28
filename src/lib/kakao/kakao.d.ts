// 카카오맵 JS SDK 최소 타입 선언 (사용하는 API만)
declare namespace kakao.maps {
  function load(callback: () => void): void

  namespace services {
    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }
    class Geocoder {
      coord2RegionCode(
        lng: number,
        lat: number,
        callback: (
          result: { region_type: string; region_2depth_name: string; region_3depth_name: string }[],
          status: Status,
        ) => void,
      ): void
    }
  }

  namespace event {
    function addListener(target: unknown, type: string, handler: () => void): void
    function removeListener(target: unknown, type: string, handler: () => void): void
  }

  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class LatLngBounds {
    constructor()
    extend(latlng: LatLng): void
  }

  type MapOptions = { center: LatLng; level?: number; draggable?: boolean; scrollwheel?: boolean; disableDoubleClickZoom?: boolean }

  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    setCenter(latlng: LatLng): void
    setLevel(level: number): void
    setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void
    setDraggable(draggable: boolean): void
    setZoomable(zoomable: boolean): void
    relayout(): void
  }

  class CustomOverlay {
    constructor(options: { position: LatLng; content: HTMLElement | string; yAnchor?: number; xAnchor?: number; zIndex?: number; clickable?: boolean })
    setMap(map: Map | null): void
    setPosition(latlng: LatLng): void
    setZIndex(zIndex: number): void
    setContent(content: HTMLElement | string): void
  }

  class Polyline {
    constructor(options: { path: LatLng[]; strokeWeight?: number; strokeColor?: string; strokeOpacity?: number; strokeStyle?: string })
    setPath(path: LatLng[]): void
    setMap(map: Map | null): void
  }
}

interface Window {
  kakao?: typeof kakao
}
