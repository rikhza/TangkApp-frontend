import React, { useState, useEffect } from 'react'
import { Input, Button, Typography, Spinner } from '@material-tailwind/react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/apiTangkApp' // Import Axios instance
import Cookies from 'js-cookie' // Cookie management
import {
    useMaterialTailwindController,
    setLoginStatus,
    setUserData,
    setRoleNow,
    setToken,
} from '../../context'

export function SignIn() {
    const [NIK, setNIK] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [controller, dispatch] = useMaterialTailwindController()
    const { isLoggedIn } = controller

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/dashboard/home')
        }
    }, [isLoggedIn, navigate])

    useEffect(() => {
        const validateToken = async () => {
            const token = Cookies.get('authToken')
            if (!token) return setLoading(false)

            try {
                const response = await axios.get('user/check-token')
                const { user } = response.data

                setLoginStatus(dispatch, true)
                setUserData(dispatch, user)
                setRoleNow(dispatch, user.role[0])
                setToken(dispatch, token)
            } catch (err) {
                console.error('Token invalid or expired:', err)
                Cookies.remove('authToken')
            } finally {
                setLoading(false)
            }
        }

        validateToken()
    }, [dispatch])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const response = await axios.post('user/login', { NIK, password })
            const { token, user } = response.data

            Cookies.set('authToken', token, { expires: 0.5 })

            setLoginStatus(dispatch, true)
            setUserData(dispatch, user)
            setRoleNow(dispatch, user.role[0])
            setToken(dispatch, token)

            const redirectTo =
                new URLSearchParams(window.location.search).get('redirect') ||
                '/'
            if (redirectTo) {
                return navigate(redirectTo)
            } else {
                return navigate('/dashboard/home')
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                'Terjadi kesalahan, silakan coba lagi.'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner className="h-12 w-12 text-blue-500" />
            </div>
        )
    }

    return (
        <section className="m-8 flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">
                        Masuk
                    </Typography>
                    <Typography
                        variant="paragraph"
                        color="blue-gray"
                        className="text-lg font-normal"
                    >
                        Masuk dengan NIK/NIP dan password Anda.
                    </Typography>
                </div>
                <form
                    className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
                    onSubmit={handleLogin}
                >
                    <div className="mb-1 flex flex-col gap-6">
                        <label className="font-medium text-blue-gray-600">
                            NIK/NIP
                            <Input
                                size="lg"
                                placeholder="1234567890123456"
                                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                value={NIK}
                                onChange={(e) => setNIK(e.target.value)}
                            />
                        </label>
                        <label className="font-medium text-blue-gray-600">
                            Password
                            <Input
                                type="password"
                                size="lg"
                                placeholder="********"
                                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                    </div>
                    {error && (
                        <Typography
                            variant="small"
                            color="red"
                            className="mt-2 text-center font-medium"
                        >
                            {error}
                        </Typography>
                    )}
                    <Button className="mt-6" fullWidth type="submit">
                        {loading ? <Spinner size="sm" /> : 'Sign In'}
                    </Button>
                </form>
            </div>
            <div className="w-2/5 h-full hidden lg:block">
                <img
                    src="/img/TangkApp_logo_pattern.png"
                    alt="Login Illustration"
                    className="h-full w-full object-cover rounded-3xl"
                />
            </div>
        </section>
    )
}

export default SignIn
