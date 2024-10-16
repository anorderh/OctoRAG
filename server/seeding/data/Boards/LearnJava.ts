/*
Static HTML content
https://www.tutorialspoint.com/java/java_quick_guide.htm
1. Visit page with URL
2. Download page's HTML content
3. Vectorize page content into vector db

Youtube video content
https://www.youtube.com/watch?v=RRubcjpTkks
1. Visit page with URL
2. Detect page is Youtube video link, then use ID to download transcrit
3. Vectorize both page and transcript content into vector db

Git repository
https://github.com/hellokaton/java11-examples
Processing...
1. Visit page with URL
2. Find all embedded resources associated w/ repo
3. Download all resources and vectorize into vector db
*/

import { data } from "seeding/data";
import { getFindEntityProps, getVersionEntityProps } from "seeding/helpers";
import { OnlineResourceType } from "src/data/utils/constants/online-resource-type";

export const javaBoard = {
    _id: data.boards.learnJava.id,
    title: "Java 101",
    desc: "Resources for studying the Java programming language.",
    creatorId: data.users.development.id,
    followers: [] as any[],
    versions: [
        {
            _id: data.boards.learnJava.versions[1].id,
            index: 1,
            desc: "First publication",
            finds: (() => {
                let finds = data.boards.learnJava.versions[1].finds;

                return [
                    {
                        _id: finds.youtubeVideo.id,
                        index: 2,
                        title: 'Alex Lee Java Tutorial',
                        desc: "Learn Java in 14 minutes. Seriously.",
                        link: 'https://www.youtube.com/watch?v=RRubcjpTkks',
                        type: OnlineResourceType.YoutubeVideo,
                        relations: [] as any[],
                        grouping: ["video"],
                        rank: 1,
                        ...getFindEntityProps()
                    },
                    {
                        _id: finds.githubSampleRepo.id,
                        index: 3,
                        title: 'Java 11 Examples',
                        desc: "Containing practical example sof new feature code after Java 8",
                        link: 'https://github.com/hellokaton/java11-examples',
                        type: OnlineResourceType.GithubRepo,
                        relations: [
                            {
                                destIdx: 1,
                                label: "Referencing Java concept 'Annotations'",
                                desc: "A feature of Java utilized when programming."
                            }
                        ],
                        grouping: ["static"],
                        rank: 2,
                        ...getFindEntityProps()
                    },
                    {
                        _id: finds.tutorialsPoint.id,
                        index: 1,
                        title: 'Java Annotations Reference',
                        desc: "Official Java documentation going over annotations.",
                        link: 'https://dev.java/learn/annotations/',
                        type: OnlineResourceType.MediaWebpage,
                        relations: [
                            {
                                destIdx: 3,
                                label: "Practical application of concepts",
                                desc: "To see Java-related concepts in action"
                            }
                        ],
                        grouping: ["static"],
                        rank: 2,
                        ...getFindEntityProps()
                    },
                    {
                        _id: finds.redditPost.id,
                        index: 4,
                        title: 'Favourite debugging patterns in Java',
                        desc: "Java debugging",
                        link: 'https://www.reddit.com/r/java/comments/1fodrl7/what_are_your_favourite_debugging_patterns_in_java/',
                        type: OnlineResourceType.RedditPost,
                        relations: [] as any[],
                        grouping: ["static"],
                        rank: 2,
                        ...getFindEntityProps()
                    },
                    {
                        _id: finds.twitterPost.id,
                        index: 5,
                        title: 'Twitter Java post about common tasks',
                        desc: "Sample",
                        link: 'https://x.com/java/status/1831703837687607313',
                        type: OnlineResourceType.XPost,
                        relations: [] as any[],
                        grouping: ["static"],
                        rank: 2,
                        ...getFindEntityProps()
                    },
                    {
                        _id: finds.tiktokPost.id,
                        index: 6,
                        title: 'Tiktok video about Java static keyword',
                        desc: "Sample",
                        link: 'https://www.tiktok.com/@.braintickle/video/7180527400738884907?lang=en',
                        type: OnlineResourceType.TiktokPost,
                        relations: [] as any[],
                        grouping: ["static"],
                        rank: 4,
                        ...getFindEntityProps()
                    },
                    {
                        _id: finds.pdf.id,
                        index: 7,
                        title: 'PDF by Tutorials point about using Java',
                        desc: "Sample",
                        link: 'https://www.tutorialspoint.com/java/java_tutorial.pdf',
                        type: OnlineResourceType.MediaPDF,
                        relations: [] as any[],
                        grouping: ["static"],
                        rank: 4,
                        ...getFindEntityProps()
                    }
                ]
            })(),
            ...getVersionEntityProps()
        }
    ],
    tags: ["Programming", "Code", "Coding", "Computers", "Java"],
    saves: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    public: true,
    active: true
}