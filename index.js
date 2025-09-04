const app=require('./app')
const config=require('./utils/config')
const logger=require('./utils/logger')
app.listen(config.PORT,()=>{
  logger.info(`server running on ${config.PORT}`)
})