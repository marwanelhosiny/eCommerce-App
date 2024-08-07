import * as routes from './modules/routes.js'
import db_connection from '../DB/connection.js'
import { globalResponse } from '../src/middlewares/globalResponse.js'
import { rollBackUploadedFiles } from './middlewares/rollback-uploadedFiles.middleware.js'
import { rollbackSavedFiles } from './middlewares/rollback-savedFiles.middleware.js'
import { cronToCheckCouponExpiration } from './utils/crons.js'

import { gracefulShutdown } from 'node-schedule'


export const initiateApp = (express,app)=>{


const port = process.env.PORT
db_connection()



app.use(express.json())

app.use('/user',routes.authRouter)
app.use('/category',routes.categoryRouter)
app.use('/sub-category',routes.subCategoryRouter)
app.use('/brand',routes.brandRouter)
app.use('/product',routes.productRouter)
app.use('/user',routes.userRouter)
app.use('/cart',routes.cartRouter)
app.use('/coupon',routes.couponRouter)
app.use('/order',routes.orderRouter)


app.use(globalResponse,rollBackUploadedFiles,rollbackSavedFiles)

cronToCheckCouponExpiration()
gracefulShutdown()

app.listen(port, () => console.log(`app listening on port ${port}!`))
}