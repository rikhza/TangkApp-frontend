import axios from '@/api/apiTangkApp';
import DetailModal from '@/components/detailPopUp';
import PopUpUpdateBerkas from '@/components/PopUpUpdateBerkas'
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
    const [showUpdatePopup, setShowUpdatePopup] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [loadingSelesai, setLoadingSelesai] = useState(false)
    const [loadingTerhenti, setLoadingTerhenti] = useState(false)

    useEffect(() => {
        console.log(showUpdatePopup)
    }, [showUpdatePopup])

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
    }, [id, refresh])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    const handleSelesai = async (idBerkas, subStatus, berkas, status) => {
        try {
            let notes
            console.log(status)
            // const status = berkas.statusTerhenti
            if (status === 'Proses Surat Tugas Pengukuran (SPJ)') {
                berkas.statusTerhenti = subStatus
                setSelectedBerkas(berkas) // Set data berkas
                setIsSelesaiPopupOpen(true)
            } else {
                if (status === 'Terhenti') {
                    notes = prompt('Masukkan catatan (opsional): ')
                    if (!notes) return
                }
                const response = await axios.post(
                    `berkas/updateStatus/${idBerkas}/selesai`,
                    {
                        notes,
                        userIn: user._id,
                        NIK: user.NIK,
                        namaUser: user.nama,
                        role: roleNow,
                        kategoriBerkas: berkas.kategoriBerkas,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Role: roleNow,
                        },
                    }
                )

                if (response.status === 200) {
                    alert("Status berhasil diperbarui ke 'Selesai'!")
                    setRefresh(!refresh) // Refresh data tabel
                    setLoadingSelesai(false)
                } else {
                    setLoadingSelesai(false)
                    throw new Error('Gagal memperbarui status.')
                }
            }
        } catch (error) {
            console.error("Error saat memperbarui status ke 'Selesai':", error)
            alert("Terjadi kesalahan saat memperbarui status ke 'Selesai'.")
        }
    }

    const handleTerhenti = async (idBerkas, deskripsiKendala) => {
        setLoadingTerhenti(true)
        const kendala = prompt('Masukkan deskripsi kendala:')
        if (!kendala) return

        try {
            const response = await axios.post(
                `berkas/updateStatus/${idBerkas}/terhenti`,
                { deskripsiKendala: kendala },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Role: roleNow,
                    },
                }
            )

            if (response.status === 200) {
                alert("Status berhasil diperbarui ke 'Terhenti'!")
                setRefresh(!refresh) // Refresh data tabel
                setLoadingTerhenti(false)
            } else {
                setLoadingTerhenti(false)
                throw new Error('Gagal memperbarui status.')
            }
        } catch (error) {
            console.error("Error saat memperbarui status ke 'Terhenti':", error)
            alert("Terjadi kesalahan saat memperbarui status ke 'Terhenti'.")
        }
    }

    const handleDeleteBerkas = async (idBerkas) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus berkas ini?')) {
            try {
                const response = await axios.delete(`berkas/${idBerkas}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Role: roleNow,
                    },
                })

                if (response.status === 200) {
                    alert('Berkas berhasil dihapus!')
                    setBerkasData((prevData) =>
                        prevData.filter((berkas) => berkas._id !== idBerkas)
                    )
                } else {
                    throw new Error('Gagal menghapus berkas.')
                }
            } catch (error) {
                console.error('Error saat menghapus berkas:', error)
                alert('Terjadi kesalahan saat menghapus berkas.')
            }
        }
    }

    return (
        <>
            <DetailModal
                setSelectedBerkas={setBerkas}
                setShowUpdatePopup={setShowUpdatePopup}
                handleTerhenti={handleTerhenti}
                handleDeleteBerkas={handleDeleteBerkas}
                handleSelesai={handleSelesai}
                berkas={berkas}
                accessRole={accessRole}
                onClose={() => {
                    if (!showUpdatePopup) navigate('/dashboard/home')
                }}
            />
            {showUpdatePopup && (
                <PopUpUpdateBerkas
                    data={berkas} // Kirim data dari selectedBerkas
                    onClose={() => {
                        setShowUpdatePopup(false) // Tutup popup
                        setSelectedBerkas(berkas) // Reset selectedBerkas
                    }}
                    onUpdateSuccess={(updatedData) => {
                        // setBerkas((prevData) =>
                        //     prevData.map((berkas) =>
                        //         berkas._id === updatedData._id
                        //             ? updatedData
                        //             : berkas
                        //     )
                        // )
                        setRefresh(!refresh) // Segarkan data tabel
                    }}
                />
            )}
        </>
    )
}

export default DetailBerkas;
