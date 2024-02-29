import { scheduleJob } from "node-schedule" 
import Coupon from "../../DB/models/coupon.model.js"
import { DateTime } from "luxon"


export const cronToCheckCouponExpiration = async () => {
    scheduleJob('*/10 * * * * *',async () =>{
        console.log('Cron job is running every 10 seconds')

        const coupons = await Coupon.find({couponStatus:'valid'})

        for (const coupon of coupons) {
            console.log(DateTime.fromISO(coupon.fromDate))
            if(
                DateTime.fromISO(coupon.toDate)< DateTime.now()
            ){
                coupon.couponStatus = 'expired'
            }
            await coupon.save()
        }
    })
}