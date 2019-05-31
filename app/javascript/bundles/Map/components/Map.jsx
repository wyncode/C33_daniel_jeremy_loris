import React, { Component } from 'react';

export default class Map extends Component {
  componentDidMount() {
    mapboxgl.accessToken = this.props.mapbox_api_key
    const mapOptions = {
      container:  this.mapContainer,
      style:      `mapbox://styles/mapbox/streets-v9`,
      center:     [0,0],
      zoom:       12
    }
    const geolocationOptions = {
      enableHighAccuracy: true,
      maximumAge        : 30000,
      timeout           : 27000
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        mapOptions.center = [
                              position.coords.longitude,
                              position.coords.latitude
                            ]
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
        positionOptions:    geolocationOptions,
        trackUserLocation:  true
      })
    )
  }

  render() {
    const style = {
      width: '100%',
      height: '500px',
      backgroundColor: 'azure'
    };
    return <div style={style} ref={el => this.mapContainer = el} />;
  }
 
  componentWillUnmount() {
    this.map.remove();
  }
}
