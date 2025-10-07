"use client";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import { Dialog } from "@headlessui/react";
import { getOnboardingAPI, getOnboardingDataByID, updateOnboardingDetails } from "@/app/services/onboarding.service";

interface OnboardingRecord {
    _id: string;
    onboardingType: 'Manual' | 'Automatic';
    paymentlink_id?: string;
    course?: {
        _id: string,
        title: string
    };
    sellBy?: {
        _id: string,
        name: string,
        email: string
    };
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    onboardingStatus: 'Pending' | 'Processing' | 'Complete' | 'Blocker';
    batch: string;
    onboardingComment: string;
}

export const OnboardingTable = () => {
    const [currentTab, setCurrentTab] = useState<'All' | 'Pending' | 'Processing' | 'Complete' | 'Blocker'>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [onboardingData, setOnboardingData] = useState<OnboardingRecord[]>();
    const [singleOnboardingData, setSingleOnboardingData] = useState<OnboardingRecord>();

    useEffect(() => {
        async function getOnboardingData() {
            try {
                const data: any = await getOnboardingAPI();
                setOnboardingData(data.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        getOnboardingData();
    }, []);

    const filteredData = onboardingData?.filter(item =>
        (currentTab === 'All' || item.onboardingStatus === currentTab) &&
        (
            item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.customerPhone.includes(searchTerm) ||
            (item.batch && item.batch.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.course?.title && item.course.title.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );    

    const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
    const currentItems = filteredData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOnboardingRowClick = async (id: any) => {
        const response: any = await getOnboardingDataByID(id);
        setSingleOnboardingData(response.data.data);
        setIsOpen(true);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSingleOnboardingData(prev =>
            prev ? { ...prev, customerName: e.target.value } : undefined
        );
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSingleOnboardingData(prev =>
            prev ? { ...prev, customerEmail: e.target.value } : undefined
        );
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSingleOnboardingData(prev =>
            prev ? { ...prev, customerPhone: e.target.value } : undefined
        );
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const status = e.target.value as OnboardingRecord['onboardingStatus'];
        setSingleOnboardingData(prev =>
            prev ? { ...prev, onboardingStatus: status } : undefined
        );
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSingleOnboardingData(prev =>
            prev ? { ...prev, onboardingComment: e.target.value } : undefined
        );
    };

    const handleSubmit = async (event: any) => {
        let response;
        try {
            setIsOpen(false);
            event.preventDefault();

            response = await updateOnboardingDetails(singleOnboardingData)
            Swal.close();

            if (response.status === 200) {
                Swal.fire({
                    title: "Success!",
                    text: "Update Successfully.",
                    icon: "success",
                    confirmButtonText: "OK",
                });
                const updatedResponse = await getOnboardingAPI();
                setOnboardingData(updatedResponse.data.data);
            }
        } catch (error: any) {
            console.log("error", error.message);
            console.log("error", response?.data);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to create payment link.",
                icon: "error",
                confirmButtonColor: "Blue",
                confirmButtonText: "OK",
            });
        }
    }

    return (
        <>
            <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
                <div className="flex flex-wrap items-center justify-between">
                    <h4 className="text-body-2xlg font-bold text-dark dark:text-white">User Onboarding</h4>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 border rounded-md text-dark dark:text-white bg-gray-100 dark:bg-gray-700"
                    />
                </div>

                {/* Tabs */}
                <div className="mt-4 flex space-x-4 overflow-x-auto">
                    {["All", "Pending", "Processing", "Complete", "Blocker"].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setCurrentTab(status as any); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-md ${currentTab === status ? 'bg-blue-500 text-white' : 'bg-gray-200 text-dark'}`}
                        >
                            {status} <span className="ml-2 bg-white text-blue-500 px-3 py-1 rounded-full text-sm font-semibold shadow-md">{onboardingData?.filter(item => status === 'All' || item.onboardingStatus === status).length}</span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="max-w-full overflow-x-auto mt-4">
                    <table className="w-full table-auto border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                                <th className="min-w-[220px] border-b border-[#eee] px-4 py-3 font-medium text-dark dark:border-dark-3 dark:text-white xl:pl-7.5">Customer Name</th>
                                <th className="border-b border-[#eee] px-4 py-3 text-right font-medium text-dark dark:border-dark-3 dark:text-white xl:pr-7.5">Customer Info</th>
                                <th className="border-b border-[#eee] px-4 py-3 text-right font-medium text-dark dark:border-dark-3 dark:text-white xl:pr-7.5">Course Name</th>
                                <th className="border-b border-[#eee] px-4 py-3 text-right font-medium text-dark dark:border-dark-3 dark:text-white xl:pr-7.5">Batch</th>
                                <th className="border-b border-[#eee] px-4 py-3 text-right font-medium text-dark dark:border-dark-3 dark:text-white xl:pr-7.5">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems?.map((brand, index) => (
                                <tr key={index} className="relative border-b hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleOnboardingRowClick(brand._id)}>
                                    <td className="px-4 py-4 text-center dark:border-dark-3 text-dark dark:text-white">{brand.customerName}</td>
                                    <td className="px-4 py-4 text-right dark:border-dark-3 text-dark dark:text-white">{brand.customerPhone} <br /> {brand.customerEmail}</td>
                                    <td className="px-4 py-4 text-right dark:border-dark-3 text-dark dark:text-white">{brand.course?.title}</td>
                                    <td className="px-4 py-4 text-right dark:border-dark-3 text-dark dark:text-white">{brand.batch}</td>
                                    <td className="px-4 py-4 text-right dark:border-dark-3">
                                        <span className={`inline-flex rounded-full px-4 py-1 text-body-sm font-semibold shadow-md ${brand.onboardingStatus === "Complete" ? "bg-green-100 text-green-600" : brand.onboardingStatus === "Blocker" ? "bg-red-100 text-red-600" : brand.onboardingStatus === "Processing" ? "bg-orange-100 text-orange-600" : "bg-yellow-100 text-yellow-600"}`}>{brand.onboardingStatus}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 mx-1 border rounded-md bg-gray-200">Previous</button>
                    <span className="px-4 py-2 mx-1">Page {currentPage} of {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 mx-1 border rounded-md bg-gray-200">Next</button>
                </div>
            </div>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
                {/* Overlay */}
                <div
                    className="fixed inset-0"
                    style={{ backgroundColor: "rgba(17, 30, 60, 0.6)" }}
                />

                <div className="relative w-full max-w-lg rounded-lg bg-white p-8 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <button
                        className="absolute right-4 top-4 text-red-600"
                        onClick={() => setIsOpen(false)}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>

                    <h3 className="mb-6 text-2xl font-bold text-dark dark:text-white">
                        Onboarding Data
                    </h3>

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit}>
                        <main className="h-[500px] overflow-auto">
                            {/* Customer Name Field */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    value={singleOnboardingData?.customerName}
                                    onChange={(e) => handleNameChange(e)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                    placeholder="Customer Name"
                                    required
                                />
                            </div>

                            {/* Customer Details Field */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                                    Customer Details
                                </label>
                                <div className="flex space-x-4">
                                    <input
                                        type="email"
                                        value={singleOnboardingData?.customerEmail}
                                        onChange={(e) => handleEmailChange(e)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                        placeholder="Email address"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        value={singleOnboardingData?.customerPhone}
                                        onChange={(e) => handlePhoneChange(e)}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                        placeholder="Phone number"
                                        required
                                    />
                                </div>
                            </div>

                            {/* BDA Details Field */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                                    BDA Details
                                </label>
                                <div className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={singleOnboardingData?.sellBy?.name}
                                        // onChange={(e) => setEmail(e.target.value)}
                                        className="block cursor-not-allowed w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                        placeholder="Email address"
                                        disabled
                                    />
                                    <input
                                        type="email"
                                        value={singleOnboardingData?.sellBy?.email}
                                        // onChange={(e) => setPhone(e.target.value)}
                                        className="block cursor-not-allowed w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                        placeholder="Phone number"
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Course Details Field */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                                    Course Name
                                </label>
                                <input
                                    type="text"
                                    value={singleOnboardingData?.course?.title}
                                    // onChange={(e) => setCustomerName(e.target.value)}
                                    className="block w-full cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                    placeholder="Course Name"
                                    disabled
                                />
                            </div>

                            {/* Course Batch Details Field */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                                    Batch
                                </label>
                                <input
                                    type="text"
                                    value={singleOnboardingData?.batch}
                                    // onChange={(e) => setCustomerName(e.target.value)}
                                    className="block w-full cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                    placeholder="batch Name"
                                    disabled
                                />
                            </div>
                            {/* Customer State Field */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                                    onboarding Status
                                </label>
                                <select
                                    value={singleOnboardingData?.onboardingStatus}
                                    onChange={(e) => handleStatusChange(e)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                    required
                                >
                                    <option value="">Select State</option>
                                    <option value={'Complete'}>
                                        Complete
                                    </option>
                                    <option value={'Pending'}>
                                        Pending
                                    </option>
                                    <option value={'Processing'}>
                                        Processing
                                    </option>
                                    <option value={'Blocker'}>
                                        Blocker
                                    </option>
                                </select>
                            </div>

                            {/* Notes Field */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                                    Add Comment
                                </label>
                                <textarea
                                    value={singleOnboardingData?.onboardingComment}
                                    onChange={(e) => handleCommentChange(e)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                                    placeholder="Add additional notes (optional)"
                                    rows={3}
                                ></textarea>
                            </div>
                        </main>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="rounded-md border border-red-300 px-4 py-2 text-white dark:text-white bg-red-600"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                // disabled={!isFormValid}
                                className={`rounded-md px-4 py-2 text-white bg-blue-600 hover:bg-blue-700`}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </>
    );
};
