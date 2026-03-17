import githubLogo from '@/assets/logo/github-logo.png';
import octoragLogo from '@/assets/logo/octo-logo.png';
import cohere from '@/assets/svgs/cohere.svg';
import langchain from '@/assets/svgs/langchain.svg';
import mongo from '@/assets/svgs/mongo.svg';
import nodejs from '@/assets/svgs/node-js.svg';
import openai from '@/assets/svgs/openai.svg';
import pinecone from '@/assets/svgs/pinecone.svg';
import react from '@/assets/svgs/react.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github } from 'lucide-react';

export function NewChatPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-xl flex flex-col items-center space-y-6  mb-36">
                {/* Images (you’ll wire assets later) */}
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

                {/* Input + Button */}
                <div className="relative w-full">
                    <Input
                        placeholder="Paste a Github repository URL"
                        className="
                            p-4
                            h-12
                            rounded-full
                            pr-14
                            bg-card
                            border-border
                            text-md
                            placeholder:text-muted-foreground
                            focus-visible:ring-1
                            focus-visible:ring-primary
                        "
                    />

                    <Button
                        size="icon"
                        className="
        absolute right-1 top-1/2
        -translate-y-1/2
        active:translate-y-[-50%]
        h-9 w-9
        rounded-full
        bg-primary
        hover:bg-primary/90
    ">
                        <Github className="h-4 w-4 text-white" />
                    </Button>
                </div>

                {/* Helper text */}
                <div className="mt-3 flex flex-col items-center gap-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                        Vectorizing online Github repositories for prompting
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
