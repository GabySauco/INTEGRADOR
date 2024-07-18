process.loadEnvFile() 
const {MongoClient} = require ('mongodb')

//OBTENEMOS LA URI DESDE LAS VARIABLES DE ENTORNO
 const URI = process.env.MONGODB_URLSTRING
 //HACEMOS LA CONEXION DEL CLIENTE
 const client = new MongoClient(URI) 

 async function connectToMongoDB() {
    try{
      await client.connect()
      console.log('Conectandose a MongoDB');
      return client
    } catch (error) {
      console.log('Error al conectarse a MongoDB')
    }
 }

 async function disconnectFromMongoDB() {
    try{
      await client.close()
      console.log('Desonectandose de MongoDB');
      
    } catch (error) {
      console.log('Error al desconectarse de MongoDB')
    }
 }

 module.exports={connectToMongoDB, disconnectFromMongoDB};
