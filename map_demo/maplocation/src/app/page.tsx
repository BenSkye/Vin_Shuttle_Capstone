'use client'

import dynamic from 'next/dynamic';
import { useState } from "react";

// Dynamic import với ssr: false
const CreateRoute = dynamic(
  () => import("@/components/createRoute"),
  { ssr: false }
);

export default function Home() {
  const [isCustomer, setIsCustomer] = useState(true);
  return (
    <main>
      {/* <button onClick={() => setIsCustomer(true)}>Customer</button>
      <button onClick={() => setIsCustomer(false)}>Driver</button>
      {isCustomer ? <Map /> : <DriverScreen />} */}
      {/* <Map /> */}
      <CreateRoute /> {/*Xem tuyến đường*/}
    </main>
  );
}

