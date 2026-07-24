import QRCode from 'qrcode';
import { formatTitleCase } from './formating';

export async function generateQrCodeDataUrl(text: string): Promise<string> {
    return await QRCode.toDataURL(text, { margin: 0 });
}

export function buildHtmlTemplate({
    qrCode,
    id,
    wasteSourceType,
    wasteSourceName,
    wasteType,
    wasteGroup,
    wasteCharacteristics,
    currentPage,
    totalPage,
    ownedBy,
    transportaionstatus,
    wasteStatus,
}: {
    qrCode: string;
    id: string;
    wasteSourceType: string;
    wasteSourceName: string;
    wasteType: string;
    wasteGroup: string;
    wasteCharacteristics: string;
    currentPage: number;
    totalPage: number;
    ownedBy?: any;
    transportaionstatus?: any;
    wasteStatus?: any;
}): string {
    const id4digit = id.toString().padStart(4, '0');
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear()}`;
    const formattedDateHeader = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

    return `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    width: 100%;
                    position: relative;
                    margin: 0;
                    padding: 0;
                }
                header {
                    position: fixed;
                    top: 25;
                    left: 0;
                    right: 0;
                    font-size: 14px;
                    color: #555;
                }
                .header-center {
                    position: absolute;
                    left: 50%;
                    bottom: 0;
                }
                .header-left {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                }
                footer {
                    position: fixed;
                    bottom: 10;
                    left: 0;
                    right: 0;
                    font-size: 14px;
                    color: #555;
                }
                .footer-left {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                }
                .footer-right {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                }
                .header {
                    font-size: 12px;
                    margin-bottom: 10px;
                    margin-top: 10px;
                }
                .divider {
                    height: 2px;
                    background: black;
                }
                .info {
                    font-weight: bold;
                    font-size: 12px;
                }
                .container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 30px;
                    margin: 0 5%;
                }
                .info-content {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 5px;
                    width: 100%;
                    align-items: center;
                }
                img {
                    width: 160px;
                    height: 160px;
                }
                .flex-center {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .card {
                    width: 10cm;
                    height: 7cm;
                    background-color: #f5f5f5;
                }
            </style>
        </head>
        <body>
            <header>
                <div class="header-left">${formattedDateHeader}</div>
                <div class="header-center">WMS Management</div>
            </header>

            <footer>
                <div class="footer-left">
                    ${process.env.BASE_URL}
                </div>
                <div class="footer-right">
                    <span class="pageNumber">${currentPage}</span>/<span class="totalPages">${totalPage}</span>
                </div>
            </footer>
            <div class="flex-center">
                <div class="card">
                    <div class="header">${wasteType} - ${wasteGroup} - ${wasteCharacteristics}</div>
                    <div class="divider"></div>
                    <div class="container">
                        <div class="info-content">
                            <div class="info">${id4digit}${formattedDate}</div>
                            <div class="info">${formatTitleCase(wasteSourceType)} - ${wasteSourceName}</div>
                        </div>
                        <img src="${qrCode}" alt="QR Code"/>
                    </div>
                </div>
            </div>
        </body>
    </html>
  `;
}
