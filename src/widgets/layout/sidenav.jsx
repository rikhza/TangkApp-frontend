import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button, Typography, Select, Option } from '@material-tailwind/react'
import {
    useMaterialTailwindController,
    setOpenSidenav,
    setRoleNow,
} from '@/context'

export function Sidenav({ brandImg, brandName, routes }) {
    const [controller, dispatch] = useMaterialTailwindController()
    const { sidenavColor, sidenavType, openSidenav, roleNow, user } = controller
    const navigate = useNavigate()
    const sidenavRef = useRef(null)

    const sidenavTypes = {
        dark: 'bg-gradient-to-br from-gray-800 to-gray-900',
        white: 'bg-white shadow-sm',
        transparent: 'bg-transparent',
    }

    const handleChangeRole = (newRole) => {
        navigate('/dashboard/home')
        setRoleNow(dispatch, newRole)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidenavRef.current &&
                !sidenavRef.current.contains(event.target)
            ) {
                setOpenSidenav(dispatch, false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dispatch])

    return (
        <aside
            ref={sidenavRef}
            className={`${sidenavTypes[sidenavType]} ${
                openSidenav ? 'translate-x-0' : '-translate-x-80'
            } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
        >
            <div className="relative text-center py-6 px-8">
                {brandImg && (
                    <img
                        src="/img/Logo Stroke.png"
                        alt="Brand Logo"
                        className="mx-auto h-20 w-auto object-contain"
                    />
                )}
            </div>

            <div className="m-4">
                {/* Role Selection */}
                <div className="mb-4">
                    <Typography
                        variant="small"
                        color={sidenavType === 'dark' ? 'white' : 'blue-gray'}
                        className="font-medium uppercase mb-2"
                    >
                        Role
                    </Typography>
                    <Select
                        value={roleNow}
                        onChange={(value) => handleChangeRole(value)}
                        className="text-white"
                    >
                        {user.role.map((role) => (
                            <Option key={role} value={role}>
                                {role}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* Routes Mapping */}
                {routes.map(({ layout, title, pages }, key) =>
                    title !== 'auth pages' ? (
                        <ul key={key} className="mb-4 flex flex-col gap-1">
                            {title && (
                                <li className="mx-3.5 mt-4 mb-2">
                                    <Typography
                                        variant="small"
                                        color={
                                            sidenavType === 'dark'
                                                ? 'white'
                                                : 'blue-gray'
                                        }
                                        className="font-black uppercase opacity-75"
                                    >
                                        {title}
                                    </Typography>
                                </li>
                            )}
                            {pages.map(
                                ({
                                    icon,
                                    name,
                                    path,
                                    role,
                                    mobileOnly,
                                    hidden,
                                }) => {
                                    const isMobileOnly = mobileOnly
                                        ? 'block sm:hidden'
                                        : ''

                                    // Memeriksa apakah role pengguna ada dalam array role yang ditentukan
                                    return (role && role.includes(roleNow)) ||
                                        (!role && !hidden) ? (
                                        <li key={name} className={isMobileOnly}>
                                            <NavLink to={`/${layout}${path}`}>
                                                {({ isActive }) => (
                                                    <Button
                                                        variant={
                                                            isActive
                                                                ? 'gradient'
                                                                : 'text'
                                                        }
                                                        color={
                                                            isActive
                                                                ? sidenavColor
                                                                : sidenavType ===
                                                                  'dark'
                                                                ? 'white'
                                                                : 'blue-gray'
                                                        }
                                                        className="flex items-center gap-4 px-4 capitalize"
                                                        fullWidth
                                                    >
                                                        {icon}
                                                        <Typography
                                                            color="inherit"
                                                            className="font-medium capitalize"
                                                        >
                                                            {name}
                                                        </Typography>
                                                    </Button>
                                                )}
                                            </NavLink>
                                        </li>
                                    ) : null
                                }
                            )}
                        </ul>
                    ) : null
                )}
            </div>
        </aside>
    )
}

Sidenav.defaultProps = {
    brandName: 'tangkapp',
}

Sidenav.propTypes = {
    brandImg: PropTypes.string,
    brandName: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
}

Sidenav.displayName = '/src/widgets/layout/sidenav.jsx'

export default Sidenav
