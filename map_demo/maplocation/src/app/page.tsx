'use client'

import CreateRoute from "@/components/createRoute";
import CustomerPage from "@/components/CustomerPage";
import DriverScreen from "@/components/Driver";
import Map from "@/components/Map";
import { useState } from "react";

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

