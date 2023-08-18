import { expect } from 'chai';
import { describe } from 'mocha';
import request from 'supertest';
import app from '../../../src/app';

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
