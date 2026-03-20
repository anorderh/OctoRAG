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

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Github } from 'lucide-react';

export function NewChatPage() {
    return (
        <TooltipProvider delayDuration={150}>
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
                        <h5>
                            A <b>Retrieval-Augmented Generation</b> pipeline for
                            <Github className="mx-1 inline h-5 w-5" />
                            Github Repositories
                        </h5>

                        <p className="text-sm font-medium text-muted-foreground mb-3">
                            Vectorizing code into embeddings for NL querying,
                            <br />
                            to contextualize LLMs&apos; input and improve AI
                            responses.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-muted-foreground">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-2 cursor-default">
                                        <img
                                            src={langchain}
                                            className="h-8 dark:invert"
                                        />
                                        LangChain
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Langchain runnables for RAG stages
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-2 cursor-default">
                                        <img
                                            src={pinecone}
                                            className="h-8 dark:invert"
                                        />
                                        Pinecone
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>Vector database</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-2 cursor-default">
                                        <img src={mongo} className="h-8" />
                                        MongoDB
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Storing entity & auth data
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-2 cursor-default">
                                        <img src={openai} className="h-8" />
                                        OpenAI
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Integrating embedding & AI APIs
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-2 cursor-default">
                                        <img src={cohere} className="h-8" />
                                        Cohere
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Reranking API models
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-2 cursor-default">
                                        <img src={nodejs} className="h-8" />
                                        Node.js
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Express backend server
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-2 cursor-default">
                                        <img src={react} className="h-8" />
                                        React
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Web components, Websockets, Zustand state
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
