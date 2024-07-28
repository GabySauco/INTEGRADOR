const express = require('express');
const { connectToMongoDB, disconnectFromMongoDB } = require('./src/mongodb.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de prendas!');
});

// Obtener todas las prendas
app.get('/prendas', async (req, res) => {
  const client= await connectToMongoDB ()
  if (!client){
    res.status (500).send ('Error al conectarse a la BD')
  }
  try{
    const db = client.db ('prendasDB')
    const prendas = await db.collection ('prendas').find().toArray()
    res.json (prendas)
    } catch (error){
      res.status(500).send('Error al obtener las prendas')
    } finally {
      await disconnectFromMongoDB()
    }
  })

// Filtrar prendas por nombre (búsqueda parcial)
app.get('/prendas/:id', async (req, res) => {
  const client = await connectToMongoDB()
  if (!client) {
    res.status(500).send('Error al conectarse a la BD')
  }
  try {
    const prendaId = parseInt(req.params.id) || 0
    const db = client.db('prendasDB')
    const prenda = await db.collection('prendas').findOne({ id: prendaId })
    if (prenda) {
      res.json(prenda)
    } else {
      res.status(404).send(`No se encontro la prenda con id ${prendaId}`)
    }
  } catch (error) {
    res.status(500).send('Error al obtener la prenda')
  } finally {
    await disconnectFromMongoDB()
  }
})

// Crear una nueva prenda
app.post('/prendas', async (req, res) => {
  const nuevaPrenda = req.body;
  if (nuevaPrenda===undefined) {
    res.status(400).send ('Error en el formato de datos a crear ')
    const client = await connectToMongoDB()
    if(!client){
      res.status(500).send('Error al conectarse a MongoDB')
}
  const collection = client.db ('prendasDB').collection ('prendas')
  collection.insertOne(nuevaPrenda)
  .then(()=>{
   conseole.log ('Nueva prenda creada')
   res.status(201).send(nuevaPrenda)
  })
  .catch(error =>{
    console.log(error)
  })
.finally(()=>{
  client.close()
})
}
})

//Modificar una prenda
app.patch('/prendas',async (req,res)=>{
  const id= req.params.id
  const nuevosDatos= req.body
  if(!nuevosDatos){
res.status(400).send('Error en el formto de datos recibido')
}
const client=await connectToMongoDB()
if(!client){
  res.status(500).send ('Error al conectarse a Mongo DB')
}
const collection= client.db('prendasDB').collection('prendas')
collection.updateOne({id:parseInt(id)},{$set : nuevosDatos})
.then(()=>{
  console.log('Prenda modificada')
  res.status(200).send(nuevosDatos)
})
.catch((error)=>{
  res.status(500).json({descripcion: 'error al modificar la prenda'})
})
.finally(()=>{
client.close()
})

})
// Eliminar una prenda
app.delete('/prendas/:id', async (req, res) => {
  const id= req.params.id
  if (!req.params.id){
    return res.status(400).send ('El formato de datos es erroneo o invalido')
  }
const client= await connectToMongoDB()
if(!client){
  return res.status(500).send('Error al conectarse a MongoDB')
}
client.connect()
.then(()=>{
  const collection= client.db('prendasDB').collection('prendas')
  return collection.deleteOne({id:parseInt(id)})
})
.then((resultado)=>{
  if(resultado.deletedCount===0){
    res.status(404).send('No se encontro prenda con el ID proporcionado',id)
  } else {
    console.log('Prenda eliminada')
    res.status(204).send()
  }
})
.catch((error)=>{
  console.error(error)
  res.status(500).send('se produjo un error al intentar eliminar la prenda')
})
.finally(()=>{
  client.close()
})
})

// Inicializar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});