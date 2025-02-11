// import { useState, useEffect } from 'react';

// export function useUserLocation() {
//     const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [isTracking, setIsTracking] = useState(false);

//     useEffect(() => {
//         let watchId: number | null = null;

//         const startTracking = () => {
//             if ('geolocation' in navigator) {
//                 watchId = navigator.geolocation.watchPosition(
//                     (position) => {
//                         console.log('Position accuracy:', position.coords.accuracy);
//                         setLocation(position.coords);
//                         setError(null);
//                     },
//                     (err) => {
//                         setError(`Error: ${err.message}`);
//                     },
//                     { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
//                 );
//             } else {
//                 setError('Geolocation is not supported by your browser');
//             }
//         };

//         const stopTracking = () => {
//             if (watchId !== null) {
//                 navigator.geolocation.clearWatch(watchId);
//             }
//         };

//         if (isTracking) {
//             startTracking();
//         } else {
//             stopTracking();
//         }

//         return () => {
//             stopTracking();
//         };
//     }, [isTracking]);

//     const toggleTracking = () => {
//         setIsTracking((prev) => !prev);
//     };

//     return { location, error, isTracking, toggleTracking };
// }

