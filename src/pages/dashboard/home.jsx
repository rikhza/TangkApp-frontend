import React, { useEffect, useState } from 'react'
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    Alert,
} from '@material-tailwind/react'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { StatisticsCard } from '@/widgets/cards'
import { useMaterialTailwindController } from '../../context'
import { useNavigate } from 'react-router-dom'
import axios from '@/api/apiTangkApp'

export function Home() {
    const [controller] = useMaterialTailwindController()
    const { isLoggedIn, roleNow } = controller
    const navigate = useNavigate()

    // Redirect ke halaman login jika tidak login
    if (!isLoggedIn) {
        navigate('/auth/sign-in')
    }

    // State untuk menyimpan data statistik dan loading
    const [statisticsCardsData, setStatisticsCardsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [countAlert, setCountAlert] = useState(0)
    const [berkasBerjalan, setBerkasBerjalan] = useState([])
    const [berkasTerhenti, setBerkasTerhenti] = useState([])
    const [error, setError] = useState(null) // Error state

    // Helper function to calculate the difference in days
    const calculateDateDifference = (date1, date2) => {
        const diffTime = Math.abs(new Date(date2) - new Date(date1))
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // Convert time to days
    }

    useEffect(() => {
        // Fetch data API for statistics
        axios
            .post('dashboard', { role: roleNow })
            .then((response) => {
                if (response.data.success) {
                    const { berjalan, selesai, terhenti } =
                        response.data.data.berkas
                    const {
                        alertSystem,
                        berjalan: berkasBerjalanResponse,
                        terhenti: berkasTerhentiResponse,
                    } = response.data.data

                    // Set the alert count if there are any items that need attention
                    let alertCount = 0

                    // Check if there are any berkas berjalan or terhenti that are more than 2 days old
                    const checkBerkasDate = (berkasList) => {
                        return berkasList.filter((berkas) => {
                            const daysDifference = calculateDateDifference(
                                berkas.dateIn,
                                new Date()
                            )
                            if (daysDifference > 2) {
                                alertCount += 1
                                return true
                            }
                            return false
                        })
                    }

                    // Apply the check to both lists
                    const overdueBerkasBerjalan = checkBerkasDate(
                        berkasBerjalanResponse
                    )
                    const overdueBerkasTerhenti = checkBerkasDate(
                        berkasTerhentiResponse
                    )

                    // Update state with the filtered lists
                    setBerkasBerjalan(overdueBerkasBerjalan)
                    setBerkasTerhenti(overdueBerkasTerhenti)
                    setCountAlert(alertCount) // Update the alert count for overdue items

                    // Update statistics cards
                    const updatedData = [
                        {
                            title: 'Berkas Berjalan',
                            value: berjalan,
                            icon: DocumentIcon,
                        },
                        {
                            title: 'Berkas Terhenti',
                            value: terhenti,
                            icon: DocumentIcon,
                        },
                    ]

                    setStatisticsCardsData(updatedData)
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [roleNow])

    return (
        <div className="mt-2">
            {/* Statistik Cards */}
            <div className="mb-12">
                {countAlert === 0 ? (
                    <></>
                ) : (
                    <Alert color="red">
                        {countAlert} Berkas Belum Diproses.
                    </Alert>
                )}
            </div>
            <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-2">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    statisticsCardsData.map(
                        ({ icon, title, footer, value, ...rest }) => (
                            <StatisticsCard
                                key={title}
                                {...rest}
                                title={title}
                                footer={footer}
                                value={value}
                                icon={React.createElement(icon, {
                                    className: 'w-6 h-6 text-white',
                                })}
                            />
                        )
                    )
                )}
            </div>
            {/* Charts Section */}
            <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-2">
                <div className="mt-12 mb-8 flex flex-col gap-12">
                    <Card>
                        <CardHeader
                            variant="gradient"
                            color="gray"
                            className="mb-8 p-6 flex flex-wrap justify-between items-center gap-4"
                        >
                            <Typography variant="h6" color="white">
                                Berkas Berjalan
                            </Typography>
                        </CardHeader>
                        <CardBody className="px-0 pt-0 pb-2">
                            {loading ? (
                                <div className="text-center py-6">
                                    <div className="spinner">Loading...</div>{' '}
                                    {/* Add a spinner or loader here */}
                                </div>
                            ) : error ? (
                                <Typography className="text-center text-red-500">
                                    {error}
                                </Typography>
                            ) : berkasBerjalan.length === 0 ? (
                                <Typography className="text-center text-blue-gray-500">
                                    Tidak ada berkas yang berjalan.
                                </Typography>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr>
                                                {[
                                                    'No Berkas',
                                                    'Tanggal Berjalan',
                                                ].map((el) => (
                                                    <th
                                                        key={el}
                                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
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
                                            {berkasBerjalan.map(
                                                (berkas, key) => {
                                                    const className = `py-3 px-5 ${
                                                        key ===
                                                        berkasBerjalan.length -
                                                            1
                                                            ? ''
                                                            : 'border-b border-blue-gray-50'
                                                    }`
                                                    return (
                                                        <tr key={berkas._id}>
                                                            <td
                                                                className={
                                                                    className
                                                                }
                                                            >
                                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                    {
                                                                        berkas.noBerkas
                                                                    }
                                                                    /
                                                                    {
                                                                        berkas.tahunBerkas
                                                                    }
                                                                </Typography>
                                                            </td>
                                                            <td
                                                                className={
                                                                    className
                                                                }
                                                            >
                                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                    {new Date(
                                                                        berkas.dateIn
                                                                    ).toLocaleDateString()}
                                                                </Typography>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
                <div className="mt-12 mb-8 flex flex-col gap-12">
                    <Card>
                        <CardHeader
                            variant="gradient"
                            color="gray"
                            className="mb-8 p-6 flex flex-wrap justify-between items-center gap-4"
                        >
                            <Typography variant="h6" color="white">
                                Berkas Terhenti
                            </Typography>
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
                            ) : berkasTerhenti.length === 0 ? (
                                <Typography className="text-center text-blue-gray-500">
                                    Tidak berkas yang terhenti.
                                </Typography>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr>
                                                {[
                                                    'No Berkas',
                                                    'Tanggal Terhenti',
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
                                            {berkasTerhenti.map(
                                                (berkas, key) => {
                                                    const className = `py-3 px-5 ${
                                                        key ===
                                                        berkasBerjalan.length -
                                                            1
                                                            ? ''
                                                            : 'border-b border-blue-gray-50'
                                                    }`

                                                    return (
                                                        <tr key={berkas._id}>
                                                            <td
                                                                className={
                                                                    className
                                                                }
                                                            >
                                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                    {
                                                                        berkas.noBerkas
                                                                    }
                                                                    /
                                                                    {
                                                                        berkas.tahunBerkas
                                                                    }
                                                                </Typography>
                                                            </td>
                                                            <td
                                                                className={
                                                                    className
                                                                }
                                                            >
                                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                    {new Date(
                                                                        berkas.dateIn
                                                                    ).toLocaleDateString()}
                                                                </Typography>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Home
