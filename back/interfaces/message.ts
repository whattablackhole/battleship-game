export class Message {
   type: string
   data: string
   id = 0

   constructor(type: string,
    data: string) {
        this.type = type;
        this.data = data;
   }
}
