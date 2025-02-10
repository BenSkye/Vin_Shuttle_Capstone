'use client'

import dynamic from 'next/dynamic';


// Dynamic import với ssr: false
const CreateRoute = dynamic(
  () => import("../../_components/map/createRoute"),
  { ssr: false }
);

export default function Home() {
  
  return (
    <main>
      <CreateRoute />
    </main>
  );
}

