import {
  createPaymentLink,
  downloadInvoiceApi,
  getPaymentLinkDataById,
  getSalesUserList,
  updateOrderForAdmin,
} from "@/app/services/razorpay.service";
import { useEffect, useState } from "react";
import Loader from "../common/Loader";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { User } from "next-auth";

const Drawer = ({
  isOpen,
  onClose,
  paymentId,
}: {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
}) => {
  const [paymentLinkData, setPaymentLinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settled, setSettled] = useState(true);
  const [isModalOpen, setIsOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user.userData);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySMS, setnotifySMS] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [notes, setNotes] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("");

  const [isModalOpenedit, setIsModalOpenedit] = useState(false);

  const handleSave = async () => {
    try {

      const response = await updateOrderForAdmin(paymentId, notes);

      if(response.status === 200) {
        window.location.reload();
        setIsModalOpenedit(false);
      }

    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const toggleDrawer = () => {
    onClose();
  };

  useEffect(() => {
    async function getData() {
      try {
        const response = await getPaymentLinkDataById(paymentId);
        console.log("response", response.data);
        // Assuming the response structure you provided:
        if (response && response.status) {
          setPaymentLinkData(response.data.data);
        }

        if (
          response.data.data.status === "Settled" ||
          response.data.data.status === "Paid"
        ) {
          setSettled(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (paymentId) {
      getData();
    }
  }, [paymentId]);

  const copyPaymentLink = (link: string) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          setTooltipVisible(true);
          setTimeout(() => setTooltipVisible(false), 2000); // Hide tooltip after 2 seconds
        })
        .catch((error) => {
          console.error("Failed to copy the link: ", error);
        });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setTooltipVisible(true);
        setTimeout(() => setTooltipVisible(false), 2000); // Hide tooltip after 2 seconds
      } catch (error) {
        console.error("Failed to copy the link: ", error);
      }
      document.body.removeChild(textarea);
    }
  };

  const downloadInvoice = async () => {
    try {
      setLoading(true);

      const response = await downloadInvoiceApi(paymentId);

      const binaryString = window.atob(response.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${paymentLinkData.customerName}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: any) => {
    let response;
    try {
      setIsOpen(false);
      // Optionally, prevent default form submission
      event.preventDefault();

      // Show a loading message while waiting for the API response
      Swal.fire({
        title: "Creating Payment Link...",
        text: "Please wait a moment.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      response = await createPaymentLink({
        linkType: 2,
        amount: paymentLinkData?.remainingAmount,
        description: `Recovery payment for ${paymentLinkData?.customerName}`,
        serviceDetails: `Recovery payment for ${paymentLinkData?.customerName}`,
        customerName: paymentLinkData?.customerName,
        customerState: paymentLinkData?.customerState || "",
        email: paymentLinkData?.customerEmail,
        phone: paymentLinkData?.customerPhone?.replace(/^\+91/, ""),
        notifyEmail,
        notifySMS,
        referenceId: paymentId,
        notes,
        linkExpiry,
        gatewayUsed: "Razorpay",
      });

      // Close the loading message
      Swal.close();

      // Check response and show success or error message
      if (response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Payment link created successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch (error: any) {
      // Handle any unexpected errors
      Swal.fire({
        title: "Error!",
        text: error.response.data.message || "Failed to create payment link.",
        icon: "error",
        confirmButtonColor: "Blue",
        confirmButtonText: "OK",
      });
    }
  };

  if (isModalOpenedit) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-0"
            onClick={toggleDrawer}
          ></div>
        )}

        <div
          id="drawer-right-example"
          className={`fixed right-0 top-20 z-999 h-full overflow-y-auto p-4 transition-transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } w-full bg-white shadow-2xl dark:bg-gray-dark md:w-150 lg:w-150`}
          aria-labelledby="drawer-right-label"
        >
          {loading ? (
            <Loader />
          ) : (
            <>
              {" "}
              <div className="flex justify-between pe-20">
                <h4
                  id="drawer-right-label"
                  className="text-body-2xlg font-bold text-dark dark:text-white"
                >
                  Payment Link Details
                </h4>
                {settled && user?.data?.role.includes("ADMIN") && (
                  <h4
                    id="drawer-right-label"
                    className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
                    onClick={() => setIsModalOpenedit(true)}
                  >
                    Settle Payment
                  </h4>
                )}

                {/* Editable Popup Modal */}
              </div>
              <button
                type="button"
                onClick={toggleDrawer}
                className="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  className="h-3 w-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close menu</span>
              </button>
              {paymentLinkData ? (
                <div className="space-y-4 p-7">
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Link Type</span>
                    <span>
                      {paymentLinkData.linkType === 1
                        ? "Fresh Payment Link"
                        : "Recovery payment Link"}
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Status</span>
                    <p
                      className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium ${
                        paymentLinkData.status === "Paid"
                          ? "bg-[#219653]/[0.08] text-[#219653]"
                          : paymentLinkData.status === "Settled"
                            ? "bg-[#219653]/[0.08] text-[#219653]"
                            : paymentLinkData.status === "Expired"
                              ? "bg-[#D34053]/[0.08] text-[#D34053]"
                              : paymentLinkData.status === "Partial"
                                ? "bg-[#2F80ED]/[0.08] text-[#2F80ED]" // Blue color for 'Partial' status
                                : "bg-[#FFA70B]/[0.08] text-[#FFA70B]"
                      }`}
                    >
                      {paymentLinkData.status}
                    </p>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Amount</span>
                    <span>₹ {paymentLinkData.amount}.00</span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Remaining Amount</span>
                    <span className="flex items-center gap-2">
                      {paymentLinkData.remainingAmountStatus === 1 ? (
                        <>
                          <span className="text-red-500">
                            ₹ {paymentLinkData.remainingAmount}.00
                          </span>
                          {paymentLinkData.status === "Partial" && (
                            <div className="relative inline-block">
                              <button
                                onClick={() => setIsOpen(true)}
                                className="mb-0 inline-block cursor-pointer whitespace-nowrap rounded-sm border border-gray-300 bg-gray-100 p-1 text-center align-middle text-xs font-normal text-gray-600 hover:bg-gray-200"
                              >
                                Create Recovery Link
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-green-500 line-through">
                            ₹ {paymentLinkData.remainingAmount || "0"}.00
                          </span>
                          <span className="text-green-500">Cleared</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">BDA Discount</span>
                    <span
                      className={`${
                        paymentLinkData.bdaDiscount > 0
                          ? "text-green-500"
                          : paymentLinkData.bdaDiscount < 0
                            ? "text-red-500"
                            : ""
                      }`}
                    >
                      ₹ {paymentLinkData.bdaDiscount || "0"}.00
                    </span>
                  </div>
                  {paymentLinkData.referenceId && (
                    <div className="flex text-dark dark:text-white">
                      <span className="w-50">Reference Id</span>
                      <span className="cursor-pointer text-blue-600 underline">
                        {paymentLinkData.referenceId}
                      </span>
                    </div>
                  )}
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Customer</span>
                    <span className="flex flex-col">
                      <span>{paymentLinkData.customerEmail}</span>
                      <span>{paymentLinkData.customerPhone}</span>
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Payment Link</span>
                    <span className="flex gap-2">
                      <a
                        href={paymentLinkData.paymentLink}
                        className="text-blue-500 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {paymentLinkData.paymentLink}
                      </a>
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            copyPaymentLink(paymentLinkData.paymentLink)
                          }
                          className="mb-0 inline-block cursor-pointer whitespace-nowrap rounded-sm border border-gray-300 bg-gray-100 p-1 text-center align-middle text-xs font-normal text-gray-600 hover:bg-gray-200"
                        >
                          Copy
                        </button>
                        <div
                          className={`tooltip absolute z-10 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity duration-300 dark:bg-gray-700 ${tooltipVisible ? "visible opacity-100" : "invisible opacity-0"}`}
                          role="tooltip"
                        >
                          Copied
                          <div
                            className="tooltip-arrow"
                            data-popper-arrow
                          ></div>
                        </div>
                      </div>
                    </span>
                  </div>

                  {paymentLinkData.orderId && (
                    <div className="flex text-dark dark:text-white">
                      <span className="w-50">OrderId</span>
                      <span className="flex flex-col">
                        <span>{paymentLinkData.orderId}</span>
                        <span className="text-blue-500">
                          {" "}
                          paid on{" "}
                          {paymentLinkData.paid_on
                            ? new Date(paymentLinkData.paid_on).toLocaleString()
                            : "--"}
                        </span>
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex text-dark dark:text-white ${paymentLinkData.status === "Paid" ? "active" : paymentLinkData.status === "Partial" ? "active" : paymentLinkData.status === "Settled" ? "active" : "hidden"}`}
                  >
                    <span className="w-50">Download Invoice</span>
                    <span
                      className="flex cursor-pointer items-center gap-1 text-blue-400 hover:underline"
                      onClick={downloadInvoice}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Download
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Notify</span>
                    <span>
                      {paymentLinkData.notifyEmail && "• Email "}
                      {paymentLinkData.notifySMS && "• SMS "}
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Created By</span>
                    <span>{paymentLinkData?.userId?.name ?? "Admin"}</span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Service Details</span>
                    <span>{paymentLinkData.description || paymentLinkData.courseId?.title || "Service Payment"}</span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Created At</span>
                    <span>
                      {new Date(paymentLinkData.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {paymentLinkData.linkExpiry &&
                    new Date(paymentLinkData.linkExpiry).getFullYear() !==
                      1970 && (
                      <div className="flex text-dark dark:text-white">
                        <span className="w-50">Expire At</span>
                        <span>
                          {new Date(
                            paymentLinkData.linkExpiry,
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}

                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Update By</span>
                    <span>
                      {paymentLinkData.updatedBy
                        ? paymentLinkData.updatedBy.name
                        : "Admin"}
                    </span>
                  </div>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </>
          )}
        </div>

        <Dialog
          open={isModalOpen}
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
              Create Recovery Link
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
                      value={paymentLinkData?.remainingAmount}
                      className="block w-full rounded-r-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                      placeholder="Enter amount"
                      required
                      disabled
                    />
                  </div>
                </div>

                {/* Service Details Field */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Service Details
                  </label>
                  <textarea
                    value={`Recovery payment for ${paymentLinkData?.customerName}`}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Describe the service or product being charged for"
                    rows={3}
                    disabled
                  />
                </div>

                {/* Customer Name Field */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={paymentLinkData?.customerName}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Customer Name"
                    disabled
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
                      value={paymentLinkData?.customerEmail}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                      placeholder="Email address"
                      required
                      disabled
                    />
                    <input
                      type="tel"
                      value={
                        paymentLinkData?.customerPhone?.replace(/^\+91/, "") ||
                        ""
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                      placeholder="Phone number"
                      required
                      disabled
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

                {/* Reference ID Field */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Reference ID
                  </label>
                  <input
                    type="text"
                    value={paymentId}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Enter a reference ID (optional)"
                    disabled
                  />
                </div>

                {/* Notes Field */}
                <div className="mb-6">
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
                </div>

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
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:text-white"
                >
                  Create Payment Link
                </button>
              </div>
            </form>
          </div>
        </Dialog>

        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0"
            style={{ backgroundColor: "rgba(17, 30, 60, 0.6)" }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className="w-100 rounded-lg bg-white p-6  dark:bg-gray-dark dark:shadow-card">
              <h2 className="mb-6 text-2xl font-bold text-dark dark:text-white">
                Edit Details
              </h2>

              <div className="flex text-dark dark:text-white">
                <span className="w-50">Status</span>
                <p
                  className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium ${
                    paymentLinkData.status === "Paid"
                      ? "bg-[#219653]/[0.08] text-[#219653]"
                      : paymentLinkData.status === "Settled"
                        ? "bg-[#219653]/[0.08] text-[#219653]"
                        : paymentLinkData.status === "Expired"
                          ? "bg-[#D34053]/[0.08] text-[#D34053]"
                          : paymentLinkData.status === "Partial"
                            ? "bg-[#2F80ED]/[0.08] text-[#2F80ED]"
                            : "bg-[#FFA70B]/[0.08] text-[#FFA70B]"
                  }`}
                >
                  {paymentLinkData.status}
                </p>
              </div>

              <div className="mt-5 flex text-dark dark:text-white">
                <span className="w-50">Remaining Amount</span>
                <span className="flex items-center gap-2">
                  {paymentLinkData.remainingAmountStatus === 1 ? (
                    <>
                      <span className="text-red-500">
                        ₹ {paymentLinkData.remainingAmount}.00
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-green-500 line-through">
                        ₹ {paymentLinkData.remainingAmount || "0"}.00
                      </span>
                      <span className="text-green-500">Cleared</span>
                    </>
                  )}
                </span>
              </div>

              <div className="mb-6 mt-5">
                <label className="text-md mb-2 block font-medium text-dark dark:text-white">
                  Note *
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                  placeholder="Enter your note"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setIsModalOpenedit(false)}
                  className="mr-2 rounded bg-gray-300 px-4 py-2 text-black"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    handleSave()
                  }}
                  className={`rounded px-4 py-2 text-white ${
                    notes.trim()
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                  disabled={!notes.trim()} // Disable button if the trimmed notes value is empty
                >
                  Settle Payment Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-0"
            onClick={toggleDrawer}
          ></div>
        )}

        <div
          id="drawer-right-example"
          className={`fixed right-0 top-20 z-999 h-full overflow-y-auto p-4 transition-transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } w-full bg-white shadow-2xl dark:bg-gray-dark md:w-150 lg:w-150`}
          aria-labelledby="drawer-right-label"
        >
          {loading ? (
            <Loader />
          ) : (
            <>
              {" "}
              <div className="flex justify-between pe-20">
                <h4
                  id="drawer-right-label"
                  className="text-body-2xlg font-bold text-dark dark:text-white"
                >
                  Payment Link Details
                </h4>
                {settled && user?.data?.role.includes("ADMIN") && (
                  <h4
                    id="drawer-right-label"
                    className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
                    onClick={() => setIsModalOpenedit(true)}
                  >
                    Settle Payment
                  </h4>
                )}
                {/* Editable Popup Modal */}
              </div>
              <button
                type="button"
                onClick={toggleDrawer}
                className="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  className="h-3 w-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close menu</span>
              </button>
              {/* {isModalOpenedit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-96 rounded-lg bg-white p-6">
                  <h2 className="mb-6 text-2xl font-bold text-dark dark:text-white">
                    Edit Details
                  </h2>

                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Status</span>
                    <p
                      className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium ${
                        paymentLinkData.status === "Paid"
                          ? "bg-[#219653]/[0.08] text-[#219653]"
                          : paymentLinkData.status === "Settled"
                            ? "bg-[#219653]/[0.08] text-[#219653]"
                            : paymentLinkData.status === "Expired"
                              ? "bg-[#D34053]/[0.08] text-[#D34053]"
                              : paymentLinkData.status === "Partial"
                                ? "bg-[#2F80ED]/[0.08] text-[#2F80ED]" // Blue color for 'Partial' status
                                : "bg-[#FFA70B]/[0.08] text-[#FFA70B]"
                      }`}
                    >
                      {paymentLinkData.status}
                    </p>
                  </div>

                  <div className="mt-5 flex text-dark dark:text-white">
                    <span className="w-50">Remaining Amount</span>
                    <span className="flex items-center gap-2">
                      {paymentLinkData.remainingAmountStatus === 1 ? (
                        <>
                          <span className="text-red-500">
                            ₹ {paymentLinkData.remainingAmount}.00
                          </span>
                          {paymentLinkData.status === "Partial" && (
                            <div className="relative inline-block">
                              <button
                                onClick={() => setIsOpen(true)}
                                className="mb-0 inline-block cursor-pointer whitespace-nowrap rounded-sm border border-gray-300 bg-gray-100 p-1 text-center align-middle text-xs font-normal text-gray-600 hover:bg-gray-200"
                              >
                                Create Recovery Link
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-green-500 line-through">
                            ₹ {paymentLinkData.remainingAmount || "0"}.00
                          </span>
                          <span className="text-green-500">Cleared</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mb-6 mt-5">
                    <label className="text-md mb-2 block font-medium text-dark dark:text-white">
                      Note *
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                      placeholder="Enter your note"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => setIsModalOpenedit(false)}
                      className="mr-2 rounded bg-gray-300 px-4 py-2 text-black"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSave();
                        setRemainingAmountStatus(2);
                      }}
                      className="rounded bg-blue-500 px-4 py-2 text-white"
                    >
                      Settle Payment Link
                    </button>
                  </div>
                </div>
              </div>
            )} */}
              {paymentLinkData ? (
                <div className="space-y-4 p-7">
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Link Type</span>
                    <span>
                      {paymentLinkData.linkType === 1
                        ? "Fresh Payment Link"
                        : "Recovery payment Link"}
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Status</span>
                    <p
                      className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium ${
                        paymentLinkData.status === "Paid"
                          ? "bg-[#219653]/[0.08] text-[#219653]"
                          : paymentLinkData.status === "Settled"
                            ? "bg-[#219653]/[0.08] text-[#219653]"
                            : paymentLinkData.status === "Expired"
                              ? "bg-[#D34053]/[0.08] text-[#D34053]"
                              : paymentLinkData.status === "Partial"
                                ? "bg-[#2F80ED]/[0.08] text-[#2F80ED]" // Blue color for 'Partial' status
                                : "bg-[#FFA70B]/[0.08] text-[#FFA70B]"
                      }`}
                    >
                      {paymentLinkData.status}
                    </p>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Amount</span>
                    <span>₹ {paymentLinkData.amount}.00</span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Remaining Amount</span>
                    <span className="flex items-center gap-2">
                      {paymentLinkData.remainingAmountStatus === 1 ? (
                        <>
                          <span className="text-red-500">
                            ₹ {paymentLinkData.remainingAmount}.00
                          </span>
                          {paymentLinkData.status === "Partial" && (
                            <div className="relative inline-block">
                              <button
                                onClick={() => setIsOpen(true)}
                                className="mb-0 inline-block cursor-pointer whitespace-nowrap rounded-sm border border-gray-300 bg-gray-100 p-1 text-center align-middle text-xs font-normal text-gray-600 hover:bg-gray-200"
                              >
                                Create Recovery Link
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-green-500 line-through">
                            ₹ {paymentLinkData.remainingAmount || "0"}.00
                          </span>
                          <span className="text-green-500">Cleared</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">BDA Discount</span>
                    <span
                      className={`${
                        paymentLinkData.bdaDiscount > 0
                          ? "text-green-500"
                          : paymentLinkData.bdaDiscount < 0
                            ? "text-red-500"
                            : ""
                      }`}
                    >
                      ₹ {paymentLinkData.bdaDiscount || "0"}.00
                    </span>
                  </div>
                  {paymentLinkData.referenceId && (
                    <div className="flex text-dark dark:text-white">
                      <span className="w-50">Reference Id</span>
                      <span className="cursor-pointer text-blue-600 underline">
                        {paymentLinkData.referenceId}
                      </span>
                    </div>
                  )}
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Customer</span>
                    <span className="flex flex-col">
                      <span>{paymentLinkData.customerEmail}</span>
                      <span>{paymentLinkData.customerPhone}</span>
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Payment Link</span>
                    <span className="flex gap-2">
                      <a
                        href={paymentLinkData.paymentLink}
                        className="text-blue-500 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {paymentLinkData.paymentLink}
                      </a>
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            copyPaymentLink(paymentLinkData.paymentLink)
                          }
                          className="mb-0 inline-block cursor-pointer whitespace-nowrap rounded-sm border border-gray-300 bg-gray-100 p-1 text-center align-middle text-xs font-normal text-gray-600 hover:bg-gray-200"
                        >
                          Copy
                        </button>
                        <div
                          className={`tooltip absolute z-10 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity duration-300 dark:bg-gray-700 ${tooltipVisible ? "visible opacity-100" : "invisible opacity-0"}`}
                          role="tooltip"
                        >
                          Copied
                          <div
                            className="tooltip-arrow"
                            data-popper-arrow
                          ></div>
                        </div>
                      </div>
                    </span>
                  </div>
                  {paymentLinkData.orderId && (
                    <div className="flex text-dark dark:text-white">
                      <span className="w-50">OrderId</span>
                      <span className="flex flex-col">
                        <span>{paymentLinkData.orderId}</span>
                        <span className="text-blue-500">
                          {" "}
                          paid on{" "}
                          {paymentLinkData.paid_on
                            ? new Date(paymentLinkData.paid_on).toLocaleString()
                            : "--"}
                        </span>
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex text-dark dark:text-white ${paymentLinkData.status === "Paid" ? "active" : paymentLinkData.status === "Partial" ? "active" : paymentLinkData.status === "Settled" ? "active" : "hidden"}`}
                  >
                    <span className="w-50">Download Invoice</span>
                    <span
                      className="flex cursor-pointer items-center gap-1 text-blue-400 hover:underline"
                      onClick={downloadInvoice}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Download
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Notify</span>
                    <span>
                      {paymentLinkData.notifyEmail && "• Email "}
                      {paymentLinkData.notifySMS && "• SMS "}
                    </span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Created By</span>
                    <span>{paymentLinkData?.userId?.name ?? "Admin"}</span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Service Details</span>
                    <span>{paymentLinkData.description || paymentLinkData.courseId?.title || "Service Payment"}</span>
                  </div>
                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Created At</span>
                    <span>
                      {new Date(paymentLinkData.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!settled && (
                    <div className="flex text-dark dark:text-white">
                      <span className="w-50">Note</span>
                      <span>{paymentLinkData.notes}</span>
                    </div>
                  )}

                  {paymentLinkData.linkExpiry &&
                    new Date(paymentLinkData.linkExpiry).getFullYear() !==
                      1970 && (
                      <div className="flex text-dark dark:text-white">
                        <span className="w-50">Expire At</span>
                        <span>
                          {new Date(
                            paymentLinkData.linkExpiry,
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}

                  <div className="flex text-dark dark:text-white">
                    <span className="w-50">Update By</span>
                    <span>
                      {paymentLinkData.updatedBy
                        ? paymentLinkData.updatedBy.name
                        : "Admin"}
                    </span>
                  </div>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </>
          )}
        </div>

        <Dialog
          open={isModalOpen}
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
              Create Recovery Link
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
                      value={paymentLinkData?.remainingAmount}
                      className="block w-full rounded-r-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                      placeholder="Enter amount"
                      required
                      disabled
                    />
                  </div>
                </div>

                {/* Service Details Field */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Service Details
                  </label>
                  <textarea
                    value={`Recovery payment for ${paymentLinkData?.customerName}`}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Describe the service or product being charged for"
                    rows={3}
                    disabled
                  />
                </div>

                {/* Customer Name Field */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={paymentLinkData?.customerName}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Customer Name"
                    disabled
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
                      value={paymentLinkData?.customerEmail}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                      placeholder="Email address"
                      required
                      disabled
                    />
                    <input
                      type="tel"
                      value={
                        paymentLinkData?.customerPhone?.replace(/^\+91/, "") ||
                        ""
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                      placeholder="Phone number"
                      required
                      disabled
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

                {/* Reference ID Field */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Reference ID
                  </label>
                  <input
                    type="text"
                    value={paymentId}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-dark shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-sm"
                    placeholder="Enter a reference ID (optional)"
                    disabled
                  />
                </div>

                {/* Notes Field */}
                <div className="mb-6">
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
                </div>

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
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:text-white"
                >
                  Create Payment Link
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      </>
    );
  }
};

export default Drawer;
