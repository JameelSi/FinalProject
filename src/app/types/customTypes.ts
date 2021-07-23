import { Moment } from "moment";

export interface signinUser{
    uid?:string
    email: string,
    password: string,
}


export interface Elderly {
    fName: string,
    lName: string,
    phone: string,
    email: string,
    city: 'ירושלים',
    neighborhood: string,
    street: string,
    age: number,
    needs: string[],
    langs: string[],
    maritalStatus: string,
    message: string
  }
  export interface Volunteer {
    fName: string,
    lName: string,
    phone: string,
    email: string,
    city: 'ירושלים',
    neighborhood: string,
    street: string,
    age: number,
    gender:string,
    id:string,
    hobbies: string[],
    langs: string[],
    volType: string,
    education: string,
    pastVoulnteer: boolean,
    enviroment: string,
    lastVolDate: string,
    expectations: string,
    numOfDays: number,
    numOfHours: number,
    bio: string
  }

export interface event {
    title: string,
    type?: string,
    description?: string,
    date?: Date | Moment,
    id?: string,
    img?: string,
  }

  export interface areaCoord {
    id?: string,
    name: string,
    email: string,
    phone: string,
    neighborhoods: string[],
    uid?: string  
  }
  export interface neighborhood {
    id: string,
    currentValue: boolean,
    managerId: string,
    projects: project[],
    managerInfo?: manager
  }
  
  export interface project {
    projectType: string,
    comments: string,
    date: Date | Moment,
    clubCoordinatorId: string,
    clubInfo?: clubCoord,
  }
  
  export interface manager {
    id: string,
    name: string,
    email: string,
    phone: string,
    neighborhoods: string[]
  }
  
  export interface clubCoord {
    id?: string,
    address: string,
    club: string,
    name: string,
    phone: string,
    coordPhone: string | undefined,
  }

  export interface MenuItem {
    label: string;
    icon: string;
    route: string;
    admin: boolean;
    requireLogIn: boolean;
    requireLogOut? : boolean;
    showAll?: boolean;
    // showOnMobile: boolean;
    // showOnTablet: boolean;
    // showOnDesktop: boolean;
  }
