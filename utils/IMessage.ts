export interface IMessage {
    body: IBody;
    categories: string[];
}

export interface IBody {
    content: string;
}