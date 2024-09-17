
export function getFindEntityProps(input: any={}) {
    return {
        views: 0,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
        ...input
    }
}

export function getVersionEntityProps(input: any={}) {
    return {
        visits: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
        published: true,
        ...input
    }
}