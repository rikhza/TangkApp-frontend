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
import PopUpInsertUser from '@/components/users/InsertUser'
import PopUpUpdateUser from '@/components/users/UpdateUser'
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

export function Users() {
    const [usersData, setUsersData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showInsertPopup, setShowInsertPopup] = useState(false)
    const [showUpdatePopup, setShowUpdatePopup] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [controller] = useMaterialTailwindController()
    const { roleNow, token } = controller
    const [refresh, setRefresh] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [sortConfig, setSortConfig] = useState({
        key: 'NIK',
        direction: 'ascending',
    })

    if (roleNow !== 'Admin') return <Navigate to="/dashboard/home" replace />

    // Fetching Users Data
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const response = await axios.get('user', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setUsersData(response.data || [])
            } catch (error) {
                setError('Gagal memuat data users.')
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [roleNow, token, refresh])

    // Sorting function
    const requestSort = (key) => {
        let direction = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    // Sort the users based on sortConfig
    const sortedUsers = useMemo(() => {
        const sortableUsers = [...usersData]
        if (sortConfig !== null) {
            sortableUsers.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1
                }
                return 0
            })
        }
        return sortableUsers
    }, [usersData, sortConfig])

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

    const currentUsers = paginate(sortedUsers, itemsPerPage, currentPage)

    // Handle Delete User
    const handleDeleteUser = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            try {
                await axios.delete(`user/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setRefresh(!refresh)
                alert('User berhasil dihapus!')
            } catch (error) {
                alert('Gagal menghapus user.')
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

    // Filtered Users by Search Query
    const filteredUsers = currentUsers.filter(
        (user) =>
            user.NIK.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.nama.toLowerCase().includes(searchQuery.toLowerCase())
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
                        Tabel Users
                    </Typography>
                    <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => setShowInsertPopup(true)}
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Tambah User
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
                                    placeholder="Cari NIK/NIP atau Nama"
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
                                            'NIK/NIP',
                                            'Nama',
                                            'Role',
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
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="p-4 text-center"
                                            >
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr
                                                key={user._id}
                                                className="hover:bg-gray-100 cursor-pointer"
                                            >
                                                <td className="p-3">
                                                    {highlightText(
                                                        user.NIK,
                                                        searchQuery
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {highlightText(
                                                        user.nama,
                                                        searchQuery
                                                    )}
                                                </td>
                                                <td className="p-3 max-w-xs break-words">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {user.role.map((x) => (
                                                            <Chip
                                                                color="blue"
                                                                key={x}
                                                                value={x}
                                                                className="text-xs"
                                                            />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-3 flex gap-2">
                                                    <IconButton
                                                        variant="text"
                                                        color="blue"
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                user
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
                                                            handleDeleteUser(
                                                                user._id
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
                                            sortedUsers.length / itemsPerPage
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

            {showInsertPopup && (
                <PopUpInsertUser
                    onClose={() => setShowInsertPopup(false)}
                    onInsertSuccess={() => {
                        setRefresh(!refresh)
                        setShowInsertPopup(false)
                    }}
                />
            )}

            {showUpdatePopup && selectedUser && (
                <PopUpUpdateUser
                    data={selectedUser}
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

export default Users
