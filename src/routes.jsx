import {
    HomeIcon,
    UserCircleIcon,
    ChartBarIcon,
    ServerStackIcon,
    CameraIcon,
    ArchiveBoxIcon,
    QueueListIcon,
    IdentificationIcon,
} from '@heroicons/react/24/solid'
import {
    Home,
    BerkasRutin,
    PetugasUkur,
    PetugasSPS,
    Pegawai,
    Laporan,
} from '@/pages/dashboard'
import { SignIn, SignUp } from '@/pages/auth'
import ScanQR from './pages/dashboard/scanQR'
import DetailBerkas from './pages/dashboard/detailBerkas'
import Status from './pages/dashboard/status'
import { Roles } from './pages/dashboard/roles'

const icon = {
    className: 'w-5 h-5 text-inherit',
}

export const routes = [
    {
        layout: 'dashboard',
        pages: [
            {
                icon: <HomeIcon {...icon} />,
                name: 'dashboard',
                path: '/home',
                element: <Home />,
            },
            {
                icon: <CameraIcon {...icon} />,
                name: 'Scan QR',
                path: '/scanQR',
                element: <ScanQR />,
                mobileOnly: true,
            },
            {
                icon: <ArchiveBoxIcon {...icon} />,
                name: 'Berkas',
                path: '/berkas',
                element: <BerkasRutin />,
                subRoutes: [
                    {
                        name: 'Berkas Rutin',
                        path: '/berkas/berkas-rutin',
                        element: <BerkasRutin />,
                    },
                    {
                        name: 'Berkas Alih Media',
                        path: '/berkas/berkas-alih-media',
                        element: <BerkasRutin />,
                    },
                ],
            },
            {
                icon: <UserCircleIcon {...icon} />,
                name: 'User',
                path: '/user',
                role: 'Admin',
                subRoutes: [
                    {
                        name: 'Pegawai',
                        path: '/user/pegawai', // Corrected path
                        element: <Pegawai />,
                    },
                    {
                        name: 'Petugas Ukur',
                        path: '/user/petugas-ukur', // Corrected path
                        element: <PetugasUkur />,
                    },
                    {
                        name: 'Petugas SPS',
                        path: '/user/petugas-sps', // Corrected path
                        element: <PetugasSPS />,
                    },
                ],
            },
            {
                icon: <QueueListIcon {...icon} />,
                name: 'Status',
                path: '/status',
                element: <Status />,
                role: 'Admin',
            },
            {
                icon: <IdentificationIcon {...icon} />,
                name: 'Roles',
                path: '/roles',
                element: <Roles />,
                role: 'Admin',
            },
            {
                icon: <ChartBarIcon {...icon} />,
                name: 'Laporan',
                path: '/laporan',
                element: <Laporan />,
                role: ['Admin', 'Kepala Seksi Survei dan Pemetaan'],
            },
            {
                hidden: true,
                path: '/berkas/detail/:id',
                element: <DetailBerkas />,
            },
        ],
    },
    {
        title: 'auth pages',
        layout: 'auth',
        pages: [
            {
                icon: <ServerStackIcon {...icon} />,
                name: 'sign in',
                path: '/sign-in',
                element: <SignIn />,
            },
        ],
    },
]

export default routes
