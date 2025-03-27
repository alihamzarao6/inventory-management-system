import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format, formatDate } from 'date-fns';

type PaperFormat = 'a4' | 'letter' | 'legal';
type Orientation = 'portrait' | 'landscape';

interface ExportOptions {
    filename?: string;
    orientation?: Orientation;
    format?: PaperFormat;
    margin?: number;
    quality?: number;
    watermark?: string;
    headerText?: string;
    footerText?: string;
    includeDateTime?: boolean;
    scale?: number;
    customStyles?: string;
}

/**
 * Exports content of a DOM element to PDF
 * @param elementRef - React ref to the element to export
 * @param options - Export configuration options
 */
export const exportToPdf = async (
    elementRef: React.RefObject<HTMLElement>,
    options: ExportOptions = {}
) => {
    if (!elementRef.current) {
        console.error('Element reference is invalid');
        return;
    }

    try {
        // Default options
        const {
            filename = 'export',
            orientation = 'portrait',
            format = 'a4',
            margin = 10,
            quality = 0.95,
            watermark,
            headerText,
            footerText,
            includeDateTime = true,
            scale = 2,
            customStyles,
        } = options;

        // Create a clone of the element to avoid modifying the original
        const originalElement = elementRef.current;
        const clone = originalElement.cloneNode(true) as HTMLElement;

        // Apply custom styles if provided
        if (customStyles) {
            const styleElement = document.createElement('style');
            styleElement.textContent = customStyles;
            clone.appendChild(styleElement);
        }

        // Set background to white for better printing
        clone.style.background = 'white';

        // Create a temporary container
        const container = document.createElement('div');
        container.appendChild(clone);

        // Make sure clone has explicit width
        const computedStyle = window.getComputedStyle(originalElement);
        clone.style.width = computedStyle.width;

        // Append to body but hide
        document.body.appendChild(container);
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';

        // Create canvas from the clone
        const canvas = await html2canvas(clone, {
            scale: scale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 15000
        });

        // Remove the temporary container
        document.body.removeChild(container);

        // PDF dimensions
        const pdfWidth = orientation === 'portrait' ? 210 : 297;
        const pdfHeight = orientation === 'portrait' ? 297 : 210;

        // Calculate content dimensions to fit in PDF
        const imgWidth = pdfWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Create PDF with proper orientation
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: format
        });

        // Add header if specified
        if (headerText) {
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(headerText, margin, margin);
        }

        // Add date/time if specified
        if (includeDateTime) {
            const now = new Date();
            const dateStr = formatDate(now, 'yyyy-MM-dd HH:mm');
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Generated: ${dateStr}`, pdfWidth - margin - 50, margin);
        }

        // Add main content image
        const imgData = canvas.toDataURL('image/jpeg', quality);
        pdf.addImage(imgData, 'JPEG', margin, margin + 10, imgWidth, imgHeight);

        // Add footer if specified
        if (footerText) {
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(footerText, margin, pdfHeight - margin);
        }

        // Add watermark if specified - use a simple approach without opacity
        if (watermark) {
            // Set very light gray color instead of using opacity
            pdf.setFontSize(60);
            pdf.setTextColor(245, 245, 245);

            // Place watermark in center and rotate it
            const centerX = pdfWidth / 2;
            const centerY = pdfHeight / 2;

            pdf.text(watermark, centerX, centerY, {
                align: 'center',
                angle: 45
            });
        }

        // Add page numbers
        const totalPages = 1; // For multi-page support, update this
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page 1 of ${totalPages}`, pdfWidth - margin - 25, pdfHeight - margin);

        // Save the PDF
        pdf.save(`${filename}_${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};

/**
 * Creates a handle export function that can be used in component
 * @param ref - React ref to the element that will be exported
 * @param documentType - Type of document (e.g., 'invoice', 'delivery-note')
 * @param entityName - Name of the entity (e.g., customer name or product name)
 */
export const createHandleExport = (
    ref: React.RefObject<HTMLElement>,
    documentType: string,
    entityName?: string
) => {
    return () => {
        // Prepare filename
        const sanitizedName = entityName
            ? entityName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            : '';

        const filename = `${documentType}${sanitizedName ? '_' + sanitizedName : ''}`;

        // Define watermark based on document type
        let watermark;
        if (documentType.includes('invoice')) {
            watermark = 'INVOICE';
        } else if (documentType.includes('delivery')) {
            watermark = 'DELIVERY NOTE';
        } else if (documentType.includes('report')) {
            watermark = 'REPORT';
        }

        // Define orientation based on document type
        const orientation = documentType.includes('table') || documentType.includes('report')
            ? 'landscape' as Orientation
            : 'portrait' as Orientation;

        // Export the PDF
        exportToPdf(ref, {
            filename,
            orientation,
            watermark,
            headerText: 'Your Company Name',
            footerText: 'Contact: info@yourcompany.com | +1 (123) 456-7890',
            includeDateTime: true,
            scale: 2
        });
    };
};