import axios from "axios";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

export default function useMapRoute(
  traceStart,
  traceEnd,
  showTrace,
  profile = "foot-hiking"
) {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!showTrace) return;
    setError(null);
    setSummary(null);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    const startLatLng = traceStart;
    const endLatLng = traceEnd;
    const start = [startLatLng[1], startLatLng[0]];
    const end = [endLatLng[1], endLatLng[0]];
    const center = [
      (startLatLng[0] + endLatLng[0]) / 2,
      (startLatLng[1] + endLatLng[1]) / 2,
    ];
    mapRef.current = L.map("map", { zoomControl: false }).setView(center, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);
    L.control.zoom({ position: "topright" }).addTo(mapRef.current);
    axios
      .post(
        `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
        {
          coordinates: [start, end],
          radiuses: [500000, 500000],
        },
        {
          headers: {
            Authorization: import.meta.env.VITE_ORS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        const geojson = res.data;
        if (!geojson || !geojson.features || geojson.features.length === 0) {
          setError("Aucun itinéraire trouvé entre ces deux points.");
          setSummary(null);
          return;
        }
        // Récupère les infos de résumé
        const feature = geojson.features[0];
        const summary = feature.properties.summary;
        let ascent = feature.properties.ascent;
        let descent = feature.properties.descent;
        // Si ascent/descent manquants, calcule à partir d'une API d'altitude
        if (typeof ascent !== "number" || typeof descent !== "number") {
          // Récupère les points de la trace (max 100 pour Open-Elevation)
          let coords = feature.geometry.coordinates;
          if (coords.length > 100) {
            // Échantillonne pour ne pas dépasser 100 points
            const step = Math.ceil(coords.length / 100);
            coords = coords.filter((_, i) => i % step === 0);
            if (
              coords[coords.length - 1] !==
              feature.geometry.coordinates[
                feature.geometry.coordinates.length - 1
              ]
            ) {
              coords.push(
                feature.geometry.coordinates[
                  feature.geometry.coordinates.length - 1
                ]
              );
            }
          }
          fetch("https://api.open-elevation.com/api/v1/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              locations: coords.map(([lng, lat]) => ({
                latitude: lat,
                longitude: lng,
              })),
            }),
          })
            .then((r) => r.json())
            .then((data) => {
              const elevations = data.results.map((pt) => pt.elevation);
              let ascentCalc = 0,
                descentCalc = 0;
              for (let i = 1; i < elevations.length; i++) {
                const diff = elevations[i] - elevations[i - 1];
                if (diff > 0) ascentCalc += diff;
                else descentCalc -= diff;
              }
              setSummary({
                duration: summary.duration,
                distance: summary.distance,
                ascent: Math.round(ascentCalc),
                descent: Math.round(descentCalc),
              });
              L.geoJSON(geojson, {
                style: { color: "blue", weight: 4 },
              }).addTo(mapRef.current);
            })
            .catch(() => {
              setSummary({
                duration: summary.duration,
                distance: summary.distance,
                ascent: null,
                descent: null,
              });
              L.geoJSON(geojson, {
                style: { color: "blue", weight: 4 },
              }).addTo(mapRef.current);
            });
        } else {
          setSummary({
            duration: summary.duration,
            distance: summary.distance,
            ascent,
            descent,
          });
          L.geoJSON(geojson, {
            style: { color: "blue", weight: 4 },
          }).addTo(mapRef.current);
        }
      })
      .catch((err) => {
        setError("Erreur lors de la récupération de l'itinéraire.");
        setSummary(null);
        console.error("Erreur API ORS :", err);
      });
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [traceStart, traceEnd, showTrace, profile]);

  return { mapRef, error, summary };
}
