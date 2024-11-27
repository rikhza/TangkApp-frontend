import React, { useEffect, useState } from 'react'
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Avatar,
    Tooltip,
    Progress,
    Alert,
} from '@material-tailwind/react'
import {
    EllipsisVerticalIcon,
    ArrowUpIcon,
    DocumentIcon,
} from '@heroicons/react/24/outline'
import { StatisticsCard } from '@/widgets/cards'
import { StatisticsChart } from '@/widgets/charts'
import {
    statisticsChartsData,
    projectsTableData,
    ordersOverviewData,
} from '@/data'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid'
import { useMaterialTailwindController } from '../../context'
import { Link, useNavigate } from 'react-router-dom'
import axios from '@/api/apiTangkApp'
import GenerateQRCode from '@/components/GenerateQRCode'
import ScanQRCode from '@/components/ScanQRCode'

export function Home() {
    const [controller] = useMaterialTailwindController()
    const { isLoggedIn, user, roleNow } = controller
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

    useEffect(() => {
        // Fetch data API untuk statistik
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
                        {
                            title: 'Berkas Selesai',
                            value: selesai,
                            icon: DocumentIcon,
                        },
                    ]
                    setCountAlert(alertSystem)
                    setBerkasBerjalan(berkasBerjalanResponse)
                    setBerkasTerhenti(berkasTerhentiResponse)
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
            <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-3 xl:grid-cols-3">
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
                                <Typography className="text-center">
                                    Loading...
                                </Typography>
                            ) : error ? (
                                <Typography className="text-center text-red-500">
                                    {error}
                                </Typography>
                            ) : berkasBerjalan.length === 0 ? (
                                <Typography className="text-center text-blue-gray-500">
                                    Tidak berkas yang berjalan.
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
            {/* <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon
                  strokeWidth={2}
                  className="h-4 w-4 text-blue-gray-400"
                />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div> */}
            {/* <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Projects
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-gray-200"
                />
                <strong>30 done</strong> this month
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {['companies', 'members', 'budget', 'completion'].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {projectsTableData.map(
                  ({ img, name, members, budget, completion }, key) => {
                    const className = `py-3 px-5 ${
                      key === projectsTableData.length - 1
                        ? ''
                        : 'border-b border-blue-gray-50'
                    }`;

                    return (
                      <tr key={name}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Avatar src={img} alt={name} size="sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {name}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          {members.map(({ img, name }, key) => (
                            <Tooltip key={name} content={name}>
                              <Avatar
                                src={img}
                                alt={name}
                                size="xs"
                                variant="circular"
                                className={`cursor-pointer border-2 border-white ${
                                  key === 0 ? '' : '-ml-2.5'
                                }`}
                              />
                            </Tooltip>
                          ))}
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {budget}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="w-10/12">
                            <Typography
                              variant="small"
                              className="mb-1 block text-xs font-medium text-blue-gray-600"
                            >
                              {completion}%
                            </Typography>
                            <Progress
                              value={completion}
                              variant="gradient"
                              color={completion === 100 ? 'green' : 'blue'}
                              className="h-1"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Orders Overview
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>24%</strong> this month
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {ordersOverviewData.map(
              ({ icon, color, title, description }, key) => (
                <div key={title} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                      key === ordersOverviewData.length - 1
                        ? 'after:h-0'
                        : 'after:h-4/6'
                    }`}
                  >
                    {React.createElement(icon, {
                      className: `!w-5 !h-5 ${color}`,
                    })}
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      {title}
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {description}
                    </Typography>
                  </div>
                </div>
              )
            )}
          </CardBody>
        </Card>
      </div> */}
        </div>
    )
}

export default Home
