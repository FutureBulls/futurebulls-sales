"use client";
import { fetchCoursesData } from "@/Redux/courseSlice";
import { AppDispatch, RootState } from "@/Redux/store";
import { Combobox, Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../common/Loader";
import {
  createPaymentLink,
  getPaymentLink,
  getSalesUserList,
} from "@/app/services/razorpay.service";
import Swal from "sweetalert2";
import Drawer from "@/components/Drawer/Drawer";
import { getStateData } from "@/app/services/user.service";

// First, add an interface for the state data
interface StateData {
  _id: string;
  name: string;
  country: string;
  status: boolean;
}

// Add this constant at the top of the file, after the imports
const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];


const TableOne = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.userData);
  const { coursesData, status } = useSelector(
    (state: RootState) => state.courses,
  );
  const [paymentLinkData, setpaymentLinkData] = useState([]);
  const [states, setStates] = useState<StateData[]>([]);
  const [userList, setUserList] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [filteredPaymentLinkData, setFilteredPaymentLinkData] =
    useState(paymentLinkData);

  const handlePaymentIdClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCoursesData());
    }
  }, [status, dispatch]);

  useEffect(() => {
    async function getPaymentData() {
      try {
        const response = await getPaymentLink();
        const statesResponse = await getStateData();
        
        setpaymentLinkData(response.data.paymentLinks);
        setFilteredPaymentLinkData(response.data.paymentLinks);
        
        // Make sure we're getting the states array correctly
        if (statesResponse?.data?.data && Array.isArray(statesResponse.data.data)) {
          const indianStates = statesResponse.data.data.filter((state: StateData) => 
            state.status && state.country === "India"
          );
          setStates(indianStates);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    getPaymentData();
  }, []);

  useEffect(() => {
    if (user?.data?.role.includes("ADMIN")) {
      const fetchData = async () => {
        try {
          const response = await getSalesUserList();
          setUserList(response.data.users);
        } catch (error) {
          console.error("Error fetching sales employee names:", error);
        }
      };
      fetchData();
    }
  }, [user?.data?.role]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  };

  const [isOpen, setIsOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [selectCourse, setSelectCourse] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [isDiscount, setisDiscount] = useState(false);
  const [notifySMS, setnotifySMS] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [notes, setNotes] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("");
  const [showCopiedButton, setshowCopiedButton] = useState(false);
  const [courseAmount, setCourseAmount] = useState("");
  const [courseBootcampAmount, setCourseBootcampAmount] = useState("");
  const [filterPaymentLink, setfilterPaymentLink] = useState("");
  const [filterCustomerPhone, setfilterCustomerPhone] = useState("");
  const [filterStatus, setfilterStatus] = useState("");
  const [filterUser, setfilterUser] = useState("");
  const [amountError, setAmountError] = useState("");
  const [query, setQuery] = useState("");
  // const [isOpen, setIsOpen] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Ensure amount is less than or equal to course amount
    if (Number(value) <= Number(courseAmount)) {
      setAmount(value);
      setAmountError("");
    } else {
      setAmountError("Amount cannot be greater than the course amount.");
    }
  };

  const handleSubmit = async (event: any) => {
    let response;
    try {
      setIsOpen(false);
      event.preventDefault();

      // Check if linkExpiry is at least 15 minutes from now
      const currentTime = new Date().getTime();
      const expiryTime = new Date(linkExpiry).getTime();
      const timeDifference = expiryTime - currentTime;

      if (timeDifference < 15 * 60 * 1000) {
        Swal.fire({
          title: "Invalid Expiry Time",
          text: "Expiry time must be at least 15 minutes from now.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      Swal.fire({
        title: "Creating Payment Link...",
        text: "Please wait a moment.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      response = await createPaymentLink({
        linkType: 1,
        amount,
        selectCourse,
        courseAmount,
        customerName,
        customerState,
        email,
        phone,
        notifyEmail,
        notifySMS,
        referenceId,
        notes,
        linkExpiry,
        gatewayUsed: "Razorpay",
      });

      Swal.close();

      if (response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Payment link created successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });

        const updatedResponse = await getPaymentLink();
        setpaymentLinkData(updatedResponse.data.paymentLinks);
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
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPaymentLinkData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredPaymentLinkData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    console.log("Current Page:", currentPage, pageNumber);
    setCurrentPage(pageNumber);
  };

  const performSearch = () => {
    let filteredData = paymentLinkData;

    // Apply filters
    if (filterPaymentLink) {
      filteredData = filteredData.filter((item: any) =>
        item.paymentId.includes(filterPaymentLink),
      );
    }

    if (filterCustomerPhone) {
      filteredData = filteredData.filter((item: any) =>
        item.customerPhone.includes(filterCustomerPhone),
      );
    }

    if (filterStatus) {
      filteredData = filteredData.filter((item: any) =>
        item.status.includes(filterStatus),
      );
    }

    if (filterUser) {
      filteredData = filteredData.filter((item: any) =>
        item.userId.includes(filterUser),
      );
    }

    // Update filtered data
    setFilteredPaymentLinkData(filteredData);
    // Reset to first page when filters change
    // setCurrentPage(1);
  };

  const filteredCourses =
    query === ""
      ? coursesData
      : coursesData.filter((course: any) =>
          course.title
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, "")),
        );

  // Use effect to trigger search when input values change
  useEffect(() => {
    performSearch();
  }, [filterPaymentLink, filterCustomerPhone, filterStatus, filterUser, performSearch]);

  // Add this state to track form validity
  const [isFormValid, setIsFormValid] = useState(false);

  // Add this useEffect to check form validity whenever relevant fields change
  useEffect(() => {
    const isValid =
      amount !== "" &&
      Number(amount) <= Number(courseAmount) &&
      selectCourse !== "" &&
      customerName !== "" &&
      customerState !== "" &&
      email !== "" &&
      phone !== "" &&
      Number(courseAmount) >= Number(courseBootcampAmount);

    setIsFormValid(isValid);
  }, [
    amount,
    courseAmount,
    selectCourse,
    customerName,
    customerState,
    email,
    phone,
    linkExpiry,
    courseBootcampAmount,
  ]);

  if (!coursesData || !user) {
    return <Loader />;
  }

  return (
    <>
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="flex flex-wrap items-center justify-between">
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Payment Links
          </h4>
          <button
            className="mt-4 flex w-auto items-center gap-2 bg-[#528ff0] px-4 py-2 text-sm text-white 
            hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 sm:mt-0 sm:w-auto md:text-base lg:text-lg"
            onClick={() => setIsOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Create Payment Link
          </button>
        </div>

        {/* Filter */}
        <div className="m-4 flex flex-wrap items-center justify-center gap-4">
          <div className="flex w-full flex-grow flex-col items-center justify-center gap-2 md:w-1/4 md:flex-row md:gap-4">
            <input
              id="paymentLink"
              type="text"
              value={filterPaymentLink}
              onChange={(e) => setfilterPaymentLink(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
              placeholder="Search by Payment Link"
            />
          </div>
          <div className="flex w-full flex-grow flex-col items-center justify-center gap-2 md:w-1/4 md:flex-row md:gap-4">
            <input
              id="customerPhone"
              type="text"
              value={filterCustomerPhone}
              onChange={(e) => setfilterCustomerPhone(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
              placeholder="Search By Customer Phone"
            />
          </div>
          <div className="flex w-full flex-grow flex-col items-center justify-center gap-2 md:w-1/4 md:flex-row md:gap-4">
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setfilterStatus(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
              <option value="Settled">Settled</option>
            </select>
          </div>
          {user.data.role.includes("ADMIN") && (
            <div className="flex w-full flex-grow flex-col items-center justify-center gap-2 md:w-1/4 md:flex-row md:gap-4">
              <select
                id="status"
                value={filterUser}
                onChange={(e) => setfilterUser(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
              >
                <option value="">All Users</option>
                {userList.map((user: any) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                <th className="min-w-[220px] border-b border-[#eee] px-4 py-3 font-medium text-dark dark:border-dark-3 dark:text-white xl:pl-7.5">
                  Payment Link Id
                </th>
                <th className="min-w-[150px] border-b border-[#eee] px-4 py-3 font-medium text-dark dark:border-dark-3 dark:text-white">
                  Created At
                </th>
                <th className="border-b border-[#eee] px-4 py-3 text-right font-medium text-dark dark:border-dark-3 dark:text-white xl:pr-7.5">
                  Amount
                </th>
                <th className="border-b border-[#eee] px-4 py-3 text-right font-medium text-dark dark:border-dark-3 dark:text-white xl:pr-7.5">
                  Customer Info
                </th>
                <th className="border-b border-[#eee] px-4 py-3 text-right font-medium text-dark dark:border-dark-3 dark:text-white xl:pr-7.5">
                  Payment Link
                </th>
                <th className="border-b border-[#eee] px-4 py-3 text-right font-medium text-dark dark:border-dark-3 dark:text-white xl:pr-7.5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((brand: any, index) => (
                  <tr
                    key={index}
                    className={`relative border-b hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      index === currentItems.length - 1
                        ? "border-b-0"
                        : "border-b-[#eee] dark:border-dark-3"
                    }`}
                    onMouseOver={() => setshowCopiedButton(!showCopiedButton)}
                  >
                    <td
                      className="cursor-pointer px-4 py-4 dark:border-dark-3 xl:pl-7.5"
                      onClick={() => handlePaymentIdClick(brand.paymentId)}
                    >
                      <p className="text-body-m font-medium text-blue-500">
                        {brand?.paymentId}
                      </p>
                    </td>
                    <td className="px-4 py-4 dark:border-dark-3">
                      <p className="text-dark dark:text-white">
                        {formatDate(brand?.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right dark:border-dark-3">
                      <p className="text-dark dark:text-white">
                        ₹ {brand?.amount}.00
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right dark:border-dark-3">
                      <p className="text-dark dark:text-white">
                        {brand?.customerPhone ? `${brand?.customerPhone}` : ""}{" "}
                        <br />
                        {brand?.customerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right dark:border-dark-3">
                      <p className="text-dark dark:text-white">
                        {brand?.paymentLink}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right dark:border-dark-3">
                      <p
                        className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium ${
                          brand?.status === "Paid"
                            ? "bg-[#219653]/[0.08] text-[#219653]"
                            : brand?.status === "Settled"
                              ? "bg-[#219653]/[0.08] text-[#219653]"
                              : brand?.status === "Expired"
                                ? "bg-[#D34053]/[0.08] text-[#D34053]"
                                : brand?.status === "Partial"
                                  ? "bg-[#2F80ED]/[0.08] text-[#2F80ED]" // Blue color for 'Partial' status
                                  : "bg-[#FFA70B]/[0.08] text-[#FFA70B]"
                        }`}
                      >
                        {brand?.status}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="rounded-md bg-blue px-4 py-2 text-white disabled:bg-gray-400"
            >
              Previous
            </button>
            <div className="text-center">
              Page {currentPage} of {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="rounded-md bg-blue px-4 py-2 text-white disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          paymentId={selectedPaymentId}
        />
      )}

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
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            onClick={() => setIsOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <h3 className="mb-6 text-2xl font-bold text-dark dark:text-white">
            Create Payment Link
          </h3>

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            <main className="h-[500px] overflow-auto">
              {/* Amount Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Amount *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-dark text-gray-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    className="block w-full rounded-r-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                {amountError && (
                  <p className="mt-2 text-sm text-red-600">{amountError}</p> // Display error message
                )}
              </div>

              {/* Currency Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Course *
                </label>
                <Combobox
                  as="div"
                  value={selectCourse}
                  onChange={(value: string | null) => {
                    if (value) {
                      setSelectCourse(value);
                      const selectedCourse = coursesData.find(
                        (course) => course._id === value,
                      );
                      setCourseAmount(selectedCourse?.price || "");
                      setCourseBootcampAmount(
                        selectedCourse?.bootcampPrice || "",
                      );
                    }
                  }}
                >
                  <div className="relative">
                    <Combobox.Button as="div" className="w-full">
                      <Combobox.Input
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={(courseId: string) =>
                          coursesData.find(
                            (course: any) => course._id === courseId,
                          )?.title || ""
                        }
                        placeholder="Select or search a course"
                        required
                        onClick={() => setQuery("")} // Clear query on click to show all courses
                      />
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-2 sm:text-sm">
                      {filteredCourses.length === 0 && query !== "" ? (
                        <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
                          Nothing found.
                        </div>
                      ) : (
                        (query === "" ? coursesData : filteredCourses).map(
                          (course: any) => (
                            <Combobox.Option
                              key={course._id}
                              value={course._id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                  active
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-900 dark:text-white"
                                }`
                              }
                            >
                              {({ active, selected }) => (
                                <span
                                  className={`block truncate ${selected ? "font-semibold" : ""}`}
                                >
                                  {course.title}
                                </span>
                              )}
                            </Combobox.Option>
                          ),
                        )
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              {/* Course Amount Field - only visible when a course is selected */}
              {selectCourse && (
                <>
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Course Amount
                    </label>
                    <span className="text-sm text-yellow-500">
                      Note: Course Amount should be greater than or equal to Rs.{" "}
                      {courseBootcampAmount}.
                    </span>
                    <input
                      type="number"
                      value={courseAmount}
                      onChange={(e) => setCourseAmount(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                      placeholder="Enter course amount"
                    />
                  </div>
                </>
              )}

              {/* Customer Name Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                  placeholder="Customer Name"
                  required
                />
              </div>

              {/* Customer State Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Customer State *
                </label>
                <select
                  value={customerState}
                  onChange={(e) => setCustomerState(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                  required
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Details Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Customer Details
                </label>
                <div className="flex space-x-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Email address"
                    required
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="mb-6 flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-dark dark:text-white"
                  />
                  <span className="text-sm text-dark dark:text-white">
                    Notify via Email
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notifySMS}
                    onChange={(e) => setnotifySMS(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  />
                  <span className="text-sm text-dark dark:text-white">
                    Notify via SMS
                  </span>
                </label>
              </div>

              {/* Reference ID Field
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Reference ID
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                  placeholder="Enter a reference ID (optional)"
                />
              </div> */}

              {/* Notes Field */}
              {/* <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                  placeholder="Add additional notes (optional)"
                  rows={3}
                ></textarea>
              </div> */}

              {/* Link Expiry Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Link Expiry
                </label>
                <input
                  type="datetime-local"
                  value={linkExpiry}
                  onChange={(e) => setLinkExpiry(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                />
              </div>
            </main>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-dark dark:text-white"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`rounded-md px-4 py-2 text-white ${
                  isFormValid
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-gray-400"
                } dark:text-white`}
              >
                Create Payment Link
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  );
};

export default TableOne;
