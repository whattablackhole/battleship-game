export interface User {
  name: string;
  password: string;
  index: number;
}

export interface LoginResponseMessage {
  data: {
    name: string;
    error: boolean;
    errorText: string;
    index: number;
  };
  id: 0;
  type: "reg";
}
