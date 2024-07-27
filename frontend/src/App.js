import React from 'react';
import { Routes, Route} from 'react-router-dom';
import Home from './Home';
import PathOnMap from './PathOnMap';

function App() {
    return (
            <div>
                <Routes>
                    {/* Define the route with a parameter */}
                    <Route
                    path='/path/:id' element={<PathOnMap />}
                    />
                    <Route path="/" exact element={<Home />} />
                </Routes>
            </div>
    );
}

export default App;