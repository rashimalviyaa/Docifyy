import React, { Children } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const Header = ({ children, className }: HeaderProps) => {
  return (
    <div className={cn('header', className)}>
      <Link href='/' className='flex items-center md:flex-1'>
        <Image
          src="/assets/images/logo.png"
          alt="logo with name"
          width={34}
          height={34}
          className='hidden md:block mr-2'
        />
        <Image
          src="/assets/images/logo.png"
          alt="logo"
          width={32}
          height={32}
          className='mr-2 md:hidden'
        />
        <div className='flex flex-col'>
          <h1 className='text-lg font-bold md:text-2xl'>Docify!</h1>
          <p className='text-sm text-gray-500 md:text-base'>Your main collab tool, what's the tea?</p>
        </div>
      </Link>
      {children}
    </div>
  )
}

export default Header
