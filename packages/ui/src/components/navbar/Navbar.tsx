import React from 'react'

// Bundles
import NavbarDashboard from './bundles-component/NavbarDashboard'
import NavbarLogisticManagement from './bundles-component/NavbarLogisticManagement'
import NavbarReport from './bundles-component/NavbarReport'
import NavbarSetting from './bundles-component/NavbarSetting'

const Navbar = () => {
  return (
    <div className="main__nav ui-bg-primary-500 ui-h-10">
      <div className="ui-container ui-mx-auto ui-flex ui-items-center ui-justify-start ui-text-primary-contrast">
        <NavbarDashboard />
        <NavbarLogisticManagement />
        <NavbarReport />
        <NavbarSetting />
      </div>
    </div>
  )
}
export default Navbar
