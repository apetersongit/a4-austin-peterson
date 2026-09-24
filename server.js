require('dotenv').config()

const express = require( 'express' )
const { MongoClient, ObjectId } = require( 'mongodb' )
const session = require('express-session')
const bcrypt = require('bcryptjs')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use(session( {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

const requireLogin = function(request, response, next) {
  if(!request.session.userId) {
    if(request.method === 'GET'){
      return response.redirect('/login.html')
    }
    return response.status(401).json({
      error: "You must log in"
    })
  }

  next()
}

app.get('/login.html', function(request, response) {
  response.sendFile(__dirname + '/public/login.html')
})

app.get('/', requireLogin, function(request, response) {
  response.sendFile(__dirname + '/public/index.html')
})

app.use('/js', express.static(__dirname + '/public/js'))
app.use('/css', express.static(__dirname + '/public/css'))

const client = new MongoClient(process.env.MONGODB_URI)

const db = client.db('watchlist')
const collection = db.collection('items')
const users = db.collection('users')

app.get('/data',requireLogin, async function(request, response) {
  const data = await collection.find({
    userId: request.session.userId
  }).toArray()

  response.json(data)
})

app.post('/submit', requireLogin, async function(request, response) {
  const item = request.body

  item.dateAdded = new Date().toLocaleDateString()

  item.userId = request.session.userId

  await collection.insertOne(item)

  const data = await collection.find({
    userId: request.session.userId
  }).toArray()

  response.json(data)
})

app.post('/edit', requireLogin, async function(request, response) {
  const id = request.body.id
  const item = request.body.item

  await collection.updateOne(
    { _id: new ObjectId(id),
      userId: request.session.userId
     },
    { $set: {
        title: item.title,
        type: item.type,
        platform: item.platform
      }
    }
  )

  const data = await collection.find({
    userId: request.session.userId
  }).toArray()

  response.json(data)
})

app.post('/delete', requireLogin, async function(request, response) {
  const id = request.body.id
  
  await collection.deleteOne({
    _id: new ObjectId(id),
    userId: request.session.userId
  })

  const data = await collection.find({
    userId: request.session.userId
  }).toArray()

  response.json(data)
})

app.post('/login', async function(request, response) {
  const username = request.body.username
  const password = request.body.password

  if(!username || !password) {
    return response.status(400).json({
      error: 'Username and Password required'
    })
  }

  let user = await users.findOne({
    username: username
  })

  if(!user) {
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await users.insertOne({
      username: username,
      password: hashedPassword
    })

    user = {
      _id: result.insertedId,
      username: username
    }

    request.session.userId = user._id.toString()

    return response.json({
      success: true,
      newUser: true,
      username: username
    })
  }

  const passwordMatches = await bcrypt.compare(password, user.password)

  if(!passwordMatches) {
    return response.status(401).json({
      error: 'Incorrect Password'
    })
  }

  request.session.userId = user._id.toString()

  response.json({
    success: true,
    newUser: false,
    username: user.username
  })
})

app.post('/logout', function(request, response) {
  request.session.destroy(function(error) {
    if(error) {
      return response.status(500).json({
        error: 'Could not log out'
      })
    }

    response.json({
      success: true
    })
  })
})

const startServer = async function() {
  try {
    await client.connect()

    console.log('Connected to MongoDB')

    app.listen(port, function() {
      console.log(`Server running on port ${port}`)
    })
  } catch(error) {
    console.error('MongoDB connection error: ', error)
  }
}

startServer()

//const addDerivedField = function(item) {
//  item.dateAdded = new Date().toLocaleDateString()
//  return item
//}

//const server = http.createServer( function( request,response ) {
//  if( request.method === 'GET' ) {
//    handleGet( request, response )    
//  }else if( request.method === 'POST' ){
//    if(request.url === '/submit') {
//    handlePost( request, response ) 
//    }else if(request.url === '/edit') {
//      handleEdit(request, response)
//    }else if(request.url === '/delete') {
//      handleDelete(request, response)
//    }
//  }
//})

//const handleGet = function( request, response ) {
   
//  if( request.url === '/' ) {
//    sendFile( response, 'public/index.html' )
//  }else if(request.url === '/data'){
//    response.writeHead(200, {
//      'Content-Type': 'application/json'
//    })
//    response.end(JSON.stringify(appdata))
//  }else{
//    const filename = dir + request.url.slice( 1 )
//    sendFile( response, filename )
//  }
//}

//const handlePost = function( request, response ) {
//  let dataString = ''

//  request.on( 'data', function( data ) {
//      dataString += data 
//  })

//  request.on( 'end', function() {
//    const item = JSON.parse(dataString)
//    addDerivedField(item)
//    appdata.push(item)
//    response.writeHead( 200, {'Content-Type': 'application/json'})
//    response.end(JSON.stringify(appdata))
//  })
//}

//const handleEdit = function(request, response) {
//  let dataString = ''

//  request.on('data', function(data) {
//    dataString += data
//  })

//  request.on('end', function() {
//    const data = JSON.parse(dataString)

//    appdata[data.index].title = data.item.title
//    appdata[data.index].type = data.item.type
//    appdata[data.index].platform = data.item.platform

//    response.writeHead(200, {'Content-Type': 'application/json'})

//    response.end(JSON.stringify(appdata))
//  })
//}

//const handleDelete = function(request, response) {
//  let dataString = ''

//  request.on( 'data', function( data ) {
//    dataString += data
//  })

//  request.on('end', function() {
//    const data = JSON.parse(dataString)

//    appdata.splice(data.index, 1)

//    response.writeHead(200, {'Content-Type': 'application/json'})

//    response.end(JSON.stringify(appdata))
//  })
//}

//const sendFile = function( response, filename ) {
//   const type = mime.getType( filename ) 

//   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
//     if( err === null ) {

       // status code: https://httpstatuses.com
//       response.writeHeader( 200, { 'Content-Type': type })
//       response.end( content )

//     }else{

       // file not found, error code 404
//       response.writeHeader( 404 )
//       response.end( '404 Error: File Not Found' )

//     }
//   })
//}

//server.listen( process.env.PORT || port )
