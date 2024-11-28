import React, { useState, useEffect } from 'react'
import axios from '../../api/apiTangkApp'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { Button, Spinner } from '@material-tailwind/react' // Importing Material Tailwind components
import { useMaterialTailwindController } from '@/context' // Atau sesuai dengan path yang benar

const ReportingPage = () => {
    const [controller] = useMaterialTailwindController()
    const { roleNow, token, user } = controller
    const [berkasData, setBerkasData] = useState([])
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(false)
    const [error, setError] = useState(null) // Error state

    // Fetch data from backend API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await axios.post(
                    'berkas',
                    { role: roleNow },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Role: roleNow,
                        },
                    }
                )

                console.log(response.data) // Log response data

                if (response.status === 200 && Array.isArray(response.data)) {
                    const processedData = processBerkasData(response.data)

                    const sortedData = processedData.sort(
                        (a, b) => new Date(b.dateIn) - new Date(a.dateIn)
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

    // Prepare the data for chart visualizations
    const prepareDataPerMonth = () => {
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ]
        const monthlyData = new Array(12).fill(0)

        berkasData.forEach((berkas) => {
            const month = new Date(berkas.tanggalTerima).getMonth()
            monthlyData[month]++
        })

        return months.map((month, index) => ({
            name: month,
            jumlahBerkas: monthlyData[index],
        }))
    }

    const prepareAverageBerkas = () => {
        const totalBerkas = berkasData.length
        const totalSelesai = berkasData.filter(
            (berkas) => berkas.status === 'Selesai'
        ).length
        const average = (totalSelesai / totalBerkas) * 100
        return average.toFixed(2) // Return average percentage of berkas completed
    }

    const prepareStatusData = () => {
        const statusCount = {}
        berkasData.forEach((berkas) => {
            const status = berkas.lastStatus.name
            statusCount[status] = (statusCount[status] || 0) + 1
        })
        return Object.entries(statusCount).map(([status, count]) => ({
            status,
            count,
        }))
    }

    // Loading state while data is being fetched
    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <Spinner color="blue" />
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Laporan Jumlah Berkas per Bulan */}
            <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4">
                    Jumlah Berkas per Bulan
                </h2>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={prepareDataPerMonth()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="jumlahBerkas" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Laporan Status Berkas */}
            <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4">
                    Laporan Status Berkas
                </h2>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={prepareStatusData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Laporan Pemohon */}
            <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4">Laporan Pemohon</h2>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <ul>
                        {berkasData.map((berkas, index) => (
                            <li key={index} className="py-2">
                                <span className="font-medium">
                                    {berkas.namaPemohon}
                                </span>{' '}
                                - {berkas.noBerkas}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Laporan Kegiatan */}
            <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4">Laporan Kegiatan</h2>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <ul>
                        {berkasData.map((berkas, index) => (
                            <li key={index} className="py-2">
                                <span className="font-medium">
                                    {berkas.namaKegiatan}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Laporan Petugas Ukur */}
            <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4">
                    Laporan Petugas Ukur
                </h2>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <ul>
                        {berkasData.map((berkas, index) => (
                            <li key={index} className="py-2">
                                <span className="font-medium">
                                    {berkas.namaPetugasUkur}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Laporan Kinerja Pegawai */}
            <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4">
                    Laporan Kinerja Pegawai
                </h2>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <ul>
                        {berkasData.map((berkas, index) => (
                            <li key={index} className="py-2">
                                <span className="font-medium">
                                    {berkas.namaUser}
                                </span>{' '}
                                - {berkas.status[0].name}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    )
}

export default ReportingPage
