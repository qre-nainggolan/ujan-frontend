import "leaflet/dist/leaflet.css";
import NavLane from "../../NavLane";
import Footer from "../../Footer";
import Header from "../../Header";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const MapDrone = () => {
  return (
    <div className="layout">
      <Header />
      <div className="layout__body">
        <NavLane />
        <main className="layout__main">
          <MapContainer
            center={[0, 118]}
            zoom={4}
            style={{ height: "100vh", width: "100%" }}
          >
            <TileLayer
              url="http://localhost:9009/tiles/{z}/{x}/{y}.png"
              attribution="&copy; Drone Tiles"
            />
            <Marker position={[3.6, 98.7]}>
              <Popup>Hello Medan!</Popup>
            </Marker>
          </MapContainer>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MapDrone;
