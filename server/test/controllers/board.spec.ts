import { Agent } from "../agent";
import { expect } from "chai";
import { env } from "../../src/env";
import cookie from 'cookie';
import { Database } from "../database";
import { Board, Relation } from "../../src/data/collections";
import { ObjectId } from "mongodb";

let sampleData = {
    devAcc: {
        username: "anthony",
        email: "anthony@norderhaug.org",
        password: "password123",
    },
    boards: [
        {
            title: "Board #1",
            desc: "This is a sample board.",
            tags: ["Sample", "1"],
            versions: [
                {
                    title: 'Version #1',
                    desc: 'This is a sample version.',
                    finds: [
                        {
                            title: 'Find #1',
                            index: 1,
                            desc: 'This is a sample find.',
                            link: 'www.google.com',
                            relations: [
                                {
                                    destIdx: 2,
                                    label: "Going to Find #2",
                                    desc: "This is a sample relation."
                                }
                            ],
                            grouping: ["Sample A"],
                            rank: 1
                        },
                        {
                            title: 'Find #2',
                            index: 2,
                            desc: 'This is a sample find.',
                            link: 'www.google.com',
                            grouping: ["Sample A"],
                            rank: 2
                        },
                        {
                            title: 'Find #3',
                            index: 3,
                            desc: 'This is a sample find.',
                            link: 'www.google.com',
                            grouping: ["Sample B"],
                            rank: 1
                        }
                    ]
                }
            ],
            public: true
        },
        {
            title: "Board #2",
            desc: "This is a sample board.",
            tags: ["Sample", "2"],
            public: true
        },
        {
            title: "Board #3",
            desc: "This is a sample board.",
            tags: ["Sample", "3"],
            public: true
        }
    ]
}
describe('Board Controller', () => {
    let authAgent: Agent;
    let guestAgent: Agent;

    before(async () => {
        authAgent = new Agent();
        let req = sampleData.devAcc;
        await authAgent.register(
            req.username,
            req.email,
            req.password
        );
        await authAgent.login(req.username, req.password);

        guestAgent = new Agent();
    })

    describe('Add boards', () => {
        let addedId: string;

        it('Add', async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedId = res.data._id;
            expect(res.status).to.equal(200);
        })

        it('Fail validation', async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
            };
            let res = await authAgent.http.post('/api/board/add', req)
            expect(res.status).to.equal(400);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedId}`)
            expect(res.status).to.equal(200);
        })
    })

    describe('Add version', async () => {
        let addedId: string;

        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true,
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedId = res.data._id;
            expect(res.status).to.equal(200);
        })

        it('Add version', async () => {
            let board = sampleData.boards[0];
            let version = board.versions[0];
            let req = {
                title: version.title,
                desc: version.desc,
                finds: version.finds
            };
            let res = await authAgent.http.post(`/api/board/add/${addedId}/version`, req)
            expect(res.status).to.equal(200);
        })

        it('Fail validation', async () => {
            let board = sampleData.boards[0];
            let version = board.versions[0];
            let req = {
                desc: version.desc,
                finds: version.finds
            };
            let res = await authAgent.http.post(`/api/board/add/${addedId}/version`, req)
            expect(res.status).to.equal(400);
        })

        it('Invalid board', async () => {
            let board = sampleData.boards[0];
            let version = board.versions[0];
            let req = {
                title: version.title,
                desc: version.desc,
                finds: version.finds
            };
            let res = await authAgent.http.post(`/api/board/add/${new ObjectId()}/version`, req)
            expect(res.status).to.equal(409);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedId}`)
            expect(res.status).to.equal(200);
        })
    })

    describe('Edit board', async () => {
        let addedId: string;

        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedId = res.data._id;
            expect(res.status).to.equal(200);
        })

        it('Edit', async () => {
            let editReq = {
                title: "New title",
                desc: "New desc",
                tags: ["Edited"]
            }

            let res = await authAgent.http.patch(`/api/board/edit/${addedId}`, editReq);
            expect(res.status).to.equal(200);
            expect(res.data._id).to.equal(addedId);
        })

        it('Invalid board', async () => {
            let editReq = {
                title: "New title",
                desc: "New desc",
                tags: ["Edited"]
            }

            let res = await authAgent.http.patch(`/api/board/edit/${new ObjectId()}`, editReq);
            expect(res.status).to.equal(409);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedId}`)
            expect(res.status).to.equal(200);
        })
    })

    describe('Edit version', async () => {
        let addedBoardId: string;
        let addedVersionId: string;
        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedBoardId = res.data._id;
            expect(res.status).to.equal(200);

            let version = board.versions[0];
            let verReq = {
                title: version.title,
                desc: version.desc,
                finds: version.finds
            };
            let verRes = await authAgent.http.post(`/api/board/add/${addedBoardId}/version`, verReq)
            addedVersionId = verRes.data._id;
            expect(res.status).to.equal(200);
        })

        it('Edit', async () => {
            let version = sampleData.boards[0].versions[0];
            let req = {
                title: version.title,
                desc: version.desc,
                finds: version.finds
            }
            let res = await authAgent.http.patch(
                `/api/board/edit/${addedBoardId}/version/${addedVersionId}`,
                req
            );
            expect(res.status).to.equal(200);
            expect(res.data._id).to.equal(addedVersionId);
        })

        it('Edit w/ new find', async () => {
            let version = sampleData.boards[0].versions[0];
            let req = {
                title: version.title,
                desc: version.desc,
                finds: [
                    ...version.finds,
                    // New find.
                    {
                        index: 4,
                        title: 'Find #4',
                        desc: 'This is a sample find',
                        link: 'www.google.com',
                        relations: [] as Relation[],
                        grouping: ['Sample'],
                        rank: 1,
                    }
                ]
            }
            let res = await authAgent.http.patch(
                `/api/board/edit/${addedBoardId}/version/${addedVersionId}`,
                req
            );
            expect(res.status).to.equal(200);
            expect(res.data._id).to.equal(addedVersionId);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}`)
            expect(res.status).to.equal(200);
        })
    })

    describe('Publish version', async () => {
        let addedBoardId: string;
        let addedVersionId: string;

        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedBoardId = res.data._id;
            expect(res.status).to.equal(200);

            let version = board.versions[0];
            let verReq = {
                title: version.title,
                desc: version.desc,
                finds: version.finds
            };
            let verRes = await authAgent.http.post(`/api/board/add/${addedBoardId}/version`, verReq)
            addedVersionId = verRes.data._id;
            expect(res.status).to.equal(200);
        })

        it('Publish', async () => {
            let res = await authAgent.http.post(`/api/board/${addedBoardId}/publish/version/${addedVersionId}`);
            expect(res.status).to.equal(200);
            expect(res.data._id).to.equal(addedVersionId);
        })

        it('Invalid board', async () => {
            let res = await authAgent.http.post(`/api/board/${new ObjectId()}/publish/version/${new ObjectId()}`);
            expect(res.status).to.equal(409);
        })

        it('Invalid version', async () => {
            let res = await authAgent.http.post(`/api/board/${addedBoardId}/publish/version/${new ObjectId()}`);
            expect(res.status).to.equal(409);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}`)
            expect(res.status).to.equal(200);
        })
    })

    describe('Delete board', async () => {
        let addedBoardId: string;

        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedBoardId = res.data._id;
            expect(res.status).to.equal(200);
        })

        it('Delete', async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}`);
            expect(res.status).to.equal(200);
        })

        it('Invalid board', async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${new ObjectId()}`);
            expect(res.status).to.equal(409);
        })
    })

    describe('Delete version', async () => {
        let addedBoardId: string;
        let addedVersionId: string;
        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedBoardId = res.data._id;
            expect(res.status).to.equal(200);

            let version = board.versions[0];
            let verReq = {
                title: version.title,
                desc: version.desc,
                finds: version.finds
            };
            let verRes = await authAgent.http.post(`/api/board/add/${addedBoardId}/version`, verReq)
            addedVersionId = verRes.data._id;
            expect(res.status).to.equal(200);
        })

        it('Delete', async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}/version/${addedVersionId}`);
            expect(res.status).to.equal(200);
        })

        it('Invalid board', async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${new ObjectId()}/version/${addedVersionId}`);
            expect(res.status).to.equal(409);
        })

        it('Invalid version', async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}/version/${new ObjectId()}`);
            expect(res.status).to.equal(409);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}`)
            expect(res.status).to.equal(200);
        })
    })

    describe('Follow board', async () => {
        let addedBoardId: string;
        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedBoardId = res.data._id;
            expect(res.status).to.equal(200);
        })

        it('Follow', async () => {
            let res = await authAgent.http.post(`/api/board/follow/${addedBoardId}`);
            expect(res.status).to.equal(200);
        })

        it('Invalid board', async () => {
            let res = await authAgent.http.post(`/api/board/follow/${new ObjectId()}`);
            expect(res.status).to.equal(409);
        })

        it('No auth', async () => {
            let res = await guestAgent.http.post(`/api/board/follow/${addedBoardId}`);
            expect(res.status).to.equal(401);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}`)
            expect(res.status).to.equal(200);
        })
    })

    describe('Unfollow board', async () => {
        let addedBoardId: string;
        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedBoardId = res.data._id;
            expect(res.status).to.equal(200);

            let followRes = await authAgent.http.post(`/api/board/follow/${addedBoardId}`);
            expect(followRes.status).to.equal(200);
        })

        it('Unfollow', async () => {
            let res = await authAgent.http.post(`/api/board/unfollow/${addedBoardId}`);
            expect(res.status).to.equal(200);
        })

        it('Invalid board', async () => {
            let res = await authAgent.http.post(`/api/board/unfollow/${new ObjectId()}`);
            expect(res.status).to.equal(409);
        })

        it('No auth', async () => {
            let res = await guestAgent.http.post(`/api/board/unfollow/${addedBoardId}`);
            expect(res.status).to.equal(401);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}`)
            expect(res.status).to.equal(200);
        })
    })

    describe('Get board', async () => {
        let addedBoardId: string;
        before(async () => {
            let board = sampleData.boards[0];
            let req = {
                title: board.title,
                desc: board.desc,
                tags: board.tags,
                public: true
            };
            let res = await authAgent.http.post('/api/board/add', req)
            addedBoardId = res.data._id;
            expect(res.status).to.equal(200);
        })

        it('Get board, no auth', async () => {
            let res = await guestAgent.http.get(`/api/board/${addedBoardId}`);
            expect(res.status).to.equal(200);
        })

        it('Get board, w/ auth', async () => {
            let res = await authAgent.http.get(`/api/board/${addedBoardId}`);
            expect(res.status).to.equal(200);
        })

        it('Invalid board', async () => {
            let res = await authAgent.http.get(`/api/board/${new ObjectId()}`);
            expect(res.status).to.equal(409);
        })

        after(async () => {
            let res = await authAgent.http.delete(`/api/board/delete/${addedBoardId}`)
            expect(res.status).to.equal(200);
        })
    })
})