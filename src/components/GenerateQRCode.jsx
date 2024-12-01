import React, { useEffect, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'

const GenerateQRCode = ({ id, pageType }) => {
    const svgRef = useRef(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        // Ensure QR code generation happens only in the client-side
        setIsClient(true)

        // Only generate QR code if we are on the client
        if (isClient) {
            // Default the data URL to a generic QR code, then update based on pageType
            let qrData = ''
            if (pageType === 'berkasRutin') {
                qrData = `https://tangkapp.id/dashboard/berkas/berkas-rutin/${id}`
            } else if (pageType === 'berkasAlihMedia') {
                qrData = `https://tangkapp.id/dashboard/berkas/berkas-alih-media/${id}`
            } else {
                qrData = `https://tangkapp.id/dashboard/berkas/${id}` // Default to generic if no match
            }

            const qrCode = new QRCodeStyling({
                width: 256, // Size of the QR Code
                height: 256, // Size of the QR Code
                type: 'svg', // Specify SVG type for better quality
                data: qrData, // Set the data to the appropriate URL
                image: '/img/Logo.png', // Path to logo image
                imageOptions: {
                    crossOrigin: 'anonymous', // Handle cross-origin requests
                    margin: 20, // Margin around the image inside the QR
                    imageSize: 0.4, // Logo size at 40% of the QR code
                },
                dotsOptions: {
                    color: '#0056b3', // Deep blue color for dots
                    type: 'rounded', // Rounded dots style
                    gradient: {
                        type: 'radial', // Radial gradient for subtle effect
                        rotation: Math.PI / 4, // 45-degree rotation
                        colorStops: [
                            { offset: 0, color: '#0056b3' }, // Start with dark blue
                            { offset: 1, color: '#007bff' }, // End with lighter blue
                        ],
                    },
                },
                backgroundOptions: {
                    color: '#ffffff', // White background
                    gradient: {
                        type: 'linear', // Linear gradient for smooth look
                        rotation: 0, // Horizontal gradient
                        colorStops: [
                            { offset: 0, color: '#ffffff' }, // White
                            { offset: 1, color: '#f0faff' }, // Subtle light blue tint
                        ],
                    },
                },
                cornersSquareOptions: {
                    color: '#0056b3', // Matching blue for square corners
                    type: 'square', // Square corners for modern simplicity
                },
                cornersDotOptions: {
                    color: '#0056b3', // Matching blue for corner dots
                    type: 'dot', // Dot style for rounded corners
                },
            })

            // Append the QR code as an SVG to the svgRef container
            if (svgRef.current) {
                qrCode.append(svgRef.current)
            }

            // Cleanup the QR code instance when the component is unmounted or id changes
            return () => {
                if (svgRef.current) {
                    svgRef.current.innerHTML = ''
                }
            }
        }
    }, [id, pageType, isClient]) // Re-run the effect when `id` or `pageType` changes

    if (!isClient) {
        return <div>Loading...</div> // Optionally, you can render a loading state for SSR
    }

    return (
        <div>
            <h1>Kode QR Berkas</h1>
            <div ref={svgRef}></div>
            {/* This div will hold the generated SVG QR code */}
        </div>
    )
}

export default GenerateQRCode
