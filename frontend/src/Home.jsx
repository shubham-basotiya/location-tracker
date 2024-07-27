import React, { useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'

function Home(){

    const [tracking, setTracking] = useState(false);
    const [locationId, setLocationId] = useState(null);
    const [coordinates, setCoordinates] = useState([]);
    const [name, setName] = useState('');
    const [savedPathArrOfObjs, setSavedPathArrOfObjs] = useState([]);
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
                alert("Error getting location: ", error.message);
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

    useEffect( () => {
        async function fetchAllSavedMapPath(){
            const allsavedPaths = await axios.get(`${host}/savedMapPaths`);
            setSavedPathArrOfObjs(allsavedPaths.data);
        }

        fetchAllSavedMapPath();
        // console.log(savedPathArrOfObjs);
    },[coordinates]);

    useEffect(() => {
        let watchId;

        if (tracking) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newCoordinate = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: new Date()
                    };
                    setCoordinates((prevCoords) => [
                        ...prevCoords,
                        newCoordinate
                    ]);
                    setMapCenter([newCoordinate.latitude, newCoordinate.longitude]);
                },
                (error) => console.log(error),
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
            );
        } else {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [tracking]);

    const startTracking = async () => {
        // setStartPos(false);
        if (name.trim() === '') {
            alert('Please enter a track name.');
            return;
        }
        const response = await axios.post(`${host}/start`, { name });
        setLocationId(response.data._id);
        setTracking(true);
    };

    const stopTracking = async () => {
        await axios.post(`${host}/stop/${locationId}`, { coordinates });
        setTracking(false);
        setCoordinates([]);
        setName('');
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Track Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={tracking ? stopTracking : startTracking}>
                {tracking ? 'Stop' : 'Start'}
            </button>
            <MapContainer center={mapCenter} zoom={13} style={{ height: "500px", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                    <Marker position={mapCenter} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})} />
                    <UpdateMapView coords={mapCenter} />
                {coordinates.length > 0 && (
                    <Polyline
                        positions={coordinates.map(coord => [coord.latitude, coord.longitude])}
                        color="blue"
                    />
                )}
            </MapContainer>
            <div>    
                <ul>
                    {savedPathArrOfObjs.map((pathObj) => (
                    <li key={pathObj._id}>
                        {/* Pass the id and coordinates as props */}
                        <Link to={`/path/${pathObj._id}`}>
                        {pathObj.name}
                        </Link>
                    </li>
                    ))}
                </ul>
            </div>
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

export default Home;