import { expect } from 'chai';
import { describe } from 'mocha';
import request from 'supertest';
import app from '../../src/app';

describe('GET /api/user', () => {
    it('Should return a status of 200', async () => {
        const result = await request(app).get('/api/user');
        expect(result.status).to.equal(200);
        expect(result.body).to.be.an('array');
    })
})