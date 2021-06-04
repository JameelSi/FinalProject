export interface signinUser{
    uid?:string
    email: string,
    password: string,
}

export interface signupUser{
    fName: string,
    lName: string,
    phone: string,
    city: string,
    neighborhood: string,
    street: string,
    age: string,
    id: string,
    hobbies:Array<string>,
    langs:Array<string>,
    type:Array<string>,
    status:Array<string>,
    message: string,
}
