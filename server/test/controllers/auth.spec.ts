import { expect } from 'chai';
import { env } from 'src/shared/constants/env.js';
import { Agent } from '../agent.js';

let creds = {
    username: 'anthony',
    email: 'anthony@norderhaug.org',
    password: 'password123',
};
describe('Auth Controller', () => {
    describe('Register', () => {
        let registerAgent: Agent = new Agent();

        it('Register account', async () => {
            let res = await registerAgent.http.post('/api/auth/register', {
                username: creds.username,
                email: creds.email,
                password: creds.password,
            });

            expect(res.status).to.equal(200);
        });

        it('Fail validation', async () => {
            let res = await registerAgent.http.post('/api/auth/register', {});
            expect(res.status).to.equal(400);
        });

        it('User already exists', async () => {
            let res = await registerAgent.http.post('/api/auth/register', {
                username: creds.username,
                email: creds.email,
                password: creds.password,
            });
            expect(res.status).to.equal(409);
        });
    });

    describe('Login', () => {
        let loginAgent: Agent = new Agent();

        it('Log into account', async () => {
            let res = await loginAgent.http.post('/api/auth/login', {
                username: creds.username,
                password: creds.password,
            });
            expect(res.status).to.equal(200);

            let accessToken = res.data.token;
            let refreshToken = loginAgent.getCookie(env.tokens.refresh.name);
            expect(accessToken).to.not.be.empty.and.to.not.be.null;
            expect(refreshToken).to.not.be.empty.and.to.not.be.null;
        });

        it('Fail validation', async () => {
            let res = await loginAgent.http.post('/api/auth/login', {});
            expect(res.status).to.equal(400);
        });

        it('Invalid username', async () => {
            let res = await loginAgent.http.post('/api/auth/login', {
                username: 'blamo',
                password: 'blamo',
            });
            expect(res.status).to.equal(409);
        });

        it('Invalid password', async () => {
            let res = await loginAgent.http.post('/api/auth/login', {
                username: creds.username,
                password: 'blamo',
            });
            expect(res.status).to.equal(409);
        });
    });

    describe('Refresh', () => {
        let refreshAgent: Agent = new Agent();
        let accessToken: string;

        it('Login', async () => {
            let res = await refreshAgent.http.post('/api/auth/login', {
                username: creds.username,
                password: creds.password,
            });
            expect(res.status).to.equal(200);
        });

        it('Initiate refresh', async () => {
            let res = await refreshAgent.http.get('/api/auth/refresh');
            expect(res.status).to.equal(200);
        });

        it('Fail refresh', async () => {
            refreshAgent.clearCookies();
            let res = await refreshAgent.http.get('/api/auth/refresh');
            expect(res.status).to.equal(401);
        });
    });

    describe("Account actions' verification", () => {
        let actionsAgent: Agent = new Agent();

        describe('Change password', () => {
            let hash: string;
            it('Request', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/change/password',
                    {
                        email: creds.email,
                    },
                );
                let body = res.data;
                hash = body.hash;

                expect(res.status).to.equal(200);
                expect(hash).to.not.be.empty;
            });

            it('Confirm', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/change/password/confirm',
                    {
                        hash: hash,
                        newPassword: creds.password,
                    },
                );

                expect(res.status).to.equal(200);
            });

            it('Fail validation', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/change/password/confirm',
                );
                expect(res.status).to.equal(400);
            });
        });

        describe('Change email', () => {
            let accessToken: string;
            let hash: string;

            it('Login', async () => {
                let res = await actionsAgent.http.post('/api/auth/login', {
                    username: creds.username,
                    password: creds.password,
                });
                expect(res.status).to.equal(200);

                let _accessToken = res.data.token;
                expect(_accessToken).to.not.be.empty.and.to.not.be.null;
                accessToken = _accessToken;
            });

            it('Request', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/change/email',
                    null,
                    {
                        headers: {
                            Authorization: accessToken,
                        },
                    },
                );
                let body = res.data;
                let _hash = body.hash;

                expect(res.status).to.equal(200);
                expect(_hash).to.not.be.empty;

                hash = _hash;
            });

            it('Confirm', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/change/email/confirm',
                    {
                        hash: hash,
                        newEmail: creds.email,
                    },
                    {
                        headers: {
                            Authorization: accessToken,
                        },
                    },
                );

                expect(res.status).to.equal(200);
            });

            it('Fail validation', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/change/email/confirm',
                    {
                        headers: {
                            Authorization: accessToken,
                        },
                    },
                );

                expect(res.status).to.equal(400);
            });

            it('Fail auth', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/change/email/confirm',
                    {
                        hash: hash,
                        newEmail: creds.email,
                    },
                    {},
                );

                expect(res.status).to.equal(401);
            });
        });

        describe('Delete account', () => {
            let accessToken: string;
            let hash: string;

            it('Login', async () => {
                let res = await actionsAgent.http.post('/api/auth/login', {
                    username: creds.username,
                    password: creds.password,
                });
                expect(res.status).to.equal(200);

                let _accessToken = res.data.token;
                expect(_accessToken).to.not.be.empty.and.to.not.be.null;
                accessToken = _accessToken;
            });

            it('Request', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/deletion',
                    null,
                    {
                        headers: {
                            Authorization: accessToken,
                        },
                    },
                );
                let body = res.data;
                let _hash = body.hash;

                expect(res.status).to.equal(200);
                expect(_hash).to.not.be.empty;

                hash = _hash;
            });

            it('Confirm', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/deletion/confirm',
                    {
                        hash: hash,
                    },
                    {
                        headers: {
                            Authorization: accessToken,
                        },
                    },
                );

                expect(res.status).to.equal(200);
            });

            it('Fail validation', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/deletion/confirm',
                    null,
                    {
                        headers: {
                            Authorization: accessToken,
                        },
                    },
                );

                expect(res.status).to.equal(400);
            });

            it('Fail auth', async () => {
                let res = await actionsAgent.http.post(
                    '/api/auth/request/deletion/confirm',
                    {
                        hash: hash,
                    },
                );

                expect(res.status).to.equal(401);
            });

            it('Reregister account', async () => {
                let res = await actionsAgent.http.post('/api/auth/register', {
                    username: creds.username,
                    email: creds.email,
                    password: creds.password,
                });

                expect(res.status).to.equal(200);
            });
        });
    });
});
