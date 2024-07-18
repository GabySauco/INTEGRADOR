const express = require ('express');
const {connectToMongoDB, disconnectFromMongoDB} = require('./src/mongodb.js');
require('dotenv').config();

const app = express();
process.loadEnvFile();
const port = process.env.PORT || 3000;

// Middleware
app.use ((req,res,next)=>{
  res.header("Content-Type", "application/json; chartset=utf-8");
  next()
});

//Ruta principal
app.get('/', (req,res) => {
    res.send ('Bienvenido a la API de prendas!')
});

//obtener todas las prendas
app.get('/prendas', async(req,res) => {
    const client = await connectToMongoDB()
})
try{
 const db = client.db('prendasdb')
 const prendas =  await db.colletion('prendas').find().toArray()
 res.json(prendas)
 await disconnectFromMongoDB(client)
} catch (error){
   res.status(500).send('Error al obtener las prendas')
} finally {
  await disconnectFromMongoDB(client)
}

//Obtener una prenda por ID
app.get('/prendas/:id', async(req,res) => {
  const client = await connectToMongoDB()
  if(!client){
    res.status(500).send('Error al conectarse a la BD');
  }
})
try{
const prendaId= parseInt(req.params.id)||0
const db = client.db('prendasdb');
const prenda =  await db.colletion('prendas').findOne({id:prendaId})
if (prenda) {
  res.json(prenda);
} else {
  res.status(404).send('No se encontro la prenda con id ${prendaId}')
}
await disconnectFromMongoDB(client);
} catch (error){
 res.status(500).send('Error al obtener la prenda')
} finally {
await disconnectFromMongoDB(client);
}

//Filtrar prendas por nombre (búsqueda parcial)
app.get('/prendas/buscar/:nombre', async (req, res) => {
  try {
    const client = await connectToMongoDB();
    const db = client.db('prendasdb');
    const nombre = req.params.nombre;
    const prendas = await db.collection('prendas').find({ nombre: { $regex: nombre, $options: 'i' } }).toArray();
    res.json(prendas)
await disconnectFromMongoDB(client);
  } catch (error) {
    res.status(500).send(error.toString())
  }
});

//Crear un nuevo producto
app.post('/prendas', async (req, res) => {
  const nuevaPrenda = req.body
  if (nuevaPrenda === undefined){
    res.status(400).send('Error al crear nuevo producto')
  }
    const client = await connectToMongoDB()
    if (!client){
      res.status(500).send('Error al conectarse a MongoDB')
    }
   const collection= client.db('prendasdb').collection('prendas')
    collection.insertOne(nuevaPrenda)
    .then(()=>{
      console.log('Nueva prenda creada')
      res.status(201).send(nuevaPrenda)
    })
   .catch (error => {
    console.error(error)
    await disconnectFromMongoDB(client);
}) 
})
  




//Eliminar una prenda
app.delete('/prendas/:id', async (req, res) => {
  try {
    const client = await connectToMongoDB()
    const db = client.db('prendasdb')
    const result = await db.collection('prendas').deleteOne({_id: new ObjectId(req.params.id)})
    if (result.deletedCount > 0) {
      res.send('Prenda eliminada')
    } else {
      res.status(404).send('Prenda no encontrada')
    }
    await client.close()
  } catch (error) {
    res.status(500).send(error.toString())
  }
})


// Inicializamos el servidor
app.listen(port, () => {
 console.log('Ejemplo app listen http://localhost:${port}')
 connectToMongoDB()
})


