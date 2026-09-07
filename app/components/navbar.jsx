

export default function Nav() {
 

  return (
   <div className="w-full h-20 flex bg-gray-700 z-[1000] text-white font-bold justify-center top-1">
<ul className="flex justify-between gap-3 list-none overflow-scroll">
    <Link href={"/"}>
    
    <li>Home</li>
    
    </Link>
    <Link href={"/shonchoi"}>
    <li>shonchoi</li>
    
    </Link>
    <li>Home</li>
    <li>Home</li>
    <Link href={"/shonchoi"}>
    <li>shonchoi</li>
    
    </Link><Link href={"/login"}>
    <li className="text-red-600">Login</li>
    
    </Link>

</ul>


   </div>
  );
}