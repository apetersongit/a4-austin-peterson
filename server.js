require('dotenv').config()

const express = require( 'express' )
const { MongoClient, ObjectId } = require( 'mongodb' )
const session = require('express-session')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const ViteExpress = require('vite-express')

const app = express()
const port = process.env.PORT || 3000


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

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
  response.sendFile(__dirname + '/vite-a4/dist/index.html')
})

app.use(express.static(__dirname + '/vite-a4/dist', {
  index: false
}))

app.use('/js', express.static(__dirname + '/public/js'))
app.use('/css', express.static(__dirname + '/public/css'))

const mongoUrl = new URL(process.env.MONGODB_URI)

const username = decodeURIComponent(mongoUrl.username)
const password = decodeURIComponent(mongoUrl.password)

const mongoConnectionString =
  'mongodb+srv://' +
  encodeURIComponent(username) +
  ':' +
  encodeURIComponent(password) +
  '@' +
  mongoUrl.hostname +
  '/?authSource=admin'

const client = new MongoClient(mongoConnectionString)

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

    ViteExpress.listen(app, port, function() {
      console.log(`Server running on port ${port}`)
    })
  } catch(error) {
    console.error('MongoDB connection error: ', error)
  }
}

startServer()