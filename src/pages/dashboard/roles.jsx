import React, { useState, useEffect, useMemo } from 'react'
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    IconButton,
    Chip,
} from '@material-tailwind/react'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import axios from '../../api/apiTangkApp'
import PopUpInsertRole from '@/components/roles/InsertRoles'
import PopUpUpdateRole from '@/components/roles/UpdateRoles'
import { useMaterialTailwindController } from '@/context'
import { Navigate } from 'react-router-dom'

const colors = [
    'blue',
    'red',
    'green',
    'amber',
    'pink',
    'indigo',
    'purple',
    'teal',
    'cyan',
]

export function Roles() {
    const [rolesData, setRolesData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showInsertPopup, setShowInsertPopup] = useState(false)
    const [showUpdatePopup, setShowUpdatePopup] = useState(false)
    const [selectedRole, setSelectedRole] = useState(null)
    const [controller] = useMaterialTailwindController()
    const { roleNow, token } = controller
    const [refresh, setRefresh] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [sortConfig, setSortConfig] = useState({
        key: 'nama',
        direction: 'ascending',
    })

    if (roleNow !== 'Admin') return <Navigate to="/dashboard/home" replace />

    // Fetching Roles Data
    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true)
            try {
                const response = await axios.get('roles', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setRolesData(response.data || [])
            } catch (error) {
                setError('Gagal memuat data roles.')
            } finally {
                setLoading(false)
            }
        }

        fetchRoles()
    }, [roleNow, token, refresh])

    // Sorting function
    const requestSort = (key) => {
        let direction = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    // Sort the roles based on sortConfig
    const sortedRoles = useMemo(() => {
        const sortableRoles = [...rolesData]
        if (sortConfig !== null) {
            sortableRoles.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1
                }
                return 0
            })
        }
        return sortableRoles
    }, [rolesData, sortConfig])

    // Pagination
    const paginate = (array, page_size, page_number) => {
        return array.slice(
            (page_number - 1) * page_size,
            page_number * page_size
        )
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const currentRoles = paginate(sortedRoles, itemsPerPage, currentPage)

    // Handle Delete Role
    const handleDeleteRole = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            try {
                await axios.delete(`roles/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setRefresh(!refresh)
                alert('Role berhasil dihapus!')
            } catch (error) {
                alert('Gagal menghapus role.')
            }
        }
    }

    // Search Highlight
    const highlightText = (text, query) => {
        if (!query) return text
        const regex = new RegExp(`(${query})`, 'gi')
        return text.split(regex).map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={index} className="bg-yellow-300">
                    {part}
                </span>
            ) : (
                part
            )
        )
    }

    // Filtered Roles by Search Query
    const filteredRoles = currentRoles.filter((role) =>
        role.nama.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader
                    variant="gradient"
                    color="gray"
                    className="mb-8 p-6 flex justify-between items-center"
                >
                    <Typography variant="h6" color="white">
                        Tabel Roles
                    </Typography>
                    <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => setShowInsertPopup(true)}
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Tambah Role
                    </Button>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" />
                        </div>
                    ) : error ? (
                        <Typography color="red">{error}</Typography>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-md"
                                    placeholder="Cari Role"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                            <table className="w-full table-auto">
                                <thead className="bg-transparent text-black">
                                    <tr>
                                        {[
                                            'Role Name',
                                            'Kategori Berkas', // Kolom baru untuk kategoriBerkas
                                            'Access Status',
                                            'Action',
                                        ].map((header) => (
                                            <th
                                                key={header}
                                                className="text-left p-3 font-semibold cursor-pointer"
                                                onClick={() =>
                                                    requestSort(
                                                        header.toLowerCase()
                                                    )
                                                }
                                            >
                                                {header}
                                                {sortConfig.key ===
                                                    header.toLowerCase() &&
                                                    (sortConfig.direction ===
                                                    'ascending'
                                                        ? ' 🔼'
                                                        : ' 🔽')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoles.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="p-4 text-center"
                                            >
                                                No roles found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRoles.map((role) => (
                                            <tr
                                                key={role._id}
                                                className="hover:bg-gray-100 cursor-pointer"
                                            >
                                                <td className="p-3  max-w-xs break-words">
                                                    {highlightText(
                                                        role.nama,
                                                        searchQuery
                                                    )}
                                                </td>
                                                <td className="p-3 max-w-xs break-words">
                                                    {role.kategoriBerkas ||
                                                        'N/A'}
                                                </td>
                                                <td className="p-3 max-w-xs break-words">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {role.accessStatus.map(
                                                            (status) => (
                                                                <Chip
                                                                    color="blue"
                                                                    key={
                                                                        status.indexStatus
                                                                    }
                                                                    value={
                                                                        status.nama
                                                                    }
                                                                    className="text-xs max-w-full break-words whitespace-normal"
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 flex gap-2">
                                                    <IconButton
                                                        variant="text"
                                                        color="blue"
                                                        onClick={() => {
                                                            setSelectedRole(
                                                                role
                                                            )
                                                            setShowUpdatePopup(
                                                                true
                                                            )
                                                        }}
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </IconButton>
                                                    <IconButton
                                                        variant="text"
                                                        color="red"
                                                        onClick={() =>
                                                            handleDeleteRole(
                                                                role._id
                                                            )
                                                        }
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex justify-between mt-4">
                                <Button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </Button>
                                <Button
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={
                                        currentPage ===
                                        Math.ceil(
                                            rolesData.length / itemsPerPage
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Popups */}
            {showInsertPopup && (
                <PopUpInsertRole
                    onClose={() => setShowInsertPopup(false)}
                    onInsertSuccess={() => {
                        setRefresh(!refresh)
                        setShowInsertPopup(false)
                    }}
                    setShowInsertPopup={setShowInsertPopup}
                    setRefresh={!setRefresh}
                />
            )}

            {showUpdatePopup && selectedRole && (
                <PopUpUpdateRole
                    onClose={() => setShowUpdatePopup(false)}
                    data={selectedRole}
                    setShowUpdatePopup={setShowUpdatePopup}
                    onUpdateSuccess={() => {
                        setRefresh(!refresh)
                        setShowUpdatePopup(false)
                    }}
                />
            )}
        </div>
    )
}
