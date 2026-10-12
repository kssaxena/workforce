import React from 'react'

const Footer = () => {
   
  return (
    <div>
        	<footer className="border-t border-slate-100 bg-white">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-[7px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
					<div className="flex items-center gap-2 text-[9px] font-black text-slate-900">
						<span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white">
							W
						</span>
						WorkforceOS
					</div>
					<div className="flex gap-5 text-[10px]">
						<a href="/features">Features</a>
						<a href="/solutions">Solutions</a>
						<a href="#">Pricing</a>
						<a href="">About Us</a>
						<a href="#">Contact</a>
						<a href="/dashboard"> Dashboard </a>
					</div>
					<div className="text-[10px]">© 2026 WorkforceOS</div>
				</div>
			</footer>
      
    </div>
  )
}

export default Footer
