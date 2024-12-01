import axios from '@/api/apiTangkApp';
import DetailModal from '@/components/detailPopUp';
import { useMaterialTailwindController } from '@/context'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function DetailBerkas() {
    const { id } = useParams() // Ambil parameter ID dari URL
    const [berkas, setBerkas] = useState(null)
    const [accessRole, setAccessRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const [controller] = useMaterialTailwindController()
    const { roleNow, token, user } = controller

    useEffect(() => {
        // Fungsi untuk mengambil detail berkas berdasarkan ID

        const fetchBerkas = async () => {
            try {
                const response = await axios.post(`/berkas/detail/${id}`, {
                    role: roleNow,
                })
                setBerkas(response.data.berkas)
                setAccessRole(response.data.role)
            } catch (err) {
                setError('Tidak dapat memuat data berkas.')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchBerkas()
        }
    }, [id])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <DetailModal
            setSelectedBerkas={berkas}
            // setShowUpdatePopup={setShowUpdatePopup}
            // handleTerhenti={handleTerhenti}
            // handleDeleteBerkas={handleDeleteBerkas}
            // handleSelesai={handleSelesai}
            berkas={berkas}
            accessRole={accessRole}
            onClose={() => {
                navigate('/dashboard/home')
            }}
        />
    )
}

export default DetailBerkas;
