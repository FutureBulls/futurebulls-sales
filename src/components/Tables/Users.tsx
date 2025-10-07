"use client";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    createSaleUser,
    getSalesUserList,
} from "@/app/services/razorpay.service";

const UserTableData = () => {
    const [userList, setUserList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [employeeName, setEmployeeName] = useState("");
    const [employeeEmail, setEmployeeEmail] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentItems, setCurrentItems] = useState([]); // Paginated items
    const itemsPerPage = 6; // Number of items per page

    useEffect(() => {
        async function getUser() {
            try {
                const response = await getSalesUserList();

                if (response.status === 200) {
                    const users = response.data.users;
                    setUserList(users);
                    const start = (currentPage - 1) * itemsPerPage;
                    const end = start + itemsPerPage;
                    setCurrentItems(users.slice(start, end));
                } else {
                    throw new Error('Failed to fetch user list')
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to fetch user list. Please try again.",
                });
            }
        }

        getUser();
    }, [currentPage]);

    const handleSubmit = async (e: React.FormEvent) => {
        setIsOpen(false);

        if (!employeeName || !employeeEmail || !role) {
            Swal.fire({
                icon: "error",
                title: "Incomplete Data",
                text: "Please fill all the required fields.",
            });
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: employeeName,
                email: employeeEmail,
                role,
            };

            const response = await createSaleUser(payload);

            if (response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "User added successfully!",
                });
                setIsOpen(false);
                const response = await getSalesUserList();
                setUserList(response.data.users)
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to add user.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong! Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= Math.ceil(userList.length / itemsPerPage)) {
            setCurrentPage(newPage);
        }
    };

    const totalPages = Math.ceil(userList.length / itemsPerPage);

    return (
        <>
            <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
                <div className="flex justify-between items-center">
                    <h4 className="text-body-2xlg font-bold text-dark dark:text-white">User Management</h4>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-[#528ff0] text-white hover:bg-blue-700 w-auto"
                        onClick={() => setIsOpen(true)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add User
                    </button>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                                <th className="min-w-[220px] px-4 py-3 font-medium text-dark dark:text-white xl:pl-7.5 border-b border-[#eee] dark:border-dark-3">
                                    Employee Name
                                </th>
                                <th className="min-w-[150px] px-4 py-3 font-medium text-dark dark:text-white border-b border-[#eee] dark:border-dark-3">
                                    Employee Email
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-dark dark:text-white border-b border-[#eee] dark:border-dark-3 xl:pr-7.5">
                                    Role
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((user: any, index: any) => (
                                    <tr key={user._id} className="hover:bg-gray-100">
                                        <td className="px-4 py-4">{user.name}</td>
                                        <td className="px-4 py-4">{user.email}</td>
                                        <td className="px-4 py-4 text-right">{user.role}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                                        No Data Available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
                        >
                            Previous
                        </button>
                        <div>Page {currentPage} of {totalPages}</div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Add User Dialog */}
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div
                    className="fixed inset-0"
                    style={{ backgroundColor: 'rgba(17, 30, 60, 0.6)' }}
                />

                <div className="relative bg-white rounded-lg shadow-1 w-full max-w-lg p-8 dark:bg-gray-dark dark:shadow-card">
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        onClick={() => setIsOpen(false)}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <h3 className="text-2xl font-bold mb-6 text-dark dark:text-white">Create User</h3>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Employee Name Field */}
                            <div>
                                <label className="block text-sm font-medium">Employee Name *</label>
                                <input
                                    type="text"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    className="block text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                                    placeholder="Employee Name"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium">Employee Email *</label>
                                <input
                                    type="email"
                                    value={employeeEmail}
                                    onChange={(e) => setEmployeeEmail(e.target.value)}
                                    className="block text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                                    placeholder="Employee Email"
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium">Role *</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="block text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                                    required
                                >
                                    <option value="" disabled>Select Role</option>
                                    <option value="SALESADMIN">Admin</option>
                                    <option value="SALESEMPLOYEE">Employee</option>
                                    <option value="ONBOARDINGTEAM">Onboarding</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {loading ? "Creating User..." : "Create User"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </Dialog>
        </>
    );
};

export default UserTableData;
