import githubLogo from '@/assets/logo/github-logo.png';
import octoragLogo from '@/assets/logo/octo-logo.png';
import cohere from '@/assets/svgs/cohere.svg';
import langchain from '@/assets/svgs/langchain.svg';
import mongo from '@/assets/svgs/mongo.svg';
import nodejs from '@/assets/svgs/node-js.svg';
import openai from '@/assets/svgs/openai.svg';
import pinecone from '@/assets/svgs/pinecone.svg';
import react from '@/assets/svgs/react.svg';

import { NewChatInput } from '@/components/chat/new-chat-input';

export function NewChatPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-xl flex flex-col items-center space-y-6 mb-36">
                {/* Logos */}
                <div className="flex items-center gap-6">
                    <img
                        src={octoragLogo}
                        className="h-60 w-70 rounded-md object-cover"
                    />
                    <img
                        src={githubLogo}
                        className="h-70 w-70 rounded-md object-cover mb-8"
                    />
                </div>

                {/* INPUT */}
                <NewChatInput />

                {/* Helper text */}
                <div className="mt-3 flex flex-col items-center gap-4 text-center">
                    <p className="text-md font-medium text-muted-foreground mb-3">
                        Turn GitHub repositories into embeddings for better
                        responses
                        <br />
                        using <b>Retrieval-Augmented Generation</b>
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <img src={langchain} className="h-5 dark:invert" />
                            LangChain
                        </span>

                        <span className="flex items-center gap-2">
                            <img src={pinecone} className="h-5 dark:invert" />
                            Pinecone
                        </span>

                        <span className="flex items-center gap-2">
                            <img src={mongo} className="h-5" />
                            MongoDB
                        </span>

                        <span className="flex items-center gap-2">
                            <img src={openai} className="h-5" />
                            OpenAI
                        </span>

                        <span className="flex items-center gap-2">
                            <img src={cohere} className="h-5" />
                            Cohere
                        </span>

                        <span className="flex items-center gap-2">
                            <img src={nodejs} className="h-5" />
                            Node.js
                        </span>

                        <span className="flex items-center gap-2">
                            <img src={react} className="h-5" />
                            React
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
