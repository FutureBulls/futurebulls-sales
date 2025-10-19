import DefaultLayout from '@/components/Layouts/DefaultLaout'
import { SendInvoiceTable } from "@/components/SendInvoiceTable/SendInvoiceTable"
import React from 'react'

const sendInvoice = () => {
    return (
        <DefaultLayout >
            <SendInvoiceTable />
        </DefaultLayout>
    )
}

export default sendInvoice
