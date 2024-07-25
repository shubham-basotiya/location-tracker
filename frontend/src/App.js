import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
    const [tracking, setTracking] = useState(false);
    const [locationId, setLocationId] = useState(null);
    const [coordinates, setCoordinates] = useState([]);
    const [name, setName] = useState('');
    const [mapCenter, setMapCenter] = useState([0, 0]);

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

    const host = 'http://localhost:5000';

    const startTracking = async () => {
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
                {coordinates.length > 0 && (
                    <Polyline
                        positions={coordinates.map(coord => [coord.latitude, coord.longitude])}
                        color="blue"
                    />
                )}
            </MapContainer>
        </div>
    );
}

export default App;