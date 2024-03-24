import * as routes from './modules/routes.js'
import db_connection from '../DB/connection.js'
import { globalResponse } from '../src/middlewares/globalResponse.js'
import { rollBackUploadedFiles } from './middlewares/rollback-uploadedFiles.middleware.js'
import { rollbackSavedFiles } from './middlewares/rollback-savedFiles.middleware.js'
import { cronToCheckCouponExpiration, cronToCheckOrderExpiration } from './utils/crons.js'

import { gracefulShutdown } from 'node-schedule'
import { Server } from 'socket.io'
import { generateIO } from './utils/io-generation.js'


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
app.use('/review',routes.reviewRouter)
app.use('/success',(req,res,next)=>{res.status(200),res.json({message:'success'})})
app.use('/cancel',(req,res,next)=>{res.status(400),res.json({message:'cancel'})})
app.use('*', (req, res, next) => {
    res.status(404).json({ message: 'Not Found' })
})


app.use(globalResponse,rollBackUploadedFiles,rollbackSavedFiles)

cronToCheckCouponExpiration()

gracefulShutdown()
cronToCheckOrderExpiration()

const expressServer=app.listen(port, () => console.log(`app listening on port ${port}!`))
const io = generateIO(expressServer)

io.on('connection', (socket) => {
    console.log('a client connected' , {id:socket.id});

});
}