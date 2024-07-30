import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PathOnMap() {
    const {id} = useParams();

    const navigate = useNavigate();
    
    const buttonClass = "list-group-item";
    
    const [coordinates, setCoordinates] = useState([]);
    const [pathName, setPathName] = useState('');
    const [mapCenter, setMapCenter] = useState([0, 0]);
    const [savedPathArrOfObjs, setSavedPathArrOfObjs] = useState([]);

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
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
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

    useEffect( () => {
      async function fetchAllSavedMapPath(){
          const allsavedPaths = await axios.get(`${host}/savedMapPaths`);
          setSavedPathArrOfObjs(allsavedPaths.data);
      }

      fetchAllSavedMapPath();
      // console.log(savedPathArrOfObjs);
  },[coordinates, savedPathArrOfObjs]);

  const handleDelete = async (host, locationId) => {
      const res = await axios.delete(`${host}/delete/${locationId}`);
      alert(res.data.name + "deleted successfully");
      navigate('/');
  }

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

                {/* <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                /> */}
                    <Marker position={mapCenter} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})} />
            </MapContainer>
            
            <div className='container' style={{marginTop: "30px", marginBottom: "30px"}}> 
            <Link to='/'>Home</Link>
            <br />
            <br />
                <ul className='list-group align-items-center'>
                    {savedPathArrOfObjs.map((pathObj) => (
                    <li key={pathObj._id} className={`${pathObj._id === id ? `${buttonClass} active` : buttonClass} w-50 d-flex align-items-center`}>
                        {/* Pass the id and coordinates as props */}
                        <Link to={`/path/${pathObj._id}`} className={`${pathObj._id === id ? `${buttonClass} active` : buttonClass} w-50`}>
                        {pathObj.name}
                        </Link>
                        <button className="list-group-item  list-group-item-action w-50 text-center" onClick={() => handleDelete(host, pathObj._id)}>Delete</button>
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

export default PathOnMap;