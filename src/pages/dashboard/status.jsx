import React, { useState, useEffect } from 'react'
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    IconButton,
} from '@material-tailwind/react'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import axios from '../../api/apiTangkApp'
import PopUpInsertStatus from '../../components/status/InsertStatus'
import PopUpUpdateStatus from '../../components/status/updateStatus'
import { useMaterialTailwindController } from '@/context'
import { Navigate } from 'react-router-dom'

export function Status() {
    const [statusData, setStatusData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showInsertPopup, setShowInsertPopup] = useState(false)
    const [showUpdatePopup, setShowUpdatePopup] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [controller] = useMaterialTailwindController()
    const { roleNow, token } = controller
    const [refresh, setRefresh] = useState(false)

    if (roleNow !== 'Admin') return <Navigate to="/dashboard/home" replace />

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true)
            try {
                const response = await axios.get('status', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setStatusData(response.data || [])
            } catch (error) {
                setError('Gagal memuat data status.')
            } finally {
                setLoading(false)
            }
        }

        fetchStatus()
    }, [roleNow, token, refresh])

    const handleDeleteStatus = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus status ini?')) {
            try {
                await axios.delete(`status/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setRefresh(!refresh)
                alert('Status berhasil dihapus!')
            } catch (error) {
                alert('Gagal menghapus status.')
            }
        }
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader
                    variant="gradient"
                    color="grey"
                    className="mb-8 p-6 flex justify-between items-center"
                >
                    <Typography variant="h6" color="white">
                        Tabel Status
                    </Typography>
                    <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => setShowInsertPopup(true)}
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Tambah Status
                    </Button>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : error ? (
                        <Typography color="red">{error}</Typography>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr>
                                        {['Index Status', 'Nama', 'Action'].map(
                                            (header) => (
                                                <th
                                                    key={header}
                                                    className="text-left p-2"
                                                >
                                                    {header}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {statusData.map((status) => (
                                        <tr key={status._id}>
                                            <td className="p-2">
                                                {status.indexStatus}
                                            </td>
                                            <td className="p-2">
                                                {status.nama}
                                            </td>
                                            <td className="p-2 flex gap-2">
                                                <IconButton
                                                    variant="text"
                                                    color="blue"
                                                    onClick={() => {
                                                        setSelectedStatus(
                                                            status
                                                        )
                                                        setShowUpdatePopup(true)
                                                    }}
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </IconButton>
                                                <IconButton
                                                    variant="text"
                                                    color="red"
                                                    onClick={() =>
                                                        handleDeleteStatus(
                                                            status._id
                                                        )
                                                    }
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>

            {showInsertPopup && (
                <PopUpInsertStatus
                    onClose={() => setShowInsertPopup(false)}
                    onInsertSuccess={() => {
                        setRefresh(!refresh)
                        setShowInsertPopup(false)
                    }}
                />
            )}

            {showUpdatePopup && selectedStatus && (
                <PopUpUpdateStatus
                    data={selectedStatus}
                    onClose={() => setShowUpdatePopup(false)}
                    onUpdateSuccess={() => {
                        setRefresh(!refresh)
                        setShowUpdatePopup(false)
                    }}
                />
            )}
        </div>
    )
}

export default Status
