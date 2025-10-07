import ECommerce from '@/components/Dashboard/E-commerce'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import React from 'react'

const dashboard = () => {
    return (
        <DefaultLayout >
            <ECommerce/>
        </DefaultLayout>
    )
}

export default dashboard