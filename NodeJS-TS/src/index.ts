type Handle = () => Promise<string>
const fullname = 'Lam dai ca'
const handle : Handle = () => Promise.resolve(fullname)
handle().then((res)=>{
  console.log(res)
})