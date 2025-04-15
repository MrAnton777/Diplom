export interface signUpDto{
    email:string,
    password:string,
    name:string,
    contactPhone?:string,
    role:string
}

export interface signInDto{
    email:string,
    password:string
}