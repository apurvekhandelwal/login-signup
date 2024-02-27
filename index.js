const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const { ObjectId } = require('mongoose').Types;
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// const http = require("http").Server(app);
// const io = require("socket.io")(http, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//     },
// });

const http = require('http')
const socketIo = require('socket.io')
const server = http.Server(app)
const io = socketIo(server);



mongoose.connect('mongodb+srv://root:1234@mobzcluster.padbn7r.mongodb.net/Mobzway');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
    street: String,
    city: String,
    state: String,
    country: String
});

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid mobile number!`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value0} is not a valid email address`
        }
    },
    address: addressSchema,
    loginId: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]{8}$/.test(v);
            },
            message: props => `${props.value} is not a valid loginId! Must be 8 characters alphanumeric.`
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(v);
            },
            message: props => `${props.value} is not a valid password!. Must be atleast 6 characters long and contain atleast on uppercase, one lowercase, one digit and one special character.`
        }
    },
    socketId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

const liveUsers = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/users', (req, res) => {
    res.sendFile(__dirname + '/data.html')
});
app.use('/', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html')
});

// app.post('/user', async (req, res) => {
//     try {
//         const userData = req.body;
//         const newUser = new User(userData);
//         await newUser.save();

//         res.status(200).json({ message: 'Data saved successfully', data: newUser });
//     } catch (error) {
//         res.status(500).json({ error: error.message });

//     }
// });

app.post('/', (req, res) => {
    const userData = req.body;
    User.create(userData).then(() => {
        io.on('connection', socket => {
            console.log('A user connected from server (before emit)');
            socket.join("live_users");

            liveUsers[socket.id] = {
                email: userData.email,
                firstname: userData.firstName,
                lastname: userData.lastName,
                socketId: socket.id
            };

            console.log(liveUsers);

            io.to("live_users").emit('UserList', Object.values(liveUsers));

            socket.on('disconnect', () => {
                console.log('User Disconnected', socket.id);
            });
        });
        console.log("Successfully Inserted!");
        // res.status(200).json({ message: 'Data saved successfully', data: newUser });
        res.send("User Data Uploaded successfully");
    }).catch((error) => {
        console.error('Error inserting user', error);
        res.status(500).send('Internal server error');
    });
});

app.post('/users', (req, res) => {
    const email = req.body.email;

    User.find({ email }).then((data) => {
        res.json(data);
    }).catch((error) => {
        console.error('Error finding data', error);
        res.status(500).send('error to find data');
    });
});

// io.on('connection', (socket) => {
//     console.log('A user connected from server (before emit)');

//     // Handle joining 'live_users' room
//     socket.on('joinLiveUsers', (data) => {
//         console.log("socket.on --- data:---- in serverFile", data);

//         socket.join('live_users');

//         liveUsers[socket.id] = {
//             email: data.email,
//             firstname: data.firstName,
//             lastname: data.lastName,
//             socketId: socket.id
//         };
//         const connectedUsersData = Object.values(liveUsers);
//         console.log('Emitting connectedUsers:', connectedUsersData); // Log the data being emitted

//         io.to(socket.id).emit('connectedUsers', connectedUsersData);
//         console.log('A user connected from server (after emit)');

//     });

//     // Handle disconnect
//     // socket.on('disconnect', () => {
//     //     console.log('A user disconnected');

//     //     io.to('live_users').emit('connectedUsers', Object.values(liveUsers));
//     // });
// });

// app.get('/user/data/:id', async (req, res) => {
//     const id = req.params.id;

//     if (!ObjectId.isValid(id)) {
//         return res.status(400).send('Invalid ObjectId');
//     }
//     try {
//         const user = await User.findById(id);
//         if (!user) {
//             return res.status(404).send('User not found');
//         } else {
//             res.json(user);
//         }
//     } catch (error) {
//         res.status(500).send('Error fetching data');
//     }

// });

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

