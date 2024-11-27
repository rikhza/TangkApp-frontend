import axios from '@/api/apiTangkApp';
import DetailModal from '@/components/detailPopUp';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function DetailBerkas() {
  const { id } = useParams(); // Ambil parameter ID dari URL
  const [berkas, setBerkas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fungsi untuk mengambil detail berkas berdasarkan ID

    const fetchBerkas = async () => {
      try {
        const response = await axios.get(`/berkas/detail/${id}`);
        setBerkas(response.data);
      } catch (err) {
        setError('Tidak dapat memuat data berkas.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBerkas();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DetailModal
      setSelectedBerkas={berkas}
      // setShowUpdatePopup={setShowUpdatePopup}
      // handleTerhenti={handleTerhenti}
      // handleDeleteBerkas={handleDeleteBerkas}
      // handleSelesai={handleSelesai}
      berkas={berkas}
      onClose={() => {
        navigate('/dashboard/home');
      }}
    />
  );
}

export default DetailBerkas;
