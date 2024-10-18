import { Outlet } from 'react-router-dom'
import SocialMediaIcons from '../social-media-icons'

export function AppLayout() {
  return (
    <main className='flex flex-col text-center h-full min-h-screen items-center bg-gray-100 dark:bg-slate-900'>
      <h1 className="text-2xl font-bold m-4">
        MULTI-TENANT RAG APPLICATION <br/>
        <div className="mt-4">
          <b>ANTHONY NORDERHAUG</b> <br/>
          <b>Associate Software Developer</b><br/>
          <b>anthony@norderhaug.org</b> <br/>
          <b>925 406-9860</b> <br/>
          <b className="text-sm">MAY 2023 CS GRADUATE</b> <br/>
        </div>
        <SocialMediaIcons/>
      </h1>
      <Outlet />
    </main>
  )
}
