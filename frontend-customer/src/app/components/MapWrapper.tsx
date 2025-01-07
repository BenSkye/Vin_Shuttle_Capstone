"use client";

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <>Loading...</>,
});

const MapWrapper = () => {
    return <Map />;
};

export default MapWrapper;