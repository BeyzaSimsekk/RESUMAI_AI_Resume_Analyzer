import React from 'react'
import { Link } from 'react-router'
import { RxAvatar } from "react-icons/rx";

const Navbar = () => {
  return (
    <nav className='navbar'>
      <div className='flex flex-row gap-2'>

        <Link to="/" className='text-2xl font-bold text-gradient'>RESUMAI</Link>
        <Link to="/auth" className='text-[#af5cca] hover:scale-105 font-bold transform transition-all duration-300 ease-in'> 
          <RxAvatar size={30}/>
        </Link>
      </div>
        <Link to="/upload" className='primary-button w-fit'>Upload Resume</Link>
    </nav>
  )
}

export default Navbar