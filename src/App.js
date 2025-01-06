import "./App.css";
import React from "react";

const Hero = () => {
  return (
    <div className="hero">
      {/* <div className="hero-content">
        <h1>LaariKhojo</h1>
        <p>Your Guide to Street Treasures!</p>
      </div>  */} 
      <div className="map-container">
        {
          <iframe
          style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
            width="100%"
            height="100%"
            src="https://www.pampam.city/p/7bdQYZeWh7Q1cTckDKR2"
            allowfullscreen
            loading="lazy"
          ></iframe>
        }
      </div>
    </div>
  );
};

function App() {
  return <Hero />;
}

export default App;
