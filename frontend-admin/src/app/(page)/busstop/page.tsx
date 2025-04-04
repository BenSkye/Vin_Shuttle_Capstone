'use client'

import dynamic from 'next/dynamic';


// Dynamic import với ssr: false
const BusStopMap = dynamic(
  () => import("../../_components/map/busStopMap"),
  { ssr: false }
);

export default function Home() {
  
  return (
    <main>
      <BusStopMap />
    </main>
  );
}

