import React from 'react'
import {Routes, Route} from "react-router-dom"
import WorkforceOS from '../WorkforceOS'
import Dashboard from '../pages/Dashboard/Dashboard'
import Login from '../components/Login'


const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<WorkforceOS/>} />
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/login' element={<Login/>} />
    </Routes>
  )
}

export default AppRoutes
