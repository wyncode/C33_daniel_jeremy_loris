import React, { Component } from "react";
import "./ToggleSwitch.css";

export default class ToggleSwitch extends Component {
  render() {
    return (
      <div class="container">
        <label class="switch" for="checkbox">
          <input type="checkbox" id="checkbox" />
          <div class="slider round" />
        </label>
      </div>
    );
  }
}
