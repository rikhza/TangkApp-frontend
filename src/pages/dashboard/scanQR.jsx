import axios from '@/api/apiTangkApp';
import DetailModal from '@/components/detailPopUp';
import GenerateQRCode from '@/components/GenerateQRCode';
import ScanQRCode from '@/components/ScanQRCode';
import { useMaterialTailwindController } from '@/context';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ScanQR = () => {
  const [controller] = useMaterialTailwindController();
  const { roleNow } = controller;
  const [selectedBerkas, setSelectedBerkas] = useState(null); // Menyimpan data berkas
  const [showDetailPopUp, setShowDetailPopUp] = useState(false); // Menentukan apakah modal detail tampil
  const [showUpdatePopup, setShowUpdatePopup] = useState(false); // Mengatur popup update
  const token = 'YOUR_AUTH_TOKEN';
  const navigate = useNavigate();

  const extractIdFromUrl = (url) => {
    if (!url) return null; // Jika URL kosong, kembalikan null
    const parts = url.split('/'); // Pisahkan berdasarkan '/'
    return parts[parts.length - 1]; // Ambil elemen terakhir
  };

  const fetchBerkas = async (id) => {
    try {
      const response = await axios.post(
        `berkas/${id}`, // Endpoint API dengan ID hasil scan
        { role: roleNow },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: roleNow,
          },
        }
      );

      // Simpan data berkas ke state
      setSelectedBerkas(response.data);
      setShowDetailPopUp(true);
    } catch (error) {
      console.error('Error fetching berkas:', error);
      alert('Data tidak ditemukan atau terjadi kesalahan');
    }
  };

  const handleTerhenti = () => {
    console.log('Proses dihentikan');
    // Tambahkan logika khusus jika diperlukan
  };

  const handleDeleteBerkas = () => {
    console.log('Berkas dihapus');
    // Tambahkan logika untuk menghapus berkas
  };

  const handleSelesai = () => {
    console.log('Proses selesai');
    // Tambahkan logika khusus jika diperlukan
  };

  return (
    <div>
      <h1>Scan QR Code</h1>
      <ScanQRCode
        onScan={(id) => {
          id.text.includes('tangkApp') && navigate(id.text);
          // fetchBerkas(extractIdFromUrl(id.text))
        }}
      />
      {/* <GenerateQRCode /> */}
      {/* {showDetailPopUp && (
        <DetailModal
          setSelectedBerkas={setSelectedBerkas}
          setShowUpdatePopup={setShowUpdatePopup}
          handleTerhenti={handleTerhenti}
          handleDeleteBerkas={handleDeleteBerkas}
          handleSelesai={handleSelesai}
          berkas={selectedBerkas}
          onClose={() => {
            setSelectedBerkas(null);
            setShowDetailPopUp(false);
          }}
        />
      )} */}
    </div>
  );
};

export default ScanQR;
