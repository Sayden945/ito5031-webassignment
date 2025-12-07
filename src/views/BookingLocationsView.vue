<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <!-- Map Container -->
      <div class="col-lg-8">
        <div id="map" class="map-container"></div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <div class="locations-sidebar p-4">
          <h2 class="mb-4">Our Locations</h2>
          <p class="text-muted mb-4">Find our support centers and get directions</p>

          <!-- Location List -->
          <div class="locations-list">
            <div
              v-for="location in locations"
              :key="location.id"
              class="location-card mb-3 p-3 border rounded"
              :class="{ active: selectedLocation?.id === location.id }"
              @click="selectLocation(location)"
            >
              <h5 class="mb-2">{{ location.name }}</h5>
              <p class="text-muted mb-2">
                <i class="bi bi-geo-alt-fill"></i> {{ location.address }}
              </p>
              <p class="mb-3 small">{{ location.description }}</p>
              <button
                v-if="selectedLocation?.id === location.id"
                class="btn btn-primary btn-sm w-100"
                @click.stop="getDirections(location)"
              >
                <i class="bi bi-compass"></i> Get Directions from My Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_TOKEN'

const map = ref(null)
const selectedLocation = ref(null)
const markers = ref([])

// Three pinned locations for support centers
const locations = ref([
  {
    id: 1,
    name: 'Head Office',
    address: '123 Main Street, Melbourne VIC 3000',
    description: 'Head Office. Open Mon-Fri 9am-5pm.',
    coordinates: [144.9631, -37.8136],
  },
  {
    id: 2,
    name: 'Refugee Advocacy Group',
    address: '456 High Street, Preston VIC 3072',
    description: 'Legal support, advocacy services, and rights protection for refugees.',
    coordinates: [145.0032, -37.7499],
  },
  {
    id: 3,
    name: 'Asylum Seeker Support Center',
    address: '789 Burwood Highway, Burwood VIC 3125',
    description: 'Essential services, counseling, and community support for asylum seekers.',
    coordinates: [145.1123, -37.8509],
  },
])

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})

function initializeMap() {
  // Initialize map centered on Melbourne
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136],
    zoom: 11,
  })

  // Add navigation controls
  map.value.addControl(new mapboxgl.NavigationControl(), 'top-right')

  // Wait for map to load before adding markers
  map.value.on('load', () => {
    // Add markers for all locations
    locations.value.forEach((location) => {
      addMarker(location)
    })

    // Fit bounds to show all markers
    if (locations.value.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      locations.value.forEach((loc) => {
        bounds.extend(loc.coordinates)
      })
      map.value.fitBounds(bounds, { padding: 80 })
    }
  })
}

function addMarker(location) {
  // Create custom marker element
  const el = document.createElement('div')
  el.className = 'custom-marker'
  el.innerHTML = '<i class="bi bi-geo-alt-fill text-danger" style="font-size: 2rem;"></i>'

  // Create popup
  const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    `<h6>${location.name}</h6><p class="mb-0 small">${location.address}</p>`,
  )

  // Add marker to map
  const marker = new mapboxgl.Marker(el)
    .setLngLat(location.coordinates)
    .setPopup(popup)
    .addTo(map.value)

  markers.value.push(marker)

  // Click event to select location
  el.addEventListener('click', () => {
    selectLocation(location)
  })
}

function selectLocation(location) {
  selectedLocation.value = location

  // Fly to location
  map.value.flyTo({
    center: location.coordinates,
    zoom: 14,
    duration: 1500,
  })
}

function getDirections(location) {
  // Get user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = [position.coords.longitude, position.coords.latitude]
        showRoute(userCoords, location.coordinates)
      },
      (error) => {
        alert('Unable to get your location. Please enable location services.')
        console.error('Geolocation error:', error)
      },
    )
  } else {
    alert('Geolocation is not supported by your browser.')
  }
}

function showRoute(start, end) {
  // Fetch route using Mapbox Directions API
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry

        // Remove existing route layer if present
        if (map.value.getLayer('route')) {
          map.value.removeLayer('route')
          map.value.removeSource('route')
        }

        // Remove existing start marker if present
        if (map.value.getLayer('start-marker')) {
          map.value.removeLayer('start-marker')
          map.value.removeSource('start-marker')
        }

        // Add route to map
        map.value.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route,
          },
        })

        map.value.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0d6efd',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        })

        // Add start marker (user location) using GeoJSON layer
        map.value.addSource('start-marker', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: start,
            },
          },
        })

        map.value.addLayer({
          id: 'start-marker',
          type: 'circle',
          source: 'start-marker',
          paint: {
            'circle-radius': 10,
            'circle-color': '#28a745',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })

        // Fit map to show the entire route
        const bounds = new mapboxgl.LngLatBounds()
        route.coordinates.forEach((coord) => bounds.extend(coord))
        map.value.fitBounds(bounds, { padding: 50 })

        // Calculate and display route info
        const distance = (data.routes[0].distance / 1000).toFixed(1)
        const duration = Math.round(data.routes[0].duration / 60)

        alert(`Route: ${distance} km, approximately ${duration} minutes by car`)
      }
    })
    .catch((error) => {
      console.error('Error fetching directions:', error)
      alert('Unable to fetch directions. Please try again.')
    })
}
</script>

<style scoped>
.map-container {
  height: calc(100vh - 56px);
  width: 100%;
}

.locations-sidebar {
  height: calc(100vh - 56px);
  overflow-y: auto;
  background-color: #f8f9fa;
}

.location-card {
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.location-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.location-card.active {
  border-color: #0d6efd !important;
  background-color: #e7f1ff;
}

.custom-marker {
  cursor: pointer;
}

@media (max-width: 991px) {
  .map-container {
    height: 50vh;
  }

  .locations-sidebar {
    height: auto;
    max-height: 50vh;
  }
}
</style>
