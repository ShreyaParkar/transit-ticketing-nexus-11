
// Type definitions for Google Maps API

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
      panTo(latLng: LatLng | LatLngLiteral): void;
      panBy(x: number, y: number): void;
      setOptions(options: MapOptions): void;
      controls: MVCArray<Node>[];
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      setIcon(icon: string | Icon | Symbol): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: MVCObject): void;
      close(): void;
      setContent(content: string | Node): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng | null;
    }

    class Circle {
      constructor(opts?: CircleOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setRadius(radius: number): void;
      getRadius(): number;
      setMap(map: Map | null): void;
    }

    class Polyline {
      constructor(opts?: PolylineOptions);
      setPath(path: LatLng[] | LatLngLiteral[]): void;
      getPath(): MVCArray<LatLng>;
      setMap(map: Map | null): void;
      setOptions(options: PolylineOptions): void;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      toString(): string;
      toJSON(): LatLngLiteral;
      equals(other: LatLng): boolean;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface MVCArray<T> {
      clear(): void;
      getArray(): T[];
      getAt(i: number): T;
      getLength(): number;
      insertAt(i: number, elem: T): void;
      pop(): T;
      push(elem: T): number;
      removeAt(i: number): T;
      setAt(i: number, elem: T): void;
    }

    interface MVCObject {
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      fullscreenControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      styles?: MapTypeStyle[];
      clickableIcons?: boolean;
      draggable?: boolean;
      mapTypeControlOptions?: MapTypeControlOptions;
      heading?: number;
      tilt?: number;
    }

    interface PolylineOptions {
      path?: LatLng[] | LatLngLiteral[];
      geodesic?: boolean;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      map?: Map;
    }

    interface MapTypeControlOptions {
      position?: ControlPosition;
      style?: MapTypeControlStyle;
      mapTypeIds?: (MapTypeId | string)[];
    }

    enum ControlPosition {
      BOTTOM_CENTER,
      BOTTOM_LEFT,
      BOTTOM_RIGHT,
      LEFT_BOTTOM,
      LEFT_CENTER,
      LEFT_TOP,
      RIGHT_BOTTOM,
      RIGHT_CENTER,
      RIGHT_TOP,
      TOP_CENTER,
      TOP_LEFT,
      TOP_RIGHT
    }

    enum MapTypeControlStyle {
      DEFAULT,
      DROPDOWN_MENU,
      HORIZONTAL_BAR
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      label?: string | MarkerLabel;
      draggable?: boolean;
      clickable?: boolean;
      visible?: boolean;
      zIndex?: number;
      animation?: Animation;
      optimized?: boolean;
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      radius?: number;
      map?: Map;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
    }

    interface InfoWindowOptions {
      content?: string | Node;
      position?: LatLng | LatLngLiteral;
      maxWidth?: number;
      pixelOffset?: Size;
      zIndex?: number;
    }

    interface Icon {
      url: string;
      anchor?: Point;
      labelOrigin?: Point;
      origin?: Point;
      scaledSize?: Size;
      size?: Size;
    }

    interface Symbol {
      path: SymbolPath | string;
      anchor?: Point;
      fillColor?: string;
      fillOpacity?: number;
      labelOrigin?: Point;
      rotation?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface Point {
      x: number;
      y: number;
    }

    interface Size {
      height: number;
      width: number;
    }

    enum Animation {
      BOUNCE,
      DROP
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      CIRCLE,
      FORWARD_CLOSED_ARROW,
      FORWARD_OPEN_ARROW
    }

    type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

    interface MapTypeStyle {
      elementType?: string;
      featureType?: string;
      stylers?: Array<{ [key: string]: any }>;
    }

    interface MapMouseEvent {
      latLng: LatLng;
    }
  }
}
