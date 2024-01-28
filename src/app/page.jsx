import Image from 'next/image'
import Link from 'next/link';

export default function Home() {
  return (

    
    <div className="main">
             <Image src="/assets/bg.png"
             layout='fill'
             alt="bgimage"
             objectFit='cover'
             className='bg-image'
             >
              
             </Image>
          
         <h1 className='heading'>Daisy</h1>
         <h2 className="sub-text">The Future to Managment<br></br> and Productivity.<br></br> Make your time count<br></br> and excel in tasks which you undertake</h2>
         
         <Link href="/about">
         <button className="btn secondary">About</button>
        
         </Link>
         <Link href="/chat">
         <button className="btn primary">Chat</button>
         </Link>
        
        </div>
  )
}
