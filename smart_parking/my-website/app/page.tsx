"use client";

import { useEffect, useState } from 'react';

const ParkingSlot = ({ id, data, label }: { id: string, data: any, label: string }) => {
  const isOccupied = data?.isOccupied || false;
  const slotColor = isOccupied ? 'bg-red-500' : 'bg-green-500';
  const carAnimation = isOccupied 
    ? 'opacity-100 translate-y-0 scale-100' 
    : 'opacity-0 translate-y-32 scale-90 pointer-events-none';

  const [liveSecs, setLiveSecs] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOccupied && data?.entryTime) {
      timer = setInterval(() => {
        const secondsParked = Math.floor((Date.now() - data.entryTime) / 1000);
        setLiveSecs(secondsParked > 0 ? secondsParked : 0);
      }, 1000);
    } else {
      setLiveSecs(0);
    }
    return () => clearInterval(timer);
  }, [isOccupied, data?.entryTime]);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-48 h-[22rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center rounded-2xl shadow-lg transition-colors duration-700 ${slotColor} overflow-hidden`}>
        <span className="absolute top-4 text-white font-black text-xl z-10 drop-shadow-md">{label}</span>
        
        <div className={`absolute bottom-4 w-32 h-64 z-20 transition-all duration-1000 ease-out ${carAnimation}`}>
          <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl">
            <rect x="10" y="10" width="80" height="180" rx="25" fill="#1e293b" stroke="#0f172a" strokeWidth="3"/>
            <path d="M 18 55 Q 50 35 82 55 L 75 85 L 25 85 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2"/>
            <rect x="25" y="85" width="50" height="50" rx="8" fill="#334155" />
            <rect x="15" y="10" width="18" height="8" rx="4" fill="#fef08a" />
            <rect x="67" y="10" width="18" height="8" rx="4" fill="#fef08a" />
            <rect x="15" y="182" width="25" height="8" rx="3" fill="#ef4444" />
            <rect x="60" y="182" width="25" height="8" rx="3" fill="#ef4444" />
          </svg>
        </div>
      </div>
      
      <div className={`mt-6 px-6 py-2 rounded-full font-bold text-white shadow-md tracking-wide ${
        isOccupied ? 'bg-red-600' : 'bg-green-600'
      }`}>
        {isOccupied ? '🔴 ไม่ว่าง (Occupied)' : '🟢 ว่าง (Available)'}
      </div>

      <div className="mt-4 bg-white p-4 rounded-xl shadow-md w-56 text-sm font-bold text-slate-600 border border-slate-200">
        <p className={`flex justify-between border-b pb-2 mb-2 p-1 rounded transition-colors ${
          isOccupied ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'
        }`}>
          <span>⏱️ เวลาปัจจุบัน:</span> 
          <span className="font-black text-base">{liveSecs} วิ</span>
        </p>

        <p className="flex justify-between border-b pb-1 mb-1">
          <span>ยอดสะสม:</span> <span className="text-blue-600">{data?.totalCars || 0} คัน</span>
        </p>
        <p className="flex justify-between">
          <span>เวลาเฉลี่ย:</span> <span className="text-orange-600">{(data?.avgDurationSeconds || 0).toFixed(1)} วิ</span>
        </p>
      </div>
    </div>
  );
};

export default function Home() {
  const [parkingData, setParkingData] = useState<any>({ slot1: null, slot2: null });

  const handleClearData = async () => {
    const isConfirm = window.confirm("คุณแน่ใจหรือไม่ที่จะล้างสถิติทั้งหมด และสั่งให้รถออก?");
    if (!isConfirm) return;

    try {
      await fetch('http://localhost:1880/api/reset', { method: 'POST' });
    } catch (error) {
      console.error("Reset error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:1880/api/parking');
        const data = await res.json();
        setParkingData(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-8 font-sans pb-20">
      <h1 className="text-4xl font-black mb-10 text-slate-800 uppercase tracking-tighter">
        Smart Parking System
      </h1>
      
      <div className="flex items-stretch gap-8">
        {/* ป้อมยามทางเข้า (แนวตั้ง) */}
        <div className="flex flex-col items-center justify-center p-4 bg-yellow-400 border-8 border-dashed border-yellow-600 rounded-3xl shadow-lg">
          <span className="text-4xl mb-8 animate-pulse">🚧</span>
          <h2 className="font-black text-2xl text-yellow-900 tracking-widest uppercase drop-shadow-sm" 
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            GATE (เข้า-ออก)
          </h2>
          <span className="text-4xl mt-8">🔽</span>
        </div>

        {/* ลานจอดรถ */}
        <div className="flex gap-12 bg-slate-300 p-10 rounded-[3rem] shadow-2xl border-4 border-slate-400 relative">
          <ParkingSlot id="slot1" data={parkingData.slot1} label="SLOT 1" />
          <ParkingSlot id="slot2" data={parkingData.slot2} label="SLOT 2" />
        </div>
      </div>

      <button 
        onClick={handleClearData}
        className="mt-16 px-8 py-4 bg-slate-800 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
      >
        <span>🗑️</span> ล้างข้อมูล & รีเซ็ตระบบ
      </button>
    </div>
  );
}