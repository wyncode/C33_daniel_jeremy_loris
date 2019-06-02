import React, { Component } from "react";
import { parseGeoJson } from "./MapUtils";
import axios from "axios";

export default class Map extends Component {
  async componentDidMount() {
    const foobar = await axios.get(
      "https://api.mapbox.com/directions/v5/mapbox/driving-traffic/-80.1412223,25.7810476;-90.0490,35.1495.json?geometries=geojson&access_token=pk.eyJ1IjoibG9yc29saW5pMSIsImEiOiJjandjaWNtdHUwMXIxNDlveGtpOG93d2drIn0.6WJGj9W1keKk6_R5Wgzgfg"
    );
    console.log("foobar", foobar);
    mapboxgl.accessToken = this.props.mapbox_api_key;
    const mapOptions = {
      container: this.mapContainer,
      style: `mapbox://styles/mapbox/streets-v9`,
      center: [0, 0],
      zoom: 12
    };
    const geolocationOptions = {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000
    };
    navigator.geolocation.getCurrentPosition(
      position => {
        mapOptions.center = [
          position.coords.longitude,
          position.coords.latitude
        ];
        this.createMap(mapOptions, geolocationOptions);
      },
      () => {
        console.log("Geolocation failed");
        this.createMap(mapOptions, geolocationOptions);
      },
      geolocationOptions
    );
  }

  createMap = (mapOptions, geolocationOptions) => {
    this.map = new mapboxgl.Map(mapOptions);
    const map = this.map;
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: geolocationOptions,
        trackUserLocation: true
      })
    );
    const { stations } = this.props;
    const stationsData = parseGeoJson(stations);
    const lineCoordinates = stations.map(station => [
      station.longitude,
      station.latitude
    ]);
    const lineData = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: lineCoordinates
      }
    };
    map.on("load", _ => {
      map.addSource("stations", { type: "geojson", data: stationsData });
      map.addSource("route", { type: "geojson", data: lineData });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "black",
          "line-width": 8
        }
      });
      map.addLayer({
        id: "stations",
        type: "symbol",
        source: "stations",
        layout: {
          "icon-image": "restaurant-15",
          "icon-size": 1.5,
          "icon-allow-overlap": true
        }
      });
      map.on("click", "stations", this.handleMarkerClick);
    });
  };

  handleMarkerClick = e => {
    const map = this.map;
    const { properties = {}, geometry = {} } = e.features[0];
    const { station_name, station_phone, street_address } = properties;
    const coordinates = [...geometry.coordinates];
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `<div className="station-pop">
        <p>${station_name}</p>
        <p>${station_phone}</p>
        <p>${street_address}</p>
      </div>`
      )
      .addTo(map);
  };

  render() {
    const style = {
      width: "100%",
      height: "500px",
      backgroundColor: "azure"
    };
    return <div style={style} ref={el => (this.mapContainer = el)} />;
  }

  componentWillUnmount() {
    this.map.remove();
  }
}
