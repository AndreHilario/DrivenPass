export class Note {
    private _title: string;
    private _content: string;
    private _userId: number;

    constructor(title: string, content: string, userId: number) {
        this._title = title;
        this._content = content;
        this._userId = userId;
    }

    get title() {
        return this._title;
    }

    get content() {
        return this._content;
    }

    get userId() {
        return this._userId;
    }
}
