import { BaseMessage } from "@langchain/core/messages";
import { RagRunnableProperties } from "../constants/rag-runnable-props";
import { Document } from "langchain/document";

export interface RagRunnableParameters {
    [RagRunnableProperties.input]?: string;
    [RagRunnableProperties.history]?: BaseMessage[];
    [RagRunnableProperties.interpretation]?: string;
    [RagRunnableProperties.documents]?: Document[];
    [RagRunnableProperties.context]?: string;
    [RagRunnableProperties.output]?: string;
}