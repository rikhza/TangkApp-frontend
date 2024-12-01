import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    IconButton,
    Button,
} from '@material-tailwind/react'
import {
    PencilIcon,
    TrashIcon,
    PlusIcon,
    EyeIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline' // Import icons
import { useMaterialTailwindController } from '@/context'
import { useEffect, useState } from 'react'
import axios from '../../api/apiTangkApp' // Import Axios instance
import PopUpInsertBerkas from '@/components/InsertPopupAlihMedia'
import DetailModal from '@/components/detailPopUp' // Import the detail modal
import PopUpUpdateBerkas from '@/components/PopUpUpdateBerkas'
import FilterPopUp from '@/components/filterPopUp'
import PopUpSelesai from '@/components/popupSelesaiSPJ'
import ReactDOMServer from 'react-dom/server'
import GenerateQRCode from '@/components/GenerateQRCode'

export function BerkasAlihMedia() {
    const [controller] = useMaterialTailwindController()
    const { roleNow, token, user } = controller

    const [berkasData, setBerkasData] = useState([]) // State untuk data berkas
    const [loading, setLoading] = useState(true) // Loading state
    const [error, setError] = useState(null) // Error state
    const [showPopup, setShowPopup] = useState(false)
    const [showUpdatePopup, setShowUpdatePopup] = useState(false)
    const [showDetail, setShowDetailPopUp] = useState(false)
    const [selectedBerkas, setSelectedBerkas] = useState(null) // State for selected berkas for detail modal
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const handlePrintQRCode = (response) => {
        const berkas = response.data
        const content = ReactDOMServer.renderToString(
            <div style={{ textAlign: 'center' }}>
                <GenerateQRCode id={berkas._id} />
            </div>
        )

        const printWindow = window.open('', '_blank')

        if (printWindow) {
            printWindow.document.write(
                `<html><head><title>https://tangkapp.id/dashboard/berkas/${berkas._id}</title></head><body>`
            )
            printWindow.document.write(content)
            printWindow.document.write(
                `<h2 style="text-align: center;">${berkas.noBerkas}/${berkas.tahunBerkas}</h2>`
            )
            printWindow.document.write('</body></html>')
            printWindow.document.close()
            printWindow.print()
        }
    }

    const [isSelesaiPopupOpen, setIsSelesaiPopupOpen] = useState(false)
    const [selectedPetugas, setSelectedPetugas] = useState('')
    const [isBNPB, setIsBNPB] = useState(false)

    const [refresh, setRefresh] = useState(false)
    const processBerkasData = (data) => {
        return data.map((berkas) => {
            const lastStatus =
                berkas.status?.statusDetail &&
                berkas.status.statusDetail[
                    berkas.status.statusDetail.length - 1
                ]

            const lastSubStatus =
                lastStatus?.subStatus &&
                lastStatus.subStatus[lastStatus.subStatus.length - 1]

            return {
                ...berkas,
                lastStatusName: lastStatus?.nama || 'N/A',
                lastSubStatusName: lastSubStatus?.nama || 'N/A',
            }
        })
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await axios.post(
                    'berkas',
                    { role: roleNow, kategoriBerkas: 'alih-media' },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Role: roleNow,
                        },
                    }
                )

                if (response.status === 200 && Array.isArray(response.data)) {
                    const processedData = processBerkasData(response.data)

                    // Sort data berdasarkan `dateIn` secara descending (latest first)
                    const sortedData = processedData.sort(
                        (a, b) => new Date(b.dateIn) - new Date(a.dateIn) // Ubah ke `a.dateIn - b.dateIn` untuk ascending
                    )

                    setBerkasData(sortedData)
                } else {
                    throw new Error('Data tidak valid atau kosong.')
                }
            } catch (err) {
                setError(
                    err.message || 'Terjadi kesalahan saat mengambil data.'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [roleNow, token, refresh])

    const [loadingSelesai, setLoadingSelesai] = useState(false)
    const [loadingTerhenti, setLoadingTerhenti] = useState(false)

    const renderActionButtons = (berkas) => {
        if (
            roleNow === 'Admin' ||
            roleNow === 'Petugas Administrasi - Entri Data'
        ) {
            return (
                <>
                    <IconButton
                        variant="text"
                        color="blue"
                        onClick={() => {
                            setSelectedBerkas(berkas) // Set berkas yang dipilih
                            setShowUpdatePopup(true) // Tampilkan popup
                        }}
                    >
                        <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton
                        variant="text"
                        color="red"
                        onClick={() => handleDeleteBerkas(berkas._id)} // Panggil fungsi hapus
                    >
                        <TrashIcon className="h-5 w-5" />
                    </IconButton>
                </>
            )
        } else {
            return (
                <>
                    {roleNow === 'Petugas Administrasi - Surat Tugas' && (
                        <Button
                            variant="gradient"
                            color="yellow"
                            size="sm"
                            onClick={() => {
                                setSelectedBerkas(berkas)
                                setShowUpdatePopup(true)
                            }}
                        >
                            update
                        </Button>
                    )}

                    <Button
                        variant="gradient"
                        color="green"
                        size="sm"
                        disabled={loadingSelesai}
                        onClick={() => {
                            setLoadingSelesai(true)
                            handleSelesai(
                                berkas._id,
                                berkas.status[berkas.status?.length - 1]
                                    ?.statusDetail[
                                    berkas.status[berkas.status?.length - 1]
                                        ?.statusDetail?.length - 1
                                ]?.nama,
                                berkas,
                                berkas.status[berkas.status?.length - 1]?.name
                            )
                        }}
                    >
                        {loadingSelesai ? (
                            <div className="flex items-center">
                                <svg
                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                                    ></path>
                                </svg>
                                Loading...
                            </div>
                        ) : (
                            'Selesai'
                        )}
                    </Button>

                    {berkas.status[berkas.status?.length - 1]?.statusDetail[
                        berkas.status[berkas.status?.length - 1]?.statusDetail
                            ?.length - 1
                    ]?.nama !== 'Terhenti' && (
                        <Button
                            color="red"
                            size="sm"
                            disabled={loadingTerhenti}
                            onClick={() => handleTerhenti(berkas._id)}
                        >
                            {loadingTerhenti ? (
                                <div className="flex items-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                                        ></path>
                                    </svg>
                                    Loading...
                                </div>
                            ) : (
                                'Terhenti'
                            )}
                        </Button>
                    )}
                </>
            )
        }
    }

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
                        kategoriBerkas: 'alih-media',
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

    const fetchFilteredData = async (filters) => {
        setLoading(true)
        try {
            const response = await axios.post('berkas/filter', {
                ...filters,
                role: roleNow, // Kirim role sebagai bagian dari filter
                kategoriBerkas: 'alih-media',
            })
            setBerkasData(response.data.data || [])
        } catch (error) {
            console.error('Gagal memuat data:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader
                    variant="gradient"
                    color="gray"
                    className="mb-8 p-6 flex flex-wrap justify-between items-center gap-4"
                >
                    <Typography variant="h6" color="white">
                        Tabel Berkas Saya
                    </Typography>
                    <div className="flex flex-wrap items-center gap-4">
                        <Button
                            variant="gradient"
                            color="blue"
                            className="flex items-center gap-2"
                            onClick={() => setIsFilterOpen(true)}
                        >
                            <FunnelIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Filter</span>
                        </Button>
                        <FilterPopUp
                            isOpen={isFilterOpen}
                            onClose={() => setIsFilterOpen(false)}
                            onApplyFilter={fetchFilteredData}
                        />
                        {roleNow === 'Admin' ||
                            (roleNow ===
                                'Petugas Administrasi - Entri Data' && (
                                <Button
                                    variant="gradient"
                                    color="blue"
                                    className="flex items-center gap-2"
                                    onClick={() => setShowPopup(true)}
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span className="hidden sm:inline">
                                        Tambah
                                    </span>
                                </Button>
                            ))}
                    </div>
                </CardHeader>

                <CardBody className="px-0 pt-0 pb-2">
                    {loading ? (
                        <Typography className="text-center">
                            Loading...
                        </Typography>
                    ) : error ? (
                        <Typography className="text-center text-red-500">
                            {error}
                        </Typography>
                    ) : berkasData.length === 0 ? (
                        <Typography className="text-center text-blue-gray-500">
                            Tidak ada data yang tersedia.
                        </Typography>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1200px] table-auto">
                                <thead>
                                    <tr>
                                        {[
                                            'No Berkas',
                                            'Tanggal Terima',
                                            'Kegiatan',
                                            'Pemohon',
                                            'Desa',
                                            // "Status", //hide status
                                            'SubStatus',
                                            'Action',
                                            'Detail',
                                        ].map((el) => (
                                            <th
                                                key={el}
                                                className={`border-b border-blue-gray-50 py-3 px-5 text-left ${
                                                    el === 'Action' ||
                                                    el === 'Detail'
                                                        ? 'sticky right-0 bg-gray-50 z-10 hide-on-mobile'
                                                        : ''
                                                }`}
                                            >
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {berkasData.map((berkas, key) => {
                                        const className = `py-3 px-5 ${
                                            key === berkasData.length - 1
                                                ? ''
                                                : 'border-b border-blue-gray-50'
                                        }`

                                        return (
                                            <tr key={berkas._id}>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {berkas.noBerkas}/
                                                        {berkas.tahunBerkas}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {new Date(
                                                            berkas.tanggalTerima
                                                        ).toLocaleDateString()}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {berkas.namaKegiatan}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {berkas.namaPemohon}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {berkas.namaDesa}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {berkas.status?.[
                                                            berkas.status
                                                                .length - 1
                                                        ]?.statusDetail?.[
                                                            berkas.status[
                                                                berkas.status
                                                                    .length - 1
                                                            ]?.statusDetail
                                                                ?.length - 1
                                                        ]?.nama ? (
                                                            <span
                                                                className={`px-2 py-1 text-xs font-medium rounded ${
                                                                    berkas
                                                                        .status[
                                                                        berkas
                                                                            .status
                                                                            .length -
                                                                            1
                                                                    ]
                                                                        ?.statusDetail?.[
                                                                        berkas
                                                                            .status[
                                                                            berkas
                                                                                .status
                                                                                .length -
                                                                                1
                                                                        ]
                                                                            ?.statusDetail
                                                                            ?.length -
                                                                            1
                                                                    ]?.nama ===
                                                                    'Berjalan'
                                                                        ? 'bg-blue-500 text-white'
                                                                        : 'bg-red-500 text-white'
                                                                }`}
                                                            >
                                                                {
                                                                    berkas
                                                                        .status[
                                                                        berkas
                                                                            .status
                                                                            .length -
                                                                            1
                                                                    ]
                                                                        ?.statusDetail?.[
                                                                        berkas
                                                                            .status[
                                                                            berkas
                                                                                .status
                                                                                .length -
                                                                                1
                                                                        ]
                                                                            ?.statusDetail
                                                                            ?.length -
                                                                            1
                                                                    ]?.nama
                                                                }
                                                            </span>
                                                        ) : (
                                                            'Unknown'
                                                        )}
                                                    </Typography>
                                                </td>
                                                <td
                                                    className={`${className} sticky right-0 bg-gray-50 z-10 hide-on-mobile`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {renderActionButtons(
                                                            berkas
                                                        )}
                                                    </div>
                                                </td>
                                                <td
                                                    className={`${className} sticky right-0 bg-gray-50 z-10`}
                                                >
                                                    <IconButton
                                                        variant="text"
                                                        color="blue"
                                                        onClick={() => {
                                                            setSelectedBerkas(
                                                                berkas
                                                            )
                                                            setShowDetailPopUp(
                                                                true
                                                            )
                                                        }}
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>
            {showPopup && (
                <PopUpInsertBerkas
                    onClose={() => setShowPopup(false)}
                    onInsertSuccess={(newBerkas, print) => {
                        setShowPopup(false)
                        if (print) {
                            handlePrintQRCode(newBerkas)
                        }
                        setRefresh(!refresh)
                    }}
                    kategoriBerkas={'alih-media'}
                />
            )}

            {showUpdatePopup && selectedBerkas && (
                <PopUpUpdateBerkas
                    data={selectedBerkas} // Kirim data dari selectedBerkas
                    onClose={() => {
                        setShowUpdatePopup(false) // Tutup popup
                        setSelectedBerkas(null) // Reset selectedBerkas
                    }}
                    onUpdateSuccess={(updatedData) => {
                        setBerkasData((prevData) =>
                            prevData.map((berkas) =>
                                berkas._id === updatedData._id
                                    ? updatedData
                                    : berkas
                            )
                        )
                        setRefresh(!refresh) // Segarkan data tabel
                    }}
                />
            )}
            {selectedBerkas && showDetail && (
                <DetailModal
                    setSelectedBerkas={setSelectedBerkas}
                    setShowUpdatePopup={setShowUpdatePopup}
                    handleTerhenti={handleTerhenti}
                    handleDeleteBerkas={handleDeleteBerkas}
                    handleSelesai={handleSelesai}
                    berkas={selectedBerkas}
                    onClose={() => {
                        setSelectedBerkas(null)
                        setShowDetailPopUp(false)
                    }}
                />
            )}
            {isSelesaiPopupOpen && (
                <PopUpSelesai
                    isOpen={isSelesaiPopupOpen}
                    onClose={() => setIsSelesaiPopupOpen(false)}
                    data={selectedBerkas}
                    onCompleteSuccess={async ({
                        idPetugasUkur,
                        namaPetugasUkur,
                        statusBayarPNBP,
                        notes,
                    }) => {
                        try {
                            const response = await axios.post(
                                `berkas/updateStatus/${selectedBerkas._id}/selesai`,
                                {
                                    userIn: user._id,
                                    NIK: user.NIK,
                                    namaUser: user.nama,
                                    notes,
                                    role: roleNow,
                                    idPetugasUkur,
                                    namaPetugasUkur,
                                    statusBayarPNBP,
                                    kategoriBerkas: 'alih-media',
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        Role: roleNow,
                                    },
                                }
                            )
                            if (response.status === 200) {
                                alert('Status berhasil diperbarui!')
                                setRefresh(!refresh)
                            } else {
                                throw new Error('Gagal memperbarui status.')
                            }
                        } catch (error) {
                            console.error('Error:', error)
                            alert('Terjadi kesalahan saat memperbarui status.')
                        }
                    }}
                />
            )}
        </div>
    )
}

export default BerkasAlihMedia
