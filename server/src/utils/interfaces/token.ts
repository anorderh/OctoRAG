import { TokenType } from "../enums/token-type";

export interface Token {
    type: TokenType;
    accountId: number;
    content: any;
}