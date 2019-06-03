import React, { Component } from "react"
import axios from "axios"

export default class Map extends Component {
  componentDidMount() {
    mapboxgl.accessToken = this.props.mapbox_api_key
    const mapOptions = {
      container: this.mapContainer,
      style: `mapbox://styles/mapbox/streets-v9`,
      center: [0, 0],
      zoom: 12
    }
    const geolocationOptions = {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        mapOptions.center = [position.coords.longitude, position.coords.latitude]
        this.createMap(mapOptions, geolocationOptions)
      },
      () => {
        console.log("Geolocation failed")
        this.createMap(mapOptions, geolocationOptions)
      },
      geolocationOptions
    )
  }

  createMap = (mapOptions, geolocationOptions) => {
    this.map = new mapboxgl.Map(mapOptions)
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: geolocationOptions,
        trackUserLocation: true
      })
    )
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      profile: 'mapbox/driving',
      interactive: false,
      controls: {
        profileSwitcher: false
      }
    })
    this.map.addControl(directions, 'top-left')
    directions.on("route", () => {
      const originCoords = directions.getOrigin().geometry.coordinates
      const destinationCoords = directions.getDestination().geometry.coordinates
      if(this.map.getSource('stations')){
        this.map.getSource('stations').setData({
          type:     'FeatureCollection',
          features: []
        })
      }
      axios.get(`/fuel_stations.json?origin_lng=${originCoords[0]}&origin_lat=${originCoords[1]}&destination_lng=${destinationCoords[0]}&destination_lat=${destinationCoords[1]}`)
        .then(response => {
          if(!this.map.getSource('stations')){
            this.map.addSource("stations", { type: "geojson", data: response.data })
            this.map.addLayer({
              id: "stations",
              type: "symbol",
              source: "stations",
              layout: {
                "icon-image": "fuel-15",
                "icon-size": 1.5,
                "icon-allow-overlap": false
              }
            })
            this.map.on("click", "stations", this.handleMarkerClick)
          }else{
            this.map.getSource('stations').setData(response.data)
          }
        })
        .catch(error => {
          console.log("API returned an error")
        })
    })
  }

  handleMarkerClick = e => {
    const { properties = {}, geometry = {} } = e.features[0]
    const { name, phone } = properties
    const coordinates = [...geometry.coordinates]
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `<div className="station-pop">
          <p>${name}</p>
          <p>${phone}</p>
        </div>`
      ).addTo(this.map)
  }

  render() {
    const style = {
      width: "100%",
      height: "500px",
      backgroundColor: "azure"
    }
    return <div style={style} ref={el => (this.mapContainer = el)} />
  }

  componentWillUnmount() {
    this.map.remove()
  }
}
