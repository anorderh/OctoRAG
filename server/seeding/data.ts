import { ObjectId } from "mongodb";

export const data = {
    users: {
        development: {
            id: new ObjectId(),
        }
    },
    boards: {
        learnJava: {
            id: new ObjectId(),
            versions: {
                1: {
                    id: new ObjectId(),
                    finds: {
                        tutorialsPoint: {
                            id: new ObjectId()
                        },
                        youtubeVideo: {
                            id: new ObjectId()
                        },
                        githubSampleRepo: {
                            id: new ObjectId(),
                        },
                        javaAnnotations: {
                            id: new ObjectId()
                        }
                    }
                }
            }
        }
    }
}

export const dummyData = {
    users: {
        A: {
            id: new ObjectId()
        },
        B: {
            id: new ObjectId()
        },
        C: {
            id: new ObjectId()
        }
    },
    boards: {
        A: {
            id: new ObjectId()
        },
        B: {
            id: new ObjectId()
        }
    },
    versions: {
        A: {
            id: new ObjectId()
        },
        B: {
            id: new ObjectId()
        },
        C: {
            id: new ObjectId()
        }
    },
    finds: {
        A: {
            id: new ObjectId()
        },
        B: {
            id: new ObjectId()
        },
        C: {
            id: new ObjectId()
        },
        D: {
            id: new ObjectId()
        },
        E: {
            id: new ObjectId()
        },
        F: {
            id: new ObjectId()
        }
    },
    events: {
        A: {
            id: new ObjectId()
        },
        B: {
            id: new ObjectId()
        },
        C: {
            id: new ObjectId()
        },
        D: {
            id: new ObjectId()
        },
        E: {
            id: new ObjectId()
        },
    }
}