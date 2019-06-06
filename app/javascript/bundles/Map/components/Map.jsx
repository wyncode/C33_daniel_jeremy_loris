import React, { Component } from "react"
import axios from "axios"
import Switch from "react-switch"

export default class Map extends Component {
  state = {
    make:                 '',
    model:                { model: '', range:  58 },
    instructionsVisible:  true,
    switchVisible:        false,
    originLat: Number(),
    originLng: Number()
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

  handleSwitchChange = event => {
    if(this.state.instructionsVisible){
      this.setState({instructionsVisible: false})
      document.querySelector('.mapbox-directions-instructions').classList.add('instructions-hidden')
    }else{
      this.setState({instructionsVisible: true})
      document.querySelector('.mapbox-directions-instructions').classList.remove('instructions-hidden')
    }
  }

  createGeoJSONCircle = (center, radiusInMiles, points) => {
    if(!points) points = 64;
    const coords = { latitude: center[1], longitude: center[0] };
    const km = radiusInMiles * 1.60934;
    const ret = [];
    const distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
    const distanceY = km/110.574;
    for(let i=0; i<points; i++) {
        const theta = (i/points)*(2*Math.PI);
        const x = distanceX*Math.cos(theta);
        const y = distanceY*Math.sin(theta);
        ret.push([coords.longitude+x, coords.latitude+y]);
    }
    ret.push(ret[0]);
    return {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ret]
                }
            }]
        }
};

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
      const originLat = originCoords[1]
      const originLng = originCoords[0]
      this.setState({ originLng, originLat, switchVisible: true })
      const data = this.createGeoJSONCircle([originLng, originLat], 58)
      const rangeSource = this.map.getSource('range')
      if (!rangeSource) {
        this.map.addSource("range", { type: 'geojson', data })
        this.map.addLayer({
          "id": "range",
          "type": "fill",
          "source": "range",
          "layout": {},
          "paint": {
              "fill-opacity": 1,
              "fill-outline-color": "red",
              "fill-color": "transparent",
          }
        });
      }
      else rangeSource.setData(data)
      if(this.map.getSource('stations')){
        this.map.getSource('stations').setData({
          type:     'FeatureCollection',
          features: []
        })
      }
      axios.get(`/fuel_stations.json?origin_lng=${originLng}&origin_lat=${originLat}&destination_lng=${destinationCoords[0]}&destination_lat=${destinationCoords[1]}`)
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
    this.map.on("load", () => {
      axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${mapOptions.center[0]},${mapOptions.center[1]}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => {
          const origin = response.data.features[0]
          if (origin){
            directions.setOrigin(origin.place_name)
          }else{
            directions.setOrigin(mapOptions.center)
          }
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
      const map = this.map
      const { originLat, originLng } = this.state;
      const rangeSource = map.getSource("range")
      const data = this.createGeoJSONCircle([originLng, originLat], model.range)
      rangeSource && rangeSource.setData(data)
      this.setState({ model })
    }else{
      this.setState({model: { model: '', range:  58 }})
    }
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
            {
              this.state.make !== '' &&
              <div>
                <select value={this.state.model.model} onChange={this.handleModelChange}>
                  <option value=''>Model</option>
                  {
                    this.props.models[this.state.make].map(model => (
                      <option value={model.model} key={model.model}>{model.model}</option>
                    ))
                  }
                </select>
              </div>
            }
          </div>
        </div>
      </React.Fragment>
    )
  }

  componentWillUnmount() {
    this.map.remove()
  }
}
