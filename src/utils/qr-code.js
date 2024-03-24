import  QRCode  from "qrcode"


export const qrCodeGenerate = async (data)=>{
    const QR = await QRCode.toDataURL(data,{errorCorrectionLevel:'H'})
    return QR
}