import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { useNavigate } from 'react-router-dom';

const ScanQRCode = () => {
  const [camera, setCamera] = useState('environment'); // Default kamera belakang
  const navigate = useNavigate();

  // Fungsi untuk menangani hasil scan
  const handleScan = (data) => {
    if (data) {
      const scannedUrl = data.text || data; // Pastikan menggunakan `data.text` jika objek, atau `data` jika string
      try {
        const url = new URL(scannedUrl); // Validasi URL
        navigate(url.pathname); // Gunakan path dari URL untuk navigasi di React Router
      } catch (error) {
        console.error('Hasil scan bukan URL yang valid:', scannedUrl);
      }
    }
  };

  // Fungsi untuk menangani error saat scanning
  const handleError = (err) => {
    console.error('Camera Error:', err);
  };

  // Fungsi untuk menukar kamera
  const toggleCamera = () => {
    setCamera((prevCamera) =>
      prevCamera === 'environment' ? 'user' : 'environment'
    );
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>QR Code Scanner</h1>
      <div>
        <QrScanner
          delay={300}
          style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
          onScan={handleScan}
          onError={handleError}
          constraints={{
            video: {
              facingMode: camera, // Default kamera belakang
            },
          }}
        />
        <button
          onClick={toggleCamera}
          style={{ marginTop: '10px', padding: '10px 20px' }}
        >
          {camera === 'environment'
            ? 'Gunakan Kamera Depan'
            : 'Gunakan Kamera Belakang'}
        </button>
      </div>
    </div>
  );
};

export default ScanQRCode;
