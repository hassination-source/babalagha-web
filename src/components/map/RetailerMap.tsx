"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { IRAQ_BOUNDS, IRAQ_CENTER } from "@/lib/iraq";

export type MapPoint = { id: string; lat: number; lng: number; label: string; demo?: boolean };

/**
 * Leaflet + OpenStreetMap tiles. Leaflet is imported on the client only, after this component mounts,
 * so the map never blocks first paint. Tile URL can be swapped via NEXT_PUBLIC_MAP_TILE_URL
 * (e.g. a commercial provider) — keep the attribution in line with that provider's terms.
 */
export function RetailerMap({
  points,
  selectedId,
  onSelect,
  onPick,
  pickValue,
  className = "",
  ariaLabel,
  interactive = true,
}: {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Admin coordinate picker: called with the clicked position. */
  onPick?: (lat: number, lng: number) => void;
  pickValue?: { lat: number; lng: number } | null;
  className?: string;
  ariaLabel: string;
  interactive?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const pickMarker = useRef<Marker | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  const onPickRef = useRef(onPick);
  onSelectRef.current = onSelect;
  onPickRef.current = onPick;

  // init
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !el.current || map.current) return;
      L.current = leaflet;
      const m = leaflet.map(el.current, {
        center: IRAQ_CENTER,
        zoom: 6,
        minZoom: 5,
        maxBounds: leaflet.latLngBounds(IRAQ_BOUNDS).pad(0.25),
        scrollWheelZoom: false,
        zoomControl: interactive,
        dragging: interactive,
        attributionControl: true,
      });
      m.fitBounds(IRAQ_BOUNDS);
      leaflet
        .tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(m);
      m.on("focus", () => m.scrollWheelZoom.enable());
      m.on("blur", () => m.scrollWheelZoom.disable());
      m.on("click", (e) => onPickRef.current?.(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))));
      layer.current = leaflet.layerGroup().addTo(m);
      map.current = m;
      renderMarkers();
      renderPick();
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markers.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function icon(active: boolean, demo?: boolean) {
    const leaflet = L.current!;
    return leaflet.divIcon({
      className: "ba-marker-wrap",
      html: `<div class="ba-marker${active ? " is-active" : ""}${demo ? " is-demo" : ""}"></div>`,
      iconSize: [30, 38],
      iconAnchor: [15, 38],
    });
  }

  function renderMarkers() {
    const leaflet = L.current;
    const m = map.current;
    if (!leaflet || !m || !layer.current) return;
    layer.current.clearLayers();
    markers.current.clear();
    for (const p of points) {
      const mk = leaflet
        .marker([p.lat, p.lng], { icon: icon(p.id === selectedId, p.demo), title: p.label, alt: p.label, keyboard: true })
        .on("click", () => onSelectRef.current?.(p.id));
      mk.addTo(layer.current);
      markers.current.set(p.id, mk);
    }
    if (points.length && !onPick) {
      const b = leaflet.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
      m.fitBounds(b.pad(0.3), { maxZoom: 12 });
    } else if (!onPick) {
      m.fitBounds(IRAQ_BOUNDS);
    }
  }

  function renderPick() {
    const leaflet = L.current;
    const m = map.current;
    if (!leaflet || !m) return;
    pickMarker.current?.remove();
    pickMarker.current = null;
    if (pickValue) {
      pickMarker.current = leaflet.marker([pickValue.lat, pickValue.lng], { icon: icon(true) }).addTo(m);
      m.setView([pickValue.lat, pickValue.lng], Math.max(m.getZoom(), 12));
    }
  }

  useEffect(renderMarkers, // eslint-disable-next-line react-hooks/exhaustive-deps
    [points]);
  useEffect(renderPick, // eslint-disable-next-line react-hooks/exhaustive-deps
    [pickValue?.lat, pickValue?.lng]);

  // highlight + pan to selection
  useEffect(() => {
    const m = map.current;
    if (!m || !L.current) return;
    for (const p of points) markers.current.get(p.id)?.setIcon(icon(p.id === selectedId, p.demo));
    const sel = points.find((p) => p.id === selectedId);
    if (sel) m.flyTo([sel.lat, sel.lng], Math.max(m.getZoom(), 13), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={el} role="region" aria-label={ariaLabel} className={`relative z-0 ${className}`} />;
}
