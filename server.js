const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const users = [];
const posts = [];
const SECRET_KEY = 'your_secret_key';

// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index', { name: 'kyle' });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    console.log(users);
});

app.post('/login', async (req, res) => {
    const user = users.find(user => user.email === req.body.email);
    if (user == null) {
        return res.status(400).send('Cannot find user');
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET_KEY);
            res.json({ access_token: accessToken });
        } else {
            res.status(403).send('Not Allowed');
        }
    } catch {
        res.status(500).send();
    }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: `Hello, ${req.user.name}!`, user: req.user });
});

// Create a post
app.post('/posts', authenticateToken, (req, res) => {
    const post = {
        id: Date.now().toString(),
        userId: req.user.id,
        title: req.body.title,
        content: req.body.content
    };
    posts.push(post);
    res.status(201).json(post);
});

// Get posts by user ID
app.get('/posts', authenticateToken, (req, res) => {
    const userPosts = posts.filter(post => post.userId === req.user.id);
    res.json(userPosts);
});

// Update a post
app.put('/posts/:id', authenticateToken, (req, res) => {
    const post = posts.find(post => post.id === req.params.id && post.userId === req.user.id);
    if (post == null) return res.sendStatus(404);

    post.title = req.body.title;
    post.content = req.body.content;
    res.json(post);
});

// Delete a post
app.delete('/posts/:id', authenticateToken, (req, res) => {
    const postIndex = posts.findIndex(post => post.id === req.params.id && post.userId === req.user.id);
    if (postIndex === -1) return res.sendStatus(404);

    posts.splice(postIndex, 1);
    res.sendStatus(204);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


// const express = require('express');
// const app = express();
// const bcrypt = require('bcrypt');

// const users = [];

// // Set view engine to EJS
// app.set('view engine', 'ejs');

// // Middleware to parse URL-encoded bodies
// app.use(express.urlencoded({ extended: false }));

// app.get('/', (req, res) => {
//     res.render('index', { name: 'kyle' });
// });

// app.get('/login', (req, res) => {
//     res.render('login');
// });

// app.get('/register', (req, res) => {
//     res.render('register');
// });

// app.post('/register', async (req, res) => {
//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         users.push({
//             id: Date.now().toString(),
//             name: req.body.name,
//             email: req.body.email,
//             password: hashedPassword
//         });
//         res.redirect('/login');
//     } catch {
//         res.redirect('/register');
//     }
//     console.log(users);
// });

// app.listen(3000, () => {
//     console.log('Server running on port 3000');
// });

// app.post('/login', async (req, res) => {
//     const user = users.find(user => user.email === req.body.email);
//     if (user == null) {
//         return res.status(400).send('Cannot find user');
//     }
//     try {
//         if (await bcrypt.compare(req.body.password, user.password)) {
//             res.send('Success');
//         } else {
//             res.send('Not Allowed');
//         }
//     } catch {
//         res.status(500).send();
//     }
// });

