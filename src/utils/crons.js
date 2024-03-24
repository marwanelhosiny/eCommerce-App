import { scheduleJob } from "node-schedule"
import { DateTime } from "luxon"

import Coupon from "../../DB/models/coupon.model.js"
import Order from "../../DB/models/order.model.js"


export const cronToCheckCouponExpiration = async () => {
    scheduleJob('0 0 * * *', async () => {
        console.log('Cron job is running every one day')

        const coupons = await Coupon.find({ couponStatus: 'valid' })

        for (const coupon of coupons) {
            console.log(DateTime.fromISO(coupon.fromDate))
            if (
                DateTime.fromISO(coupon.toDate) < DateTime.now()
            ) {
                coupon.couponStatus = 'expired'
            }
            await coupon.save()
        }
    })
}

export const cronToCheckOrderExpiration = async () => {
    scheduleJob('0 0 * * *', async () => {
        console.log('Cron job is running every one day')

        const orders = await Order.find({ orderStatus: "Pending" })
        const now = DateTime.now()

        for (const order of orders) {
            console.log(DateTime.fromJSDate(order.createdAt))
            if (
                DateTime.fromJSDate(order.createdAt) < now.minus({ days: 1 })
            ) {
                console.log(`Order ${order._id} is older than 1 day and will be cancelled.`);
                order.orderStatus = 'Cancelled'
            }
            await order.save()
        }
    })
}