const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const user1ID = new mongoose.Types.ObjectId();
const user1 = {
    _id: user1ID,
    name: 'Mike',
    email: 'mike@example.com',
    password: '56what!',
    tokens: [{
        token: jwt.sign({_id: user1ID}, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany();
    await new User(user1).save();
});

// afterEach(() => {
//     console.log('After each');
// })

test('Should sign up a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        password: 'MyPass777!',
        email: 'andrew@example.com'
    }).expect(201);
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'andrew@example.com'
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('MyPass777!');
});

test('Should log in existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: user1.email,
        password: user1.password
    }).expect(200);
    const user = User.findById(user1._id);
    //expect(user).not.toBeNull();
    //expect(user.tokens[1].token).toBe(response.body.token);
});

test('Should fail login for the non-existent user', async () => {
    await request(app).post('/users/login').send({
        email: user1.email,
        password: 'dhjshh'
    }).expect(400)
});

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(404);});

test('Should delete user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200);
    const user = User.findById(user1._id);
    expect(user).toBeNull();
});

test('Should not delete user with invalid authentication', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(404)
});