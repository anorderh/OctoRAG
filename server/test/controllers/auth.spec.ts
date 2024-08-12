import TestAgent from "supertest/lib/agent";
import { procureHttpAgent } from "../helpers";
import { env } from "../../src/env";
import { expect } from "chai";
import cookie from 'cookie';
import { access } from "fs";

let creds = {
    username: "anthony",
    email: "anthony@norderhaug.org",
    password: "password123",
    accessToken: "",
    refreshToken: ""
};

describe('Auth Controller', () => {
    describe('Register', () => {
        let registerAgent : TestAgent = procureHttpAgent();

        it('Register account', (done) => {
            registerAgent.post('/api/auth/register')
                .send({
                    username: creds.username,
                    email: creds.email,
                    password: creds.password
                })
                .expect(200);
            done();
        })
    
        it('Fail validation', (done) => {
            registerAgent.post('/api/auth/register')
                .send({})
                .expect(400)
            done();
        })

        it('Fail bc user already exists', (done) => {
            registerAgent.post('/api/auth/register')
                .send({
                    username: creds.username,
                    email: creds.email,
                    password: creds.password
                })
                .expect(409)
            done();
        })
    })

    describe("Login", () => {
        let loginAgent : TestAgent = procureHttpAgent();

        it('Log into account', (done) => {
            loginAgent.post('/api/auth/login')
                .send({
                    username: creds.username,
                    password: creds.password
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    // Confirm access token.
                    let accessToken = res.body['token']
                    expect(accessToken)
                        .to.not.be.empty
                        .and.to.not.equal("");

                    // Confirm refresh token.
                    var cookies = cookie.parse(res.headers['set-cookie'] ?? '' );
                    var refreshToken = cookies[env.tokens.refresh.name];
                    expect(refreshToken)
                        .to.not.be.empty
                        .and.to.not.equal("");

                    creds.accessToken = accessToken;
                    creds.refreshToken = refreshToken;
                })
            done();
        });

        it('Fail validation', (done) => {
            loginAgent.post('/api/auth/login')
                .send({})
                .expect(400)
            done();
        })

        it('Invalid credentials', (done) => {
            loginAgent.post('/api/auth/login')
                .send({
                    username: 'blamo',
                    password: 'blamo'
                })
                .expect(409)
            loginAgent.post('/api/auth/login')
                .send({
                    username: creds.username,
                    password: 'blamo'
                })
                .expect(409)
            
            done();
        })
    })
})