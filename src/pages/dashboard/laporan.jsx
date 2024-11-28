import React, { useState, useEffect } from 'react'
import axios from 'axios'
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

const ReportingPage = () => {
    const [berkasData, setBerkasData] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch data from backend API
    useEffect(() => {
        axios
            .get('/api/berkas') // Replace with actual backend API endpoint
            .then((response) => {
                setBerkasData(response.data)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setLoading(false)
            })
    }, [])

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

            {/* Laporan Rata-Rata Berkas Selesai */}
            <section className="mb-8">
                <h2 className="text-2xl font-medium mb-4">
                    Rata-Rata Berkas Selesai
                </h2>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h3 className="text-xl">
                        Rata-rata Berkas yang Selesai: {prepareAverageBerkas()}%
                    </h3>
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
