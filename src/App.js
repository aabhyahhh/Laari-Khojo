import "./App.css";
import React, { useState, useRef } from "react";
import Header from "./components/Header/Header";

import { MapContainer, TileLayer } from "react-leaflet";
import osm from "./osm-providers";


const Hero = () => {
  const [center, setCenter] = useState({ lat: 41.40338, lng: 2.17403 });
  const ZOOM_LEVEL = 9;
  const mapRef = useRef();

  return (
    <>
        <Header title="Laari Khojo" />
        <div className="row">
          <div className="col">
            <MapContainer center={center} zoom={ZOOM_LEVEL} scrollWheelZoom={true} style={{ height: "100vh", width: "100%" }} ref={mapRef}>
              <TileLayer
                url={osm.maptiler.url}
                attribution={osm.maptiler.attribution}
              />
            </MapContainer>
          </div>
        </div>
    </>
  );
};

function App() {
  return <Hero />;
}

export default App;
