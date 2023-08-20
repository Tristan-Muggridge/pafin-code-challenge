import { expect } from 'chai';
import { describe } from 'mocha';
import request from 'supertest';
import app, {App} from '../../src/App';

let token: string = "";
let appInstance = new App(3000); // Create an instance of the App class
let server = appInstance.app.listen(3001); // Start the server

describe('Login Route', () => {
    
    it("Should create an admin user", async () => {
        const response = await request(server).post('/create-admin-user').send({});
        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.status).to.equal('success');
        expect(response.body.data.user).to.be.an('object');
        expect(response.body.data.user.name).to.equal('admin');
        expect(response.body.data.user.email).to.equal('admin');
    });

    it('Should return a JWT token with valid credentials', async () => {
      const credentials = Buffer.from('admin:admin').toString('base64');
      const response = await request(server)
        .post('/login')
        .set('Authorization', `Basic ${credentials}`);
  
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.data).to.be.an('object');
        expect(response.body.data.token).to.be.a('string');

        token = response.body.data.token;
    });
  
    it('Should return 401 with invalid credentials', async () => {
        const credentials = Buffer.from('invalid-username:invalid-password').toString('base64');
        const response = await request(server)
            .post('/login')
            .set('Authorization', `Basic ${credentials}`);
    
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal('fail');
        expect(response.body.data).to.be.an('undefined');
    });
});

describe('GET /api/users', () => {
    it('Should return 401 without a token', async () => {
        const response = await request(server).get('/api/users');
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal('fail');
        expect(response.body.data).to.be.an('undefined');
    });

    it('Should return 401 with an invalid token', async () => {
        const response = await request(server).get('/api/users').set('Authorization', `Bearer invalid-token`);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal('fail');
        expect(response.body.data).to.be.an('undefined');
    });

    it('Should return 200 with a valid token', async () => {
        const response = await request(server).get('/api/users').set('Authorization', `Bearer ${token}`);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.data).to.be.an('object');
        console.debug(response.body.data)
        expect(response.body.data.users).to.be.an('array');
    });
});

// describe('POST /api/user', async () => {

//     it('Should only return name errors when name is invalid', async () => {
//         const result = await request(app).post('/api/user').send({
//             name: 'St',
//             email: 'test.user@test.com',
//             password: 'Password123!',
//         });

//         expect(result.status).to.equal(400);
//         expect(result.body.status).to.equal('fail');
//         expect(result.body.data.name).to.be.an('array');
//         expect(result.body.data.email).to.be.an('undefined');
//         expect(result.body.data.password).to.be.an('undefined');
//     });

//     it('Should only return email errors when email is invalid', async () => {
//         const result = await request(app).post('/api/user').send({
//             name: "Test User",
//             email: "test.user@test",
//             password: "Password123!",
//         });

//         expect(result.status).to.equal(400);
//         expect(result.body.status).to.equal('fail');
//         expect(result.body.data.name).to.be.an('undefined');
//         expect(result.body.data.email).to.be.an('array');
//         expect(result.body.data.password).to.be.an('undefined');
//     });

//     it('Should only return password errors when password is invalid', async () => {
//         const result = await request(app).post('/api/user').send({
//             name: "Test User",
//             email: "test.user@test.com",
//             password: "password",
//         });

//         expect(result.status).to.equal(400);
//         expect(result.body.status).to.equal('fail');
//         expect(result.body.data.name).to.be.an('undefined');
//         expect(result.body.data.email).to.be.an('undefined');
//         expect(result.body.data.password).to.be.an('array');
//     });

// });
