export class Credential {
    private _title: string;
    private _url: string;
    private _username: string;
    private _encryptedPassword: string;
    private _userId: number;

    constructor(title: string, url: string, username: string, encryptedPassword: string, userId: number) {
        this._title = title;
        this._url = url;
        this._username = username;
        this._encryptedPassword = encryptedPassword;
        this._userId = userId;
    }

    get title() {
        return this._title;
    }

    get url() {
        return this._url;
    }

    get username() {
        return this._username;
    }

    get encryptedPassword() {
        return this._encryptedPassword;
    }

    get userId() {
        return this._userId;
    }
}
