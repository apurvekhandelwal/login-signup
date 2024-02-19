const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const { ObjectId } = require('mongoose').Types;

const app = express();
const PORT = 3000;


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

app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));


app.post('/user', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json({ message: 'Data saved successfully', data: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
});

app.get('/user/data/:id', async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ObjectId');
    }
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('User not found');
        } else {
            res.json(user);
        }
    } catch (error) {
        res.status(500).send('Error fetching data');
    }

});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

