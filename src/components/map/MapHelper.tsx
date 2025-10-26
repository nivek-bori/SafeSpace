import { config } from "@/lib/config";
import { Safety } from "@/lib/prisma/generated/prisma";
import { RelationLocation, RelationRating } from "@/types/types";
import { Divide } from "lucide-react";

// ----- UTIL -----
export async function convertPositionToAddress(lat: number, lng: number) {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.google.key}`);

  const data = await response.json();
  if (data.status === 'OK' && data.results[0]) {
    const address = data.results[0].formatted_address;
    return address;
  }
}

// ----- MARKERS ------

export function createMarkerData(document: any, hex: string) {
  const markerContent = document.createElement('div');
  markerContent.style.background = hex;
  markerContent.style.width = '24px';
  markerContent.style.height = '24px';
  markerContent.style.borderRadius = '50%';
  markerContent.style.border = '2px solid #fff';
  return markerContent;
}

export function calculateLocationColor(location: RelationLocation): string {
  if (!location.ratings || location.ratings.length === 0) {
    return "#cccccc";
  }

  const avg = calculateLocationAvgRating(location);
  return calculateRatingColor(avg);
}

function calculateLocationAvgRating(location: RelationLocation): number {
  let sum = 0.0;
  location.ratings.forEach((rating: RelationRating) => sum += ratingEnumToValue(rating.safety));
  return sum / location.ratings.length;
}

function calculateRatingColor(avg: number) {
  const t = (avg + 2) / 4; // Normalize [-2, 2] to [0, 1]
  let r, g, b; //  Red (#ff2d2d), Yellow (#ffee2d), Green (#27ea53)

  if (t < 0.5) {
    // red to yellow
    const t2 = t / 0.5; // Range: [0, 0.5] to [0, 1]
    r = Math.round(0xff * (1 - t2) + 0xff * t2); // 255 (red) stays
    g = Math.round(0x2d * (1 - t2) + 0xee * t2); // 45 -> 238
    b = Math.round(0x2d * (1 - t2) + 0x2d * t2); // 45 stays
  } else {
    // yellow to green
    const t2 = (t - 0.5) / 0.5; // Range: [0.5, 1] to [0, 1]
    r = Math.round(0xff * (1 - t2) + 0x27 * t2); // 255 -> 39
    g = Math.round(0xee * (1 - t2) + 0xea * t2); // 238 -> 234
    b = Math.round(0x2d * (1 - t2) + 0x53 * t2); // 45 -> 83
  }

  // Clamp values to valid RGB range
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  // Return as hex color string
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function ratingEnumToValue(safety: Safety) {
  switch (safety) {
    case 'NEG_TWO':
      return -2.0;
    case 'NEG_ONE':
      return -1.0;
    case 'ZERO':
      return 0.0;
    case 'ONE':
      return 1.0;
    case 'TWO':
      return 2.0;
    default:
      return 0.0;
  }
}


// ----- CLUSTERS -----

// Renderer of clusters
export class ClusterRenderer {
  // Returns a marker in plcae of a cluster for rendering
  // This renders the cluster marker instead of all the markers in the cluster
  public render(cluster: any, stats: any, map: google.maps.Map) {
    // Calculate color based on average of rating of location
    const color = calculateClusterColor(cluster);

    const clusterDataSvg = `<svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50">
                    <circle cx="120" cy="120" opacity="1.0" r="50" />
                    <circle cx="120" cy="120" opacity=".8" r="80" />
                    <circle cx="120" cy="120" opacity=".7" r="100" stroke="#000" stroke-width="6"/>
                    <text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="50" dominant-baseline="middle" font-family="roboto,arial,sans-serif">${cluster.count}</text>
                  </svg>`;
    const parser = new DOMParser();
    const clusterData = parser.parseFromString(clusterDataSvg, 'image/svg+xml').documentElement;
    clusterData.setAttribute('transform', 'translate(0 25)');

    const title = `${cluster.count} Locations`;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: cluster.position,
      title: title,
      content: clusterData,
    });

    return marker;
  }
}

// Calculate cluster color based on marker's ratings
function calculateClusterColor(cluster: any) {
  let sumRating = 0.0;
  let numRating = 0;

  (cluster.markers ?? []).forEach(marker => {
    (marker.loc.ratings ?? []).forEach(rating => {
      sumRating += ratingEnumToValue(rating.safety);
      numRating++;
    });
  });

  const avgRating = sumRating / numRating;
  return calculateRatingColor(avgRating);
}

// Zoom into cluster when clicked
export const onClusterCLick = (_: google.maps.MapMouseEvent, cluster: any, map: google.maps.Map): void => {
  if (cluster.bounds) {
    map.fitBounds(cluster.bounds, { top: 200, bottom: 200, left: 200, right: 200 });
  }
};