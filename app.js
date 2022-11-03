const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');


//mongoose (2nd step )

mongoose.connect('mongodb://localhost:27017/loginDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

// middlewares
app.set("view engine", 'ejs');
app.set('views', 'views');
// body parser
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret' }));

//MiddleWare

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
}

// routes`
app.get('/register', (req, res) => {
    res.render("register")
})
app.post('/register', async (req, res) => {
    // let guestCredentials = req.body;
    // res.send(guestCredentials);
    const { password, username } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hash });
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})
app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/secretRoute');
    }
    //const user = await User.findOne({ username });
    //const check = await bcrypt.compare(password, user.password);
    // if (check) {
    //     req.session.user_id=user._id;
    //     res.redirect('/secretRoute');
    // }
    else {
        res.redirect('/login');

    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    // req.session.destroy();
    res.redirect('login');
})
app.get('/secretRoute', requireLogin, (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    res.render('secret')

})


app.get('/', (req, res) => {
    res.send("Hello world")
})


app.listen(3000, () => {
    console.log('listening on port 3000');
})