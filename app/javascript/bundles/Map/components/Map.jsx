import React, { Component } from "react"
import axios from "axios"
import Switch from "react-switch"
import StationIcon from './images/charger1.png'

export default class Map extends Component {
  constructor(props){
    super(props)
    window.map = this
  }

  state = {
    make:                 '',
    model:                { model: '', range:  58 },
    instructionsVisible:  true,
    switchVisible:        false,
    originLat:            0,
    originLng:            0
  }

  componentDidMount() {
    mapboxgl.accessToken = this.props.mapbox_api_key
    const mapOptions = {
      container: this.mapContainer,
      style: `mapbox://styles/mapbox/streets-v9`,
      center: [this.state.originLng, this.state.originLat],
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

  handleSwitchChange = event => {
    this.setState({instructionsVisible: !this.state.instructionsVisible})
    document.querySelector('.mapbox-directions-instructions').classList.toggle('instructions-hidden')
  }

  createGeoJSONCircle = (center, radiusInMiles) => {
    const points = 64
    const coords = { latitude: center[1], longitude: center[0] }
    const km = radiusInMiles * 1.60934
    const ret = []
    const distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180))
    const distanceY = km/110.574
    for(let i=0; i<points; i++) {
      const theta = (i/points)*(2*Math.PI)
      const x = distanceX*Math.cos(theta)
      const y = distanceY*Math.sin(theta)
      ret.push([coords.longitude+x, coords.latitude+y])
    }
    ret.push(ret[0])
    return  {
              "type": "FeatureCollection",
              "features": [{
                "type": "Feature",
                "geometry": {
                  "type": "Polygon",
                  "coordinates": [ret]
                }
              }]
            }
  }

  addWaypoint = (lng, lat) => {
    this.setState({ waypointJustAdded: true})
    const waypoints = this.directions.getWaypoints()
    if(waypoints.length > 0){
      this.directions.addWaypoint(0, [lng,lat])
    }else{
      this.directions.setWaypoint(0, [lng,lat])
    }
    this.map.flyTo({ center: [lng, lat], zoom: 12 })
  }

  chargeUp = (lng, lat) => {
    this.setCircle(lat, lng, this.state.model)
    document.querySelector('.mapboxgl-popup-close-button').click()
  }

  setOriginToCurrentLocation = (lng, lat) => {
    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => {
      const origin = response.data.features[0]
      if (origin){
        this.directions.setOrigin(origin.place_name)
      }else{
        this.directions.setOrigin([lng,lat])
      }
    })
  }

  createMap = (mapOptions, geolocationOptions) => {
    this.map = new mapboxgl.Map(mapOptions)
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: geolocationOptions,
        trackUserLocation: true
      })
    )
    this.directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      profile: 'mapbox/driving',
      interactive: false,
      controls: {
        profileSwitcher: false
      }
    })
    this.map.addControl(this.directions, 'top-left')
    this.map.on("load", () => {
        this.map.loadImage(StationIcon, (error, icon) => {
          if (error) return
          this.map.addImage('station', icon)
      })
      this.setOriginToCurrentLocation(...mapOptions.center)
      this.directions.on("route", () => {
        this.setState({ instructionsVisible: true })
        if(!this.state.waypointJustAdded){
          document.querySelectorAll('.geocoder-icon-close').forEach(button => {
            button.addEventListener('click', this.handleEndpointDelete)
          })
          const [originLng, originLat] = this.directions.getOrigin().geometry.coordinates
          const [destinationLng, destinationLat] = this.directions.getDestination().geometry.coordinates
          this.setState({ originLng, originLat, switchVisible: true })
          this.setCircle(originLat, originLng, this.state.model)
          this.unsetStations()
          axios.get(`/fuel_stations.json?origin_lng=${originLng}&origin_lat=${originLat}&destination_lng=${destinationLng}&destination_lat=${destinationLat}`)
            .then(response => {
              if(!this.map.getSource('stations')){
                this.map.addSource("stations", { type: "geojson", data: response.data })
                this.map.addLayer({
                  id: "stations",
                  type: "symbol",
                  source: "stations",
                  layout: {
                    "icon-image": "station",
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
        }else{
          this.setState({waypointJustAdded: false})
        }
      })
    })

  }

  unsetStations = () => {
    if(this.map.getSource('stations')){
      this.map.getSource('stations').setData({
        type:     'FeatureCollection',
        features: []
      })
    }
  }

  handleEndpointDelete = () => {
    this.setState({ switchVisible: false })
    if(this.map.getSource('stations')){
      this.unsetStations()
    }
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
          <button onclick="window.map.addWaypoint(${coordinates[0]}, ${coordinates[1]})">
            Set Waypoint
          </button>
          <button onclick="window.map.chargeUp(${coordinates[0]}, ${coordinates[1]})">
            Reset Range
          </button>
       </div>`
      ).addTo(this.map)
  }

  handleMakeChange = event => {
    const model = { model: '', range: 58 }
    this.setState({ make: event.target.value, model })
    this.setCircle(this.state.originLat, this.state.originLng, model)
  }

  setCircle = (originLat, originLng, model) => {
    const data = this.createGeoJSONCircle([originLng, originLat], model.range)
    const rangeSource = this.map.getSource('range')
    if (!rangeSource) {
      this.map.addSource("range", { type: 'geojson', data })
      this.map.addLayer({
        "id": "range",
        "type": "fill",
        "source": "range",
        "layout": {},
        "paint": {
          "fill-opacity": 0.10,
          "fill-color": "#3BB2D0",
        }
      })
      this.map.addLayer({
        "id": "range-line",
        "type": "line",
        "source": "range",
        "layout": {
          "line-join": "round",
          "line-cap": "round"
        },
        "paint": {
          "line-color": "#3BB2D0",
          "line-width": 4
        }
      })
    } else {
      rangeSource.setData(data)
    }
    this.setState({originLat, originLng, model})
  }

  handleModelChange = event => {
    let model = this.props.models[this.state.make].find(model => model.model === event.target.value)
    if(!model){
      model = { model: '', range:  58 }
    }
    this.setState({ model })
    this.setCircle(this.state.originLat, this.state.originLng, model)
  }

  render() {
    const style = {
      width: "100vw",
      height: "100vh",
      backgroundColor: "azure"
    }
    return(
      <React.Fragment>
        <div style={style} ref={el => (this.mapContainer = el)} >
          {
            this.state.switchVisible &&
            <Switch
              onChange={this.handleSwitchChange}
              checked={this.state.instructionsVisible}
              className="instructionsToggle"
              checkedIcon={false}
              uncheckedIcon={false}
              onColor='#3BB2D0'
            />
          }
          <div id="vehicle-selector">
            <div>
              <select id="make" value={this.state.make} onChange={this.handleMakeChange}>
                <option value=''>Make</option>
                {
                  this.props.makes.map(make => (
                    <option value={make} key={make}>{make}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <select id="model" value={this.state.model.model} onChange={this.handleModelChange}>
                <option value=''>Model</option>
                {
                  (this.props.models[this.state.make] || []).map(model => (
                    <option value={model.model} key={model.model}>{model.model}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  componentWillUnmount() {
    this.map.remove()
  }
}
