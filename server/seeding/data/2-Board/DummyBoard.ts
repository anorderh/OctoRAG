import { ObjectId } from "mongodb";
import { container } from "tsyringe";
import { dummyData } from "seeding/data";
import { FindType } from "src/data/utils/constants/find-type.js";

export const dummyBoards = [
    {
        _id: dummyData.boards.A.id,
        title: "Board A",
        desc: "This is Board A.",
        creatorId: dummyData.users.A.id,
        followers: [dummyData.users.B.id, dummyData.users.C.id],
        versions: [
            {   
                _id: dummyData.versions.A.id,
                index: 1,
                desc: 'This is version A.',
                finds: [
                    {   
                        _id: dummyData.finds.A.id,
                        index: 1,
                        title: 'Find A',
                        desc: 'This is find A',
                        link: 'www.google.com',
                        type: FindType.Other,
                        relations: [
                            {
                                destIdx: 2,
                                label: "Going to Find B",
                                desc: "This is a sample relation."
                            }
                        ],
                        grouping: ["A"],
                        rank: 1,
                        views: 0,
                        clicks: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        active: true
                    },
                    {   
                        _id: dummyData.finds.B.id,
                        index: 2,
                        title: 'Find B',
                        desc: 'This is find B',
                        link: 'www.google.com',
                        type: FindType.Other,
                        relations: [],
                        grouping: ["B"],
                        rank: 1,
                        views: 0,
                        clicks: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        active: true
                    },
                ],
                visits: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                active: true,
                published: true
            }
        ],
        tags: ["A"],
        public: true,
        active: true
    },
    {
        _id: dummyData.boards.B.id,
        title: "Board B",
        desc: "This is Board B.",
        creatorId: dummyData.users.B.id,
        followers: [dummyData.users.C.id],
        versions: [
            {   
                _id: dummyData.versions.B.id,
                index: 1,
                desc: 'This is version B.',
                finds: [
                    {   
                        _id: dummyData.finds.C.id,
                        index: 1,
                        title: 'Find C',
                        desc: 'This is find C',
                        link: 'www.google.com',
                        type: FindType.Other,
                        relations: [],
                        grouping: ["Group 1"],
                        rank: 1,
                        views: 0,
                        clicks: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        active: true
                    },
                    {   
                        _id: dummyData.finds.D.id,
                        index: 2,
                        title: 'Find D',
                        desc: 'This is find D',
                        link: 'www.google.com',
                        type: FindType.Other,
                        relations: [],
                        grouping: ["Group 1"],
                        rank: 3,
                        views: 0,
                        clicks: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        active: true
                    },
                    {   
                        _id: dummyData.finds.E.id,
                        index: 3,
                        title: 'Find E',
                        desc: 'This is find E',
                        link: 'www.google.com',
                        type: FindType.Other,
                        relations: [],
                        grouping: ["Group 1"],
                        rank: 1,
                        views: 0,
                        clicks: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        active: true
                    },
                ],
                visits: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                active: true,
                published: true
            },
            {   
                _id: dummyData.versions.C.id,
                index: 1,
                desc: 'This is version C.',
                finds: [
                    {   
                        _id: dummyData.finds.F.id,
                        index: 1,
                        title: 'Find F',
                        desc: 'This is find F',
                        link: 'www.google.com',
                        type: FindType.Other,
                        relations: [],
                        grouping: ["Group 2"],
                        rank: 1,
                        views: 0,
                        clicks: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        active: true
                    },
                ],
                visits: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                active: true,
                published: true
            }
        ],
        tags: ["B"],
        public: true,
        active: true
    }
]