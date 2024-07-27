import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PathOnMap() {
    const {id} = useParams();

    const [coordinates, setCoordinates] = useState([]);
    const [pathName, setPathName] = useState('');
    const [mapCenter, setMapCenter] = useState([0, 0]);

    const host = 'https://currentlocationonmapbackend.onrender.com';//'http://localhost:5000';

    useEffect(() => {
      // Function to get the current location
      const getCurrentLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setMapCenter([latitude, longitude]);
            },
            (error) => {
              console.error("Error getting location: ", error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          alert("Geolocation is not supported by this browser.");
        }
      };
  
      // Call the function to get the current location
      getCurrentLocation();
    }, []);

    useEffect(() => {
      const fetchCoordinates = async () => {
        try {
          const fetchedCoordinates = await axios(`${host}/pathCoordinates/${id}`);
          setCoordinates(fetchedCoordinates.data.coordinates);
          setPathName(fetchedCoordinates.data.name);
        } catch (error) {
          console.error('Error fetching coordinates:', error);
        }
      };
  
      fetchCoordinates();
    }, [id]);

    return (
        <div>
            <h1> Name: {pathName} </h1>
          
            <MapContainer center={mapCenter} zoom={14} style={{ height: "500px", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <UpdateMapView coords={mapCenter} />
                {coordinates.length > 0 && ( <Marker position={[coordinates[0].latitude, coordinates[0].longitude]} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})} /> )}
                {coordinates.length > 0 && (
                    <Polyline
                        positions={coordinates.map(coord => [coord.latitude, coord.longitude])}
                        color="blue"
                    />
                  )}
                {coordinates.length > 0 && ( <Marker position={[coordinates[coordinates.length - 1].latitude, coordinates[coordinates.length - 1].longitude]} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})} /> )}
            </MapContainer>
        </div>
    );
}

const UpdateMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords);
  }, [coords, map]);
  return null;
};

export default PathOnMap;