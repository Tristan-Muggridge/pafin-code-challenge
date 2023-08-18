import { expect } from 'chai';
import { describe } from 'mocha';
import request from 'supertest';
import app from '../../src/app';

describe('GET /api/user', async () => {
    it('Should return a status of 200', async () => {
        const result = await request(app).get('/api/user');
        expect(result.status).to.equal(200);
    });

    it('Should return an array of users', async () => {
        const result = await request(app).get('/api/user');
        expect(result.body.data.users).to.be.an('array');
    });
})

describe('POST /api/user', async () => {

    it('Should only return name errors when name is invalid', async () => {
        const result = await request(app).post('/api/user').send({
            name: 'St',
            email: 'test.user@test.com',
            password: 'Password123!',
        });

        expect(result.status).to.equal(400);
        expect(result.body.status).to.equal('fail');
        expect(result.body.data.name).to.be.an('array');
        expect(result.body.data.email).to.be.an('undefined');
        expect(result.body.data.password).to.be.an('undefined');
    });

    it('Should only return email errors when email is invalid', async () => {
        const result = await request(app).post('/api/user').send({
            name: "Test User",
            email: "test.user@test",
            password: "Password123!",
        });

        expect(result.status).to.equal(400);
        expect(result.body.status).to.equal('fail');
        expect(result.body.data.name).to.be.an('undefined');
        expect(result.body.data.email).to.be.an('array');
        expect(result.body.data.password).to.be.an('undefined');
    });

    it('Should only return password errors when password is invalid', async () => {
        const result = await request(app).post('/api/user').send({
            name: "Test User",
            email: "test.user@test.com",
            password: "password",
        });

        expect(result.status).to.equal(400);
        expect(result.body.status).to.equal('fail');
        expect(result.body.data.name).to.be.an('undefined');
        expect(result.body.data.email).to.be.an('undefined');
        expect(result.body.data.password).to.be.an('array');
    });

});
