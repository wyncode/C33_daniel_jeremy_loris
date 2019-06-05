import ReactOnRails from "react-on-rails";

import Map from "../bundles/Stations/components/Map";
import ToggleSwitch from "../bundles/Stations/components/ToggleSwitch";

// This is how react_on_rails can see the Map in the browser.
ReactOnRails.register({
  Map,
  ToggleSwitch
});
