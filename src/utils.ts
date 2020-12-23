export default {

  makeLog(head:string): (arg0: string)=>void {
    return (str:string) => (console.log(`[${head}] ${str}`));
  },
};
