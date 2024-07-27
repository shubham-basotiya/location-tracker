import React, { useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Home(){

    const [mapCenter, setMapCenter] = useState([0, 0]);
    
    // useEffect(() => {
    //     navigator.geolocation.getCurrentPosition(
    //         (position) => {
    //             const { latitude, longitude } = position.coords;
    //             setMapCenter([ latitude, longitude ]);
    //         },
    //         (error) => console.log(error.message),
    //         { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    //     );
    // },[]);

    const [tracking, setTracking] = useState(false);
    const [locationId, setLocationId] = useState(null);
    const [coordinates, setCoordinates] = useState([]);
    const [name, setName] = useState('');
    const [savedPathArrOfObjs, setSavedPathArrOfObjs] = useState([]);

    const host = 'http://localhost:5000';//'https://currentlocationonmapbackend.onrender.com';



    useEffect( () => {
        async function fetchAllSavedMapPath(){
            const allsavedPaths = await axios.get(`${host}/savedMapPaths`);
            setSavedPathArrOfObjs(allsavedPaths.data);
        }

        fetchAllSavedMapPath();
        // console.log(savedPathArrOfObjs);
    },[]);

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
                { enableHighAccuracy: true, maximumAge: 1000, timeout: 1000 }
            );
        } else {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [tracking]);

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

    function LocationMarker() {
        // const [position, setPosition] = useState(null);
        // const [bbox, setBbox] = useState([]);
    
        const map = useMap();
    
        useEffect(() => {
          map.locate().on("locationfound", function (e) {
            setMapCenter(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            // const radius = e.accuracy;
            // const circle = L.circle(e.latlng, radius);
            // circle.addTo(map);
            // setBbox(e.bounds.toBBoxString().split(","));
          });
        }, [map]);
    
        // return position === null ? null : (
        //   <Marker position={position} icon={icon}>
            // <Popup>
            //   You are here. <br />
            //   Map bbox: <br />
            //   <b>Southwest lng</b>: {bbox[0]} <br />
            //   <b>Southwest lat</b>: {bbox[1]} <br />
            //   <b>Northeast lng</b>: {bbox[2]} <br />
            //   <b>Northeast lat</b>: {bbox[3]}
            // </Popup>
        //   </Marker>
        // );
      }

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

                {coordinates.lenth === 0 && (
                    <LocationMarker />
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

export default Home;