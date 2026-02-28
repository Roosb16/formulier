require('dotenv').config()
const express = require('express')
const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const xss = require('xss')

const app = express()

// --- Middleware ---
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', 'views')

// --- MongoDB ---
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`
const client = new MongoClient(uri)

async function startServer() {
  try {
    await client.connect()
    console.log('Database connected')

    const db = client.db(process.env.DB_NAME)
    const PORT = process.env.PORT || 3000

    // --- ROUTES ---
    app.get('/', (req, res) => {
      res.render('pages/home')
    })

    // ABOUT PAGE
    app.get('/about', function (req, res) {
      const data = {
        moviename: "The Lord of the Rings"
      }
      res.render('pages/about', { data: data })
    });

    // REGISTER FORM
    app.get('/register', (req, res) => {
      res.render('pages/register', { error: "" })
    })

    // REGISTER POST
    app.post('/register', async (req, res) => {
      try {
        let { username, email, wachtwoord } = req.body

        //SANITISE
        username = xss(username)
        email = xss(email)

        // VALIDATE
        if (!validator.isLength(username, { min: 3 })) {
          return res.render('pages/register', { error: "Username moet minimaal 3 tekens zijn" })
        }

        if (!validator.isEmail(email)) {
          return res.render('pages/register', { error: "Ongeldig emailadres" })
        }

        if (!validator.isLength(wachtwoord, { min: 6 })) {
          return res.render('pages/register', { error: "Wachtwoord moet minimaal 6 tekens zijn" })
        }

        // Check of gebruiker al bestaat
        const bestaandeUser = await db.collection('gebruikers').findOne({ email })
        if (bestaandeUser) {
          return res.render('pages/register', { error: "Email bestaat al" })
        }

        // HASH WACHTWOORD
        const hashedPassword = await bcrypt.hash(wachtwoord, 10)

        // Opslaan in database
        await db.collection('gebruikers').insertOne({
          username,
          email,
          wachtwoord: hashedPassword
        })

        res.render('pages/submitted', { user: { username } })

      } catch (err) {
        console.error(err)
        res.status(500).send('Server error bij registratie')
      }
    })

    // LOGIN FORM
    app.get('/login', (req, res) => {
      res.render('pages/loginform', { error: "" })
    })

    // LOGIN POST
    app.post('/login', async (req, res) => {
      try {
        let { email, wachtwoord } = req.body

        email = xss(email)

        const gebruiker = await db.collection('gebruikers').findOne({ email })

        if (!gebruiker) {
          return res.render('pages/loginform', { error: "Gebruiker niet gevonden" })
        }

        const isMatch = await bcrypt.compare(wachtwoord, gebruiker.wachtwoord)

        if (!isMatch) {
          return res.render('pages/loginform', { error: "Wachtwoord klopt niet" })
        }

        res.render('pages/submitted', { user: gebruiker })

      } catch (err) {
        console.error(err)
        res.status(500).send('Server error bij login')
      }
    })

    // TEST ROUTE
    app.get('/test-db', async (req, res) => {
      const users = await db.collection('gebruikers').find().toArray()
      res.send(users)
    })

    // 404
    app.use((req, res) => {
      res.status(404).send("404 - Pagina niet gevonden")
    })

    app.listen(PORT, () => {
      console.log(`Server draait op http://localhost:${PORT}`)
    })

  } catch (err) {
    console.error('Database connectie mislukt:', err)
  }
}

startServer()