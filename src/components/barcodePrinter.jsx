import React, { useRef } from 'react'
import Barcode from 'react-barcode'

const BarcodePrinter = () => {
    const printRef = useRef < HTMLDivElement > null

    // Fungsi untuk mencetak menggunakan window.open
    const handlePrintWindow = () => {
        const printContents = printRef.current?.innerHTML
        if (!printContents) {
            alert('Nothing to print!')
            return
        }

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.open()
            printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
              }
            </style>
          </head>
          <body onload="window.print();window.close()">
            ${printContents}
          </body>
        </html>
      `)
            printWindow.document.close()
        } else {
            alert(
                'Unable to open print window. Please check your browser settings.'
            )
        }
    }

    // Fungsi untuk mencetak langsung dari halaman
    const handlePrintDirect = () => {
        const printContents = printRef.current?.innerHTML
        if (!printContents) {
            alert('Nothing to print!')
            return
        }

        const originalContents = document.body.innerHTML
        document.body.innerHTML = printContents
        window.print()
        document.body.innerHTML = originalContents
    }

    return (
        <div>
            <h1>Barcode Printer</h1>
            {/* Area untuk menampilkan barcode */}
            <div ref={printRef}>
                <Barcode value="https://example.com/your-link" />
            </div>

            {/* Tombol untuk mencetak */}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={handlePrintWindow}
                    style={{ marginRight: '10px' }}
                >
                    Print using Window
                </button>
                <button onClick={handlePrintDirect}>Print Directly</button>
            </div>
        </div>
    )
}

export default BarcodePrinter
