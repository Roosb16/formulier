const express = require('express')
const app = express()
const users = require('./users.json')
app.use(express.static('public')) //soort handler die ervoor zorgt dat we de bestanden in de public map kunnen gebruiken in onze server
app.use(express.urlencoded({ extended: true })) //soort handler die ervoor zorgt dat we de data van een form kunnen gebruiken in onze server

// set the view engine to ejs
app.set('view engine', 'ejs')

// use res.render to load up an ejs view file

// profiel page
app.get('/', function(req, res) {
  res.render('pages/home')
});

app.get('/login', (req, res) => {
    res.render('pages/loginform', {error: ""})
})

// // submitted
// app.post('/login', function(req, res) {
//   const email = req.body.email
//   const wachtwoord = req.body.wachtwoord

//   //account
//   const juisteEmail = "test@mail.com"
//   const juistWachtwoord = "1234"

//   if (email === juisteEmail && wachtwoord === juistWachtwoord) {
//     res.render('pages/submitted', { success: true, email: email })
//   } else {
//     res.render('pages/submitted', { success: false })
//   }
// })

const checkForm = (req, res, next) => {
  const formOk = true;
  if (formOk) {
    next()
  } else {
    res.render("pages/loginform", { error: "Er is iets misgegaan, probeer het opnieuw" })
  }
}

// const toonBoodschap = (req, res) => {
//   console.log(req.body)
//   res.render('pages/submitted', {voornaam: req.body.voornaam, email: req.body.email})
// }

// app.post('/submitted', checkForm, toonBoodschap)

app.post('/login', (req, res) => {
  const ingevuldeEmail = req.body.email // Let op: check of 'name="email"' in je HTML staat
  const ingevuldWachtwoord = req.body.wachtwoord // Check of 'name="wachtwoord"' in je HTML staat

  // We zoeken in de 'data' (jouw users.json) of er een match is
  // Ik ga er even vanuit dat je JSON een array is met objecten
  const gebruiker = users.find(user => 
      user.email === ingevuldeEmail && user.wachtwoord === ingevuldWachtwoord
  )

  if (gebruiker) {
      // Match gevonden! Toon de welkomstpagina
      res.render('pages/submitted', { 
          user: gebruiker
      })
  } else {
      // Geen match, toon het formulier opnieuw met een foutmelding
      res.render('pages/loginform', { 
          error: "Helaas, je inloggegevens zijn niet bekend." 
      })
  }
})

// about page
app.get('/about', function(req, res) {
  const data = {
    moviename: "The Lord of the Rings"
  }
  res.render('pages/about', { data: data})
});

// app.post('/login', (req, res) => {
//     res.render('pages/submitted', { success: true, email: req.body.email })
// })

app.listen(3000)
console.log('Server is listening on port 3000')
