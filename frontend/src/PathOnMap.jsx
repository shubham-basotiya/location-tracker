import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PathOnMap() {
    const {id} = useParams();

    const [coordinates, setCoordinates] = useState([]);
    const [pathName, setPathName] = useState('');

    const host = 'http://localhost:5000';//'https://currentlocationonmapbackend.onrender.com';

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
            <MapContainer center={[0,0]} zoom={13} style={{ height: "500px", width: "100%" }}>
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

export default PathOnMap;