"use client";
import { useEffect, useState } from "react";
import { XMarkIcon, DocumentArrowDownIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import { Dialog } from "@headlessui/react";
import { sendBulkInvoicesApi, downloadBulkInvoicesApi, getBulkInvoiceHistoryApi, retryBulkInvoicesApi } from "../../app/services/bulkInvoice.service";

interface CSVRecord {
    name: string;
    email: string;
    phone: string;
    serviceName: string;
    amount: string;
    description?: string;
}

interface BulkInvoiceRecord {
    _id: string;
    csvFileName: string;
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
    status: 'Processing' | 'Completed' | 'Failed';
    createdAt: string;
    downloadUrl?: string;
}

export const SendInvoiceTable = () => {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<CSVRecord[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string>('');
    const [bulkInvoiceHistory, setBulkInvoiceHistory] = useState<BulkInvoiceRecord[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<BulkInvoiceRecord | null>(null);

    useEffect(() => {
        fetchBulkInvoiceHistory();
    }, []);

    const fetchBulkInvoiceHistory = async () => {
        try {
            const response = await getBulkInvoiceHistoryApi();
            setBulkInvoiceHistory(response.data.data);
        } catch (error) {
            console.error('Error fetching bulk invoice history:', error);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/csv') {
            setCsvFile(file);
            parseCSV(file);
        } else {
            Swal.fire({
                title: 'Invalid File',
                text: 'Please upload a CSV file',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            
            const data: CSVRecord[] = [];
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    // Simple CSV parsing that handles quoted fields
                    const values = parseCSVLine(lines[i]);
                    if (values.length >= 5) {
                        data.push({
                            name: values[0] || '',
                            email: values[1] || '',
                            phone: values[2] || '',
                            serviceName: values[3] || '',
                            amount: values[4] || '',
                            description: values[5] || '',
                        });
                    }
                }
            }
            setCsvData(data);
        };
        reader.readAsText(file);
    };

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    };

    const validateCSVData = () => {
        const errors: string[] = [];
        
        csvData.forEach((record, index) => {
            if (!record.name.trim()) errors.push(`Row ${index + 2}: Name is required`);
            if (!record.email.trim()) errors.push(`Row ${index + 2}: Email is required`);
            if (!record.phone.trim()) errors.push(`Row ${index + 2}: Phone is required`);
            if (!record.serviceName.trim()) errors.push(`Row ${index + 2}: Service Name is required`);
            if (!record.amount.trim() || isNaN(Number(record.amount))) errors.push(`Row ${index + 2}: Valid amount is required`);
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (record.email && !emailRegex.test(record.email)) {
                errors.push(`Row ${index + 2}: Invalid email format`);
            }
        });

        return errors;
    };

    const handleSendInvoices = async () => {
        if (!csvFile || csvData.length === 0) {
            Swal.fire({
                title: 'No Data',
                text: 'Please upload a CSV file first',
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return;
        }

        const validationErrors = validateCSVData();
        if (validationErrors.length > 0) {
            Swal.fire({
                title: 'Validation Errors',
                html: validationErrors.slice(0, 10).join('<br>') + (validationErrors.length > 10 ? '<br>...and more' : ''),
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            setIsProcessing(true);
            setProcessingStatus('Uploading CSV file...');
            
            Swal.fire({
                title: 'Processing Bulk Invoices',
                html: `
                    <div style="text-align: center;">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <p id="processing-status">Uploading CSV file...</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            This may take a few minutes for large files
                        </p>
                    </div>
                `,
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    // Update status periodically
                    const statusElement = document.getElementById('processing-status');
                    if (statusElement) {
                        const statuses = [
                            'Uploading CSV file...',
                            'Validating data...',
                            'Creating payment links...',
                            'Generating invoices...',
                            'Sending emails...',
                            'Creating ZIP file...',
                            'Finalizing...'
                        ];
                        let currentIndex = 0;
                        const interval = setInterval(() => {
                            if (currentIndex < statuses.length) {
                                statusElement.textContent = statuses[currentIndex];
                                setProcessingStatus(statuses[currentIndex]);
                                currentIndex++;
                            } else {
                                clearInterval(interval);
                            }
                        }, 2000);
                    }
                },
            });

            const formData = new FormData();
            formData.append('csvFile', csvFile);
            formData.append('csvData', JSON.stringify(csvData));

            setProcessingStatus('Sending request to server...');
            const response = await sendBulkInvoicesApi(formData);
            
            setProcessingStatus('Processing started successfully!');
            Swal.close();
            
            if (response.status === 200) {
                Swal.fire({
                    title: 'Processing Started!',
                    html: `
                        <div style="text-align: center;">
                            <div style="color: #28a745; font-size: 48px; margin-bottom: 16px;">✓</div>
                            <p>Your bulk invoice processing has started!</p>
                            <p style="font-size: 14px; color: #666;">
                                Processing ${csvData.length} records. You'll receive an email when complete.
                            </p>
                            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                                Check the history below to monitor progress.
                            </p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                
                // Reset form
                setCsvFile(null);
                setCsvData([]);
                fetchBulkInvoiceHistory();
            }
        } catch (error: any) {
            Swal.close();
            Swal.fire({
                title: 'Processing Failed',
                html: `
                    <div style="text-align: center;">
                        <div style="color: #dc3545; font-size: 48px; margin-bottom: 16px;">✗</div>
                        <p>Failed to start bulk invoice processing</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            ${error.response?.data?.message || 'An unexpected error occurred'}
                        </p>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Try Again',
            });
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    const handleDownloadInvoices = async (recordId: string) => {
        try {
            Swal.fire({
                title: 'Downloading Invoices',
                html: `
                    <div style="text-align: center;">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <p>Preparing your invoice files...</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            This may take a moment for large files
                        </p>
                    </div>
                `,
                allowOutsideClick: false,
                showConfirmButton: false,
            });

            const response = await downloadBulkInvoicesApi(recordId);
            
            Swal.close();
            
            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bulk-invoices-${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Show success message
            Swal.fire({
                title: 'Download Complete!',
                html: `
                    <div style="text-align: center;">
                        <div style="color: #28a745; font-size: 48px; margin-bottom: 16px;">✓</div>
                        <p>Your invoice files have been downloaded!</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            Check your downloads folder for the ZIP file.
                        </p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (error: any) {
            Swal.close();
            Swal.fire({
                title: 'Download Failed',
                html: `
                    <div style="text-align: center;">
                        <div style="color: #dc3545; font-size: 48px; margin-bottom: 16px;">✗</div>
                        <p>Failed to download invoices</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            ${error.response?.data?.message || 'An unexpected error occurred'}
                        </p>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Try Again',
            });
        }
    };

    const handleViewDetails = (record: BulkInvoiceRecord) => {
        setSelectedRecord(record);
        setIsOpen(true);
    };

    const handleRetryInvoices = async (recordId: string) => {
        try {
            Swal.fire({
                title: 'Retrying Failed Invoices',
                html: `
                    <div style="text-align: center;">
                        <div class="spinner-border text-warning mb-3" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <p>Retrying failed invoice processing...</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            This will reprocess all records from the original CSV
                        </p>
                    </div>
                `,
                allowOutsideClick: false,
                showConfirmButton: false,
            });

            const response = await retryBulkInvoicesApi(recordId);
            
            Swal.close();
            
            if (response.status === 200) {
                Swal.fire({
                    title: 'Retry Started!',
                    html: `
                        <div style="text-align: center;">
                            <div style="color: #28a745; font-size: 48px; margin-bottom: 16px;">✓</div>
                            <p>Failed invoices are being retried!</p>
                            <p style="font-size: 14px; color: #666; margin-top: 10px;">
                                The system will reprocess all records from the original CSV file.
                            </p>
                            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                                Check the history below to monitor progress.
                            </p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                
                // Refresh the history
                fetchBulkInvoiceHistory();
            }
        } catch (error: any) {
            Swal.close();
            Swal.fire({
                title: 'Retry Failed',
                html: `
                    <div style="text-align: center;">
                        <div style="color: #dc3545; font-size: 48px; margin-bottom: 16px;">✗</div>
                        <p>Failed to retry invoices</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            ${error.response?.data?.message || 'An unexpected error occurred'}
                        </p>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Try Again',
            });
        }
    };

    const downloadSampleCSV = () => {
        const sampleData = [
            "Name,Email,Phone,Service Name,Amount,Description",
            "John Smith,john.smith@example.com,9876543210,Web Development Services,15000,Complete website development with responsive design",
            "Sarah Johnson,sarah.johnson@example.com,9876543211,Digital Marketing,8000,Social media marketing campaign for 3 months",
            "Mike Wilson,mike.wilson@example.com,9876543212,SEO Optimization,5000,Search engine optimization for e-commerce site",
            "Emily Davis,emily.davis@example.com,9876543213,Consulting Services,12000,Business strategy consultation and planning",
            "David Brown,david.brown@example.com,9876543214,Mobile App Development,25000,iOS and Android app development",
            "Lisa Garcia,lisa.garcia@example.com,9876543215,Content Writing,3000,Blog writing and content creation services",
            "Robert Miller,robert.miller@example.com,9876543216,Graphic Design,6000,Logo design and branding package",
            "Jennifer Taylor,jennifer.taylor@example.com,9876543217,Data Analysis,9000,Data analysis and reporting services",
            "Michael Anderson,michael.anderson@example.com,9876543218,Cloud Migration,18000,Cloud infrastructure migration and setup",
            "Amanda Thomas,amanda.thomas@example.com,9876543219,Training Services,4000,Staff training on new software systems"
        ].join('\n');

        const blob = new Blob([sampleData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sample-bulk-invoices.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
                <div className="flex flex-wrap items-center justify-between">
                    <h4 className="text-body-2xlg font-bold text-dark dark:text-white">Send Bulk Invoices</h4>
                    <button
                        onClick={downloadSampleCSV}
                        className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                        </svg>
                        Download Sample CSV
                    </button>
                </div>

                {/* CSV Upload Section */}
                <div className="mt-6">
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Upload CSV File
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-500">
                                <strong>CSV Format:</strong> Name, Email, Phone, Service Name, Amount, Description (optional)
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>📋 <strong>Need a template?</strong></span>
                                <button
                                    onClick={downloadSampleCSV}
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    Download Sample CSV
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                                <strong>💡 Tip:</strong> Use the sample CSV to understand the format. You can edit it with your own data and upload it back.
                            </div>
                        </div>
                    </div>

                    {/* CSV Preview */}
                    {csvData.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-2 text-sm font-medium text-dark dark:text-white">CSV Preview ({csvData.length} records)</h5>
                            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {csvData.slice(0, 10).map((record, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-2 text-sm text-gray-900">{record.name}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{record.email}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{record.phone}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{record.serviceName}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">₹{record.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {csvData.length > 10 && (
                                    <p className="px-3 py-2 text-sm text-gray-500">... and {csvData.length - 10} more records</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Processing Status */}
                    {isProcessing && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Processing Bulk Invoices</p>
                                    <p className="text-xs text-blue-600">{processingStatus}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Send Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSendInvoices}
                            disabled={!csvFile || csvData.length === 0 || isProcessing}
                            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <PaperAirplaneIcon className="h-4 w-4" />
                                    Send Invoices
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* History Section */}
                <div className="mt-8">
                    <h5 className="mb-4 text-lg font-medium text-dark dark:text-white">Bulk Invoice History</h5>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Records</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bulkInvoiceHistory.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.csvFileName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.totalRecords}</td>
                                        <td className="px-6 py-4 text-sm text-green-600">{record.processedRecords}</td>
                                        <td className="px-6 py-4 text-sm text-red-600">{record.failedRecords}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    record.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {record.status}
                                                </span>
                                                {record.status === 'Processing' && (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(record.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(record)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View
                                                </button>
                                                {record.status === 'Completed' && (
                                                    <button
                                                        onClick={() => handleDownloadInvoices(record._id)}
                                                        className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                                    >
                                                        <DocumentArrowDownIcon className="h-4 w-4" />
                                                        Download
                                                    </button>
                                                )}
                                                {(record.status === 'Failed' || (record.failedRecords > 0 && record.status === 'Completed')) && (
                                                    <button
                                                        onClick={() => handleRetryInvoices(record._id)}
                                                        className="text-orange-600 hover:text-orange-800 flex items-center gap-1"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                                            />
                                                        </svg>
                                                        Retry
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black bg-opacity-25" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                Bulk Invoice Details
                            </Dialog.Title>
                            
                            {selectedRecord && (
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">File Name:</label>
                                        <p className="text-sm text-gray-900">{selectedRecord.csvFileName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Total Records:</label>
                                        <p className="text-sm text-gray-900">{selectedRecord.totalRecords}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Processed:</label>
                                        <p className="text-sm text-green-600">{selectedRecord.processedRecords}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Failed:</label>
                                        <p className="text-sm text-red-600">{selectedRecord.failedRecords}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Status:</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            selectedRecord.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            selectedRecord.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedRecord.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Created:</label>
                                        <p className="text-sm text-gray-900">{new Date(selectedRecord.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </>
    );
};
