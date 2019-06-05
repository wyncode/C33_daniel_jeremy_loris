import React, { Component } from "react"
import axios from "axios"
import '/stylesheets/map_component/dropdowns.css'

export default class Map extends Component {
  state = {
    make:   '',
    model:  { model: '', range:  58 }
  }

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
    const { name, address, zip, phone } = properties
    const coordinates = [...geometry.coordinates]

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `<div className="station-pop">
         <p>${name}</p>
         <p>${address}, ${zip}</p>
         ${phone && phone !== 'null' ? '<p>'+phone+'</p>' : '' }
       </div>`
      ).addTo(this.map)
  }

  handleMakeChange = event => {
    this.setState({ make: event.target.value, model: { model: '', range: 58 } })
  }

  handleModelChange = event => {
    const model = this.props.models[this.state.make].find(model => model.model === event.target.value)
    if(model){
      this.setState({ model })
    }else{
      this.setState({model: { model: '', range:  58 }})
    }
  }

  render() {
    const style = {
      width: "100%",
      height: "500px",
      backgroundColor: "azure"
    }
    return(
      <React.Fragment>
        {
          this.state.model.model !== '' &&
          <h1>Your {this.state.make} {this.state.model.model} can go {this.state.model.range} miles</h1>
        }
        <label htmlFor="make">Make</label>
        <select id="make" className="vehicleSelector" value={this.state.make} onChange={this.handleMakeChange}>
          <option value=''>Select</option>
          {
            this.props.makes.map(make => (
              <option value={make} key={make}>{make}</option>
            ))
          }
        </select>
        {
          this.state.make !== '' &&
          <React.Fragment>
            <label htmlFor="model">Model</label>
            <select id="model" className="vehicleSelector" value={this.state.model.model} onChange={this.handleModelChange}>
              <option value=''>Select</option>
              {
                this.props.models[this.state.make].map(model => (
                  <option value={model.model} key={model.model}>{model.model}</option>
                ))
              }
            </select>
          </React.Fragment>
        }
        <div style={style} ref={el => (this.mapContainer = el)} />
      </React.Fragment>
    )
  }

  componentWillUnmount() {
    this.map.remove()
  }
}
